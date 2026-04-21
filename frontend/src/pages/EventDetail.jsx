import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Calendar, MapPin, Clock, Users, Share2, Heart, ArrowRight, Play, X } from 'lucide-react'
import { eventsApi } from '../services/api'
import toast from 'react-hot-toast'

// Format a TimeSpan string (e.g. "19:00:00") to "7:00 PM"
function formatTime(timeSpan) {
    if (!timeSpan) return 'N/A'
    const parts = String(timeSpan).split(':')
    if (parts.length < 2) return timeSpan
    let hours = parseInt(parts[0], 10)
    const minutes = parts[1].padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${minutes} ${ampm}`
}

// Category-specific gallery images as fallback
const categoryGalleries = {
    Concert: [
        'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
        'https://images.unsplash.com/photo-1583321500900-82807e458ba5?w=800&q=80',
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
        'https://images.unsplash.com/photo-1493225457124-a1a8a5f3dfd6?w=800&q=80',
    ],
    Sports: [
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
        'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=800&q=80',
    ],
    Theatre: [
        'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&q=80',
    ],
    Comedy: [
        'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=80',
        'https://images.unsplash.com/photo-1628260412297-a3377e45006f?w=800&q=80',
        'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
    ],
}

const defaultGallery = [
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
]

// Ticket categories derived from the event price
function buildTicketCategories(price) {
    return [
        { id: 'vip', label: 'VIP Zone', price: Math.round(price * 2.5), available: 12, color: '#F59E0B', perks: ['Front stage', 'VIP lounge', 'Priority entry'] },
        { id: 'premium', label: 'Premium', price: Math.round(price * 1.5), available: 80, color: '#FF2D55', perks: ['Great view', 'Premium seating'] },
        { id: 'standard', label: 'Standard', price: price, available: 250, color: '#3B82F6', perks: ['Numbered seats', 'Good view'] },
        { id: 'general', label: 'General', price: Math.round(price * 0.6), available: 800, color: '#10B981', perks: ['Open access'] },
    ]
}

const youtubeIds = {
    Concert: 'jAzz6z_E3H8',
    Sports: 'ZYmPNkjLTGA',
    Theatre: 'CJDjUBgA5To',
    Comedy: '2GOh0LxFBqE',
}

export default function EventDetailPage() {
    const { id } = useParams()
    const location = useLocation()
    const passedState = location.state || {}

    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isVideoOpen, setIsVideoOpen] = useState(false)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true)
                const res = await eventsApi.getById(id)
                setEvent(res.data)
            } catch (err) {
                console.error('Error fetching event:', err)
                toast.error('Failed to load event details')
            } finally {
                setLoading(false)
            }
        }
        fetchEvent()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-muted-color text-sm">Loading event details...</p>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-xl font-bold text-primary-color">Event not found</p>
                <Link to="/events" className="btn-primary mt-4">Browse Events</Link>
            </div>
        )
    }

    const gallery = event.galleryImageUrls
        ? event.galleryImageUrls.split(',').map(u => u.trim()).filter(Boolean)
        : event.bannerUrl
            ? [event.bannerUrl, ...(categoryGalleries[event.category] || defaultGallery).slice(0, 5)]
            : (categoryGalleries[event.category] || defaultGallery)

    const ticketCategories = buildTicketCategories(event.price)
    const youtubeId = event.youtubeTrailerId || youtubeIds[event.category] || 'jAzz6z_E3H8'
    const formattedDate = new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const formattedTime = formatTime(event.eventTime)

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Hero */}
            <div className="relative h-[55vh] min-h-[400px] overflow-hidden">
                <img src={event.bannerUrl || gallery[0]} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }} />

                <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="badge-purple">{event.category}</span>
                            {event.venueCity && (
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                                    📍 {event.venueCity}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white font-display mb-2 max-w-3xl">{event.title}</h1>
                        <p className="text-white/70 text-lg mb-4 line-clamp-2">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-6">
                            {event.rating && (
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-white font-bold text-lg">{event.rating?.toFixed(1)}</span>
                                    <span className="text-white/50 text-sm">/ 10</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-white/70">
                                <Calendar className="w-4 h-4" /><span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                                <Clock className="w-4 h-4" /><span>{formattedTime} onwards</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                                <MapPin className="w-4 h-4" /><span>{event.venueName}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors backdrop-blur-sm">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors backdrop-blur-sm">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        <div className="rounded-2xl p-6 border border-default" style={{ background: 'var(--card-bg)' }}>
                            <h2 className="text-xl font-black text-primary-color font-display mb-4">About This Event</h2>
                            <p className="text-secondary-color leading-relaxed whitespace-pre-line text-sm">{event.description}</p>
                        </div>

                        {/* Gallery */}
                        <div className="rounded-2xl p-6 border border-default" style={{ background: 'var(--card-bg)' }}>
                            <h2 className="text-xl font-black text-primary-color font-display mb-4">Gallery & Trailer</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {gallery.slice(0, 6).map((img, i) => (
                                    <div
                                        key={i}
                                        className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer"
                                        onClick={() => i === 0 && setIsVideoOpen(true)}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                        {i === 0 && (
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-opacity group-hover:bg-black/60">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-2">
                                                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                                                </div>
                                                <span className="text-white text-xs font-bold tracking-widest uppercase">Watch Trailer</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Venue Info */}
                        <div className="rounded-2xl p-6 border border-default" style={{ background: 'var(--card-bg)' }}>
                            <h2 className="text-xl font-black text-primary-color font-display mb-4">Venue</h2>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,45,85,0.1)' }}>
                                    <MapPin className="w-6 h-6" style={{ color: '#FF2D55' }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary-color">{event.venueName}</h3>
                                    <p className="text-sm text-muted-color mt-1">{event.venueCity}</p>
                                    <p className="text-sm text-muted-color mt-0.5">{formattedDate} at {formattedTime}</p>
                                </div>
                            </div>
    
                        </div>
                    </div>

                    {/* Right - Ticket Categories */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-default overflow-hidden sticky top-24" style={{ background: 'var(--card-bg)' }}>
                            <div className="p-5 border-b border-default">
                                <h2 className="font-black text-lg text-primary-color font-display">Choose Ticket Category</h2>
                                <p className="text-xs text-muted-color mt-1">{formattedDate} · {formattedTime}</p>
                                {!event.isAvailable && (
                                    <span className="inline-block mt-2 badge bg-red-500/10 text-red-400 text-xs">Sold Out</span>
                                )}
                            </div>
                            <div className="p-5 space-y-3">
                                {ticketCategories.map(cat => (
                                    <div key={cat.id} id={`ticket-cat-${cat.id}`}
                                        className="p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                                        style={{ borderColor: cat.color + '40', background: cat.color + '0A' }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-bold text-sm text-primary-color">{cat.label}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Users className="w-3 h-3 text-muted-color" />
                                                    <span className="text-xs text-muted-color">{cat.available.toLocaleString()} Available</span>
                                                </div>
                                            </div>
                                            <span className="font-black text-lg" style={{ color: cat.color }}>₹{cat.price.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {cat.perks.map(p => (
                                                <span key={p} className="text-xs px-2 py-0.5 rounded-full" style={{ background: cat.color + '20', color: cat.color }}>✓ {p}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {event.isAvailable ? (
                                    <Link
                                        to={`/seat-selection/${event.category === 'Sports' ? 's' : 'c'}${id}`}
                                        state={{
                                            eventName: event.title,
                                            venue: event.venueName,
                                            date: formattedDate,
                                            time: formattedTime,
                                            language: event.category,
                                            eventType: event.category === 'Sports' ? 'sports' : 'concert',
                                            eventId: event.id,         // ✅ add this
                                            venueCity: event.venueCity, // ✅ add this
                                        }}
                                        id="event-book-btn"
                                        className="btn-primary w-full py-4 mt-4"
                                    >
                                        Select Seats <ArrowRight className="w-5 h-5" />
                                    </Link>
                                ) : (
                                    <button disabled className="w-full py-4 mt-4 rounded-xl bg-gray-700 text-gray-400 font-bold cursor-not-allowed">
                                        Sold Out
                                    </button>
                                )}

                                <p className="text-xs text-center text-muted-color">Prices include all taxes & fees</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    >
                        <div className="absolute top-6 right-6 cursor-pointer text-white/70 hover:text-white bg-black/50 p-3 rounded-full hover:bg-white/10 transition-colors"
                            onClick={() => setIsVideoOpen(false)}>
                            <X className="w-6 h-6" />
                        </div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black"
                        >
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}