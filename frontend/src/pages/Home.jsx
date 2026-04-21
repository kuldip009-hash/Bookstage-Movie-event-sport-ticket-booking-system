import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
    Search, MapPin, Calendar, Star, ArrowRight, Play, X,
    Zap, Shield, Clock, Smile, TrendingUp, ChevronLeft, ChevronRight,
    Film, Music, Trophy, Theater, Laugh, Mic
} from 'lucide-react'
import { moviesApi, eventsApi } from '../services/api'

const categories = [
    { icon: Film, label: 'Movies', count: '132 shows', color: '#FF2D55', bg: 'rgba(255,45,85,0.1)', href: '/movies' },
    { icon: Music, label: 'Concerts', count: '28 events', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', href: '/events?cat=Concert' },
    { icon: Trophy, label: 'Sports', count: '19 matches', color: '#FF6B35', bg: 'rgba(255,107,53,0.1)', href: '/events?cat=Sports' },
    { icon: Theater, label: 'Theatre', count: '45 plays', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', href: '/events?cat=Theatre' },
    { icon: Laugh, label: 'Comedy', count: '33 shows', color: '#10B981', bg: 'rgba(16,185,129,0.1)', href: '/events?cat=Comedy' },
    { icon: Mic, label: 'Open Mic', count: '12 events', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', href: '/events?cat=Open%20Mic' },
]

const stats = [
    { value: '10M+', label: 'Happy Customers', icon: Smile, color: '#FF2D55' },
    { value: '50K+', label: 'Events Hosted', icon: Calendar, color: '#7C3AED' },
    { value: '₹500Cr+', label: 'Tickets Sold', icon: TrendingUp, color: '#FF6B35' },
    { value: '99.9%', label: 'Uptime SLA', icon: Shield, color: '#10B981' },
]

const eventCategoryImages = {
    Concert: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&q=80',
    Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=80',
    Theatre: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&q=80',
    Comedy: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=900&q=80',
}

const eventKeywordImages = {
    arijit: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=900&q=80',
    concert: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&q=80',
    cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&q=80',
    football: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&q=80',
    theatre: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&q=80',
    comedy: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=900&q=80',
}

const defaultEventImage = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=900&q=80'

function getEventCardImage(event) {
    const title = (event?.title || '').toLowerCase()
    const keyword = Object.keys(eventKeywordImages).find((k) => title.includes(k))
    if (keyword) return eventKeywordImages[keyword]

    const banner = event?.bannerUrl?.trim()
    if (banner) return banner

    return eventCategoryImages[event?.category] || defaultEventImage
}

// Fade animation variant
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
    show: { transition: { staggerChildren: 0.1 } },
}

function AnimatedSection({ children, className }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-100px' })
    return (
        <motion.div
            ref={ref}
            variants={stagger}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export default function HomePage() {
    const navigate = useNavigate()
    const [currentHero, setCurrentHero] = useState(0)
    const [isVideoOpen, setIsVideoOpen] = useState(false)
    const [youtubeTrailerId, setYoutubeTrailerId] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCity, setSelectedCity] = useState('Mumbai')
    const [movies, setMovies] = useState([])
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef(null)

    // Fetch movies and events on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [moviesRes, eventsRes] = await Promise.all([
                    moviesApi.getAll({ nowShowing: true }),
                    eventsApi.getAll()
                ])
                setMovies(moviesRes.data || [])
                setEvents(eventsRes.data || [])
            } catch (error) {
                console.error('Error fetching home data:', error)
                setMovies([])
                setEvents([])
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Build hero items from fetched data
    const heroItems = movies.slice(0, 4).map(m => ({
        id: m.id,
        title: m.title,
        subtitle: m.description?.substring(0, 50) || 'Latest Release',
        category: 'Movie',
        rating: m.rating || 8.5,
        date: 'Now Showing',
        image: m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&q=80',
        color: '#FF6B35',
        badge: '🔥 Trending',
        price: '₹299',
        youtubeId: m.youtubeTrailerId || 'U2Qp5pL3ovA',
    }))

    // Add some events to hero if available
    const mixedHeroItems = [
        ...heroItems,
        ...events.slice(0, 2).map(e => ({
            id: e.id,
            title: e.title,
            subtitle: e.description?.substring(0, 50) || 'Live Event',
            category: e.category,
            rating: e.rating || 8.5,
            date: new Date(e.eventDate).toLocaleDateString(),
            image: e.bannerUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1400&q=80',
            color: '#7C3AED',
            badge: '⚡ Selling Fast',
            price: `₹${e.price}`,
        }))
    ].slice(0, 4)

    // Default fallback hero items
    const defaultHeroItems = [
        {
            id: 1,
            title: 'Discover Amazing Events',
            subtitle: 'Book your next experience',
            category: 'Movie',
            rating: 8.5,
            date: 'Now Showing',
            image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&q=80',
            color: '#FF6B35',
            badge: '🎬 Explore',
            price: '₹299',
        }
    ]

    const currentHeroItems = mixedHeroItems.length > 0 ? mixedHeroItems : defaultHeroItems
    const hero = currentHeroItems[currentHero] || currentHeroItems[0]

    // Auto-rotate hero
    useEffect(() => {
        if (currentHeroItems.length === 0) return
        const timer = setInterval(() => {
            setCurrentHero(prev => (prev + 1) % currentHeroItems.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [currentHeroItems.length])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}&city=${selectedCity}`)
        }
    }

    const upcomingEventsList = events.filter(e => new Date(e.eventDate) > new Date()).slice(0, 4)

    return (
        <div className="min-h-screen">

            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                {/* Background Image */}
                <motion.div
                    key={currentHero}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <img
                        src={hero.image}
                        alt={hero.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 100%)'
                    }} />
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)'
                    }} />
                </motion.div>

                {/* Glows */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${hero.color}, transparent)`, filter: 'blur(80px)' }} />

                {/* Content */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
                    <div className="max-w-2xl">
                        <motion.div key={`badge-${currentHero}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                            <span className="badge-red mb-4 inline-block">{hero.badge}</span>
                        </motion.div>

                        <motion.div key={`cat-${currentHero}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                            <span className="text-sm font-semibold uppercase tracking-widest mb-2 block" style={{ color: hero.color }}>
                                {hero.category}
                            </span>
                        </motion.div>

                        <motion.h1
                            key={`title-${currentHero}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-5xl sm:text-7xl font-black text-white mb-2 leading-none"
                        >
                            {hero.title}
                        </motion.h1>

                        <motion.p
                            key={`sub-${currentHero}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-xl text-white/70 mb-6"
                        >
                            {hero.subtitle}
                        </motion.p>

                        <motion.div
                            key={`meta-${currentHero}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex items-center flex-wrap gap-6 mb-10"
                        >
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-white font-bold text-lg">{hero.rating}</span>
                                <span className="text-white/50 text-sm">/ 10</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                                <Calendar className="w-4 h-4" />
                                <span>{hero.date}</span>
                            </div>
                            <div className="text-white font-bold text-xl">Starting {hero.price}</div>
                        </motion.div>

                        <motion.div
                            key={`btns-${currentHero}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="flex items-center gap-4"
                        >
                            <Link to={hero.category === 'Movie' ? `/movies/${hero.id}` : `/events/${hero.id}`} className="btn-primary text-base px-8 py-4">
                                Book Now <ArrowRight className="w-5 h-5" />
                            </Link>
                            {hero.category === 'Movie' && (
                                <button onClick={() => {
                                    setYoutubeTrailerId(hero.youtubeId)
                                    setIsVideoOpen(true)
                                }} className="flex items-center gap-3 px-6 py-4 rounded-xl text-white/90 font-semibold transition-all duration-200 hover:bg-white/10 border border-white/20">
                                    <span className="w-10 h-10 rounded-full border-2 border-white/60 flex items-center justify-center">
                                        <Play className="w-4 h-4 fill-white ml-0.5" />
                                    </span>
                                    Watch Trailer
                                </button>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Hero Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {currentHeroItems.map((_, i) => (
                        <button key={i} onClick={() => setCurrentHero(i)}
                            className={`transition-all duration-300 rounded-full ${i === currentHero ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
                        />
                    ))}
                </div>

                {/* Hero Nav Arrows */}
                <button onClick={() => setCurrentHero((currentHero - 1 + currentHeroItems.length) % currentHeroItems.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center border border-white/20 text-white bg-black/30 hover:bg-black/50 transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={() => setCurrentHero((currentHero + 1) % currentHeroItems.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center border border-white/20 text-white bg-black/30 hover:bg-black/50 transition-all">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </section>

            {/* ===== SEARCH BAR ===== */}
            <section className="relative -mt-10 z-10 max-w-4xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="rounded-2xl p-2 shadow-2xl border border-default"
                    style={{ background: 'var(--card-bg)', backdropFilter: 'blur(20px)' }}
                >
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-2">
                        {/* City Selector */}
                        <div className="flex items-center gap-2 px-4 sm:border-r border-default">
                            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#FF2D55' }} />
                            <select
                                value={selectedCity}
                                onChange={e => setSelectedCity(e.target.value)}
                                className="bg-transparent outline-none text-sm font-medium text-primary-color cursor-pointer py-3"
                            >
                                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'].map(c => (
                                    <option key={c} value={c} style={{ background: 'var(--card-bg)' }}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Input */}
                        <div className="flex-1 flex items-center gap-3 px-4">
                            <Search className="w-4 h-4 flex-shrink-0 text-muted-color" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search for movies, events, concerts, sports..."
                                className="w-full py-3 bg-transparent outline-none text-sm text-primary-color placeholder:text-muted-color"
                            />
                        </div>

                        {/* Search Button */}
                        <button type="submit" className="btn-primary rounded-xl px-8 py-3 flex-shrink-0">
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </button>
                    </form>
                </motion.div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 space-y-20">

                {/* ===== CATEGORIES ===== */}
                <AnimatedSection>
                    <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-primary-color font-display">Browse Categories</h2>
                            <p className="text-muted-color mt-1">Explore what's happening near you</p>
                        </div>
                        <Link to="/events" className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: '#FF2D55' }}>
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat, i) => (
                            <motion.div key={cat.label} variants={fadeUp}>
                                <Link
                                    to={cat.href}
                                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-default transition-all duration-300 hover:scale-105 hover:shadow-xl text-center group"
                                    style={{ background: 'var(--card-bg)' }}
                                    id={`cat-${cat.label.toLowerCase()}`}
                                >
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                        style={{ background: cat.bg }}>
                                        <cat.icon className="w-7 h-7" style={{ color: cat.color }} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-primary-color">{cat.label}</p>
                                        <p className="text-xs text-muted-color mt-0.5">{cat.count}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </AnimatedSection>

                {/* ===== TRENDING MOVIES ===== */}
                <AnimatedSection>
                    <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
                        <div>
                            <span className="badge-red mb-2 inline-block">🔥 Trending</span>
                            <h2 className="text-3xl font-black text-primary-color font-display">Now Showing</h2>
                        </div>
                        <Link to="/movies" className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: '#FF2D55' }}>
                            All Movies <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {movies.length > 0 ? movies.slice(0, 6).map((movie, i) => (
                            <motion.div key={movie.id} variants={fadeUp}>
                                <Link
                                    to={`/movies/${movie.id}`}
                                    className="event-card group block"
                                    id={`movie-${movie.id}`}
                                >
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        <img
                                            src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80'}
                                            alt={movie.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                            <button className="btn-primary w-full text-xs py-2 px-3 rounded-lg">Book Now</button>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="flex items-center gap-1 bg-black/70 rounded-lg px-2 py-1 text-xs font-bold text-yellow-400 backdrop-blur-sm">
                                                <Star className="w-3 h-3 fill-yellow-400" />
                                                {movie.rating?.toFixed(1) || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-bold text-sm text-primary-color truncate">{movie.title}</h3>
                                        <p className="text-xs text-muted-color mt-0.5">{movie.genre}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs font-bold" style={{ color: '#FF2D55' }}>₹299+</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )) : <p className="text-muted-color col-span-full text-center">Loading movies...</p>}
                    </div>
                </AnimatedSection>

                {/* ===== UPCOMING EVENTS ===== */}
                <AnimatedSection>
                    <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
                        <div>
                            <span className="badge-purple mb-2 inline-block">⚡ Upcoming</span>
                            <h2 className="text-3xl font-black text-primary-color font-display">Don't Miss Out</h2>
                        </div>
                        <Link to="/events" className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: '#FF2D55' }}>
                            All Events <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {upcomingEventsList.length > 0 ? upcomingEventsList.map(event => (
                            <motion.div key={event.id} variants={fadeUp}>
                                <Link
                                    to={`/events/${event.id}`}
                                    className="event-card group block"
                                    id={`event-${event.id}`}
                                >
                                    <div className="relative aspect-video overflow-hidden">
                                        <img
                                            src={getEventCardImage(event)}
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null
                                                e.currentTarget.src = eventCategoryImages[event.category] || defaultEventImage
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute top-3 left-3">
                                            <span className={`badge ${event.category === 'Concert' ? 'badge-purple' :
                                                event.category === 'Sports' ? 'badge-orange' :
                                                    event.category === 'Comedy' ? 'badge-green' : 'badge-blue'
                                                }`}>{event.category}</span>
                                        </div>
                                        {!event.isAvailable && (
                                            <div className="absolute top-3 right-3">
                                                <span className="badge bg-red-500/80 text-white text-xs px-2 py-1 rounded-lg">Sold Out</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-primary-color leading-tight mb-2">{event.title}</h3>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs text-muted-color">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-color">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="truncate">{event.venueName}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-default">
                                            <span className="font-bold text-sm" style={{ color: '#FF2D55' }}>₹{event.price?.toLocaleString()}</span>
                                            {event.isAvailable ? (
                                                <span className="badge-green text-xs">Available</span>
                                            ) : (
                                                <span className="badge bg-red-500/10 text-red-400 text-xs">Sold Out</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )) : <p className="text-muted-color col-span-full text-center">Loading events...</p>}
                    </div>
                </AnimatedSection>

                {/* ===== STATS ===== */}
                <AnimatedSection>
                    <div className="rounded-3xl p-12 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(255,45,85,0.07), rgba(124,58,237,0.07))', border: '1px solid rgba(255,45,85,0.15)' }}>
                        <div className="absolute top-0 right-0 w-80 h-80 opacity-10 pointer-events-none"
                            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', filter: 'blur(60px)' }} />
                        <div className="absolute bottom-0 left-0 w-80 h-80 opacity-10 pointer-events-none"
                            style={{ background: 'radial-gradient(circle, #FF2D55, transparent)', filter: 'blur(60px)' }} />

                        <motion.div variants={fadeUp} className="text-center mb-12">
                            <h2 className="text-4xl font-black font-display text-primary-color">Trusted by Millions</h2>
                            <p className="text-muted-color mt-2">India's most loved entertainment booking platform</p>
                        </motion.div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map(stat => (
                                <motion.div key={stat.label} variants={fadeUp} className="text-center">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                        style={{ background: `${stat.color}1a` }}>
                                        <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
                                    </div>
                                    <div className="text-4xl font-black font-display mb-1" style={{ color: stat.color }}>{stat.value}</div>
                                    <div className="text-sm text-muted-color">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* ===== WHY BOOKSTAGE ===== */}
                <AnimatedSection>
                    <motion.div variants={fadeUp} className="text-center mb-12">
                        <h2 className="text-4xl font-black font-display text-primary-color">Why Choose BookStage?</h2>
                        <p className="text-muted-color mt-2 max-w-lg mx-auto">We make ticket booking fast, safe, and delightful</p>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Zap, title: 'Instant Booking', desc: 'Book in under 60 seconds with our lightning-fast checkout', color: '#F59E0B' },
                            { icon: Shield, title: 'Secure Payments', desc: '256-bit SSL encryption with Razorpay & Stripe integration', color: '#10B981' },
                            { icon: Clock, title: 'Real-time Seats', desc: 'Live seat availability with 5-minute hold protection', color: '#3B82F6' },
                            { icon: Smile, title: 'Easy Returns', desc: 'Hassle-free cancellations and instant refunds', color: '#FF2D55' },
                        ].map((f, i) => (
                            <motion.div key={f.title} variants={fadeUp}>
                                <div className="glass-card-hover p-8 text-center h-full" id={`feature-${i}`}>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                                        style={{ background: `${f.color}1a` }}>
                                        <f.icon className="w-8 h-8" style={{ color: f.color }} />
                                    </div>
                                    <h3 className="font-bold text-lg text-primary-color mb-3">{f.title}</h3>
                                    <p className="text-sm text-muted-color leading-relaxed">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </AnimatedSection>

                {/* ===== CTA ===== */}
                <AnimatedSection>
                    <motion.div
                        variants={fadeUp}
                        className="relative rounded-3xl overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #FF2D55 0%, #7C3AED 100%)' }}
                    >
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)'
                        }} />
                        <div className="relative p-12 sm:p-20 text-center">
                            <h2 className="text-4xl sm:text-6xl font-black text-white font-display mb-4">
                                Ready to Experience<br />Live Entertainment?
                            </h2>
                            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                                Join 10 million+ fans who book their favourite events on BookStage every month.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/register"
                                    className="px-10 py-4 rounded-xl bg-white text-gray-900 font-bold text-lg transition-all duration-200 hover:scale-105 shadow-xl"
                                >
                                    Get Started Free
                                </Link>
                                <Link
                                    to="/events"
                                    className="px-10 py-4 rounded-xl border-2 border-white/50 text-white font-bold text-lg transition-all duration-200 hover:bg-white/10"
                                >
                                    Explore Events
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </AnimatedSection>
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
                        <div className="absolute top-6 right-6 cursor-pointer text-white/70 hover:text-white bg-black/50 p-3 rounded-full hover:bg-white/10 transition-colors z-[101]"
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
                                src={`https://www.youtube.com/embed/${youtubeTrailerId}?autoplay=1&rel=0`}
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
