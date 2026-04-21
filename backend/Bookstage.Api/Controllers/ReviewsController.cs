using System.Security.Claims;
using Bookstage.Api.Domain.Entities;
using Bookstage.Api.DTOs;
using Bookstage.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bookstage.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly BookstageDbContext _db;

    public ReviewsController(BookstageDbContext db)
    {
        _db = db;
    }

    [HttpGet("movie/{movieId}")]
    public async Task<ActionResult<List<ReviewDto>>> GetForMovie(Guid movieId)
    {
        var currentUserId = TryGetUserId();
        var reviews = await _db.Reviews
            .AsNoTracking()
            .Include(r => r.User)
            .Where(r => r.MovieId == movieId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews.Select(r => ToDto(r, currentUserId)).ToList());
    }

    [HttpGet("event/{eventId}")]
    public async Task<ActionResult<List<ReviewDto>>> GetForEvent(Guid eventId)
    {
        var currentUserId = TryGetUserId();
        var reviews = await _db.Reviews
            .AsNoTracking()
            .Include(r => r.User)
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews.Select(r => ToDto(r, currentUserId)).ToList());
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> Create(CreateReviewRequest request)
    {
        var userId = TryGetUserId();
        if (userId is null) return Unauthorized();

        if (request.Rating < 1 || request.Rating > 5)
            return BadRequest(new { message = "Rating must be between 1 and 5." });

        var hasMovie = request.MovieId.HasValue;
        var hasEvent = request.EventId.HasValue;
        if (hasMovie == hasEvent)
            return BadRequest(new { message = "Provide exactly one target: movieId or eventId." });

        if (hasMovie)
        {
            var exists = await _db.Movies.AsNoTracking().AnyAsync(m => m.Id == request.MovieId!.Value);
            if (!exists) return NotFound(new { message = "Movie not found." });
        }

        if (hasEvent)
        {
            var exists = await _db.Events.AsNoTracking().AnyAsync(e => e.Id == request.EventId!.Value);
            if (!exists) return NotFound(new { message = "Event not found." });
        }

        var alreadyReviewed = await _db.Reviews.AnyAsync(r =>
            r.UserId == userId.Value &&
            r.MovieId == request.MovieId &&
            r.EventId == request.EventId);

        if (alreadyReviewed)
            return Conflict(new { message = "You have already reviewed this title." });

        var review = new Review
        {
            UserId = userId.Value,
            MovieId = request.MovieId,
            EventId = request.EventId,
            Rating = request.Rating,
            Title = request.Title?.Trim() ?? string.Empty,
            Comment = request.Comment?.Trim() ?? string.Empty,
            Helpful = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        review.User = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId.Value);

        return CreatedAtAction(nameof(Create), new { id = review.Id }, ToDto(review, userId));
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = TryGetUserId();
        if (userId is null) return Unauthorized();

        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review is null) return NotFound();

        if (review.UserId != userId.Value)
            return Forbid();

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private Guid? TryGetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private static ReviewDto ToDto(Review review, Guid? currentUserId)
    {
        var userName = review.User?.FullName;
        if (string.IsNullOrWhiteSpace(userName)) userName = "Bookstage User";

        return new ReviewDto(
            review.Id,
            review.UserId,
            userName,
            review.MovieId,
            review.EventId,
            review.Rating,
            review.Title,
            review.Comment,
            review.Helpful,
            review.CreatedAt,
            currentUserId.HasValue && review.UserId == currentUserId.Value
        );
    }
}
