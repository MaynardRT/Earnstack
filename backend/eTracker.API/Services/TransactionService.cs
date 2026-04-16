using Microsoft.EntityFrameworkCore;
using eTracker.API.Data;
using eTracker.API.DTOs;
using eTracker.API.Models;

namespace eTracker.API.Services;

public interface ITransactionService
{
    Task<TransactionSummaryDto> GetTransactionSummary(Guid? userId = null);
    Task<List<TransactionListDto>> GetRecentTransactions(Guid? userId = null, int days = 30);
    Task<List<TransactionListDto>> GetTransactionsByPeriod(Guid? userId, string period);
    Task<TransactionListDto?> CreateEWalletTransaction(Guid userId, CreateEWalletTransactionDto dto);
    Task<TransactionListDto?> CreatePrintingTransaction(Guid userId, CreatePrintingTransactionDto dto);
}

public class TransactionService : ITransactionService
{
    private readonly ApplicationDbContext _context;
    private readonly IServiceFeeService _serviceFeeService;

    public TransactionService(ApplicationDbContext context, IServiceFeeService serviceFeeService)
    {
        _context = context;
        _serviceFeeService = serviceFeeService;
    }

    public async Task<TransactionSummaryDto> GetTransactionSummary(Guid? userId = null)
    {
        var today = DateTime.UtcNow.Date;
        var weekAgo = today.AddDays(-7);
        var monthAgo = today.AddDays(-30);

        var transactionsQuery = _context.Transactions.AsQueryable();

        if (userId.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(t => t.UserId == userId.Value);
        }

        var dailyTotal = await transactionsQuery
            .Where(t => t.CreatedAt.Date == today && t.Status == "Completed")
            .SumAsync(t => t.TotalAmount ?? 0);

        var weeklyTotal = await transactionsQuery
            .Where(t => t.CreatedAt >= weekAgo && t.Status == "Completed")
            .SumAsync(t => t.TotalAmount ?? 0);

        var monthlyTotal = await transactionsQuery
            .Where(t => t.CreatedAt >= monthAgo && t.Status == "Completed")
            .SumAsync(t => t.TotalAmount ?? 0);

        var totalTransactions = await transactionsQuery.CountAsync();

        return new TransactionSummaryDto
        {
            DailyTotal = dailyTotal,
            WeeklyTotal = weeklyTotal,
            MonthlyTotal = monthlyTotal,
            TotalTransactions = totalTransactions
        };
    }

    public async Task<List<TransactionListDto>> GetRecentTransactions(Guid? userId = null, int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);

        var transactionsQuery = _context.Transactions
            .Where(t => t.CreatedAt >= startDate);

        if (userId.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(t => t.UserId == userId.Value);
        }

        return await transactionsQuery
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TransactionListDto
            {
                Id = t.Id,
                TransactionType = t.TransactionType,
                Amount = t.Amount,
                ServiceCharge = t.ServiceCharge ?? 0,
                TotalAmount = t.TotalAmount ?? 0,
                Status = t.Status,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<List<TransactionListDto>> GetTransactionsByPeriod(Guid? userId, string period)
    {
        var startDate = period.ToLower() switch
        {
            "daily" => DateTime.UtcNow.Date,
            "weekly" => DateTime.UtcNow.Date.AddDays(-7),
            "monthly" => DateTime.UtcNow.Date.AddDays(-30),
            _ => DateTime.UtcNow.Date.AddDays(-30)
        };

        var transactionsQuery = _context.Transactions
            .Where(t => t.CreatedAt >= startDate);

        if (userId.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(t => t.UserId == userId.Value);
        }

        return await transactionsQuery
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TransactionListDto
            {
                Id = t.Id,
                TransactionType = t.TransactionType,
                Amount = t.Amount,
                ServiceCharge = t.ServiceCharge ?? 0,
                TotalAmount = t.TotalAmount ?? 0,
                Status = t.Status,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<TransactionListDto?> CreateEWalletTransaction(Guid userId, CreateEWalletTransactionDto dto)
    {
        var serviceFee = await _serviceFeeService.GetServiceFeeForEWallet(dto.Provider, dto.Method);
        var serviceCharge = CalculateEWalletServiceCharge(dto.BaseAmount, serviceFee);
        var totalAmount = dto.BaseAmount + serviceCharge;

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TransactionType = "EWallet",
            Amount = dto.BaseAmount,
            ServiceCharge = serviceCharge,
            TotalAmount = totalAmount,
            Status = "Completed"
        };

        var eWalletTransaction = new EWalletTransaction
        {
            Id = Guid.NewGuid(),
            TransactionId = transaction.Id,
            Provider = dto.Provider,
            Method = dto.Method,
            AmountBracket = dto.AmountBracket,
            ReferenceNumber = dto.ReferenceNumber,
            BaseAmount = dto.BaseAmount
        };

        _context.Transactions.Add(transaction);
        _context.EWalletTransactions.Add(eWalletTransaction);
        await _context.SaveChangesAsync();

        return new TransactionListDto
        {
            Id = transaction.Id,
            TransactionType = transaction.TransactionType,
            Amount = transaction.Amount,
            ServiceCharge = serviceCharge,
            TotalAmount = totalAmount,
            Status = transaction.Status,
            CreatedAt = transaction.CreatedAt
        };
    }

    public async Task<TransactionListDto?> CreatePrintingTransaction(Guid userId, CreatePrintingTransactionDto dto)
    {
        var quantity = Math.Max(1, dto.Quantity);
        var subtotal = dto.BaseAmount * quantity;
        var serviceCharge = 0m;
        var totalAmount = subtotal;

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TransactionType = "Printing",
            Amount = subtotal,
            ServiceCharge = serviceCharge,
            TotalAmount = totalAmount,
            Status = "Completed"
        };

        var printingTransaction = new PrintingTransaction
        {
            Id = Guid.NewGuid(),
            TransactionId = transaction.Id,
            ServiceType = dto.ServiceType,
            PaperSize = dto.PaperSize,
            Color = dto.Color,
            BaseAmount = dto.BaseAmount,
            Quantity = quantity
        };

        _context.Transactions.Add(transaction);
        _context.PrintingTransactions.Add(printingTransaction);
        await _context.SaveChangesAsync();

        return new TransactionListDto
        {
            Id = transaction.Id,
            TransactionType = transaction.TransactionType,
            Amount = transaction.Amount,
            ServiceCharge = serviceCharge,
            TotalAmount = totalAmount,
            Status = transaction.Status,
            CreatedAt = transaction.CreatedAt
        };
    }

    private decimal CalculateServiceCharge(decimal baseAmount, ServiceFee? fee)
    {
        if (fee == null) return 0;

        if (fee.FeePercentage.HasValue)
            return baseAmount * (fee.FeePercentage.Value / 100);

        if (fee.FlatFee.HasValue)
            return fee.FlatFee.Value;

        return 0;
    }

    private decimal CalculateEWalletServiceCharge(decimal baseAmount, ServiceFee? fee)
    {
        if (baseAmount >= 5001)
        {
            return baseAmount * 0.05m;
        }

        if (fee != null)
        {
            return CalculateServiceCharge(baseAmount, fee);
        }

        return baseAmount * 0.01m;
    }
}
