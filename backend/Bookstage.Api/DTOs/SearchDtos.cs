namespace Bookstage.Api.DTOs;

public record SearchResultDto(
    Guid Id,
    string Type,
    string Title,
    string? Subtitle,
    double? Rating,
    string? ImageUrl,
    double? Price,
    string? City,
    DateTime? Date);
