using Microsoft.EntityFrameworkCore;
using eTracker.API.Models;

namespace eTracker.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {

    }

    public DbSet<User> Users { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<EWalletTransaction> EWalletTransactions { get; set; }
    public DbSet<PrintingTransaction> PrintingTransactions { get; set; }
    public DbSet<ServiceFee> ServiceFees { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>()
            .HasKey(u => u.Id);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasMany(u => u.Transactions)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Transaction>()
            .Property(t => t.Amount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Transaction>()
            .Property(t => t.ServiceCharge)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Transaction>()
            .Property(t => t.TotalAmount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<ServiceFee>()
            .Property(f => f.FeePercentage)
            .HasPrecision(5, 2);

        modelBuilder.Entity<ServiceFee>()
            .Property(f => f.FlatFee)
            .HasPrecision(10, 2);

        modelBuilder.Entity<ServiceFee>()
            .Property(f => f.BracketMinAmount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<ServiceFee>()
            .Property(f => f.BracketMaxAmount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<EWalletTransaction>()
            .Property(e => e.BaseAmount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<PrintingTransaction>()
            .Property(p => p.BaseAmount)
            .HasPrecision(10, 2);

        // Transaction Configuration
        modelBuilder.Entity<Transaction>()
            .HasKey(t => t.Id);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.EWalletTransaction)
            .WithOne(e => e.Transaction)
            .HasForeignKey<EWalletTransaction>(e => e.TransactionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.PrintingTransaction)
            .WithOne(p => p.Transaction)
            .HasForeignKey<PrintingTransaction>(p => p.TransactionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Create indexes for performance
        modelBuilder.Entity<Transaction>()
            .HasIndex(t => t.UserId);

        modelBuilder.Entity<Transaction>()
            .HasIndex(t => t.CreatedAt);

        modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
