namespace Bookstage.Api.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public double Amount { get; set; }
    public string PaymentMethod { get; set; } = "card"; // card, upi, netbanking, wallet
    public string TransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending, completed, failed, refunded
    public string? PaymentGateway { get; set; } // razorpay, stripe, etc.
    public string? GatewayTransactionId { get; set; }
    public string? GatewayResponse { get; set; }
    public double? RefundAmount { get; set; }
    public string? RefundStatus { get; set; } // pending, completed, failed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Booking? Booking { get; set; }
    public User? User { get; set; }
}
