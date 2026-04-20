-- Template seeding script for local development only.
-- Copy this file to seed-users.local.sql and replace every placeholder before running it.
-- Never commit real emails, passwords, or BCrypt hashes to version control.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert Admin User
INSERT INTO "Users" ("Id", "Email", "FullName", "Role", "PasswordHash", "CreatedAt", "UpdatedAt", "IsActive")
VALUES (
    gen_random_uuid(),
    'REPLACE_WITH_ADMIN_EMAIL',
    'REPLACE_WITH_ADMIN_NAME',
    'Admin',
    'REPLACE_WITH_ADMIN_BCRYPT_HASH',
    timezone('utc', now()),
    timezone('utc', now()),
    true
)
ON CONFLICT ("Email") DO NOTHING;

-- Insert Seller User
INSERT INTO "Users" ("Id", "Email", "FullName", "Role", "PasswordHash", "CreatedAt", "UpdatedAt", "IsActive")
VALUES (
    gen_random_uuid(),
    'REPLACE_WITH_SELLER_EMAIL',
    'REPLACE_WITH_SELLER_NAME',
    'Seller',
    'REPLACE_WITH_SELLER_BCRYPT_HASH',
    timezone('utc', now()),
    timezone('utc', now()),
    true
)
ON CONFLICT ("Email") DO NOTHING;