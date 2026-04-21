# Bookstage

Bookstage is a full-stack ticket booking platform for movies and live events.

It includes:
- ASP.NET Core Web API backend with Entity Framework Core and SQL Server
- React + Vite frontend
- JWT-based authentication
- Movie/event discovery, showtimes, seat locking, booking flow, and reviews

## Tech Stack

Backend:
- .NET 10 Web API
- Entity Framework Core 10
- SQL Server (LocalDB by default)
- JWT authentication

Frontend:
- React 18 + Vite 5
- Tailwind CSS
- Zustand state management
- Axios API client

## Project Structure

- `backend/Bookstage.Api` - ASP.NET Core API project
- `frontend` - React application
- `Bookstage.sln` - Solution file

## Prerequisites

Install these before running:
- .NET SDK 10.x
- SQL Server LocalDB (or SQL Server instance)
- Node.js 18+ and npm

## Configuration

### 1) Backend app settings

File: `backend/Bookstage.Api/appsettings.json`

Important settings:
- `ConnectionStrings:DefaultConnection`
- `Jwt:Issuer`
- `Jwt:Audience`
- `Jwt:Key`

Update `Jwt:Key` to a long random secret (32+ characters).

Default local API URL is configured via launch profile:
- `http://localhost:5054`

### 2) Frontend API base URL

The frontend uses:
- `VITE_API_URL` if provided
- otherwise `/api` and Vite proxy to backend (`http://localhost:5054`)

Proxy is configured in:
- `frontend/vite.config.js`

## Getting Started

### 1) Run backend

From project root:

```powershell
cd backend/Bookstage.Api
dotnet restore
dotnet run
```

What happens on startup:
- EF Core migrations are applied automatically
- seed data is inserted when movie/event tables are empty

### 2) Run frontend

Open a second terminal from project root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on:
- `http://localhost:5173`

## API Overview (Implemented)

Base URL: `http://localhost:5054/api`

Auth:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (authorized)

Users:
- `GET /users/me` (authorized)
- `PUT /users/me` (authorized)

Movies and showtimes:
- `GET /movies?nowShowing=true|false`
- `GET /movies/{id}`
- `POST /movies`
- `GET /movies/{movieId}/showtimes`
- `GET /movies/{movieId}/showtimes/{id}`
- `POST /movies/{movieId}/showtimes`

Events:
- `GET /events`
- `GET /events/{id}`
- `POST /events`
- `GET /events/{eventId}/seats`
- `POST /events/{eventId}/seats/lock` (authorized)
- `POST /events/{eventId}/seats/unlock` (authorized)
- `POST /events/{eventId}/seats/confirm` (authorized)

Seats (movie showtimes):
- `GET /seats/{showtimeId}`
- `POST /seats/{showtimeId}/lock` (authorized)
- `POST /seats/{showtimeId}/unlock` (authorized)
- `POST /seats/{showtimeId}/confirm` (authorized)

Bookings:
- `GET /bookings/my` (authorized)
- `GET /bookings/{id}` (authorized)
- `POST /bookings` (authorized)
- `PUT /bookings/{id}/cancel` (authorized)

Reviews:
- `GET /reviews/movie/{movieId}`
- `GET /reviews/event/{eventId}`
- `POST /reviews` (authorized)
- `DELETE /reviews/{id}` (authorized)

## Current Notes

- The frontend API client includes some endpoints (payments, admin, offers, search) that are not currently backed by controllers in this backend.
- Seed data currently focuses on movies, showtimes, seats, events, and offers.
- If LocalDB is unavailable, change the connection string to your SQL Server instance.

## Build Commands

Backend:

```powershell
cd backend/Bookstage.Api
dotnet build
```

Frontend:

```powershell
cd frontend
npm run build
npm run preview
```

## Troubleshooting

- Port conflict:
  - Backend expected on `5054`
  - Frontend expected on `5173`

- Database connection issues:
  - Check `ConnectionStrings:DefaultConnection`
  - Ensure SQL Server/LocalDB is installed and accessible

- 401 Unauthorized:
  - Ensure login succeeded and JWT token is stored
  - Check JWT issuer, audience, and key values match token generation/validation

## Future Improvements

- Add missing backend controllers for payments, offers validation, admin dashboard, and search
- Add automated tests for API and frontend flows
- Add CI pipeline and environment-based configuration docs
