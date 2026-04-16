# Test Report

Date: 2026-04-16

## Scope

This report covers newly added automated tests for both backend and frontend business rules related to transaction calculations and summary behavior.

## Test Artifacts Added

### Backend

- `backend/eTracker.API.Tests/eTracker.API.Tests.csproj`
- `backend/eTracker.API.Tests/TransactionServiceTests.cs`

### Frontend

- `frontend/src/utils/transactionCalculations.ts`
- `frontend/src/utils/transactionCalculations.test.ts`

## Use Cases Covered

### Backend Use Cases

1. Admin/global summary aggregation includes all users when no user filter is applied.
2. Printing transactions store subtotal-only totals with zero service charge.
3. E-Wallet transactions apply a 5% service charge for amounts at or above `5001`.

### Frontend Use Cases

1. E-Wallet calculations use a 1% rate below `5001`.
2. E-Wallet calculations use a 5% rate at `5001` and above.
3. E-Wallet amount bracket generation matches the form values.
4. Printing total remains `unit price x quantity`, with a minimum quantity of `1`.

## Commands Executed

### Backend

```powershell
cd backend/eTracker.API.Tests
dotnet test
```

### Frontend

```powershell
cd frontend
npm.cmd run test
```

## Results

### Backend Result

- Status: Passed
- Total tests: 3
- Failed: 0
- Notes: Build/test execution required stopping a running `eTracker.API` process because it was locking the output executable.

### Frontend Result

- Status: Passed
- Total tests: 4
- Failed: 0

## Findings

### Resolved During Test Setup

1. The E-Wallet amount bracket dropdown values in the form did not match the bracket generation logic.

   - Impact: submitted brackets could be inconsistent with calculated brackets.
   - Resolution: centralized the bracket logic in `frontend/src/utils/transactionCalculations.ts` and aligned the dropdown option values.

2. The frontend dependency graph was inconsistent for fresh installs.
   - Issue: `vite@8.x` was paired with `@vitejs/plugin-react@4.x`, which caused `npm install` to fail with peer dependency resolution errors.
   - Resolution: updated `@vitejs/plugin-react` to a Vite 8-compatible version.

### Remaining Warnings / Risks

1. Backend restore/build still reports `NU1903` for `AutoMapper.Extensions.Microsoft.DependencyInjection 12.0.1` via the `AutoMapper` advisory.
2. Frontend `npm install` reported `7 vulnerabilities` in the dependency tree. These were not addressed as part of this test task.
3. Backend test and build commands can fail if the API is already running because `eTracker.API.exe` is locked by the active process.

## Summary

The new automated coverage validates the core transaction pricing and summary rules currently implemented in the application. Both backend and frontend test suites pass after setup corrections, and the report captured two real issues discovered during the work: a frontend amount-bracket mismatch and a frontend dependency version mismatch.
