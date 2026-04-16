namespace eTracker.API.Models;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TransactionType { get; set; } = string.Empty; // "EWallet" or "Printing"
    public decimal Amount { get; set; }
    public decimal? ServiceCharge { get; set; }
    public decimal? TotalAmount { get; set; }
    public string Status { get; set; } = "Completed"; // "Pending", "Completed", "Failed"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? User { get; set; }
    public EWalletTransaction? EWalletTransaction { get; set; }
    public PrintingTransaction? PrintingTransaction { get; set; }
}
