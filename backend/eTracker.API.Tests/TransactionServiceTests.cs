using eTracker.API.Data;
using eTracker.API.DTOs;
using eTracker.API.Models;
using eTracker.API.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace eTracker.API.Tests;

public class TransactionServiceTests
{
    [Fact]
    public async Task GetTransactionSummary_WithNullUserId_ReturnsAllUsersCompletedTotals()
    {
        using var context = CreateContext();
        var userA = Guid.NewGuid();
        var userB = Guid.NewGuid();

        context.Transactions.AddRange(
            CreateTransaction(userA, 150m, "Completed", DateTime.UtcNow),
            CreateTransaction(userB, 275m, "Completed", DateTime.UtcNow.AddDays(-2)),
            CreateTransaction(userA, 999m, "Failed", DateTime.UtcNow));
        await context.SaveChangesAsync();

        var service = CreateService(context);

        var summary = await service.GetTransactionSummary(null);

        Assert.Equal(150m, summary.DailyTotal);
        Assert.Equal(425m, summary.WeeklyTotal);
        Assert.Equal(425m, summary.MonthlyTotal);
        Assert.Equal(3, summary.TotalTransactions);
    }

    [Fact]
    public async Task CreatePrintingTransaction_UsesSubtotalWithoutServiceCharge()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var result = await service.CreatePrintingTransaction(Guid.NewGuid(), new CreatePrintingTransactionDto
        {
            ServiceType = "Printing",
            PaperSize = "Short",
            Color = "Grayscale",
            BaseAmount = 2.50m,
            Quantity = 4
        });

        Assert.NotNull(result);
        Assert.Equal(10m, result!.Amount);
        Assert.Equal(0m, result.ServiceCharge);
        Assert.Equal(10m, result.TotalAmount);
    }

    [Fact]
    public async Task CreateEWalletTransaction_UsesFivePercentChargeAtOrAbove5001()
    {
        using var context = CreateContext();
        var service = CreateService(context, new StubServiceFeeService(new ServiceFee
        {
            Id = Guid.NewGuid(),
            ServiceType = "EWallet",
            ProviderType = "GCash",
            MethodType = "CashIn",
            FeePercentage = 1m
        }));

        var result = await service.CreateEWalletTransaction(Guid.NewGuid(), new CreateEWalletTransactionDto
        {
            Provider = "GCash",
            Method = "CashIn",
            AmountBracket = "5000+",
            ReferenceNumber = "REF-001",
            BaseAmount = 6000m
        });

        Assert.NotNull(result);
        Assert.Equal(300m, result!.ServiceCharge);
        Assert.Equal(6300m, result.TotalAmount);
    }

    private static TransactionService CreateService(ApplicationDbContext context, IServiceFeeService? serviceFeeService = null)
    {
        return new TransactionService(context, serviceFeeService ?? new StubServiceFeeService());
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static Transaction CreateTransaction(Guid userId, decimal totalAmount, string status, DateTime createdAt)
    {
        return new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TransactionType = "EWallet",
            Amount = totalAmount,
            ServiceCharge = 0m,
            TotalAmount = totalAmount,
            Status = status,
            CreatedAt = createdAt,
            UpdatedAt = createdAt
        };
    }

    private sealed class StubServiceFeeService : IServiceFeeService
    {
        private readonly ServiceFee? _eWalletFee;

        public StubServiceFeeService(ServiceFee? eWalletFee = null)
        {
            _eWalletFee = eWalletFee;
        }

        public Task<ServiceFee?> GetServiceFeeForEWallet(string provider, string method)
            => Task.FromResult(_eWalletFee);

        public Task<ServiceFee?> GetServiceFeeForPrinting(string serviceType)
            => Task.FromResult<ServiceFee?>(null);

        public Task<List<ServiceFeeDto>> GetAllServiceFees()
            => Task.FromResult(new List<ServiceFeeDto>());

        public Task<ServiceFeeDto?> CreateServiceFee(CreateServiceFeeDto dto)
            => Task.FromResult<ServiceFeeDto?>(null);

        public Task<ServiceFeeDto?> UpdateServiceFee(Guid id, UpdateServiceFeeDto dto)
            => Task.FromResult<ServiceFeeDto?>(null);

        public Task<bool> DeleteServiceFee(Guid id)
            => Task.FromResult(false);
    }
}