namespace Bookstage.Api.Domain.Entities;

public class Offer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = "percentage"; // percentage, fixed, free-ticket
    public double DiscountValue { get; set; } // percentage (0-100) or fixed amount
    public double? MinimumAmount { get; set; }
    public double? MaximumDiscount { get; set; }
    public int UsageLimit { get; set; } = 9999;
    public int UsedCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string? ApplicableFor { get; set; } // movie, event, all
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
