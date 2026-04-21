import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Star, Calendar, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { eventsApi } from '../services/api'

const categories = ['All', 'Concert', 'Sports', 'Theatre', 'Comedy']
const cities = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad']
const sortOptions = ['Popularity', 'Date: Soonest', 'Price: Low to High', 'Price: High to Low', 'Rating']

const catBadge = { Concert: 'badge-purple', Sports: 'badge-orange', Theatre: 'badge-blue', Comedy: 'badge-green' }

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

export default function EventsPage() {
    const [search, setSearch] = useState('')
    const [selectedCat, setSelectedCat] = useState('All')
    const [selectedCity, setSelectedCity] = useState('All Cities')
    const [sortBy, setSortBy] = useState('Popularity')
    const [showFilters, setShowFilters] = useState(false)
    const [priceRange, setPriceRange] = useState([0, 10000])
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true)
                const response = await eventsApi.getAll({
                    category: selectedCat === 'All' ? null : selectedCat,
                    city: selectedCity === 'All Cities' ? null : selectedCity
                })
                setEvents(response.data || [])
            } catch (error) {
                console.error('Error fetching events:', error)
                setEvents([])
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [selectedCat, selectedCity])

    const filtered = events.filter(e => {
        const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase())
        const matchPrice = e.price >= priceRange[0] && e.price <= priceRange[1]
        return matchSearch && matchPrice
    }).sort((a, b) => {
        if (sortBy === 'Price: Low to High') return a.price - b.price
        if (sortBy === 'Price: High to Low') return b.price - a.price
        if (sortBy === 'Rating') return (b.rating || 0) - (a.rating || 0)
        if (sortBy === 'Date: Soonest') return new Date(a.eventDate) - new Date(b.eventDate)
        return (b.rating || 0) - (a.rating || 0)
    })

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="py-12 px-4" style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-primary))' }}>
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black font-display text-primary-color mb-2">Live Events</h1>
                    <p className="text-muted-color">Discover concerts, sports, theatre & more</p>

                    {/* Search + Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-color" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search events..."
                                className="input-field pl-12 py-4"
                                id="events-search"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-color hover:text-primary-color">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
                            className="input-field py-4 w-full sm:w-48"
                            style={{ background: 'var(--glass-bg)' }}>
                            {cities.map(c => <option key={c} value={c} style={{ background: 'var(--card-bg)' }}>{c}</option>)}
                        </select>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            className="input-field py-4 w-full sm:w-48"
                            style={{ background: 'var(--glass-bg)' }}>
                            {sortOptions.map(s => <option key={s} value={s} style={{ background: 'var(--card-bg)' }}>{s}</option>)}
                        </select>
                        <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary py-4 px-5 flex-shrink-0 ${showFilters ? 'border-red-400/60' : ''}`}>
                            <SlidersHorizontal className="w-5 h-5" />
                            Filters
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 rounded-2xl p-5 border border-default" style={{ background: 'var(--card-bg)' }}>
                            <div className="flex flex-wrap gap-3 items-center">
                                <span className="text-sm font-semibold text-primary-color">Price Range:</span>
                                <input type="range" min="0" max="10000" step="100" value={priceRange[1]}
                                    onChange={e => setPriceRange([0, Number(e.target.value)])}
                                    className="w-48 accent-red-500" />
                                <span className="text-sm text-muted-color">Up to ₹{priceRange[1].toLocaleString()}</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-16">
                {/* Category Pills */}
                <div className="flex items-center gap-2 py-6 overflow-x-auto scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCat(cat)}
                            id={`cat-filter-${cat.toLowerCase()}`}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${selectedCat === cat
                                ? 'text-white border-transparent'
                                : 'border-default text-secondary-color hover:border-red-400/40'
                                }`}
                            style={selectedCat === cat ? { background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' } : { background: 'var(--glass-bg)' }}
                        >
                            {cat}
                        </button>
                    ))}
                    <div className="ml-auto flex-shrink-0 text-sm text-muted-color whitespace-nowrap">
                        {filtered.length} events found
                    </div>
                </div>

                {/* Events Grid */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((event, i) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link to={`/events/${event.id}`} className="event-card block" id={`event-card-${event.id}`}>
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
                                            <span className={`badge text-xs ${catBadge[event.category] || 'badge-blue'}`}>{event.category}</span>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <span className="flex items-center gap-1 bg-black/60 rounded-lg px-2 py-1 text-xs font-bold text-yellow-400 backdrop-blur-sm">
                                                <Star className="w-3 h-3 fill-yellow-400" />
                                                {event.rating}
                                            </span>
                                        </div>
                                        {!event.isAvailable && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="font-bold text-white text-lg">SOLD OUT</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-primary-color leading-tight mb-3 line-clamp-2">{event.title}</h3>
                                        <div className="space-y-1.5 mb-3">
                                            <div className="flex items-center gap-2 text-xs text-muted-color">
                                                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>{new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-color">
                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{event.venueName}, {event.venueCity}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-default">
                                            <span className="font-bold text-sm" style={{ color: '#FF2D55' }}>₹{event.price.toLocaleString()}</span>
                                            {event.isAvailable
                                                ? <span className="badge-green text-xs">Book Now</span>
                                                : <span className="badge bg-red-500/10 text-red-400 text-xs">Sold Out</span>
                                            }
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-primary-color mb-2">No events found</h3>
                        <p className="text-muted-color">Try adjusting your filters or search query</p>
                        <button onClick={() => { setSearch(''); setSelectedCat('All'); setSelectedCity('All Cities') }} className="btn-primary mt-6">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
