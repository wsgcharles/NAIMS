# EduCore API — Secrets & Local Development Setup

> ⚠️ **Never commit real credentials, passwords, or API keys to source control.**

---

## Why This Document Exists

`appsettings.json` is tracked by git and contains **placeholder values only**.

Real secrets must be configured **locally** or via **environment variables** in production.

The application will **refuse to start** if secrets are missing or still placeholder values.

---

## Developer Quickstart

### Step 1 — Copy the Template

```bash
cp appsettings.template.json appsettings.Development.json
```

`appsettings.Development.json` is in `.gitignore` — it will never be committed.

### Step 2 — Fill in Your Local Values

Edit `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=educore_db;Username=postgres;Password=YOUR_LOCAL_DB_PASSWORD"
  },
  "Jwt": {
    "Key": "YOUR_MINIMUM_32_CHARACTER_JWT_SECRET_HERE"
  },
  "SmtpSettings": {
    "Username": "your-gmail@gmail.com",
    "Password": "your-gmail-app-password",
    "SenderEmail": "your-gmail@gmail.com"
  },
  "AppSettings": {
    "FrontendBaseUrl": "http://localhost:5173",
    "AllowedOrigins": ["http://localhost:5173"]
  }
}
```

### Step 3 — Generate a Gmail App Password

Gmail requires an **App Password** (not your regular Gmail password) when 2-Step Verification is enabled.

1. Go to: https://myaccount.google.com/apppasswords
2. Select App: **Mail**
3. Select Device: **Other (Custom name)** → type "EduCore Dev"
4. Copy the 16-character password → paste into `SmtpSettings:Password`

### Step 4 — Generate a JWT Key

The JWT key must be at least 32 characters. Generate a secure one:

**PowerShell:**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**OpenSSL:**
```bash
openssl rand -base64 32
```

Paste the output into `Jwt:Key` in your local `appsettings.Development.json`.

---

## Production Deployment

In production, **never put secrets in any file**. Use environment variables instead.

### Docker / Linux

```bash
export ASPNETCORE_Jwt__Key="your-production-jwt-key"
export ASPNETCORE_SmtpSettings__Username="school@gmail.com"
export ASPNETCORE_SmtpSettings__Password="your-app-password"
export ASPNETCORE_SmtpSettings__SenderEmail="school@gmail.com"
export ASPNETCORE_ConnectionStrings__DefaultConnection="Host=prod-db;..."
export ASPNETCORE_AppSettings__FrontendBaseUrl="https://portal.noahsacademy.edu.ph"
export ASPNETCORE_AppSettings__AllowedOrigins__0="https://portal.noahsacademy.edu.ph"
export ASPNETCORE_AppSettings__AllowedOrigins__1="https://www.noahsacademy.edu.ph"
```

### Windows IIS / Application Pool

Set environment variables in **IIS → Application Pool → Advanced Settings → Environment Variables**.

### Azure App Service

Set via **Configuration → Application Settings** in the Azure Portal.

---

## Configuration Hierarchy (ASP.NET Core)

ASP.NET Core loads configuration in this order (later overrides earlier):

1. `appsettings.json` (base — committed, no secrets)
2. `appsettings.Development.json` (local dev — gitignored, has local secrets)
3. `appsettings.Production.json` (if exists — gitignored)
4. **Environment Variables** (highest priority — use in production)

---

## What the Application Validates at Startup

If any of these are missing or still a placeholder, the app will refuse to start with a clear error:

| Config Key | Why Required |
|---|---|
| `Jwt:Key` | Signs all JWTs — if missing, no authentication works |
| `SmtpSettings:Username` | Gmail SMTP sender identity |
| `SmtpSettings:Password` | Gmail App Password for authentication |
| `SmtpSettings:SenderEmail` | From address on all outgoing emails |
| `ConnectionStrings:DefaultConnection` | PostgreSQL database access |
| `AppSettings:FrontendBaseUrl` | Password reset link generation |

---

## Security Rules

- ❌ Never put real passwords in `appsettings.json`
- ❌ Never commit `appsettings.Development.json`
- ❌ Never share your Gmail App Password in chat, email, or code reviews
- ✅ Use a dedicated Gmail account for the school system — not a personal account
- ✅ Rotate the Gmail App Password every 6 months
- ✅ Generate a new JWT key when deploying to production
- ✅ Use a minimum 32-character random JWT key
