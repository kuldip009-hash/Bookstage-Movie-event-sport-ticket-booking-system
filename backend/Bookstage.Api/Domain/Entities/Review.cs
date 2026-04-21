namespace Bookstage.Api.Domain.Entities;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid? MovieId { get; set; }
    public Guid? EventId { get; set; }
    public int Rating { get; set; } // 1-5
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public int Helpful { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
    public Movie? Movie { get; set; }
    public Event? Event { get; set; }
}
