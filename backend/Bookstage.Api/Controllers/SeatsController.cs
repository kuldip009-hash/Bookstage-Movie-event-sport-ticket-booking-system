using System.Security.Claims;
using Bookstage.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bookstage.Api.Controllers;

[ApiController]
[Route("api/seats")]
public class SeatsController : ControllerBase
{
    private readonly BookstageDbContext _db;
    private const int LOCK_DURATION_MINUTES = 5;

    public SeatsController(BookstageDbContext db)
    {
        _db = db;
    }

    [HttpGet("{showtimeId}")]
    public async Task<ActionResult> GetSeatStatus(Guid showtimeId)
    {
        var showtime = await _db.ShowTimes.AsNoTracking()
            .Include(s => s.Movie)
            .FirstOrDefaultAsync(s => s.Id == showtimeId);

        if (showtime is null) return NotFound(new { message = "Showtime not found" });

        // Cleanup expired locks
        var expiredLocks = await _db.SeatLocks
            .Where(sl => sl.ShowTimeId == showtimeId && !sl.IsConfirmed && sl.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();
        if (expiredLocks.Any())
        {
            _db.SeatLocks.RemoveRange(expiredLocks);
            await _db.SaveChangesAsync();
        }

        var activeLocks = await _db.SeatLocks
            .AsNoTracking()
            .Where(sl => sl.ShowTimeId == showtimeId && (sl.IsConfirmed || sl.ExpiresAt > DateTime.UtcNow))
            .Select(sl => new {
                sl.SeatId,
                Status = sl.IsConfirmed ? "booked" : "locked",
                sl.LockedByUserId,
                sl.ExpiresAt,
            })
            .ToListAsync();

        return Ok(new
        {
            showtimeId,
            movieTitle = showtime.Movie?.Title,
            venueName = showtime.VenueName,
            venueCity = showtime.VenueCity,
            showDate = showtime.ShowDate,
            showTime = showtime.ShowTimeOfDay,
            price = showtime.Price,
            totalSeats = showtime.TotalSeats,
            availableSeats = showtime.AvailableSeats,
            seatLayout = showtime.SeatLayout,
            seats = activeLocks,
        });
    }

    [HttpPost("{showtimeId}/lock")]
    [Authorize]
    public async Task<ActionResult> LockSeats(Guid showtimeId, LockSeatsRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var showtime = await _db.ShowTimes.FirstOrDefaultAsync(s => s.Id == showtimeId);
        if (showtime is null) return NotFound(new { message = "Showtime not found" });

        // Clean expired locks
        var expiredLocks = await _db.SeatLocks
            .Where(sl => sl.ShowTimeId == showtimeId && !sl.IsConfirmed && sl.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();
        _db.SeatLocks.RemoveRange(expiredLocks);
        await _db.SaveChangesAsync();

        // ✅ Check if seats are taken by SOMEONE ELSE only (not the current user)
        var takenSeats = await _db.SeatLocks
            .Where(sl => sl.ShowTimeId == showtimeId
                         && request.SeatIds.Contains(sl.SeatId)
                         && sl.LockedByUserId != userId
                         && (sl.IsConfirmed || sl.ExpiresAt > DateTime.UtcNow))
            .Select(sl => sl.SeatId)
            .ToListAsync();

        if (takenSeats.Any())
            return Conflict(new { message = "Some seats are already taken", takenSeats });

        // ✅ Remove YOUR previous unconfirmed locks for this showtime (replace with new set)
        var previousLocks = await _db.SeatLocks
            .Where(sl => sl.ShowTimeId == showtimeId && sl.LockedByUserId == userId && !sl.IsConfirmed)
            .ToListAsync();
        _db.SeatLocks.RemoveRange(previousLocks);

        var expiresAt = DateTime.UtcNow.AddMinutes(LOCK_DURATION_MINUTES);
        var locks = request.SeatIds.Select(seatId => new Bookstage.Api.Domain.Entities.SeatLock
        {
            ShowTimeId = showtimeId,
            SeatId = seatId,
            LockedByUserId = userId,
            LockedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            IsConfirmed = false,
        }).ToList();

        _db.SeatLocks.AddRange(locks);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Seats locked successfully",
            lockedSeats = request.SeatIds,
            expiresAt,
            lockDurationSeconds = LOCK_DURATION_MINUTES * 60,
        });
    }

    [HttpPost("{showtimeId}/unlock")]
    [Authorize]
    public async Task<ActionResult> UnlockSeats(Guid showtimeId, LockSeatsRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var locksToRemove = await _db.SeatLocks
            .Where(sl => sl.ShowTimeId == showtimeId
                         && sl.LockedByUserId == userId
                         && !sl.IsConfirmed
                         && request.SeatIds.Contains(sl.SeatId))
            .ToListAsync();

        _db.SeatLocks.RemoveRange(locksToRemove);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Seats unlocked", unlockedCount = locksToRemove.Count });
    }

    [HttpPost("{showtimeId}/confirm")]
    [Authorize]
    public async Task<ActionResult> ConfirmSeats(Guid showtimeId, LockSeatsRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var locks = await _db.SeatLocks
            .Where(sl => sl.ShowTimeId == showtimeId
                         && sl.LockedByUserId == userId
                         && !sl.IsConfirmed
                         && request.SeatIds.Contains(sl.SeatId))
            .ToListAsync();

        if (locks.Count != request.SeatIds.Count)
            return Conflict(new { message = "Some seats are no longer locked by you. Please re-select." });

        foreach (var seatLock in locks)
            seatLock.IsConfirmed = true;

        var showtime = await _db.ShowTimes.FirstOrDefaultAsync(s => s.Id == showtimeId);
        if (showtime != null)
            showtime.AvailableSeats = Math.Max(0, showtime.AvailableSeats - locks.Count);

        await _db.SaveChangesAsync();

        return Ok(new { message = "Seats confirmed", confirmedSeats = request.SeatIds });
    }
}

public record LockSeatsRequest(List<string> SeatIds);