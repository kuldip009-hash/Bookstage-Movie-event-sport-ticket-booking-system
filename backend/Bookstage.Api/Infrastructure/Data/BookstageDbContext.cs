using Bookstage.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Bookstage.Api.Infrastructure.Data;

public class BookstageDbContext : DbContext
{
    public BookstageDbContext(DbContextOptions<BookstageDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<ShowTime> ShowTimes => Set<ShowTime>();
    public DbSet<Seat> Seats => Set<Seat>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<SeatLock> SeatLocks => Set<SeatLock>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Offer> Offers => Set<Offer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var user = modelBuilder.Entity<User>();
        user.ToTable("Users");
        user.HasKey(u => u.Id);
        user.HasIndex(u => u.Email).IsUnique();
        user.Property(u => u.Email).IsRequired().HasMaxLength(256);
        user.Property(u => u.PasswordHash).IsRequired();
        user.Property(u => u.FullName).IsRequired().HasMaxLength(200);
        user.Property(u => u.Role).IsRequired().HasMaxLength(50);
        user.Property(u => u.City).HasMaxLength(100);
        user.Property(u => u.DateOfBirth);

        // Movie
        var movie = modelBuilder.Entity<Movie>();
        movie.ToTable("Movies");
        movie.HasKey(m => m.Id);
        movie.Property(m => m.Title).IsRequired().HasMaxLength(500);
        movie.Property(m => m.Genre).HasMaxLength(200);
        movie.Property(m => m.Language).HasMaxLength(50);
        movie.Property(m => m.YoutubeTrailerId).HasMaxLength(50);
        movie.Property(m => m.GalleryImageUrls).HasMaxLength(2000);

        // Event
        var evt = modelBuilder.Entity<Event>();
        evt.ToTable("Events");
        evt.HasKey(e => e.Id);
        evt.Property(e => e.Title).IsRequired().HasMaxLength(500);
        evt.Property(e => e.Category).HasMaxLength(100);
        evt.Property(e => e.VenueName).HasMaxLength(300);
        evt.Property(e => e.VenueCity).HasMaxLength(100);
        evt.Property(e => e.YoutubeTrailerId).HasMaxLength(50);
        evt.Property(e => e.GalleryImageUrls).HasMaxLength(2000);

        // ShowTime (Movie screening)
        var showTime = modelBuilder.Entity<ShowTime>();
        showTime.ToTable("ShowTimes");
        showTime.HasKey(s => s.Id);
        showTime.Property(s => s.VenueName).IsRequired().HasMaxLength(300);
        showTime.Property(s => s.VenueCity).IsRequired().HasMaxLength(100);
        showTime.HasOne(s => s.Movie).WithMany(m => m.ShowTimes).HasForeignKey(s => s.MovieId).OnDelete(DeleteBehavior.SetNull);

        // Seat
        var seat = modelBuilder.Entity<Seat>();
        seat.ToTable("Seats");
        seat.HasKey(s => s.Id);
        seat.Property(s => s.SeatNumber).IsRequired().HasMaxLength(50);
        seat.Property(s => s.Row).IsRequired().HasMaxLength(10);
        seat.Property(s => s.Category).HasMaxLength(100);
        seat.Property(s => s.Status).HasMaxLength(50);
        seat.HasOne(s => s.ShowTime).WithMany().HasForeignKey(s => s.ShowTimeId).OnDelete(DeleteBehavior.Restrict);
        seat.HasOne(s => s.LockedByUser).WithMany().HasForeignKey(s => s.LockedByUserId).OnDelete(DeleteBehavior.NoAction);
        seat.HasOne(s => s.BookedByUser).WithMany().HasForeignKey(s => s.BookedByUserId).OnDelete(DeleteBehavior.NoAction);

        // Booking (Movie + Event tickets)
        var booking = modelBuilder.Entity<Booking>();
        booking.ToTable("Bookings");
        booking.HasKey(b => b.Id);
        booking.Property(b => b.BookingType).HasMaxLength(50);
        booking.Property(b => b.EventOrMovieTitle).IsRequired().HasMaxLength(500);
        booking.Property(b => b.VenueName).HasMaxLength(300);
        booking.Property(b => b.VenueCity).HasMaxLength(100);
        booking.Property(b => b.SeatCategory).HasMaxLength(100);
        booking.Property(b => b.Status).HasMaxLength(50);
        booking.HasOne(b => b.User).WithMany().HasForeignKey(b => b.UserId).OnDelete(DeleteBehavior.Cascade);
        booking.HasOne(b => b.Movie).WithMany().HasForeignKey(b => b.MovieId).OnDelete(DeleteBehavior.SetNull);
        booking.HasOne(b => b.Event).WithMany(e => e.Bookings).HasForeignKey(b => b.EventId).OnDelete(DeleteBehavior.SetNull);
        booking.HasOne(b => b.ShowTime).WithMany(s => s.Bookings).HasForeignKey(b => b.ShowTimeId).OnDelete(DeleteBehavior.SetNull);

        // Review
        var review = modelBuilder.Entity<Review>();
        review.ToTable("Review");
        review.HasKey(r => r.Id);
        review.Property(r => r.Title).IsRequired();
        review.Property(r => r.Comment).IsRequired();
        review.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
        review.HasOne(r => r.Movie).WithMany(m => m.Reviews).HasForeignKey(r => r.MovieId).OnDelete(DeleteBehavior.SetNull);
        review.HasOne(r => r.Event).WithMany(e => e.Reviews).HasForeignKey(r => r.EventId).OnDelete(DeleteBehavior.SetNull);

        // SeatLock
        var seatLock = modelBuilder.Entity<SeatLock>();
        seatLock.ToTable("SeatLocks");
        seatLock.HasKey(sl => sl.Id);
        seatLock.Property(sl => sl.SeatId).IsRequired().HasMaxLength(50);
        seatLock.HasIndex(sl => new { sl.ShowTimeId, sl.SeatId }).IsUnique().HasFilter("[ShowTimeId] IS NOT NULL");
        seatLock.HasIndex(sl => new { sl.EventId, sl.SeatId }).IsUnique().HasFilter("[EventId] IS NOT NULL");
        seatLock.HasOne(sl => sl.ShowTime).WithMany().HasForeignKey(sl => sl.ShowTimeId).OnDelete(DeleteBehavior.Restrict);
        seatLock.HasOne(sl => sl.Event).WithMany(e => e.SeatLocks).HasForeignKey(sl => sl.EventId).OnDelete(DeleteBehavior.Restrict);
        seatLock.HasOne(sl => sl.User).WithMany().HasForeignKey(sl => sl.LockedByUserId).OnDelete(DeleteBehavior.NoAction);

        // Payment
        var payment = modelBuilder.Entity<Payment>();
        payment.ToTable("Payments");
        payment.HasKey(p => p.Id);
        payment.Property(p => p.PaymentMethod).HasMaxLength(50);
        payment.Property(p => p.TransactionId).IsRequired().HasMaxLength(200);
        payment.Property(p => p.Status).HasMaxLength(50);
        payment.HasOne(p => p.Booking).WithMany().HasForeignKey(p => p.BookingId).OnDelete(DeleteBehavior.Restrict);
        payment.HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Restrict);

        // Offer
        var offer = modelBuilder.Entity<Offer>();
        offer.ToTable("Offers");
        offer.HasKey(o => o.Id);
        offer.Property(o => o.Code).IsRequired().HasMaxLength(50);
        offer.HasIndex(o => o.Code).IsUnique();
        offer.Property(o => o.Type).HasMaxLength(50);
    }
}