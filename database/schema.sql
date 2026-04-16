-- eTracker Database Schema
-- MS SQL Server

-- Create Database
CREATE DATABASE eTracker;
GO

USE eTracker;
GO

-- Users Table
CREATE TABLE [Users] (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) UNIQUE NOT NULL,
    FullName NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) NOT NULL CHECK (Role IN ('Admin', 'Seller')),
    ProfilePicture NVARCHAR(MAX),
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);

-- Service Fees Configuration Table
CREATE TABLE [ServiceFees] (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ServiceType NVARCHAR(50) NOT NULL UNIQUE,
    ProviderType NVARCHAR(50),
    MethodType NVARCHAR(50),
    FeePercentage DECIMAL(5, 2),
    FlatFee DECIMAL(10, 2),
    BracketMinAmount DECIMAL(10, 2),
    BracketMaxAmount DECIMAL(10, 2),
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME DEFAULT GETUTCDATE()
);

-- Transactions Table
CREATE TABLE [Transactions] (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL CHECK (TransactionType IN ('EWallet', 'Printing')),
    Amount DECIMAL(10, 2) NOT NULL,
    ServiceCharge DECIMAL(10, 2),
    TotalAmount DECIMAL(10, 2),
    Status NVARCHAR(50) DEFAULT 'Completed' CHECK (Status IN ('Pending', 'Completed', 'Failed')),
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES [Users](Id)
);

-- EWallet Transactions Details Table
CREATE TABLE [EWalletTransactions] (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TransactionId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES [Transactions](Id),
    Provider NVARCHAR(50) NOT NULL CHECK (Provider IN ('GCash', 'Maya')),
    Method NVARCHAR(50) NOT NULL CHECK (Method IN ('CashIn', 'CashOut')),
    AmountBracket NVARCHAR(50),
    ReferenceNumber NVARCHAR(100) NOT NULL,
    ScreenshotUrl NVARCHAR(MAX),
    BaseAmount DECIMAL(10, 2),
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);

-- Printing Transactions Details Table
CREATE TABLE [PrintingTransactions] (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TransactionId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES [Transactions](Id),
    ServiceType NVARCHAR(50) NOT NULL CHECK (ServiceType IN ('Printing', 'Scanning', 'Photocopy')),
    PaperSize NVARCHAR(50) NOT NULL CHECK (PaperSize IN ('Long', 'Short')),
    Color NVARCHAR(50) NOT NULL CHECK (Color IN ('Grayscale', 'Colored')),
    BaseAmount DECIMAL(10, 2),
    Quantity INT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);

-- Audit Log Table
CREATE TABLE [AuditLogs] (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER,
    Action NVARCHAR(255),
    TableName NVARCHAR(100),
    RecordId UNIQUEIDENTIFIER,
    OldValues NVARCHAR(MAX),
    NewValues NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES [Users](Id)
);

-- Create Indexes for Performance
CREATE INDEX IX_Transactions_UserId ON [Transactions](UserId);
CREATE INDEX IX_Transactions_CreatedAt ON [Transactions](CreatedAt);
CREATE INDEX IX_EWalletTransactions_TransactionId ON [EWalletTransactions](TransactionId);
CREATE INDEX IX_PrintingTransactions_TransactionId ON [PrintingTransactions](TransactionId);
CREATE INDEX IX_Users_Email ON [Users](Email);
