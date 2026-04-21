import { useSearchParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, X } from 'lucide-react'
import { searchApi } from '../services/api'

const typeColors = { Movie: 'badge-red', Event: 'badge-purple' }

export default function SearchPage() {
    const [params, setParams] = useSearchParams()
    const queryParam = (params.get('q') || '').trim()
    const [query, setQuery] = useState(queryParam)
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [typeFilter, setTypeFilter] = useState('All')

    useEffect(() => {
        setQuery(queryParam)
    }, [queryParam])

    useEffect(() => {
        let isActive = true
        if (!queryParam || queryParam.length < 2) {
            setResults([])
            setLoading(false)
            return () => { isActive = false }
        }

        const fetchResults = async () => {
            setLoading(true)
            setError('')
            try {
                const { data } = await searchApi.query(queryParam)
                if (!isActive) return
                setResults(data || [])
            } catch (err) {
                if (!isActive) return
                console.error('Search failed', err)
                setError('Could not fetch search results. Please try again.')
                setResults([])
            } finally {
                if (isActive) setLoading(false)
            }
        }

        fetchResults()
        return () => { isActive = false }
    }, [queryParam])

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = query.trim()
        if (!trimmed) {
            setParams({})
            setResults([])
            return
        }
        setParams({ q: trimmed })
    }

    const filtered = typeFilter === 'All' ? results : results.filter(r => r.type === typeFilter)
    const visibleTypes = ['All', ...Array.from(new Set(results.map(r => r.type)))]
    const noQueryYet = !queryParam || queryParam.length < 2

    return (
        <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-primary-color font-display mb-6">Search Results</h1>

                {/* Search Bar */}
                <form className="relative mb-6" onSubmit={handleSubmit}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-color" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search movies or events"
                        className="input-field pl-12 py-4 text-lg"
                        id="main-search"
                    />
                    {query && <button type="button" onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2"><X className="w-5 h-5 text-muted-color" /></button>}
                </form>

                {/* Type filters */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
                    {visibleTypes.map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${typeFilter === t ? 'text-white border-transparent' : 'border-default text-muted-color'
                                }`}
                            style={typeFilter === t ? { background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' } : { background: 'var(--glass-bg)' }}>
                            {t}
                        </button>
                    ))}
                </div>

                {queryParam && queryParam.length >= 2 && <p className="text-muted-color text-sm mb-5">
                    Showing results for "<strong className="text-primary-color">{queryParam}</strong>" · {filtered.length} found
                </p>}
                {error && <p className="text-red-400 text-sm mb-5">{error}</p>}

                {noQueryYet && (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-3">🔍</div>
                        <p className="text-lg font-semibold text-primary-color">Start typing to search the catalogue</p>
                        <p className="text-muted-color mt-2">Use at least 2 characters to see results from movies and events.</p>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="space-y-4">
                        {filtered.map((r, i) => (
                            <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                <Link
                                    to={r.type === 'Movie' ? `/movies/${r.id}` : `/events/${r.id}`}
                                    className="flex gap-5 p-5 rounded-2xl border border-default transition-all hover:shadow-lg hover:border-red-400/30 group"
                                    style={{ background: 'var(--card-bg)' }}
                                >
                                    <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                        <img src={r.imageUrl || 'https://placehold.co/200x160?text=Bookstage'} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`badge text-xs ${typeColors[r.type] || 'badge-blue'}`}>{r.type}</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-bold text-yellow-400">{r.rating ?? '—'}</span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-primary-color">{r.title}</h3>
                                        <p className="text-xs text-muted-color mt-1">{r.subtitle || r.city || 'Details available'}</p>
                                        {r.date && <p className="text-[11px] text-muted-color mt-1">{new Date(r.date).toLocaleDateString()}</p>}
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        {r.price ? (
                                            <>
                                                <p className="text-xs text-muted-color">from</p>
                                                <p className="font-black text-sm" style={{ color: '#FF2D55' }}>
                                                    ₹{Number(r.price).toLocaleString('en-IN')}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-xs text-muted-color">View details</p>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    !noQueryYet && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-xl font-bold text-primary-color">No results found</p>
                            <p className="text-muted-color mt-2">Try different keywords or browse our categories</p>
                            <Link to="/events" className="btn-primary mt-6">Browse Events</Link>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
