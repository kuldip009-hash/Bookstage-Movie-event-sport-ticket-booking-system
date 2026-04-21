namespace Bookstage.Api.Domain.Entities;

public class ShowTime
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? MovieId { get; set; }
    public string VenueName { get; set; } = string.Empty;
    public string VenueCity { get; set; } = string.Empty;
    public DateTime ShowDate { get; set; }
    public TimeSpan ShowTimeOfDay { get; set; }
    public double Price { get; set; }
    public int TotalSeats { get; set; } = 100;
    public int AvailableSeats { get; set; } = 100;
    public string? SeatLayout { get; set; } // JSON: rows and columns
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Movie? Movie { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
