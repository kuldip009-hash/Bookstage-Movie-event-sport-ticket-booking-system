namespace Bookstage.Api.Domain.Entities;

public class Seat
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ShowTimeId { get; set; }
    public string SeatNumber { get; set; } = string.Empty; // e.g., "A1", "B10"
    public string Row { get; set; } = string.Empty;
    public int Column { get; set; }
    public string Category { get; set; } = "Standard"; // VIP, Premium, Standard, Economy
    public double Price { get; set; }
    public string Status { get; set; } = "available"; // available, booked, locked
    public Guid? LockedByUserId { get; set; }
    public DateTime? LockedAt { get; set; }
    public Guid? BookedByUserId { get; set; }
    public Guid? BookingId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ShowTime? ShowTime { get; set; }
    public User? LockedByUser { get; set; }
    public User? BookedByUser { get; set; }
    public Booking? Booking { get; set; }
}
