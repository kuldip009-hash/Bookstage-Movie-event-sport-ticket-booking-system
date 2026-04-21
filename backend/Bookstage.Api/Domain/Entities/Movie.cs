namespace Bookstage.Api.Domain.Entities;
public class Movie
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public string Language { get; set; } = "English";
    public double? Rating { get; set; }
    public int? Duration { get; set; } // in minutes
    public DateTime ReleaseDate { get; set; }
    public string? DirectorName { get; set; }
    public string? CastNames { get; set; } // comma-separated
    public string? PosterUrl { get; set; }
    public string? YoutubeTrailerId { get; set; }
    public string? GalleryImageUrls { get; set; }
    public bool IsNowShowing { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<ShowTime> ShowTimes { get; set; } = new List<ShowTime>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
