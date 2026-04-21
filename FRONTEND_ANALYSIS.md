# Frontend Data Requirements Analysis

## Frontend Pages & Data Needs:

### 1. **Home Page**
- Needs: Movies (now showing), Events
- Fields: id, title, rating, posterUrl, price, category, eventDate

### 2. **Movies Page**
- Needs: List of movies with filters
- Fields: title, genre, language, rating, duration, posterUrl, isNowShowing

### 3. **Movie Detail Page**
- Needs: Movie details + ShowTimes for that movie
- Fields: title, description, genre, rating, duration, director, cast, posterUrl
- Relations: Movie → ShowTimes

### 4. **Events Page**
- Needs: List of events with filters by category & city
- Fields: title, category, price, rating, venueName, venueCity, eventDate, eventTime, bannerUrl, isAvailable

### 5. **Event Detail Page**
- Needs: Event details + categories (VIP, Gold, Silver, etc.)
- Fields: Same as Events + detailed description

### 6. **Seat Selection Page**
- Needs: Seat layout per showtime + seat status (available, booked, locked)
- Fields: showtimeId, seatId, status, category, price
- Features: Seat locking with 5-minute expiry

### 7. **Checkout Page**
- Needs: Booking summary, selected seats, pricing
- Use: Data from booking store (selectedSeats, totalAmount, etc.)

### 8. **My Bookings Page**
- Needs: User's past and upcoming bookings
- Fields: bookingId, eventOrMovieTitle, venueName, eventDate, seatsBooked, totalPrice, status

### 9. **Profile Page**
- Needs: User profile data
- Fields: email, fullName, phone, city, dateOfBirth

### 10. **Admin Dashboard**
- Needs: Revenue, tickets sold, active users, booking stats

## Database Tables Needed:

1. **Users** - User accounts & profiles
2. **Movies** - Movie catalog
3. **ShowTimes** - Movie screenings
4. **Seats** - Individual seat data per showtime
5. **Events** - Event catalog
6. **SeatLocks** - Temporary seat locks during booking
7. **Bookings** - Completed bookings
8. **Payments** - Payment records
9. **Offers/Coupons** - Discount codes

