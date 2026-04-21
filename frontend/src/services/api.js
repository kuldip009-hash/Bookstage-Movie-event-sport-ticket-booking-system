import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor — attach JWT
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('bs_token') || localStorage.getItem('bs_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('bs_token')
            localStorage.removeItem('bs_token')
            localStorage.removeItem('bookstage-auth')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ============================
// Auth
// ============================
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    // retrieve profile from token; new /auth/me endpoint added to backend
    me: () => api.get('/auth/me'),
    refreshToken: () => api.post('/auth/refresh'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    googleAuth: (token) => api.post('/auth/google', { token }),
}

// user-specific endpoints (non-admin)
export const usersApi = {
    getMe: () => api.get('/users/me'),
    updateMe: (data) => api.put('/users/me', data),
}

// ============================
// Movies
// ============================
export const moviesApi = {
    getAll: (params) => api.get('/movies', { params }),
    getNowShowing: () => api.get('/movies', { params: { nowShowing: true } }),
    getUpcoming: () => api.get('/movies', { params: { nowShowing: false } }),
    getById: (id) => api.get(`/movies/${id}`),
}

// ============================
// Events
// ============================
export const eventsApi = {
    getAll: (params) => api.get('/events', { params }),
    getById: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
}

// ============================
// ShowTimes (Movie screenings)
// ============================
export const showTimesApi = {
    getByMovie: (movieId) => api.get(`/movies/${movieId}/showtimes`),
    getByMovieAndCity: (movieId, city) => api.get(`/movies/${movieId}/showtimes`, { params: { city } }),
}

// ============================
// Seats (lock / unlock / status)
// ============================
export const seatsApi = {
    getStatus: (showtimeId) => api.get(`/seats/${showtimeId}`),
    lock: (showtimeId, seatIds) => api.post(`/seats/${showtimeId}/lock`, { seatIds }),
    unlock: (showtimeId, seatIds) => api.post(`/seats/${showtimeId}/unlock`, { seatIds }),
    confirm: (showtimeId, seatIds) => api.post(`/seats/${showtimeId}/confirm`, { seatIds }),
}

// Event seat locking (sports/concerts)
export const eventSeatsApi = {
    getStatus: (eventId) => api.get(`/events/${eventId}/seats`),
    lock: (eventId, seatIds) => api.post(`/events/${eventId}/seats/lock`, { seatIds }),
    unlock: (eventId, seatIds) => api.post(`/events/${eventId}/seats/unlock`, { seatIds }),
    confirm: (eventId, seatIds) => api.post(`/events/${eventId}/seats/confirm`, { seatIds }),
}

// ============================
// Bookings
// ============================
export const bookingsApi = {
    getMyBookings: (params) => api.get('/bookings/my', { params }),
    getById: (id) => api.get(`/bookings/${id}`),
    create: (data) => api.post('/bookings', data),
    cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
}

// ============================
// Payments
// ============================
export const paymentsApi = {
    create: (data) => api.post('/payments', data),  // ← add this
    createIntent: (data) => api.post('/payments/intent', data),
    confirm: (data) => api.post('/payments/confirm', data),
    createRazorpayOrder: (data) => api.post('/payments/razorpay/order', data),
    verifyRazorpay: (data) => api.post('/payments/razorpay/verify', data),
    getHistory: () => api.get('/payments/history'),
}

// ============================
// Admin
// ============================
export const adminApi = {
    getDashboard: () => api.get('/admin/dashboard'),
    getRevenue: (params) => api.get('/admin/revenue', { params }),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getBookings: (params) => api.get('/admin/bookings', { params }),
    getSalesByEvent: (eventId) => api.get(`/admin/events/${eventId}/sales`),
    updateSettings: (data) => api.put('/admin/settings', data),
}

// ============================
// Offers
// ============================
export const offersApi = {
    validateCoupon: (code, amount) => api.post('/offers/validate', { code, amount }),
    getAll: () => api.get('/offers'),
    create: (data) => api.post('/offers', data),
    update: (id, data) => api.put(`/offers/${id}`, data),
    delete: (id) => api.delete(`/offers/${id}`),
}

// ============================
// Reviews
// ============================
export const reviewsApi = {
    getForMovie: (movieId) => api.get(`/reviews/movie/${movieId}`),
    getForEvent: (eventId) => api.get(`/reviews/event/${eventId}`),
    create: (data) => api.post('/reviews', data),
    delete: (id) => api.delete(`/reviews/${id}`),
}

// ============================
// Search
// ============================
export const searchApi = {
    query: (q) => api.get('/search', { params: { q } }),
}

export default api
