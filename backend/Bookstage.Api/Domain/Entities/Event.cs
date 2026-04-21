using System;
using System.Collections.Generic;

namespace Bookstage.Api.Domain.Entities
{
    public class Event
    {
        public Guid Id { get; set; }

        public string Title { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }

        // Venue
        public string VenueName { get; set; }
        public string VenueCity { get; set; }

        // Date & Time
        public DateTime EventDate { get; set; }
        public TimeSpan EventTime { get; set; }

        // Pricing & Rating
        public double Price { get; set; }
        public double Rating { get; set; }

        // Media
        public string BannerUrl { get; set; }
        public string? YoutubeTrailerId { get; set; }
        public string? GalleryImageUrls { get; set; }

        // Availability
        public bool IsAvailable { get; set; }

        // Audit
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation
        public ICollection<Booking>? Bookings { get; set; }
        public ICollection<Review>? Reviews { get; set; }
        public ICollection<SeatLock>? SeatLocks { get; set; }
    }
}