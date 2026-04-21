using Bookstage.Api.Domain.Entities;
using Bookstage.Api.DTOs;
using Bookstage.Api.Infrastructure.Data;
using Bookstage.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Bookstage.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly BookstageDbContext _db;
    private readonly IPasswordHasher<object> _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthController(
        BookstageDbContext db,
        IPasswordHasher<object> passwordHasher,
        ITokenService tokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var existing = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existing is not null)
        {
            return BadRequest(new { message = "Email is already registered." });
        }

        var now = DateTime.UtcNow;
        var user = new User
        {
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            City = string.IsNullOrWhiteSpace(request.City) ? null : request.City.Trim(),
            DateOfBirth = request.DateOfBirth,
            Role = "User",
            CreatedAt = now,
            UpdatedAt = now
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);

        var response = new AuthResponse(
            user.Id,
            user.Email,
            user.FullName,
            user.Phone,
            user.City,
            user.DateOfBirth,
            user.Role,
            token);

        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponse>> Me()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return NotFound();
        }

        var token = _tokenService.GenerateToken(user); // optionally refresh token
        var response = new AuthResponse(
            user.Id,
            user.Email,
            user.FullName,
            user.Phone,
            user.City,
            user.DateOfBirth,
            user.Role,
            token);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = _tokenService.GenerateToken(user);

        var response = new AuthResponse(
            user.Id,
            user.Email,
            user.FullName,
            user.Phone,
            user.City,
            user.DateOfBirth,
            user.Role,
            token);

        return Ok(response);
    }
}

