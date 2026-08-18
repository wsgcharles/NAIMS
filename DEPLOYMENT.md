# EDUCORE / NAISIS — SYSTEM DEPLOYMENT & ARCHITECTURE GUIDE

This document provides complete instructions for setting up, deploying, and maintaining a cloud-hosted development/production instance of **EduCore (NAISIS)** without affecting your local development baseline or local database (`educore_db`).

---

## 1. ARCHITECTURE OVERVIEW

```
                      GITHUB REPOSITORY
                              │
             ┌────────────────┴────────────────┐
             │                                 │
     FRONTEND (React 19)              BACKEND (.NET 9)
     Vercel Hosting                   Render / Railway
             │                                 │
             └────────────────┬────────────────┘
                              │
                       DATABASE (PostgreSQL)
                       Supabase Cloud DB
```

### Environment Isolation Matrix

| Environment | Frontend URL | Backend URL | Database Host | Database Name |
| :--- | :--- | :--- | :--- | :--- |
| **Local Dev** | `http://localhost:5173` | `http://localhost:5097/api` | Localhost (`127.0.0.1:5432`) | `educore_db` |
| **Cloud Production** | `https://your-app.vercel.app` | `https://your-api.onrender.com/api` | Supabase (`aws-0-xx.pooler.supabase.com:5432`) | `postgres` |

---

## 2. SAFETY GUARANTEES & DATABASE ISOLATION

> [!IMPORTANT]
> The local PostgreSQL database `educore_db` is your protected working baseline.
> - Never run database migrations or reset commands without checking `ConnectionStrings__DefaultConnection`.
> - Local configuration (`appsettings.Development.json`) points to `educore_db`.
> - Production configuration (`appsettings.Production.json` & cloud environment variables) points to Supabase.

---

## 3. LOCAL DEVELOPMENT EXECUTION

To run the existing working system locally:

### Backend (.NET 9 Web API)
```powershell
cd backend/EduCore.API/EduCore.API
dotnet run
```
*API Base URL*: `http://localhost:5097/api`  
*Swagger UI*: `http://localhost:5097/swagger`

### Frontend (React 19 / Vite 8)
```powershell
cd frontend
npm install
npm run dev
```
*Frontend URL*: `http://localhost:5173`

---

## 4. GITHUB REPOSITORY PREPARATION

The repository is pre-configured with strict `.gitignore` rules to prevent committing secrets, build outputs, or `.env` files.

### Verification Steps:
1. Ensure `.env` is **NOT** committed:
   - `frontend/.env.example` is committed as a template.
   - `frontend/.env` is ignored.
2. Ensure backend secrets are **NOT** committed:
   - `appsettings.json` and `appsettings.Development.json` are ignored.
   - `appsettings.template.json` and `appsettings.Production.json` are committed with safe placeholders.
3. Commit clean source code to GitHub:
   ```bash
   git add .
   git commit -m "Build: Prepare EduCore for Vercel, Supabase, and cloud deployment"
   git push origin main
   ```

---

## 5. SUPABASE POSTGRESQL DATABASE SETUP

### Step A: Create a Supabase Project
1. Log in to [Supabase Console](https://supabase.com/).
2. Click **New Project** and select your organization and region (e.g. Singapore / US East).
3. Set your **Database Password** (store securely).

### Step B: Database Migration & Copy Strategy

We recommend **OPTION B** (Restoring Audited Local Database Baseline):
Because your local `educore_db` already contains the audited **101 DepEd curriculum subjects**, 12 Grade Levels, 10 Academic Programs, Section `ICT101`, and verified staff accounts, taking a database snapshot preserves 100% of your verified master data without needing complex seeders.

#### Option B Execution (pg_dump -> Supabase):
1. **Export Local Snapshot** (Command Prompt / PowerShell):
   ```powershell
   pg_dump -U postgres -d educore_db --clean --if-exists -f "educore_baseline.sql"
   ```
2. **Import into Supabase**:
   ```powershell
   psql -h aws-0-YOUR-REGION.pooler.supabase.com -U postgres.YOUR-PROJECT-REF -d postgres -f "educore_baseline.sql"
   ```

#### Option A Execution (Fresh Schema via EF Core):
If you prefer a clean schema build followed by SQL data import:
```powershell
dotnet ef database update --project backend/EduCore.API/EduCore.API/EduCore.API.csproj --connection "Host=aws-0-YOUR-REGION.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.YOUR-PROJECT-REF;Password=YOUR_SUPABASE_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
```

---

## 6. BACKEND CLOUD DEPLOYMENT (.NET 9)

### Hosting Provider Analysis

| Provider | .NET 9 Support | Ease of Deployment | GitHub Integration | Cold Start | Recommended Use |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Render** | ⭐⭐⭐⭐⭐ (Native / Docker) | Very Easy | Automatic | ~30s on Free tier | **RECOMMENDED (Thesis/Demo)** |
| **Railway** | ⭐⭐⭐⭐⭐ (Native / Docker) | Very Easy | Automatic | Zero | **RECOMMENDED (Fast Demo)** |
| **Azure App Service** | ⭐⭐⭐⭐⭐ (Native) | Moderate | GitHub Actions | Zero | Enterprise / Paid |

### Deploying to Render (Recommended):
1. Log in to [Render Dashboard](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set settings:
   - **Root Directory**: `backend/EduCore.API/EduCore.API`
   - **Environment**: `.NET` (or Docker)
   - **Build Command**: `dotnet publish -c Release -o out`
   - **Start Command**: `dotnet out/EduCore.API.dll`
5. Configure Environment Variables in Render:
   - `ConnectionStrings__DefaultConnection`: `Host=aws-0-YOUR-REGION.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.YOUR-PROJECT-REF;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true`
   - `Jwt__Key`: `<YOUR_32_CHAR_PRODUCTION_JWT_SECRET>`
   - `Jwt__Issuer`: `EduCoreAPI`
   - `Jwt__Audience`: `EduCoreClient`
   - `Jwt__DurationInMinutes`: `120`
   - `SmtpSettings__Username`: `noahsacademy.edu.ph@gmail.com`
   - `SmtpSettings__Password`: `<GMAIL_APP_PASSWORD>`
   - `SmtpSettings__SenderEmail`: `noahsacademy.edu.ph@gmail.com`
   - `AppSettings__FrontendBaseUrl`: `https://your-frontend.vercel.app`
   - `AppSettings__AllowedOrigins__0`: `https://your-frontend.vercel.app`

---

## 7. FRONTEND DEPLOYMENT ON VERCEL

### Step A: Import Repository into Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure Build Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (`tsc -b && vite build`)
   - **Output Directory**: `dist`

### Step B: Set Environment Variables in Vercel
In **Environment Variables** tab, add:
- `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com/api`

### Step C: SPA Rewrite Handling (`vercel.json`)
The repository contains `frontend/vercel.json` with SPA rewrite rules to ensure routes (`/login`, `/registrar`, `/accounting`, `/student`, `/teacher`, `/parent`) do not return 404 errors on direct navigation or page refresh.

---

## 8. ENVIRONMENT VARIABLES REFERENCE

### Backend (`appsettings.Production.json` / Cloud Provider Settings)

```env
ConnectionStrings__DefaultConnection=Host=aws-0-region.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.ref;Password=pass;SSL Mode=Require;Trust Server Certificate=true
Jwt__Key=Minimum32CharacterSecureRandomString2026!
Jwt__Issuer=EduCoreAPI
Jwt__Audience=EduCoreClient
Jwt__DurationInMinutes=120
SmtpSettings__Username=noahsacademy.edu.ph@gmail.com
SmtpSettings__Password=your-gmail-app-password
SmtpSettings__SenderEmail=noahsacademy.edu.ph@gmail.com
SmtpSettings__SenderName=Noah's Academy Incorporated
AppSettings__FrontendBaseUrl=https://your-frontend.vercel.app
AppSettings__AllowedOrigins__0=https://your-frontend.vercel.app
```

### Frontend (`frontend/.env` / Vercel Environment Variables)

```env
VITE_API_BASE_URL=https://your-backend-api.onrender.com/api
```

---

## 9. TESTING & VERIFICATION PROCEDURE

After deployment:

1. **Authentication**: Log in as Superadmin (`admin@educore.local`), Registrar (`modinonicoleangelica@gmail.com`), Accountant (`paladiasjerome40@gmail.com`), and Teacher (`charlesudayy@gmail.com`).
2. **Student Admission**: Submit a new Grade 11 ICT admission form from the public portal (`/admissions`).
3. **Registrar Document Verification**: Verify document status and issue a Registrar Verification Slip.
4. **Accounting Assessment & Payment**: Generate tuition assessment and process cash payment.
5. **Section Assignment & Enrollment**: Assign student `Daniel Vance Santos` to Section `ICT101` and verify automatic creation of Student Account (`STU-2026-000001`).
6. **Student Portal Login**: Log in with student credentials and verify subjects (`EDU-SSHS-ORAL` Oral Communication in Context), grade records, and zero balance.

---

## 10. TROUBLESHOOTING & ROLLBACK PROCEDURES

### Problem: Vercel returns CORS error when calling backend
- **Cause**: Backend CORS policy (`AppCors`) is missing the Vercel domain in `AppSettings:AllowedOrigins`.
- **Fix**: Update `AppSettings__AllowedOrigins__0` in Render environment variables to match your exact Vercel URL (e.g., `https://your-app.vercel.app`).

### Problem: Vercel returns 404 on page refresh
- **Cause**: Missing SPA rewrite configuration.
- **Fix**: Ensure `frontend/vercel.json` exists with the rewrite rule pointing `/(.*)` to `/index.html`.

### Problem: Backend fails at startup (`STARTUP CONFIGURATION VALIDATION FAILED`)
- **Cause**: Missing or placeholder `Jwt__Key` or `SmtpSettings__Password`.
- **Fix**: Check `Program.cs` startup validator requirements and ensure all required environment variables are set in Render/Railway.

### Rollback Strategy
If cloud deployment needs to be rolled back:
1. Revert Vercel deployment to previous deployment ID in Vercel Dashboard.
2. Revert backend commit in Render Dashboard.
3. Your local development environment (`http://localhost:5173` & `educore_db`) is completely isolated and remains 100% operational throughout.
