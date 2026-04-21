using System.Security.Claims;
using Bookstage.Api.DTOs;
using Bookstage.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bookstage.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly BookstageDbContext _db;

    public BookingsController(BookstageDbContext db)
    {
        _db = db;
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<BookingDto>>> GetMyBookings()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var bookings = await _db.Bookings
            .AsNoTracking()
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();

        return Ok(bookings.Select(b => new BookingDto(
            b.Id,
            b.UserId,
            b.BookingType,
            b.EventOrMovieTitle,
            b.VenueName,
            b.VenueCity,
            b.BookingDate,
            b.EventDate,
            b.EventTime,
            b.SeatsBooked,
            b.SeatCategory,
            b.TotalPrice,
            b.Status,
            b.PaymentId,
            b.RefundAmount
        )).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingDto>> GetById(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var booking = await _db.Bookings.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (booking is null) return NotFound();

        return Ok(new BookingDto(
            booking.Id,
            booking.UserId,
            booking.BookingType,
            booking.EventOrMovieTitle,
            booking.VenueName,
            booking.VenueCity,
            booking.BookingDate,
            booking.EventDate,
            booking.EventTime,
            booking.SeatsBooked,
            booking.SeatCategory,
            booking.TotalPrice,
            booking.Status,
            booking.PaymentId,
            booking.RefundAmount
        ));
    }

    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create(CreateBookingRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var booking = new Bookstage.Api.Domain.Entities.Booking
        {
            UserId = userId,
            MovieId = request.MovieId,
            EventId = request.EventId,
            ShowTimeId = request.ShowTimeId,
            BookingType = request.BookingType,
            EventOrMovieTitle = request.EventOrMovieTitle,
            VenueName = request.VenueName,
            VenueCity = request.VenueCity,
            EventDate = request.EventDate,
            EventTime = request.EventTime,
            SeatsBooked = request.SeatsBooked,
            SeatCategory = request.SeatCategory,
            TotalPrice = request.TotalPrice,
            Status = "confirmed",
            BookingDate = DateTime.UtcNow,
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, new BookingDto(
            booking.Id,
            booking.UserId,
            booking.BookingType,
            booking.EventOrMovieTitle,
            booking.VenueName,
            booking.VenueCity,
            booking.BookingDate,
            booking.EventDate,
            booking.EventTime,
            booking.SeatsBooked,
            booking.SeatCategory,
            booking.TotalPrice,
            booking.Status,
            booking.PaymentId,
            booking.RefundAmount
        ));
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<BookingDto>> CancelBooking(Guid id, UpdateBookingStatusRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (booking is null) return NotFound();

        booking.Status = request.Status;
        booking.UpdatedAt = DateTime.UtcNow;

        // Calculate refund (80% of total)
        if (request.Status == "cancelled")
        {
            booking.RefundAmount = booking.TotalPrice * 0.8;
        }

        await _db.SaveChangesAsync();

        return Ok(new BookingDto(
            booking.Id,
            booking.UserId,
            booking.BookingType,
            booking.EventOrMovieTitle,
            booking.VenueName,
            booking.VenueCity,
            booking.BookingDate,
            booking.EventDate,
            booking.EventTime,
            booking.SeatsBooked,
            booking.SeatCategory,
            booking.TotalPrice,
            booking.Status,
            booking.PaymentId,
            booking.RefundAmount
        ));
    }
}
