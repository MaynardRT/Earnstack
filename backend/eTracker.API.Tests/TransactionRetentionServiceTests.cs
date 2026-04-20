using eTracker.API.Data;
using eTracker.API.Models;
using eTracker.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace eTracker.API.Tests;

public class TransactionRetentionServiceTests
{
    [Fact]
    public async Task ArchiveExpiredTransactionsAsync_MovesTransactionsOlderThanSixMonthsToDeletedTable()
    {
        using var context = CreateContext();
        var now = new DateTime(2026, 4, 20, 12, 0, 0, DateTimeKind.Utc);
        var expiredTransactionId = Guid.NewGuid();
        var expiredUserId = Guid.NewGuid();
        var recentTransactionId = Guid.NewGuid();

        context.Transactions.AddRange(
            new Transaction
            {
                Id = expiredTransactionId,
                UserId = expiredUserId,
                TransactionType = "EWallet",
                Amount = 500m,
                ServiceCharge = 5m,
                TotalAmount = 505m,
                Status = "Completed",
                CreatedAt = now.AddMonths(-6).AddDays(-1),
                UpdatedAt = now.AddMonths(-6).AddDays(-1)
            },
            new Transaction
            {
                Id = recentTransactionId,
                UserId = Guid.NewGuid(),
                TransactionType = "Printing",
                Amount = 100m,
                ServiceCharge = 0m,
                TotalAmount = 100m,
                Status = "Completed",
                CreatedAt = now.AddMonths(-5),
                UpdatedAt = now.AddMonths(-5)
            });

        context.EWalletTransactions.Add(new EWalletTransaction
        {
            Id = Guid.NewGuid(),
            TransactionId = expiredTransactionId,
            Provider = "GCash",
            Method = "CashIn",
            AmountBracket = "0-1000",
            ReferenceNumber = "REF-ARCHIVE",
            BaseAmount = 500m,
            CreatedAt = now.AddMonths(-6).AddDays(-1)
        });

        await context.SaveChangesAsync();

        var service = new TransactionRetentionService(context, NullLogger<TransactionRetentionService>.Instance);

        var archivedCount = await service.ArchiveExpiredTransactionsAsync(now);

        Assert.Equal(1, archivedCount);
        Assert.False(await context.Transactions.AnyAsync(t => t.Id == expiredTransactionId));
        Assert.True(await context.Transactions.AnyAsync(t => t.Id == recentTransactionId));

        var deletedTransaction = await context.DeletedTransactions.SingleAsync();
        Assert.Equal(expiredTransactionId, deletedTransaction.OriginalTransactionId);
        Assert.Equal(expiredUserId, deletedTransaction.UserId);
        Assert.Equal("EWallet", deletedTransaction.TransactionType);
        Assert.Equal("GCash", deletedTransaction.Provider);
        Assert.Equal("CashIn", deletedTransaction.Method);
        Assert.Equal("REF-ARCHIVE", deletedTransaction.ReferenceNumber);
        Assert.Equal(now, deletedTransaction.DeletedAt);
    }

    [Fact]
    public async Task ArchiveExpiredTransactionsAsync_LeavesTransactionsAtSixMonthBoundaryInActiveTable()
    {
        using var context = CreateContext();
        var now = new DateTime(2026, 4, 20, 12, 0, 0, DateTimeKind.Utc);
        var boundaryTransactionId = Guid.NewGuid();

        context.Transactions.Add(new Transaction
        {
            Id = boundaryTransactionId,
            UserId = Guid.NewGuid(),
            TransactionType = "Printing",
            Amount = 50m,
            ServiceCharge = 0m,
            TotalAmount = 50m,
            Status = "Completed",
            CreatedAt = now.AddMonths(-6),
            UpdatedAt = now.AddMonths(-6)
        });

        await context.SaveChangesAsync();

        var service = new TransactionRetentionService(context, NullLogger<TransactionRetentionService>.Instance);

        var archivedCount = await service.ArchiveExpiredTransactionsAsync(now);

        Assert.Equal(0, archivedCount);
        Assert.True(await context.Transactions.AnyAsync(t => t.Id == boundaryTransactionId));
        Assert.False(await context.DeletedTransactions.AnyAsync());
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}