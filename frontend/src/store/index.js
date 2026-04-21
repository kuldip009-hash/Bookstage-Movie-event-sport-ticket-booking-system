import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: (user, token) => {
                set({ user, token, isAuthenticated: true })
                // store token per-tab to avoid cross-tab user bleed
                sessionStorage.setItem('bs_token', token)
                // cleanup any old persisted token for safety
                localStorage.removeItem('bs_token')
            },

            loadUser: async () => {
                const { token } = get()
                if (!token) return
                if (get().user) return
                try {
                    const res = await import('../services/api').then(m => m.authApi.me())
                    const data = res.data
                    const userObj = {
                        id: data.id,
                        firstName: data.fullName.split(' ')[0],
                        lastName: data.fullName.split(' ').slice(1).join(' '),
                        email: data.email,
                        role: data.role,
                        phone: data.phone,
                        city: data.city,
                        dateOfBirth: data.dateOfBirth,
                    }
                    set({ user: userObj, isAuthenticated: true })
                } catch (err) {
                    console.error('failed to load user profile', err)
                    // if token invalid, clear it
                    set({ user: null, token: null, isAuthenticated: false })
                    localStorage.removeItem('bs_token')
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false })
                sessionStorage.removeItem('bs_token')
                localStorage.removeItem('bs_token')
                localStorage.removeItem('bs_user')
            },

            updateUser: (userData) => {
                set(state => ({ user: { ...state.user, ...userData } }))
            },

            setLoading: (isLoading) => set({ isLoading }),

            isAdmin: () => {
                const { user } = get()
                return user?.role === 'Admin' || user?.roles?.includes('Admin')
            },
        }),
        {
            name: 'bookstage-auth',
            storage: createJSONStorage(() => sessionStorage),
            partialise: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)

export const useThemeStore = create(
    persist(
        (set) => ({
            isDark: true,

            toggleTheme: () =>
                set(state => {
                    const newIsDark = !state.isDark
                    if (newIsDark) {
                        document.documentElement.classList.add('dark')
                    } else {
                        document.documentElement.classList.remove('dark')
                    }
                    return { isDark: newIsDark }
                }),

            initTheme: () =>
                set(state => {
                    if (state.isDark) {
                        document.documentElement.classList.add('dark')
                    } else {
                        document.documentElement.classList.remove('dark')
                    }
                    return state
                }),
        }),
        { name: 'bookstage-theme' }
    )
)

export const useBookingStore = create(
    persist(
        (set, get) => ({
            selectedSeats: [],
            lockedSeats: [],
            showtime: null,
            event: null,
            showtimeInfo: null, // { eventName, venue, date, time, language, eventType, showtimeId, movieId, eventId }
            totalAmount: 0,
            couponCode: null,
            discount: 0,

            setShowtime: (showtime) => set({ showtime }),
            setEvent: (event) => set({ event }),
            setShowtimeInfo: (info) => set({ showtimeInfo: info }),

            selectSeat: (seat) => {
                const { selectedSeats } = get()
                const exists = selectedSeats.find(s => s.id === seat.id)
                if (exists) {
                    set({
                        selectedSeats: selectedSeats.filter(s => s.id !== seat.id),
                    })
                } else {
                    if (selectedSeats.length >= 10) return
                    set({ selectedSeats: [...selectedSeats, seat] })
                }
                get().recalcTotal()
            },

            clearSeats: () => set({ selectedSeats: [], totalAmount: 0 }),

            recalcTotal: () => {
                const { selectedSeats, discount } = get()
                const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0)
                const discountAmount = (subtotal * discount) / 100
                const convenience = Math.round(subtotal * 0.05)
                const gst = Math.round((subtotal - discountAmount) * 0.18)
                set({
                    totalAmount: subtotal - discountAmount + convenience + gst,
                    subtotal,
                    discountAmount,
                    convenience,
                    gst,
                })
            },

            applyCoupon: (code, discountPercent) => {
                set({ couponCode: code, discount: discountPercent })
                get().recalcTotal()
            },

            removeCoupon: () => {
                set({ couponCode: null, discount: 0 })
                get().recalcTotal()
            },

            addLockedSeat: (seatId) => {
                set(state => ({ lockedSeats: [...state.lockedSeats, seatId] }))
            },

            removeLockedSeat: (seatId) => {
                set(state => ({
                    lockedSeats: state.lockedSeats.filter(id => id !== seatId),
                }))
            },

            reset: () =>
                set({
                    selectedSeats: [],
                    lockedSeats: [],
                    showtime: null,
                    event: null,
                    showtimeInfo: null,
                    totalAmount: 0,
                    couponCode: null,
                    discount: 0,
                    subtotal: 0,
                    discountAmount: 0,
                    convenience: 0,
                    gst: 0,
                }),
        }),
        {
            name: 'bookstage-booking',
            partialize: (state) => ({
                selectedSeats: state.selectedSeats,
                showtimeInfo: state.showtimeInfo,
                totalAmount: state.totalAmount,
                subtotal: state.subtotal,
                convenience: state.convenience,
                gst: state.gst,
                couponCode: state.couponCode,
                discount: state.discount,
                discountAmount: state.discountAmount,
            }),
        }
    )
)

export const useSearchStore = create((set) => ({
    query: '',
    category: 'all',
    city: 'All Cities',
    dateFilter: 'all',
    priceRange: [0, 10000],
    results: [],
    isSearching: false,

    setQuery: (query) => set({ query }),
    setCategory: (category) => set({ category }),
    setCity: (city) => set({ city }),
    setDateFilter: (dateFilter) => set({ dateFilter }),
    setPriceRange: (priceRange) => set({ priceRange }),
    setResults: (results) => set({ results }),
    setIsSearching: (isSearching) => set({ isSearching }),
    reset: () => set({ query: '', category: 'all', results: [], isSearching: false }),
}))
