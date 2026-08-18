# ─── EduCore API — Production Dockerfile ───────────────────────────────────────
# Multi-stage build for ASP.NET Core .NET 9
#
# Stage 1 (build): Full SDK image — restores, builds, and publishes the app.
# Stage 2 (runtime): Minimal runtime-only image — no SDK, smaller attack surface.
#
# Render deployment:
#   Root directory:  backend/EduCore.API/EduCore.API
#   Build Command:   (handled by Docker)
#   Port:            10000 (Render default, set via PORT env var)
# ───────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy the project file first so that the restore layer is cached
# as long as .csproj does not change.
COPY ["EduCore.API.csproj", "."]
RUN dotnet restore "EduCore.API.csproj"

# Copy the rest of the source code and publish in Release mode.
COPY . .
RUN dotnet publish "EduCore.API.csproj" \
    --configuration Release \
    --no-restore \
    --output /app/publish

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy published output from the build stage.
COPY --from=build /app/publish .

# Render passes the PORT environment variable.
# ASP.NET Core reads ASPNETCORE_URLS to determine which port to bind.
# We set it to 0.0.0.0 so the container is reachable from outside.
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

# The entry point is the compiled API assembly.
ENTRYPOINT ["dotnet", "EduCore.API.dll"]
