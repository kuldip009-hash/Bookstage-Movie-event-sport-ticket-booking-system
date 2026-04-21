using Bookstage.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Bookstage.Api.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedDataAsync(BookstageDbContext context, IPasswordHasher<object> passwordHasher)
    {
        // Only seed if database is empty
        if (context.Movies.Any() || context.Events.Any())
            return;

        // ─────────────────────────────────────────────────────────────
        // MOVIES
        // ─────────────────────────────────────────────────────────────
        var movie1Id  = Guid.NewGuid();
        var movie2Id  = Guid.NewGuid();
        var movie3Id  = Guid.NewGuid();
        var movie4Id  = Guid.NewGuid();
        var movie5Id  = Guid.NewGuid();
        var movie6Id  = Guid.NewGuid();
        var movie7Id  = Guid.NewGuid();
        var movie8Id  = Guid.NewGuid();
        var movie9Id  = Guid.NewGuid();
        var movie10Id = Guid.NewGuid();

        var movies = new List<Movie>
        {
            new Movie
            {
                Id = movie1Id,
                Title = "Pushpa 2: The Rule",
                Genre = "Action,Thriller",
                Description = "Pushpa Raj rises as a powerful force in the red sandalwood smuggling empire while facing intense rivalries and dangerous enemies threatening his rule.",
                Language = "Telugu",
                Rating = 8.3,
                Duration = 179,
                ReleaseDate = new DateTime(2024, 12, 5),
                DirectorName = "Sukumar",
                CastNames = "Allu Arjun,Rashmika Mandanna,Fahadh Faasil",
                PosterUrl = "https://images.moneycontrol.com/static-mcnews/2024/12/20241205070538_jdjdiwkjncjncc-2024-12-05T123407.366.jpg",
                YoutubeTrailerId = "1kVK0MZlbI4",
                GalleryImageUrls = "https://m.media-amazon.com/images/M/MV5BNDM3N2UzM2UtMjEwMC00NGUzLThmMmQtNGMyM2VmMDA0ZWEwXkEyXkFqcGc@._V1_FMjpg_UY2048_.jpg,https://m.media-amazon.com/images/M/MV5BNjBkMzI2ZTMtYWY3MC00ODg2LWE5Y2MtYTBmMGNlYTY4NGVmXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg,https://m.media-amazon.com/images/M/MV5BNTAxNDVjZTUtYWJkNy00OTg0LWE1NzgtNThmYjk0OGYyOTVhXkEyXkFqcGc@._V1_FMjpg_UX864_.jpg",
                IsNowShowing = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Movie
            {
                Id = movie2Id,
                Title = "Dune: Part Two",
                Genre = "Sci-Fi,Adventure",
                Description = "Paul Atreides unites with the Fremen to wage war against House Harkonnen while confronting visions of a dark and inevitable future.",
                Language = "English",
                Rating = 8.5,
                Duration = 166,
                ReleaseDate = new DateTime(2024, 3, 1),
                DirectorName = "Denis Villeneuve",
                CastNames = "Timothee Chalamet,Zendaya,Rebecca Ferguson",
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_FMjpg_UY4096_.jpg",
                YoutubeTrailerId = "Way9Dexny3w",
                GalleryImageUrls = "https://m.media-amazon.com/images/M/MV5BNjNkZTEzNmUtMWJhNC00NTUwLTg4NmMtMzU2MjMyZGU3ZjJkXkEyXkFqcGc@._V1_FMjpg_UY2048_.jpg,https://m.media-amazon.com/images/M/MV5BNDRkN2U5NmMtYTRkOC00Y2U4LWJlMjgtNTAyOWJjM2E3MmY1XkEyXkFqcGc@._V1_FMjpg_UX512_.jpg,https://m.media-amazon.com/images/M/MV5BYTNkYWViMjEtYTIxNi00YTJmLThiNGYtMDNmOTQ5NjNmYmI0XkEyXkFqcGc@._V1_FMjpg_UY2048_.jpg",
                IsNowShowing = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Movie
            {
                Id = movie3Id,
                Title = "Kalki 2898 AD",
                Genre = "Sci-Fi,Action",
                Description = "In a dystopian future set in 2898 AD, a warrior emerges as humanity's final hope against powerful and dark forces.",
                Language = "Telugu",
                Rating = 7.7,
                Duration = 181,
                ReleaseDate = new DateTime(2024, 6, 27),
                DirectorName = "Nag Ashwin",
                CastNames = "Prabhas,Deepika Padukone,Amitabh Bachchan",
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BMTM3ZGUwYTEtZTI5NS00ZmMyLTk2YmQtMWU4YjlhZTI3NjRjXkEyXkFqcGc@._V1_FMjpg_UY4096_.jpg",
                YoutubeTrailerId = "Ld-V3wEMqgk",
                GalleryImageUrls = "https://m.media-amazon.com/images/M/MV5BZTdjZTg4YTEtYzcwZS00NzdiLTgyMTUtZjIxNzhiNTE0ZGNhXkEyXkFqcGc@._V1_FMjpg_UY4096_.jpg,https://m.media-amazon.com/images/M/MV5BZDZlZjkwMjAtZWY3MC00MjMzLTg3ODYtNGMwM2I5MWQ2NGUxXkEyXkFqcGc@._V1_FMjpg_UY4096_.jpg,https://m.media-amazon.com/images/M/MV5BMmQ3YTdhZDAtZGEwYS00YWUwLWEzNzktNDEzMTY1ZGIxMjA4XkEyXkFqcGc@._V1_FMjpg_UY4096_.jpg",
                IsNowShowing = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Movie
            {
                Id = movie4Id,
                Title = "Animal",
                Genre = "Action,Crime,Drama",
                Description = "A troubled son's obsessive love for his father leads him into the violent world of crime and power struggles.",
                Language = "Hindi",
                Rating = 6.8,
                Duration = 201,
                ReleaseDate = new DateTime(2023, 12, 1),
                DirectorName = "Sandeep Reddy Vanga",
                CastNames = "Ranbir Kapoor,Rashmika Mandanna,Bobby Deol",
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BZThmNDg1NjUtNWJhMC00YjA3LWJiMjItNmM4ZDQ5ZGZiN2Y2XkEyXkFqcGc@._V1_FMjpg_UX1078_.jpg",
                YoutubeTrailerId = "8FkLRUJj-o0",
                GalleryImageUrls = "https://m.media-amazon.com/images/M/MV5BNzA5YzNiY2UtYTBlNS00YzMxLThlNGMtZDhkNWMyZDNiOWZlXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg,https://m.media-amazon.com/images/M/MV5BMzNlNjg2ZTYtZWEwMC00NjQ1LWE0MDAtODFlZTEzMWRiNTQ5XkEyXkFqcGc@._V1_FMjpg_UY2048_.jpg,https://m.media-amazon.com/images/M/MV5BOWIyODQ2YTMtZjk5MS00ODc4LWI4MTEtZGM1ZjRkOWU2YjNkXkEyXkFqcGc@._V1_FMjpg_UX946_.jpg",
                IsNowShowing = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Movie
            {
                Id = movie5Id,
                Title = "Oppenheimer",
                Genre = "Biography,Drama,History",
                Description = "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
                Language = "English",
                Rating = 8.4,
                Duration = 180,
                ReleaseDate = new DateTime(2023, 7, 21),
                DirectorName = "Christopher Nolan",
                CastNames = "Cillian Murphy,Robert Downey Jr.,Emily Blunt",
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_FMjpg_UY3454_.jpg",
                YoutubeTrailerId = "uYPbbksJxIg",
                GalleryImageUrls = "https://m.media-amazon.com/images/M/MV5BMDczYzM3NzEtZjdiMS00ODMyLThkMzAtOGQzMDI4ZTgxNGQ5XkEyXkFqcGc@._V1_FMjpg_UX682_.jpg,https://m.media-amazon.com/images/M/MV5BNzI3M2FkMzItMjA1ZS00ZDUyLWE1NzAtYzJlZjhiMDQwNDc0XkEyXkFqcGc@._V1_FMjpg_UX853_.jpg,https://m.media-amazon.com/images/M/MV5BYmMwYWZlMDgtMTJmYy00NjE5LTg3YzYtMzRhMTFmNjgxNmI1XkEyXkFqcGc@._V1_FMjpg_UX2160_.jpg",
                IsNowShowing = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Movie
            {
                Id = movie6Id,
                Title = "Stree 2",
                Genre = "Horror,Comedy",
                Description = "The town of Chanderi faces a new supernatural threat as Stree returns with a vengeance, and the gang must gear up once more to save the town.",
                Language = "Hindi",
                Rating = 8.1,
                Duration = 135,
                ReleaseDate = new DateTime(2024, 8, 15),
                DirectorName = "Amar Kaushik",
                CastNames = "Rajkummar Rao,Shraddha Kapoor,Pankaj Tripathi",
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BMTA1NmUxYzItZmVmNy00YmQxLTk4Y2UtZjVkMWUwMWQ5N2IxXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg",
                YoutubeTrailerId = "VlvOgk5BHS4",
                GalleryImageUrls = "https://m.media-amazon.com/images/M/MV5BOWUzNjE2ZDctNTM1Yi00MDY0LTkwM2QtNDZhNGIwY2Q0ZjVkXkEyXkFqcGc@._V1_FMjpg_UY1973_.jpg,https://m.media-amazon.com/images/M/MV5BNGZjOTMyZTgtMzk2Zi00ZTdmLWE2MGUtMTU5YmZjNDljNGNiXkEyXkFqcGc@._V1_FMjpg_UX500_.jpg,https://m.media-amazon.com/images/M/MV5BMDA2ODlkM2MtYTdlOS00ODg4LTk5NjgtMTZhNjc2NTRkODBmXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg",
                IsNowShowing = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Movie
            {
                Id = movie7Id,
                Title = "Deadpool & Wolverine",
                Genre = "Action,Comedy,Superhero",
                Description = "Deadpool is recruited by the TVA and reluctantly teams up with a variant of Wolverine on a mission that will change the MCU forever.",
                Language = "English",
                Rating = 7.9,
                Duration = 128,
                ReleaseDate = new DateTime(2024, 7, 26),
                DirectorName = "Shawn Levy",
                CastNames = "Ryan Reynolds,Hugh Jackman,Emma Corrin",
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc@._V1_FMjpg_UY3000_.jpg",
                YoutubeTrailerId = "73_1biulkYk",
                GalleryImageUrls = "https://m.media-amazon.com/images/M/MV5BMWE0YzkwNDktM2FjMS00NWVhLThhNmUtNTY5MmI1ZjVlNmFlXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg,https://m.media-amazon.com/images/M/MV5BYzg2NzA3ODItMTRhNy00NmZiLWJmMTUtZWVmOWMxMTlhMjFjXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg,https://m.media-amazon.com/images/M/MV5BZGMxYmY2MGYtYWU2Yy00MmJkLThiYjAtNjhjY2FkZDk0ZDBhXkEyXkFqcGc@._V1_FMjpg_UX1200_.jpg",
                IsNowShowing = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Movie
            {
                Id = movie8Id,
                Title = "Singham Again",
                Genre = "Action,Drama",
                Description = "Bajirao Singham embarks on a mission to rescue his wife, uniting an elite squad of officers against a powerful and sinister villain.",
                Language = "Hindi",
                Rating = 6.5,
                Duration = 174,
                ReleaseDate = new DateTime(2024, 11, 1),
                DirectorName = "Rohit Shetty",
                CastNames = "Ajay Devgn,Kareena Kapoor,Ranveer Singh,Deepika Padukone",
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BMjQzZDExZDEtYjAxYy00ZGVhLWE4YWItNTVkZjA5ZjVjZWM3XkEyXkFqcGc@._V1_FMjpg_UY5280_.jpg",
                YoutubeTrailerId = "DovbhJavvfU",
                GalleryImageUrls = "https://m.media-amazon.com/images/M/MV5BZjY2YjEyODUtOTY5Yy00YThmLThjMzgtYzkyZjE5MjJiM2EzXkEyXkFqcGc@._V1_FMjpg_UY1800_.jpg,https://m.media-amazon.com/images/M/MV5BY2Y0YTY1MTktNTE2ZC00OTYxLTg0MTgtN2M2MTExZWIzZTQ2XkEyXkFqcGc@._V1_FMjpg_UY1440_.jpg,https://m.media-amazon.com/images/M/MV5BNjhkNTQwMzQtMTZjMC00YjlkLTk1MzQtZWZlYzgyNTBiMTZjXkEyXkFqcGc@._V1_FMjpg_UX720_.jpg",
                IsNowShowing = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Movie
            {
                Id = movie9Id,
                Title = "Vettaiyan",
                Genre = "Action,Drama",
                Description = "A seasoned cop with uncompromising values takes on a ruthless criminal network while questioning the very system he serves.",
                Language = "Tamil",
                Rating = 7.4,
                Duration = 169,
                ReleaseDate = new DateTime(2024, 10, 10),
                DirectorName = "T.J. Gnanavel",
                CastNames = "Rajinikanth,Amitabh Bachchan,Fahadh Faasil",
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BMjExZDc1MzUtNDc3Mi00NDcxLWFmYTAtYzI2MzhlMmE3YzBiXkEyXkFqcGc@._V1_FMjpg_UY2048_.jpg",
                YoutubeTrailerId = "NQXE3iJCWNI",
                GalleryImageUrls = "https://m.media-amazon.com/images/M/MV5BMjc2MGY3NGEtZGYyZC00MmIyLThjMjMtZGZhYmYzNzJhYTJjXkEyXkFqcGc@._V1_FMjpg_UX333_.jpg,https://m.media-amazon.com/images/M/MV5BZTBmMmIxMTctYTY2Yi00ZDM2LWI3YTAtM2VmNTdmOWEyMGVmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg,https://m.media-amazon.com/images/M/MV5BZDYwZDkzYWQtMWY3Mi00YTczLTkxNTktODNjMzRhYTRlNzRlXkEyXkFqcGc@._V1_FMjpg_UX1200_.jpg",
                IsNowShowing = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Movie
            {
                Id = movie10Id,
                Title = "Fighter",
                Genre = "Action,War",
                Description = "India's first aerial action franchise follows elite Air Force pilots defending the nation against a powerful enemy threat.",
                Language = "Hindi",
                Rating = 7.0,
                Duration = 166,
                ReleaseDate = new DateTime(2024, 1, 25),
                DirectorName = "Siddharth Anand",
                CastNames = "Hrithik Roshan,Deepika Padukone,Anil Kapoor",
                PosterUrl = "https://m.media-amazon.com/images/M/MV5BMzlmOGU5MDYtODVhZC00ZGEzLThjNmEtNTgyYjQ2ZTQwNWYzXkEyXkFqcGc@._V1_FMjpg_UX345_.jpg",
                YoutubeTrailerId = "6amIq_mP4xM",
                GalleryImageUrls = "https://m.media-amazon.com/images/M/MV5BOGUxYmIxZmYtZWE4OC00ZjQ4LWI1MzYtMTM4MGM1Zjk1Yzg2XkEyXkFqcGc@._V1_FMjpg_UX843_.jpg,https://m.media-amazon.com/images/M/MV5BNjk2YjI2ZTUtOGUzMC00ZWNkLThiY2EtMzZjZTk0NDNhYjQyXkEyXkFqcGc@._V1_FMjpg_UX840_.jpg,https://m.media-amazon.com/images/M/MV5BZjNiNjMyYTMtMzM2YS00YWQ4LWEzYjQtYjA5ODZjMGQ3OTc4XkEyXkFqcGc@._V1_FMjpg_UX722_.jpg",
                IsNowShowing = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        await context.Movies.AddRangeAsync(movies);
        await context.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────
        // SHOWTIMES  (3–4 per now-showing movie, multiple venues/cities)
        // ─────────────────────────────────────────────────────────────
        var showTimes = new List<ShowTime>();

        // Helper to add showtimes in bulk
        void AddShowtimes(Guid movieId, string venue, string city, int daysAhead,
                          TimeSpan time, double price, int total, int available)
        {
            showTimes.Add(new ShowTime
            {
                Id = Guid.NewGuid(),
                MovieId = movieId,
                VenueName = venue,
                VenueCity = city,
                ShowDate = DateTime.Now.Date.AddDays(daysAhead),
                ShowTimeOfDay = time,
                Price = price,
                TotalSeats = total,
                AvailableSeats = available,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        // Pushpa 2 – Mumbai & Hyderabad
        AddShowtimes(movie1Id, "IMAX Mumbai",       "Mumbai",    1, new TimeSpan(10, 30, 0), 350, 150, 85);
        AddShowtimes(movie1Id, "IMAX Mumbai",       "Mumbai",    1, new TimeSpan(14, 00, 0), 400, 150, 120);
        AddShowtimes(movie1Id, "PVR Cinemas",       "Mumbai",    1, new TimeSpan(18, 30, 0), 450, 200, 150);
        AddShowtimes(movie1Id, "PVR Cinemas",       "Mumbai",    1, new TimeSpan(21, 30, 0), 400, 200,  95);
        AddShowtimes(movie1Id, "Cinepolis Hyd",     "Hyderabad", 1, new TimeSpan(11, 00, 0), 320, 180, 160);
        AddShowtimes(movie1Id, "Cinepolis Hyd",     "Hyderabad", 2, new TimeSpan(17, 00, 0), 320, 180, 100);
        AddShowtimes(movie1Id, "AMB Cinemas",       "Hyderabad", 2, new TimeSpan(20, 30, 0), 380, 200, 130);

        // Dune Part Two – Bangalore & Delhi
        AddShowtimes(movie2Id, "Cinepolis Bangalore", "Bangalore", 1, new TimeSpan(11, 00, 0), 300, 120, 110);
        AddShowtimes(movie2Id, "Cinepolis Bangalore", "Bangalore", 1, new TimeSpan(15, 30, 0), 350, 120,  80);
        AddShowtimes(movie2Id, "PVR Orion Mall",      "Bangalore", 2, new TimeSpan(19, 00, 0), 380, 160, 140);
        AddShowtimes(movie2Id, "PVR Delhi",           "Delhi",     1, new TimeSpan(10, 00, 0), 300, 150, 130);
        AddShowtimes(movie2Id, "INOX Nehru Place",    "Delhi",     2, new TimeSpan(18, 00, 0), 350, 180, 120);

        // Kalki 2898 AD – Delhi & Chennai
        AddShowtimes(movie3Id, "PVR Delhi",           "Delhi",     2, new TimeSpan(15, 30, 0), 420, 180,  95);
        AddShowtimes(movie3Id, "INOX Nehru Place",    "Delhi",     2, new TimeSpan(19, 30, 0), 450, 180, 110);
        AddShowtimes(movie3Id, "AGS Cinemas Chennai", "Chennai",   1, new TimeSpan(10, 30, 0), 280, 200, 175);
        AddShowtimes(movie3Id, "AGS Cinemas Chennai", "Chennai",   1, new TimeSpan(14, 00, 0), 280, 200, 140);
        AddShowtimes(movie3Id, "SPI Sathyam",         "Chennai",   2, new TimeSpan(20, 00, 0), 320, 220, 165);

        // Stree 2 – Mumbai & Pune
        AddShowtimes(movie6Id, "PVR Juhu",          "Mumbai",    1, new TimeSpan(11, 30, 0), 280, 160, 145);
        AddShowtimes(movie6Id, "PVR Juhu",          "Mumbai",    1, new TimeSpan(15, 00, 0), 310, 160, 100);
        AddShowtimes(movie6Id, "Carnival Cinemas",  "Mumbai",    2, new TimeSpan(19, 00, 0), 340, 140, 115);
        AddShowtimes(movie6Id, "Cinepolis Pune",    "Pune",      1, new TimeSpan(12, 00, 0), 260, 150, 130);
        AddShowtimes(movie6Id, "Cinepolis Pune",    "Pune",      2, new TimeSpan(18, 30, 0), 260, 150,  90);

        // Deadpool & Wolverine – Mumbai & Bangalore
        AddShowtimes(movie7Id, "IMAX Mumbai",         "Mumbai",    1, new TimeSpan(13, 00, 0), 420, 150, 100);
        AddShowtimes(movie7Id, "IMAX Mumbai",         "Mumbai",    1, new TimeSpan(17, 30, 0), 420, 150,  75);
        AddShowtimes(movie7Id, "IMAX Mumbai",         "Mumbai",    2, new TimeSpan(21, 00, 0), 460, 150,  50);
        AddShowtimes(movie7Id, "PVR Orion Mall",      "Bangalore", 1, new TimeSpan(12, 30, 0), 380, 160, 140);
        AddShowtimes(movie7Id, "Cinepolis Bangalore", "Bangalore", 2, new TimeSpan(20, 00, 0), 360, 120,  95);

        // Singham Again – Mumbai & Delhi
        AddShowtimes(movie8Id, "PVR Phoenix",       "Mumbai",    1, new TimeSpan(10, 00, 0), 300, 180, 160);
        AddShowtimes(movie8Id, "PVR Phoenix",       "Mumbai",    1, new TimeSpan(14, 30, 0), 350, 180, 120);
        AddShowtimes(movie8Id, "INOX Megaplex",     "Mumbai",    2, new TimeSpan(18, 00, 0), 370, 200, 145);
        AddShowtimes(movie8Id, "PVR Delhi",         "Delhi",     1, new TimeSpan(11, 00, 0), 290, 150, 130);
        AddShowtimes(movie8Id, "PVR Delhi",         "Delhi",     2, new TimeSpan(20, 30, 0), 320, 150, 100);

        // Vettaiyan – Chennai & Coimbatore
        AddShowtimes(movie9Id, "SPI Sathyam",       "Chennai",     1, new TimeSpan(9, 30, 0),  260, 220, 200);
        AddShowtimes(movie9Id, "SPI Sathyam",       "Chennai",     1, new TimeSpan(13, 30, 0), 260, 220, 170);
        AddShowtimes(movie9Id, "AGS Cinemas Chennai","Chennai",    1, new TimeSpan(18, 00, 0), 280, 200, 155);
        AddShowtimes(movie9Id, "Sri Annamalai",     "Coimbatore",  2, new TimeSpan(11, 00, 0), 220, 180, 165);
        AddShowtimes(movie9Id, "Sri Annamalai",     "Coimbatore",  2, new TimeSpan(19, 30, 0), 220, 180, 130);

        await context.ShowTimes.AddRangeAsync(showTimes);
        await context.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────
        // SEATS  (auto-generated per showtime)
        // ─────────────────────────────────────────────────────────────
        var seats = new List<Seat>();
        var seatPrices = new Dictionary<string, double>
        {
            { "Standard", 250 },
            { "Premium",  350 },
            { "VIP",      500 }
        };

        foreach (var showtime in showTimes)
        {
            var seatNumber = 1;
            for (int row = 0; row < 10; row++)
            {
                var rowLetter = ((char)('A' + row)).ToString();
                for (int col = 1; col <= 15; col++)
                {
                    var category = seatNumber % 3 == 0 ? "VIP"
                                 : seatNumber % 2 == 0 ? "Premium"
                                 : "Standard";
                    var isBooked = row > 7 || (row == 7 && col > 10);

                    seats.Add(new Seat
                    {
                        Id = Guid.NewGuid(),
                        ShowTimeId = showtime.Id,
                        SeatNumber = $"{rowLetter}{col}",
                        Row = rowLetter,
                        Column = col,
                        Category = category,
                        Price = seatPrices[category],
                        Status = isBooked ? "booked" : "available",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                    seatNumber++;
                }
            }
        }

        await context.Seats.AddRangeAsync(seats);
        await context.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────
        // EVENTS
        // ─────────────────────────────────────────────────────────────
        var events = new List<Event>
        {
            // ── Concerts ──────────────────────────────────────────────
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "Arijit Singh Live Concert",
                Category = "Concert",
                Description = "Experience a magical night with Arijit Singh performing his biggest hits live on stage.",
                VenueName = "Jio World Garden",
                VenueCity = "Mumbai",
                EventDate = DateTime.Now.Date.AddDays(10),
                EventTime = new TimeSpan(19, 30, 0),
                Price = 2499,
                Rating = 9.3,
                BannerUrl = "",
                YoutubeTrailerId = "jAzz6z_E3H8",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "Diljit Dosanjh – Dil-Luminati Tour",
                Category = "Concert",
                Description = "The Dil-Luminati Tour brings Diljit Dosanjh's electrifying energy live to India for a night of non-stop Punjabi hits.",
                VenueName = "Jawaharlal Nehru Stadium",
                VenueCity = "Delhi",
                EventDate = DateTime.Now.Date.AddDays(14),
                EventTime = new TimeSpan(19, 00, 0),
                Price = 1999,
                Rating = 9.1,
                BannerUrl = "",
                YoutubeTrailerId = "sFAkPLKMagk",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "Coldplay Music of the Spheres World Tour",
                Category = "Concert",
                Description = "One of the world's biggest bands brings their stunning visual spectacle and timeless anthems to India.",
                VenueName = "DY Patil Stadium",
                VenueCity = "Mumbai",
                EventDate = DateTime.Now.Date.AddDays(21),
                EventTime = new TimeSpan(19, 00, 0),
                Price = 4999,
                Rating = 9.7,
                BannerUrl = "",
                YoutubeTrailerId = "agiHOkSbNiY",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "AR Rahman – MARakesh Live",
                Category = "Concert",
                Description = "A musical odyssey with the Mozart of Madras, AR Rahman, performing his legendary compositions with a live orchestra.",
                VenueName = "YMCA Grounds",
                VenueCity = "Chennai",
                EventDate = DateTime.Now.Date.AddDays(18),
                EventTime = new TimeSpan(18, 30, 0),
                Price = 2999,
                Rating = 9.5,
                BannerUrl = "",
                YoutubeTrailerId = "xMdVdVPeKEQ",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // ── Sports ────────────────────────────────────────────────
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "India vs Australia – T20 International",
                Category = "Sports",
                Description = "High-voltage T20 clash between India and Australia at the world's largest cricket stadium.",
                VenueName = "Narendra Modi Stadium",
                VenueCity = "Ahmedabad",
                EventDate = DateTime.Now.Date.AddDays(15),
                EventTime = new TimeSpan(18, 30, 0),
                Price = 3500,
                Rating = 9.4,
                BannerUrl = "",
                YoutubeTrailerId = "ZYmPNkjLTGA",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "India vs England – ODI Series Match 2",
                Category = "Sports",
                Description = "India host England in the second ODI of the series at the iconic Wankhede Stadium.",
                VenueName = "Wankhede Stadium",
                VenueCity = "Mumbai",
                EventDate = DateTime.Now.Date.AddDays(12),
                EventTime = new TimeSpan(13, 30, 0),
                Price = 2000,
                Rating = 9.0,
                BannerUrl = "",
                YoutubeTrailerId = "",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "IPL 2025 – MI vs CSK",
                Category = "Sports",
                Description = "The El Clasico of IPL returns as Mumbai Indians take on Chennai Super Kings in a blockbuster clash.",
                VenueName = "Wankhede Stadium",
                VenueCity = "Mumbai",
                EventDate = DateTime.Now.Date.AddDays(8),
                EventTime = new TimeSpan(19, 30, 0),
                Price = 4500,
                Rating = 9.6,
                BannerUrl = "",
                YoutubeTrailerId = "",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "IPL 2025 – RCB vs KKR",
                Category = "Sports",
                Description = "Royal Challengers Bangalore and Kolkata Knight Riders go head-to-head in a high-stakes IPL encounter.",
                VenueName = "M. Chinnaswamy Stadium",
                VenueCity = "Bangalore",
                EventDate = DateTime.Now.Date.AddDays(11),
                EventTime = new TimeSpan(19, 30, 0),
                Price = 3000,
                Rating = 9.2,
                BannerUrl = "",
                YoutubeTrailerId = "",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "Pro Kabaddi League Finals 2025",
                Category = "Sports",
                Description = "The two best teams in the Pro Kabaddi League battle it out in an electrifying finale.",
                VenueName = "EKA Arena by TransStadia",
                VenueCity = "Ahmedabad",
                EventDate = DateTime.Now.Date.AddDays(25),
                EventTime = new TimeSpan(20, 00, 0),
                Price = 1200,
                Rating = 8.5,
                BannerUrl = "",
                YoutubeTrailerId = "",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "India Super League – Mumbai City FC vs Bengaluru FC",
                Category = "Sports",
                Description = "India's biggest football rivalry resumes as Mumbai City FC hosts Bengaluru FC in an ISL thriller.",
                VenueName = "Mumbai Football Arena",
                VenueCity = "Mumbai",
                EventDate = DateTime.Now.Date.AddDays(9),
                EventTime = new TimeSpan(17, 30, 0),
                Price = 800,
                Rating = 8.2,
                BannerUrl = "",
                YoutubeTrailerId = "",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // ── Comedy ────────────────────────────────────────────────
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "Zakir Khan Live",
                Category = "Comedy",
                Description = "An unforgettable evening of stand-up comedy with Zakir Khan and his signature storytelling style.",
                VenueName = "Shanmukhananda Hall",
                VenueCity = "Mumbai",
                EventDate = DateTime.Now.Date.AddDays(7),
                EventTime = new TimeSpan(20, 00, 0),
                Price = 1499,
                Rating = 8.8,
                BannerUrl = "",
                YoutubeTrailerId = "2GOh0LxFBqE",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "Kapil Sharma Live",
                Category = "Comedy",
                Description = "The king of Bollywood comedy, Kapil Sharma, is back on stage with his side-splitting live act.",
                VenueName = "NSCI Dome",
                VenueCity = "Mumbai",
                EventDate = DateTime.Now.Date.AddDays(22),
                EventTime = new TimeSpan(19, 30, 0),
                Price = 1800,
                Rating = 8.6,
                BannerUrl = "",
                YoutubeTrailerId = "",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // ── Theatre ───────────────────────────────────────────────
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "Broadway Musical Night",
                Category = "Theatre",
                Description = "A grand musical theatre experience featuring live orchestra performances of Broadway classics.",
                VenueName = "NCPA Theatre",
                VenueCity = "Mumbai",
                EventDate = DateTime.Now.Date.AddDays(20),
                EventTime = new TimeSpan(19, 30, 0),
                Price = 1800,
                Rating = 8.5,
                BannerUrl = "",
                YoutubeTrailerId = "CJDjUBgA5To",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "Mughal-E-Azam: The Musical",
                Category = "Theatre",
                Description = "India's most lavish stage production — an iconic love story told through breathtaking sets, costumes and live music.",
                VenueName = "Siri Fort Auditorium",
                VenueCity = "Delhi",
                EventDate = DateTime.Now.Date.AddDays(16),
                EventTime = new TimeSpan(19, 00, 0),
                Price = 2200,
                Rating = 9.0,
                BannerUrl = "",
                YoutubeTrailerId = "",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // ── Festival / Others ─────────────────────────────────────
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "Sunburn Festival 2025",
                Category = "Festival",
                Description = "Asia's biggest electronic dance music festival returns with an international lineup of top DJs and artists.",
                VenueName = "Vagator Beach Grounds",
                VenueCity = "Goa",
                EventDate = DateTime.Now.Date.AddDays(30),
                EventTime = new TimeSpan(16, 00, 0),
                Price = 3999,
                Rating = 9.2,
                BannerUrl = "",
                YoutubeTrailerId = "r3DPMjW5dXM",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Id = Guid.NewGuid(),
                Title = "NH7 Weekender",
                Category = "Festival",
                Description = "The happiest music festival on earth returns with multiple stages, diverse genres and a joyful community vibe.",
                VenueName = "Mahalaxmi Racecourse",
                VenueCity = "Mumbai",
                EventDate = DateTime.Now.Date.AddDays(35),
                EventTime = new TimeSpan(14, 00, 0),
                Price = 2999,
                Rating = 8.9,
                BannerUrl = "",
                YoutubeTrailerId = "",
                GalleryImageUrls = ",,",
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        await context.Events.AddRangeAsync(events);
        await context.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────
        // OFFERS
        // ─────────────────────────────────────────────────────────────
        var offers = new List<Offer>
        {
            new Offer
            {
                Id = Guid.NewGuid(),
                Code = "BOOK20",
                Title = "20% Off on Movies",
                Description = "Get 20% discount on movie bookings",
                Type = "percentage",
                DiscountValue = 20,
                MinimumAmount = 500,
                MaximumDiscount = 500,
                UsageLimit = 100,
                UsedCount = 0,
                IsActive = true,
                ApplicableFor = "movie",
                ValidFrom = DateTime.Now,
                ValidTo = DateTime.Now.AddDays(30),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Offer
            {
                Id = Guid.NewGuid(),
                Code = "EVENT30",
                Title = "30% Off on Events",
                Description = "Get 30% discount on event bookings",
                Type = "percentage",
                DiscountValue = 30,
                MinimumAmount = 1000,
                MaximumDiscount = 1000,
                UsageLimit = 50,
                UsedCount = 0,
                IsActive = true,
                ApplicableFor = "event",
                ValidFrom = DateTime.Now,
                ValidTo = DateTime.Now.AddDays(30),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Offer
            {
                Id = Guid.NewGuid(),
                Code = "WELCOME100",
                Title = "₹100 Off on First Booking",
                Description = "New user discount – flat ₹100 off on your first booking",
                Type = "fixed",
                DiscountValue = 100,
                MinimumAmount = 500,
                UsageLimit = 9999,
                UsedCount = 0,
                IsActive = true,
                ApplicableFor = "all",
                ValidFrom = DateTime.Now,
                ValidTo = DateTime.Now.AddDays(60),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Offer
            {
                Id = Guid.NewGuid(),
                Code = "SPORTS15",
                Title = "15% Off on Sports Events",
                Description = "Flat 15% discount on all sports event bookings",
                Type = "percentage",
                DiscountValue = 15,
                MinimumAmount = 800,
                MaximumDiscount = 750,
                UsageLimit = 200,
                UsedCount = 0,
                IsActive = true,
                ApplicableFor = "event",
                ValidFrom = DateTime.Now,
                ValidTo = DateTime.Now.AddDays(45),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        await context.Offers.AddRangeAsync(offers);
        await context.SaveChangesAsync();
    }
}