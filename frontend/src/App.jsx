import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore, useAuthStore } from './store'

// Layouts
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingScreen from './components/ui/LoadingScreen'

// Public Pages (eager loaded)
import HomePage from './pages/Home'
import LoginPage from './pages/auth/Login'
import RegisterPage from './pages/auth/Register'

// Lazy loaded pages
const EventsPage = lazy(() => import('./pages/Events'))
const EventDetailPage = lazy(() => import('./pages/EventDetail'))
const MoviesPage = lazy(() => import('./pages/Movies'))
const MovieDetailPage = lazy(() => import('./pages/MovieDetail'))
const SeatSelectionPage = lazy(() => import('./pages/SeatSelection'))
const CheckoutPage = lazy(() => import('./pages/Checkout'))
const BookingConfirmPage = lazy(() => import('./pages/BookingConfirm'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsImpl'))
const ProfilePage = lazy(() => import('./pages/Profile'))
const SearchPage = lazy(() => import('./pages/Search'))

// Route Guards
const PrivateRoute = ({ children }) => {
    const isAuthenticated = useAuthStore(s => s.isAuthenticated)
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
    const isAuthenticated = useAuthStore(s => s.isAuthenticated)
    return !isAuthenticated ? children : <Navigate to="/" replace />
}

// Main Layout
const MainLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-primary-color">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
    </div>
)

export default function App() {
    const { isDark, initTheme } = useThemeStore()
    const loadUser = useAuthStore(s => s.loadUser)

    useEffect(() => {
        initTheme()
        loadUser()
    }, [])

    return (
        <Router>
            <div className={isDark ? 'dark' : ''}>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: isDark ? '#1A1A1A' : '#fff',
                            color: isDark ? '#F8FAFC' : '#0f172a',
                            border: `1px solid ${isDark ? '#2D2D2D' : '#e2e8f0'}`,
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                        },
                        success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#FF2D55', secondary: '#fff' } },
                    }}
                />

                <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                        {/* ── Public ── */}
                        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
                        <Route path="/events" element={<MainLayout><EventsPage /></MainLayout>} />
                        <Route path="/events/:id" element={<MainLayout><EventDetailPage /></MainLayout>} />
                        <Route path="/movies" element={<MainLayout><MoviesPage /></MainLayout>} />
                        <Route path="/movies/:id" element={<MainLayout><MovieDetailPage /></MainLayout>} />
                        <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />

                        {/* ── Auth ── */}
                        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                        {/* ── Protected ── */}
                        <Route path="/seat-selection/:showtimeId" element={
                            <PrivateRoute><MainLayout><SeatSelectionPage /></MainLayout></PrivateRoute>
                        } />
                        <Route path="/checkout" element={
                            <PrivateRoute><MainLayout><CheckoutPage /></MainLayout></PrivateRoute>
                        } />
                        <Route path="/booking/confirm/:bookingId" element={
                            <PrivateRoute><MainLayout><BookingConfirmPage /></MainLayout></PrivateRoute>
                        } />
                        <Route path="/my-bookings" element={
                            <PrivateRoute><MainLayout><MyBookingsPage /></MainLayout></PrivateRoute>
                        } />
                        <Route path="/profile" element={
                            <PrivateRoute><MainLayout><ProfilePage /></MainLayout></PrivateRoute>
                        } />

                        {/* ── 404 ── */}
                        <Route path="*" element={
                            <MainLayout>
                                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
                                    <h1 className="text-8xl font-black text-gradient">404</h1>
                                    <p className="text-xl text-secondary-color">Oops – page not found</p>
                                    <a href="/" className="btn-primary mt-4">Go Home</a>
                                </div>
                            </MainLayout>
                        } />
                    </Routes>
                </Suspense>
            </div>
        </Router>
    )
}
