using Bookstage.Api.DTOs;
using Bookstage.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bookstage.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly BookstageDbContext _db;

    public MoviesController(BookstageDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<MovieDto>>> GetAll([FromQuery] bool nowShowing = true)
    {
        var movies = await _db.Movies
            .AsNoTracking()
            .Where(m => m.IsNowShowing == nowShowing)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        return Ok(movies.Select(m => new MovieDto(
            m.Id,
            m.Title,
            m.Description,
            m.Genre,
            m.Language,
            m.Rating,
            m.Duration,
            m.ReleaseDate,
            m.DirectorName,
            m.CastNames,
            m.PosterUrl,
            m.YoutubeTrailerId,
            m.GalleryImageUrls,
            m.IsNowShowing
        )).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MovieDto>> GetById(Guid id)
    {
        var movie = await _db.Movies.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        if (movie is null) return NotFound();

        return Ok(new MovieDto(
            movie.Id,
            movie.Title,
            movie.Description,
            movie.Genre,
            movie.Language,
            movie.Rating,
            movie.Duration,
            movie.ReleaseDate,
            movie.DirectorName,
            movie.CastNames,
            movie.PosterUrl,
            movie.YoutubeTrailerId,
            movie.GalleryImageUrls,
            movie.IsNowShowing
        ));
    }

    [HttpPost]
    public async Task<ActionResult<MovieDto>> Create(CreateMovieRequest request)
    {
        var movie = new Bookstage.Api.Domain.Entities.Movie
        {
            Title = request.Title,
            Description = request.Description,
            Genre = request.Genre,
            Language = request.Language,
            Rating = request.Rating,
            Duration = request.Duration,
            ReleaseDate = request.ReleaseDate,
            DirectorName = request.DirectorName,
            CastNames = request.CastNames,
            PosterUrl = request.PosterUrl,
            YoutubeTrailerId = request.YoutubeTrailerId,
            GalleryImageUrls = request.GalleryImageUrls,
            IsNowShowing = request.IsNowShowing,
        };

        _db.Movies.Add(movie);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = movie.Id }, new MovieDto(
            movie.Id,
            movie.Title,
            movie.Description,
            movie.Genre,
            movie.Language,
            movie.Rating,
            movie.Duration,
            movie.ReleaseDate,
            movie.DirectorName,
            movie.CastNames,
            movie.PosterUrl,
            movie.YoutubeTrailerId,
            movie.GalleryImageUrls,
            movie.IsNowShowing
        ));
    }
}
