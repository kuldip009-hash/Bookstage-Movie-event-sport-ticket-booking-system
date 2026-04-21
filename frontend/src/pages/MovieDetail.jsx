import { useParams, Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, Calendar, MapPin, ArrowRight, Play, X } from 'lucide-react'
import { moviesApi, showTimesApi, reviewsApi } from '../services/api'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

const seatStatusColor = { 'available': 'badge-green', 'locked': 'badge-orange', 'booked': 'badge-red' }

// Format a TimeSpan string (e.g. "14:30:00") to "2:30 PM"
function formatTime(timeSpan) {
    if (!timeSpan) return 'N/A'
    const parts = timeSpan.split(':')
    if (parts.length < 2) return timeSpan
    let hours = parseInt(parts[0], 10)
    const minutes = parts[1].padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${minutes} ${ampm}`
}

export default function MovieDetailPage() {
    const { id } = useParams()
    const location = useLocation()

    const [movie, setMovie] = useState(null)
    const [showtimes, setShowtimes] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState('')
    const [isVideoOpen, setIsVideoOpen] = useState(false)
    const [reviews, setReviews] = useState([])
    const [reviewsLoading, setReviewsLoading] = useState(false)
    const [reviewSubmitting, setReviewSubmitting] = useState(false)
    const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' })

    const isAuthenticated = useAuthStore(s => s.isAuthenticated)

    const availableDates = useMemo(() => {
        const uniq = new Map()
        showtimes.forEach(st => {
            if (!uniq.has(st.dateKey)) {
                uniq.set(st.dateKey, st.showDate)
            }
        })
        return Array.from(uniq.entries()).map(([value, label]) => ({ value, label }))
    }, [showtimes])

    const filteredShowtimes = useMemo(
        () => (selectedDate ? showtimes.filter(s => s.dateKey === selectedDate) : showtimes),
        [selectedDate, showtimes]
    )

    const reviewStats = useMemo(() => {
        const total = reviews.length
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
        const average = total ? sum / total : 0
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        reviews.forEach(r => {
            const key = Math.max(1, Math.min(5, Number(r.rating || 0)))
            breakdown[key] += 1
        })
        return { total, average, breakdown }
    }, [reviews])

    const makeDateKey = (dt) => {
        const d = new Date(dt)
        const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
        return iso.toISOString().slice(0, 10) // yyyy-mm-dd
    }

    const formatDateLabel = (dt) => {
        const d = new Date(dt)
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setReviewsLoading(true)
                // Fetch movie details
                const movieRes = await moviesApi.getById(id)
                const movieData = movieRes.data
                setMovie({
                    id: movieData.id,
                    title: movieData.title,
                    description: movieData.description,
                    genre: movieData.genre?.split(',').map(g => g.trim()) || [],
                    rating: movieData.rating || 0,
                    votes: '0',
                    duration: movieData.duration ? `${Math.floor(movieData.duration / 60)}h ${movieData.duration % 60}m` : 'N/A',
                    language: movieData.language,
                    director: movieData.directorName || 'N/A',
                    cast: movieData.castNames?.split(',').map(c => c.trim()) || [],
                    image: movieData.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&q=80',
                    poster: movieData.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
                    gallery: movieData.galleryImageUrls
                        ? movieData.galleryImageUrls
                            .split(/[,\n]/)
                            .map(u => u.trim())
                            .filter(Boolean)
                        : [
                            movieData.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'
                        ],
                    synopsis: movieData.description || 'No synopsis available.',
                    youtubeId: movieData.youtubeTrailerId || 'U2Qp5pL3ovA',
                    certificate: 'UA',
                    releaseDate: movieData.releaseDate || 'N/A',
                })
                console.log('Movie data:', movieData)
                // Fetch showtimes
                const showRes = await showTimesApi.getByMovie(id)
                const showData = showRes.data || []
                const mapped = showData.map(s => {
                    const dateKey = makeDateKey(s.showDate)
                    return {
                        id: s.id,
                        time: formatTime(s.showTimeOfDay),
                        format: '2D',
                        lang: movieData.language || 'English',
                        venue: s.venueName,
                        venueCity: s.venueCity,
                        price: s.price,
                        totalSeats: s.totalSeats,
                        availableSeats: s.availableSeats,
                        seats: s.availableSeats > 0 ? 'available' : 'booked',
                        showDate: formatDateLabel(s.showDate),
                        dateKey,
                    }
                })
                setShowtimes(mapped)
                if (mapped.length > 0) {
                    setSelectedDate(mapped[0].dateKey)
                }

                const reviewRes = await reviewsApi.getForMovie(id)
                setReviews(reviewRes.data || [])
            } catch (error) {
                console.error('Error fetching movie data:', error)
                toast.error('Failed to load movie details')
            } finally {
                setLoading(false)
                setReviewsLoading(false)
            }
        }

        fetchData()
    }, [id])

    const handleSubmitReview = async (e) => {
        e.preventDefault()

        if (!isAuthenticated) {
            toast.error('Please sign in to post a review')
            return
        }

        if (reviewForm.rating < 1 || reviewForm.rating > 5) {
            toast.error('Please select a rating')
            return
        }

        if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
            toast.error('Please add a title and comment')
            return
        }

        try {
            setReviewSubmitting(true)
            const response = await reviewsApi.create({
                movieId: id,
                eventId: null,
                rating: reviewForm.rating,
                title: reviewForm.title.trim(),
                comment: reviewForm.comment.trim(),
            })

            setReviews(prev => [response.data, ...prev])
            setReviewForm({ rating: 0, title: '', comment: '' })
            toast.success('Review posted successfully')
        } catch (error) {
            const msg = error?.response?.data?.message || 'Failed to post review'
            toast.error(msg)
        } finally {
            setReviewSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
                <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <p className="text-muted-color text-sm">Loading movie details...</p>
            </div>
        )
    }

    if (!movie) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-xl font-bold text-primary-color">Movie not found</p>
                <Link to="/movies" className="btn-primary mt-4">Browse Movies</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Hero */}
            <div className="relative pt-0 overflow-hidden">
                <div className="absolute inset-0 h-80">
                    <img src={movie.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, var(--bg-primary) 100%)' }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-0">
                    <div className="flex flex-col sm:flex-row gap-8">
                        {/* Poster */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0">
                            <div className="w-44 h-64 sm:w-52 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border-2 border-default">
                                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                            </div>
                        </motion.div>

                        {/* Info */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="pt-16 sm:pt-24">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="badge" style={{ background: '#FF2D5520', color: '#FF2D55' }}>{movie.certificate}</span>
                                {movie.genre.map(g => (
                                    <span key={g} className="badge badge-blue text-xs">{g}</span>
                                ))}
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black text-primary-color font-display mb-2">{movie.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`w-5 h-5 ${s <= Math.round(movie.rating / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                                        ))}
                                    </div>
                                    <span className="font-black text-xl text-primary-color">{movie.rating?.toFixed(1)}</span>
                                    <span className="text-muted-color text-sm">/ 10</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-color text-sm">
                                    <Clock className="w-4 h-4" /><span>{movie.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-color text-sm">
                                    <Calendar className="w-4 h-4" /><span>{movie.releaseDate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-color text-sm">
                                    <span className="font-medium text-primary-color">Language:</span>
                                    <span>{movie.language}</span>
                                </div>
                            </div>
                            <div className="text-sm text-muted-color space-y-1">
                                <p><span className="font-semibold text-primary-color">Director:</span> {movie.director}</p>
                                {movie.cast.length > 0 && (
                                    <p><span className="font-semibold text-primary-color">Cast:</span> {movie.cast.join(', ')}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-5">
                                <button
                                    onClick={() => setIsVideoOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-default text-sm font-medium text-primary-color hover:bg-white/10 transition-all"
                                    style={{ background: 'var(--glass-bg)' }}
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    Watch Trailer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                {/* Synopsis */}
                <div className="rounded-2xl p-6 border border-default mb-8" style={{ background: 'var(--card-bg)' }}>
                    <h2 className="text-xl font-black text-primary-color font-display mb-3">Synopsis</h2>
                    <p className="text-secondary-color leading-relaxed text-sm">{movie.synopsis}</p>
                </div>

                {/* Gallery */}
                <div className="rounded-2xl p-6 border border-default mb-8" style={{ background: 'var(--card-bg)' }}>
                    <h2 className="text-xl font-black text-primary-color font-display mb-4">Gallery & Trailer</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {movie.gallery.map((img, i) => (
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

               

                {/* Book Tickets */}
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-primary-color font-display mb-4">Book Tickets</h2>
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {availableDates.length === 0 && (
                            <span className="text-muted-color text-sm">No dates available</span>
                        )}
                        {availableDates.map(d => (
                            <button key={d.value} onClick={() => setSelectedDate(d.value)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${selectedDate === d.value ? 'text-white border-transparent' : 'border-default text-primary-color'
                                    }`}
                                style={selectedDate === d.value ? { background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' } : { background: 'var(--glass-bg)' }}>
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Showtime Cards */}
                <div className="space-y-4">
                    {filteredShowtimes.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl border border-default" style={{ background: 'var(--card-bg)' }}>
                            <div className="text-4xl mb-3">🎭</div>
                            <p className="text-primary-color font-semibold">No showtimes available</p>
                            <p className="text-muted-color text-sm mt-1">Check back later for upcoming shows.</p>
                        </div>
                    ) : filteredShowtimes.map(show => (
                        <div key={show.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-default transition-all hover:border-red-400/30"
                            style={{ background: 'var(--card-bg)' }} id={`showtime-${show.id}`}>
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-2xl font-black text-primary-color">{show.time}</p>
                                    <p className="text-xs text-muted-color">{show.lang} • {show.format}</p>
                                </div>
                                <div className="h-10 w-px" style={{ background: 'var(--border-color)' }} />
                                <div>
                                    <p className="font-semibold text-primary-color text-sm">{show.venue}</p>
                                    <p className="text-xs text-muted-color">{show.venueCity} • {show.showDate}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="badge badge-purple text-xs">{show.format}</span>
                                        <span className={`badge text-xs ${seatStatusColor[show.seats]}`}>
                                            {show.availableSeats} left
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs text-muted-color">from</p>
                                    <p className="text-xl font-black" style={{ color: '#FF2D55' }}>₹{show.price}</p>
                                </div>
                                <Link
                                    to={`/seat-selection/${show.id}`}
                                    state={{
                                        eventName: movie.title,
                                        venue: show.venue,
                                        date: show.showDate,
                                        time: show.time,
                                        language: `${show.lang} • ${show.format}`,
                                        eventType: 'movie',
                                        showTimeId: show.id,       // ✅ add this
                                        movieId: movie.id,         // ✅ add this
                                        venueCity: show.venueCity, // ✅ add this

                                    }}
                                    className="btn-primary text-sm py-3 px-6 flex-shrink-0"
                                >
                                    Select Seats <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <h2 className="text-2xl font-black text-primary-color font-display mb-4">Ratings & Reviews</h2>
                
                <div className="rounded-2xl p-6 border border-default mb-8" style={{ background: 'var(--card-bg)' }}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                        <p className="text-muted-color text-sm">See what audiences are saying</p>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black text-primary-color">{reviewStats.average.toFixed(1)}</span>
                            <div className="pb-1">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={`avg-${s}`}
                                            className={`w-4 h-4 ${s <= Math.round(reviewStats.average) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-color mt-1">{reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = reviewStats.breakdown[star]
                                const pct = reviewStats.total ? (count / reviewStats.total) * 100 : 0
                                return (
                                    <div key={`bar-${star}`} className="flex items-center gap-2">
                                        <span className="text-xs text-muted-color w-10">{star}★</span>
                                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #FF2D55, #FF6B35)' }} />
                                        </div>
                                        <span className="text-xs text-muted-color w-8 text-right">{count}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <form onSubmit={handleSubmitReview} className="rounded-xl border border-default p-4" style={{ background: 'var(--bg-secondary)' }}>
                            <p className="text-sm font-bold text-primary-color mb-3">Rate this movie</p>
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button
                                        key={`rate-${s}`}
                                        type="button"
                                        onClick={() => setReviewForm(prev => ({ ...prev, rating: s }))}
                                        className="p-0.5"
                                    >
                                        <Star className={`w-5 h-5 ${s <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>
                            <input
                                value={reviewForm.title}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Review title"
                                className="input-field py-2.5 mb-2"
                                maxLength={80}
                            />
                            <textarea
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Write your experience..."
                                className="input-field py-2.5 min-h-24 resize-none"
                                maxLength={500}
                            />
                            <button type="submit" disabled={reviewSubmitting} className="btn-primary w-full mt-3 justify-center">
                                {reviewSubmitting ? 'Posting...' : 'Post Review'}
                            </button>
                            {!isAuthenticated && (
                                <p className="text-xs text-muted-color mt-2">Sign in required to post reviews.</p>
                            )}
                        </form>
                    </div>

                    {reviewsLoading ? (
                        <p className="text-sm text-muted-color">Loading reviews...</p>
                    ) : reviews.length === 0 ? (
                        <div className="rounded-xl border border-default p-6 text-center" style={{ background: 'var(--bg-secondary)' }}>
                            <p className="text-sm text-muted-color">No reviews yet. Be the first to review this movie.</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                            {reviews.slice(0, 12).map((r) => (
                                <div key={r.id} className="flex-shrink-0 w-80 rounded-xl border border-default p-4" style={{ background: 'var(--bg-secondary)' }}>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex-1">
                                            <p className="font-bold text-primary-color text-sm">{r.userName || 'Bookstage User'}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={`${r.id}-s-${s}`} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-color whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-primary-color mt-2">{r.title}</p>
                                    <p className="text-sm text-secondary-color mt-1 leading-relaxed line-clamp-3">{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
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
                                src={`https://www.youtube.com/embed/${movie.youtubeId}?autoplay=1&rel=0`}
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