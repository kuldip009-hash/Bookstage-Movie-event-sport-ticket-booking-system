namespace Bookstage.Api.DTOs;

// Movie DTOs
public record MovieDto(
    Guid Id,
    string Title,
    string Description,
    string Genre,
    string Language,
    double? Rating,
    int? Duration,
    DateTime ReleaseDate,
    string? DirectorName,
    string? CastNames,
    string? PosterUrl,
    string? YoutubeTrailerId,
    string? GalleryImageUrls,
    bool IsNowShowing);

public record CreateMovieRequest(
    string Title,
    string Description,
    string Genre,
    string Language,
    double? Rating,
    int? Duration,
    DateTime ReleaseDate,
    string? DirectorName,
    string? CastNames,
    string? PosterUrl,
    string? YoutubeTrailerId,
    string? GalleryImageUrls,
    bool IsNowShowing);

// Event DTOs
public record EventDto(
    Guid Id,
    string Title,
    string Category,
    string Description,
    string? VenueName,
    string? VenueCity,
    DateTime EventDate,
    TimeSpan EventTime,
    double Price,
    double? Rating,
    string? BannerUrl,
    bool IsAvailable);

public record CreateEventRequest(
    string Title,
    string Category,
    string Description,
    string? VenueName,
    string? VenueCity,
    DateTime EventDate,
    TimeSpan EventTime,
    double Price,
    double? Rating,
    string? BannerUrl,
    bool IsAvailable);

// ShowTime DTOs
public record ShowTimeDto(
    Guid Id,
    Guid? MovieId,
    string VenueName,
    string VenueCity,
    DateTime ShowDate,
    TimeSpan ShowTimeOfDay,
    double Price,
    int TotalSeats,
    int AvailableSeats);

public record CreateShowTimeRequest(
    Guid MovieId,
    string VenueName,
    string VenueCity,
    DateTime ShowDate,
    TimeSpan ShowTimeOfDay,
    double Price,
    int TotalSeats);

// Seat DTOs
public record SeatDto(
    Guid Id,
    Guid ShowTimeId,
    string SeatNumber,
    string Row,
    int Column,
    string Category,
    double Price,
    string Status);

public record SeatStatusDto(
    string SeatId,
    string Status,
    string Category,
    double Price);

// Booking DTOs
public record BookingDto(
    Guid Id,
    Guid UserId,
    string BookingType,
    string EventOrMovieTitle,
    string VenueName,
    string VenueCity,
    DateTime BookingDate,
    DateTime EventDate,
    TimeSpan EventTime,
    string SeatsBooked,
    string SeatCategory,
    double TotalPrice,
    string Status,
    string? PaymentId,
    double? RefundAmount);

public record CreateBookingRequest(
    string BookingType,
    Guid? MovieId,
    Guid? EventId,
    Guid? ShowTimeId,
    string EventOrMovieTitle,
    string VenueName,
    string VenueCity,
    DateTime EventDate,
    TimeSpan EventTime,
    string SeatsBooked,
    string SeatCategory,
    double TotalPrice);

public record UpdateBookingStatusRequest(
    string Status);

// Payment DTOs
public record PaymentDto(
    Guid Id,
    Guid BookingId,
    double Amount,
    string PaymentMethod,
    string Status,
    string TransactionId,
    DateTime CreatedAt);

public record CreatePaymentRequest(
    Guid BookingId,
    double Amount,
    string PaymentMethod);

// Offer DTOs
public record OfferDto(
    Guid Id,
    string Code,
    string Title,
    string Type,
    double DiscountValue,
    bool IsActive);

public record ValidateOfferRequest(
    string Code,
    double Amount);

