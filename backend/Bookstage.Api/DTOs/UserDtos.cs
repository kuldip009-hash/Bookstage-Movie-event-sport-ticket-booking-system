namespace Bookstage.Api.DTOs;

public record UserProfileResponse(
    Guid Id,
    string Email,
    string FullName,
    string? Phone,
    string? City,
    DateTime? DateOfBirth,
    string Role,
    DateTime CreatedAt);

public record UpdateProfileRequest(
    string? FullName,
    string? Phone,
    string? City,
    DateTime? DateOfBirth);

