namespace Bookstage.Api.DTOs;

public record ReviewDto(
    Guid Id,
    Guid UserId,
    string UserName,
    Guid? MovieId,
    Guid? EventId,
    int Rating,
    string Title,
    string Comment,
    int Helpful,
    DateTime CreatedAt,
    bool IsMine);

public record CreateReviewRequest(
    Guid? MovieId,
    Guid? EventId,
    int Rating,
    string Title,
    string Comment);
