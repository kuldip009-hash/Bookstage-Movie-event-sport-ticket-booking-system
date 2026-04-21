namespace Bookstage.Api.Domain.Entities;

public class SeatLock
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? ShowTimeId { get; set; }
    public Guid? EventId { get; set; }
    public string SeatId { get; set; } = string.Empty; // e.g. "A-3"
    public Guid LockedByUserId { get; set; }
    public DateTime LockedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public bool IsConfirmed { get; set; } = false; // becomes true after booking

    // Navigation
    public ShowTime? ShowTime { get; set; }
    public User? User { get; set; }
    public Event? Event { get; set; }
}
