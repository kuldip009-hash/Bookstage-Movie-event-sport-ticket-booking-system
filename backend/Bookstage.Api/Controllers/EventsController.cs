using Bookstage.Api.DTOs;
using Bookstage.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Bookstage.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly BookstageDbContext _db;
    private const int LOCK_DURATION_MINUTES = 5;

    public EventsController(BookstageDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<EventDto>>> GetAll([FromQuery] string? category = null, [FromQuery] string? city = null)
    {
        var query = _db.Events.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(e => e.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(city) && city != "All Cities")
        {
            query = query.Where(e => e.VenueCity == city);
        }

        var events = await query.OrderByDescending(e => e.EventDate).ToListAsync();

        return Ok(events.Select(e => new EventDto(
            e.Id,
            e.Title,
            e.Category,
            e.Description,
            e.VenueName,
            e.VenueCity,
            e.EventDate,
            e.EventTime,
            e.Price,
            e.Rating,
            e.BannerUrl,
            e.IsAvailable
        )).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EventDto>> GetById(Guid id)
    {
        var evt = await _db.Events.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        if (evt is null) return NotFound();

        return Ok(new EventDto(
            evt.Id,
            evt.Title,
            evt.Category,
            evt.Description,
            evt.VenueName,
            evt.VenueCity,
            evt.EventDate,
            evt.EventTime,
            evt.Price,
            evt.Rating,
            evt.BannerUrl,
            evt.IsAvailable
        ));
    }

    [HttpPost]
    public async Task<ActionResult<EventDto>> Create(CreateEventRequest request)
    {
        var evt = new Bookstage.Api.Domain.Entities.Event
        {
            Title = request.Title,
            Category = request.Category,
            Description = request.Description,
            VenueName = request.VenueName,
            VenueCity = request.VenueCity,
            EventDate = request.EventDate,
            EventTime = request.EventTime,
            Price = request.Price,
            Rating = (double)request.Rating,
            BannerUrl = request.BannerUrl,
            IsAvailable = request.IsAvailable,
        };

        _db.Events.Add(evt);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = evt.Id }, new EventDto(
            evt.Id,
            evt.Title,
            evt.Category,
            evt.Description,
            evt.VenueName,
            evt.VenueCity,
            evt.EventDate,
            evt.EventTime,
            evt.Price,
            evt.Rating,
            evt.BannerUrl,
            evt.IsAvailable
        ));
    }

    [HttpGet("{eventId}/seats")]
    public async Task<ActionResult> GetEventSeatStatus(Guid eventId)
    {
        var evt = await _db.Events.AsNoTracking().FirstOrDefaultAsync(e => e.Id == eventId);
        if (evt is null) return NotFound(new { message = "Event not found" });

        // Cleanup expired locks
        var expiredLocks = await _db.SeatLocks
            .Where(sl => sl.EventId == eventId && !sl.IsConfirmed && sl.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();
        if (expiredLocks.Any())
        {
            _db.SeatLocks.RemoveRange(expiredLocks);
            await _db.SaveChangesAsync();
        }

        var activeLocks = await _db.SeatLocks
            .AsNoTracking()
            .Where(sl => sl.EventId == eventId && (sl.IsConfirmed || sl.ExpiresAt > DateTime.UtcNow))
            .Select(sl => new
            {
                sl.SeatId,
                Status = sl.IsConfirmed ? "booked" : "locked",
                sl.LockedByUserId,
                sl.ExpiresAt,
            })
            .ToListAsync();

        return Ok(new
        {
            eventId,
            title = evt.Title,
            venueName = evt.VenueName,
            venueCity = evt.VenueCity,
            eventDate = evt.EventDate,
            eventTime = evt.EventTime,
            price = evt.Price,
            seats = activeLocks,
        });
    }

    [HttpPost("{eventId}/seats/lock")]
    [Authorize]
    public async Task<ActionResult> LockEventSeats(Guid eventId, LockSeatsRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var evt = await _db.Events.FirstOrDefaultAsync(e => e.Id == eventId);
        if (evt is null) return NotFound(new { message = "Event not found" });

        // Clean expired locks
        var expiredLocks = await _db.SeatLocks
            .Where(sl => sl.EventId == eventId && !sl.IsConfirmed && sl.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();
        _db.SeatLocks.RemoveRange(expiredLocks);
        await _db.SaveChangesAsync();

        // Check if seats are taken by someone else
        var takenSeats = await _db.SeatLocks
            .Where(sl => sl.EventId == eventId
                         && request.SeatIds.Contains(sl.SeatId)
                         && sl.LockedByUserId != userId
                         && (sl.IsConfirmed || sl.ExpiresAt > DateTime.UtcNow))
            .Select(sl => sl.SeatId)
            .ToListAsync();

        if (takenSeats.Any())
            return Conflict(new { message = "Some seats are already taken", takenSeats });

        // Replace current user's temporary locks with the newly selected set
        var previousLocks = await _db.SeatLocks
            .Where(sl => sl.EventId == eventId && sl.LockedByUserId == userId && !sl.IsConfirmed)
            .ToListAsync();
        _db.SeatLocks.RemoveRange(previousLocks);

        var expiresAt = DateTime.UtcNow.AddMinutes(LOCK_DURATION_MINUTES);
        var locks = request.SeatIds.Select(seatId => new Bookstage.Api.Domain.Entities.SeatLock
        {
            EventId = eventId,
            ShowTimeId = null,
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

    [HttpPost("{eventId}/seats/unlock")]
    [Authorize]
    public async Task<ActionResult> UnlockEventSeats(Guid eventId, LockSeatsRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var locksToRemove = await _db.SeatLocks
            .Where(sl => sl.EventId == eventId
                         && sl.LockedByUserId == userId
                         && !sl.IsConfirmed
                         && request.SeatIds.Contains(sl.SeatId))
            .ToListAsync();

        _db.SeatLocks.RemoveRange(locksToRemove);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Seats unlocked", unlockedCount = locksToRemove.Count });
    }

    [HttpPost("{eventId}/seats/confirm")]
    [Authorize]
    public async Task<ActionResult> ConfirmEventSeats(Guid eventId, LockSeatsRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var locks = await _db.SeatLocks
            .Where(sl => sl.EventId == eventId
                         && sl.LockedByUserId == userId
                         && !sl.IsConfirmed
                         && request.SeatIds.Contains(sl.SeatId))
            .ToListAsync();

        if (locks.Count != request.SeatIds.Count)
            return Conflict(new { message = "Some seats are no longer locked by you. Please re-select." });

        foreach (var seatLock in locks)
            seatLock.IsConfirmed = true;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Seats confirmed", confirmedSeats = request.SeatIds });
    }
}
