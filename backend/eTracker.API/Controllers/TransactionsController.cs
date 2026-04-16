using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using eTracker.API.DTOs;
using eTracker.API.Services;
using System.Security.Claims;

namespace eTracker.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    private bool IsAdmin() => User.IsInRole("Admin") || User.FindFirst(ClaimTypes.Role)?.Value == "Admin";

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var userIdValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdValue, out userId);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<TransactionSummaryDto>> GetSummary()
    {
        if (!TryGetCurrentUserId(out var userGuid))
            return Unauthorized();

        var summary = await _transactionService.GetTransactionSummary(IsAdmin() ? null : userGuid);
        return Ok(summary);
    }

    [HttpGet("recent")]
    public async Task<ActionResult<List<TransactionListDto>>> GetRecentTransactions([FromQuery] int days = 30)
    {
        if (!TryGetCurrentUserId(out var userGuid))
            return Unauthorized();

        var transactions = await _transactionService.GetRecentTransactions(IsAdmin() ? null : userGuid, days);
        return Ok(transactions);
    }

    [HttpGet("by-period")]
    public async Task<ActionResult<List<TransactionListDto>>> GetTransactionsByPeriod([FromQuery] string period = "monthly")
    {
        if (!TryGetCurrentUserId(out var userGuid))
            return Unauthorized();

        var transactions = await _transactionService.GetTransactionsByPeriod(IsAdmin() ? null : userGuid, period);
        return Ok(transactions);
    }

    [HttpPost("ewallet")]
    public async Task<ActionResult<TransactionListDto>> CreateEWalletTransaction([FromBody] CreateEWalletTransactionDto request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var transaction = await _transactionService.CreateEWalletTransaction(userGuid, request);
        if (transaction == null)
            return BadRequest("Failed to create transaction");

        return Ok(transaction);
    }

    [HttpPost("printing")]
    public async Task<ActionResult<TransactionListDto>> CreatePrintingTransaction([FromBody] CreatePrintingTransactionDto request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var transaction = await _transactionService.CreatePrintingTransaction(userGuid, request);
        if (transaction == null)
            return BadRequest("Failed to create transaction");

        return Ok(transaction);
    }
}
