import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Ticket, Download, X, QrCode, Filter, Search } from 'lucide-react'
import { bookingsApi } from '../services/api'
import toast from 'react-hot-toast'

const statusConfig = {
    confirmed: { label: 'Confirmed', color: '#10B981', bg: 'rgba(16,185,129,0.1)', emoji: '✅' },
    completed: { label: 'Completed', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', emoji: '✔️' },
    cancelled: { label: 'Cancelled', color: '#FF2D55', bg: 'rgba(255,45,85,0.1)', emoji: '❌' },
}

export default function MyBookingsImpl() {
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true)
                const response = await bookingsApi.getMyBookings()
                setBookings(response.data || [])
            } catch (error) {
                console.error('Error fetching bookings:', error)
                setBookings([])
                toast.error('Failed to load bookings')
            } finally {
                setLoading(false)
            }
        }

        fetchBookings()
    }, [])

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return
        try {
            const response = await bookingsApi.cancel(bookingId, { status: 'cancelled' })
            setBookings(bookings.map(b => b.id === bookingId ? response.data : b))
            toast.success('Booking cancelled successfully! Refund will be processed soon.')
        } catch (error) {
            console.error(error)
            toast.error('Failed to cancel booking')
        }
    }

    const filtered = bookings.filter(b => {
        const matchFilter = filter === 'all' || b.status === filter
        const matchSearch = !search || b.eventOrMovieTitle.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search)
        return matchFilter && matchSearch
    })

    return (
        <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-primary-color font-display">My Bookings</h1>
                        <p className="text-muted-color mt-1">{bookings.length} bookings found</p>
                    </div>
                </div>

                {/* Filter Tabs + Search */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex items-center gap-2">
                        {['all', 'confirmed', 'completed', 'cancelled'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${filter === f ? 'text-white' : 'border border-default text-muted-color'
                                    }`}
                                style={filter === f ? { background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' } : { background: 'var(--glass-bg)' }}>
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 max-w-xs ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search bookings..." className="input-field pl-10 py-2" id="bookings-search" />
                    </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-primary-color font-semibold">Loading your bookings...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🎫</div>
                            <p className="text-xl font-bold text-primary-color">No bookings found</p>
                            <Link to="/events" className="btn-primary inline-block mt-4">Browse Events</Link>
                        </div>
                    ) : (
                        filtered.map((booking, i) => {
                            const status = statusConfig[booking.status]
                            return (
                                <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                                    <div className="rounded-2xl border border-default overflow-hidden transition-all hover:shadow-xl" style={{ background: 'var(--card-bg)' }}>
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Content - No Image */}
                                            <div className="flex-1 p-6">
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="text-lg font-bold text-primary-color">{booking.eventOrMovieTitle}</h3>
                                                            <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize`}
                                                                style={{ color: status.color, background: status.bg }}>
                                                                {status.emoji} {status.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-sm text-muted-color mt-3">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(booking.eventDate).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Ticket className="w-4 h-4" />
                                                                {booking.bookingType}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {booking.venueName}
                                                            </div>
                                                        </div>
                                                        {booking.seatsBooked && (
                                                            <p className="text-sm text-muted-color mt-2">
                                                                <span className="font-semibold">Seats:</span> {booking.seatsBooked}
                                                            </p>
                                                        )}
                                                        {booking.refundAmount && (
                                                            <p className="text-sm text-green-400 mt-2">
                                                                <span className="font-semibold">Refund:</span> ₹{booking.refundAmount.toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className="px-6 py-4 sm:py-6 sm:border-l border-t sm:border-t-0 border-default flex gap-2 sm:flex-col justify-between">
                                                <div className="text-right">
                                                    <p className="text-2xl font-black" style={{ color: '#FF2D55' }}>₹{booking.totalPrice}</p>
                                                    {booking.refundAmount && (
                                                        <p className="text-xs text-green-400 mt-1">Refund calculated</p>
                                                    )}
                                                </div>
                                                <div className="flex sm:flex-col gap-2">
                                                    {booking.status === 'confirmed' && (
                                                        <>
                                                            <button className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1">
                                                                <Download className="w-3 h-3" />
                                                                Ticket
                                                            </button>
                                                            <button onClick={() => handleCancel(booking.id)} className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1">
                                                                <X className="w-3 h-3" />
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'completed' && (
                                                        <button className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1">
                                                            <Download className="w-3 h-3" />
                                                            Download
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}

                    {filtered.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🎫</div>
                            <p className="text-xl font-bold text-primary-color mb-2">No bookings found</p>
                            <Link to="/" className="btn-primary mt-4">Explore Events</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
