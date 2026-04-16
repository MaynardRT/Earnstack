using Microsoft.EntityFrameworkCore;
using eTracker.API.Models;
using eTracker.API.Services;

namespace eTracker.API.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("DatabaseInitializer");
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        logger.LogInformation("Applying database migrations.");
        await dbContext.Database.MigrateAsync();

        await SeedAdminUserAsync(scope.ServiceProvider, configuration, dbContext, logger);
    }

    private static async Task SeedAdminUserAsync(
        IServiceProvider services,
        IConfiguration configuration,
        ApplicationDbContext dbContext,
        ILogger logger)
    {
        var adminEmail = configuration["Seed:AdminEmail"]?.Trim();
        var adminPassword = configuration["Seed:AdminPassword"];

        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            logger.LogInformation("Admin bootstrap skipped because seed credentials were not provided.");
            return;
        }

        var normalizedEmail = adminEmail.ToLowerInvariant();
        var existingAdmin = await dbContext.Users.AnyAsync(user => user.Email.ToLower() == normalizedEmail);
        if (existingAdmin)
        {
            logger.LogInformation("Admin bootstrap skipped because the configured admin account already exists.");
            return;
        }

        var authService = services.GetRequiredService<IAuthService>();
        var adminFullName = configuration["Seed:AdminFullName"]?.Trim();

        dbContext.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = adminEmail,
            FullName = string.IsNullOrWhiteSpace(adminFullName) ? "Administrator" : adminFullName,
            Role = "Admin",
            PasswordHash = authService.HashPassword(adminPassword),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true
        });

        await dbContext.SaveChangesAsync();
        logger.LogInformation("Bootstrapped initial admin account for {AdminEmail}.", adminEmail);
    }
}