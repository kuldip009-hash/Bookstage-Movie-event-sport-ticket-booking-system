namespace Bookstage.Api.Domain.Entities;

public class Booking
{
   
     public Guid Id { get; set; }   // ✅ MUST EXIST
public Guid UserId { get; set; }
public Guid? MovieId { get; set; }
public Guid? EventId { get; set; }
public Guid? ShowTimeId { get; set; }
    public string BookingType { get; set; } = string.Empty; // "Movie" or "Event"
    public string EventOrMovieTitle { get; set; } = string.Empty;
    public string VenueName { get; set; } = string.Empty;
    public string VenueCity { get; set; } = string.Empty;
    public DateTime BookingDate { get; set; } = DateTime.UtcNow;
    public DateTime EventDate { get; set; }
    public TimeSpan EventTime { get; set; }
    public string SeatsBooked { get; set; } = string.Empty; // comma-separated
    public string SeatCategory { get; set; } = string.Empty; // VIP, Premium, Standard
    public double TotalPrice { get; set; }
    public string Status { get; set; } = "confirmed"; // confirmed, cancelled, completed
    public string? PaymentId { get; set; }
    public double? RefundAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
    public Movie? Movie { get; set; }
    public Event? Event { get; set; }
    public ShowTime? ShowTime { get; set; }
}
