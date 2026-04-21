namespace Bookstage.Api.DTOs;

public record RegisterRequest(string Email, string Password, string FullName, string? Phone, string? City, DateTime? DateOfBirth);

public record LoginRequest(string Email, string Password);

public record AuthResponse(
    Guid Id,
    string Email,
    string FullName,
    string? Phone,
    string? City,
    DateTime? DateOfBirth,
    string Role,
    string Token);

