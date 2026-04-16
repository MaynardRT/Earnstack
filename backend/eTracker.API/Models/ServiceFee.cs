namespace eTracker.API.Models;

public class ServiceFee
{
    public Guid Id { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string? ProviderType { get; set; }
    public string? MethodType { get; set; }
    public decimal? FeePercentage { get; set; }
    public decimal? FlatFee { get; set; }
    public decimal? BracketMinAmount { get; set; }
    public decimal? BracketMaxAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
