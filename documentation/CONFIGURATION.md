# Configuration Guide

## JWT Configuration

### Secret Key Generation

For production, generate a strong secret key:

```powershell
# PowerShell
$key = [System.Random]::new() |
    ForEach-Object { [Convert]::ToString([byte]($_ % 256), 16).PadLeft(2, '0') } |
    Select-Object -First 64 |
    Join-String
```

Or use an online generator: https://www.random.org/bytes/

### JWT Settings

```json
"JwtSettings": {
  "SecretKey": "your-min-64-char-secret-key",
  "Issuer": "eTracker",
  "Audience": "eTracker-User",
  "ExpirationHours": 24
}
```

## Google OAuth Configuration

### 1. Create Google Cloud Project

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create new project
- Enable "Google+ API"

### 2. Create OAuth 2.0 Credentials

- Go to Credentials
- Click "Create Credentials" → "OAuth client ID"
- Select "Web application"
- Add authorized redirect URIs:
  - Development: `http://localhost:5173`
  - Production: `https://yourdomain.com`

### 3. Configure in appsettings.json

```json
"GoogleOAuth": {
  "ClientId": "your-client-id.apps.googleusercontent.com",
  "ClientSecret": "your-client-secret"
}
```

> ⚠️ **Security Warning:** Never commit `ClientSecret` to version control. Use environment variables or secrets manager.

## Backend Configuration (appsettings.json)

### Connection Strings

#### SQL Server (Windows Authentication)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=eTracker;Trusted_Connection=True;Connection Timeout=30;"
  }
}
```

For development environment (`appsettings.Development.json`):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=eTracker_Dev.db"
  }
}
```

### JWT Settings

```json
{
  "JwtSettings": {
    "SecretKey": "your-very-long-secret-key-at-least-32-characters",
    "Issuer": "eTracker",
    "Audience": "eTracker-User",
    "ExpirationHours": 24
  }
}
```

### Google OAuth Configuration

```json
{
  "GoogleOAuth": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
  }
}
```

## Frontend Configuration

### .env.local

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

### .env.production

```
VITE_API_URL=https://your-production-api.com/api
VIT_GOOGLE_CLIENT_ID=YOUR_PRODUCTION_GOOGLE_CLIENT_ID
```

## Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project for eTracker
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   - `http://localhost:5173` (Development)
   - `http://localhost:3000` (Alternative)
   - Your production domain
6. Copy the Client ID and Client Secret

## Database Setup

1. Create the database using the schema in `database/schema.sql`
2. Update connection strings in both backend and Entity Framework configuration
3. Run Entity Framework migrations if needed

## Running the Application

### Development

```bash
# Terminal 1: Backend
cd backend/eTracker.API
dotnet run

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Production

Update configuration files with production values and deploy accordingly.

## Security Considerations

1. **JWT Secret Key**: Generate a strong, random secret key (min 32 characters)
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS appropriately for your domain
4. **OAuth Secrets**: Never commit secrets to repository
5. **Database**: Use strong, complex passwords
6. **Token Expiration**: Set appropriate token expiration times
