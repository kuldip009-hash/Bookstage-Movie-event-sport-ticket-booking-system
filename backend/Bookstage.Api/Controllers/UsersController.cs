using System.Security.Claims;
using Bookstage.Api.DTOs;
using Bookstage.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bookstage.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly BookstageDbContext _db;

    public UsersController(BookstageDbContext db)
    {
        _db = db;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> GetMe()
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

        var response = new UserProfileResponse(
            user.Id,
            user.Email,
            user.FullName,
            user.Phone,
            user.City,
            user.DateOfBirth,
            user.Role,
            user.CreatedAt);

        return Ok(response);
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserProfileResponse>> UpdateMe(UpdateProfileRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            user.FullName = request.FullName.Trim();
        }

        if (request.Phone is not null)
        {
            user.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        }

        if (request.City is not null)
        {
            user.City = string.IsNullOrWhiteSpace(request.City) ? null : request.City.Trim();
        }

        if (request.DateOfBirth.HasValue)
        {
            user.DateOfBirth = request.DateOfBirth.Value;
        }

        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var response = new UserProfileResponse(
            user.Id,
            user.Email,
            user.FullName,
            user.Phone,
            user.City,
            user.DateOfBirth,
            user.Role,
            user.CreatedAt);

        return Ok(response);
    }
}

