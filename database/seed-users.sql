-- Database seeding script for eTracker
-- This script creates the initial admin and seller users for development use.
-- Login credentials after seeding:
--   admin@localhost  / Admin@123
--   seller@localhost / Seller@123

-- Insert Admin User
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@localhost')
BEGIN
    INSERT INTO Users (Id, Email, FullName, Role, PasswordHash, CreatedAt, UpdatedAt, IsActive)
    VALUES (
        NEWID(),
        'admin@localhost',
        'Administrator',
        'Admin',
        -- BCrypt hash for password: Admin@123
        '$2a$11$z.ph3x5QF1rmeTADY83s5OS6gOFJILCfXnsHcBpweJGmpMohXz1/i',
        GETUTCDATE(),
        GETUTCDATE(),
        1
    );
END;

-- Insert Seller User
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'seller@localhost')
BEGIN
    INSERT INTO Users (Id, Email, FullName, Role, PasswordHash, CreatedAt, UpdatedAt, IsActive)
    VALUES (
        NEWID(),
        'seller@localhost',
        'Seller',
        'Seller',
        -- BCrypt hash for password: Seller@123
        '$2a$11$FPwgEvhQf0MMBDXZX.ELp.oxeUOsWRq1TprRK/aBFqssmSTKCS6n6',
        GETUTCDATE(),
        GETUTCDATE(),
        1
    );
END;

-- IMPORTANT SECURITY NOTES:
-- 1. These are test credentials - DO NOT use in production
-- 2. Change the default passwords immediately after first login
-- 3. Never commit real credentials to version control
-- 4. Use environment variables for sensitive configuration
-- 5. In production, use strong passwords and rotate them regularly
-- 
-- To generate new BCrypt hashes:
-- 1. Visit: https://bcrypt-generator.com/
-- 2. Or run application and use AuthService.HashPassword()
