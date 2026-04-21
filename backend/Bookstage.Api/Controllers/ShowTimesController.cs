using Bookstage.Api.DTOs;
using Bookstage.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bookstage.Api.Controllers;

[ApiController]
[Route("api/movies/{movieId}/showtimes")]
public class ShowTimesController : ControllerBase
{
    private readonly BookstageDbContext _db;

    public ShowTimesController(BookstageDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<ShowTimeDto>>> GetByMovieAndCity(Guid movieId, [FromQuery] string? city)
    {
        var movie = await _db.Movies.AsNoTracking().FirstOrDefaultAsync(m => m.Id == movieId);
        if (movie is null) return NotFound(new { message = "Movie not found" });

        var query = _db.ShowTimes.AsNoTracking().Where(s => s.MovieId == movieId);

        if (!string.IsNullOrWhiteSpace(city))
        {
            query = query.Where(s => s.VenueCity == city);
        }

        var showTimes = await query
            .OrderBy(s => s.ShowDate)
            .ThenBy(s => s.ShowTimeOfDay)
            .ToListAsync();

        return Ok(showTimes.Select(s => new ShowTimeDto(
            s.Id,
            s.MovieId ?? Guid.Empty,
            s.VenueName,
            s.VenueCity,
            s.ShowDate,
            s.ShowTimeOfDay,
            s.Price,
            s.TotalSeats,
            s.AvailableSeats
        )).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ShowTimeDto>> GetById(Guid movieId, Guid id)
    {
        var showTime = await _db.ShowTimes
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id && s.MovieId == movieId);

        if (showTime is null) return NotFound();

        return Ok(new ShowTimeDto(
            showTime.Id,
            showTime.MovieId ?? Guid.Empty,
            showTime.VenueName,
            showTime.VenueCity,
            showTime.ShowDate,
            showTime.ShowTimeOfDay,
            showTime.Price,
            showTime.TotalSeats,
            showTime.AvailableSeats
        ));
    }

    [HttpPost]
    public async Task<ActionResult<ShowTimeDto>> Create(Guid movieId, CreateShowTimeRequest request)
    {
        // Verify movie exists
        var movie = await _db.Movies.FirstOrDefaultAsync(m => m.Id == movieId);
        if (movie is null) return NotFound(new { message = "Movie not found" });

        var showTime = new Bookstage.Api.Domain.Entities.ShowTime
        {
            MovieId = movieId,
            VenueName = request.VenueName,
            VenueCity = request.VenueCity,
            ShowDate = request.ShowDate,
            ShowTimeOfDay = request.ShowTimeOfDay,
            Price = request.Price,
            TotalSeats = request.TotalSeats,
            AvailableSeats = request.TotalSeats,
        };

        _db.ShowTimes.Add(showTime);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { movieId, id = showTime.Id }, new ShowTimeDto(
            showTime.Id,
            showTime.MovieId ?? Guid.Empty,
            showTime.VenueName,
            showTime.VenueCity,
            showTime.ShowDate,
            showTime.ShowTimeOfDay,
            showTime.Price,
            showTime.TotalSeats,
            showTime.AvailableSeats
        ));
    }
}
