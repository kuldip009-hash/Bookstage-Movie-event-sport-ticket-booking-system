import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Star, Clock, X } from 'lucide-react'
import { moviesApi } from '../services/api'

const languages = ['All', 'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam']
const genres = ['All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Romance']

export default function MoviesPage() {
    const [tab, setTab] = useState('now-showing')
    const [search, setSearch] = useState('')
    const [lang, setLang] = useState('All')
    const [genre, setGenre] = useState('All')
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true)
                const response = await moviesApi.getAll({ nowShowing: tab === 'now-showing' })
                setMovies(response.data || [])
            } catch (error) {
                console.error('Error fetching movies:', error)
                setMovies([])
            } finally {
                setLoading(false)
            }
        }

        fetchMovies()
    }, [tab])

    const filtered = movies.filter(m => {
        const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase())
        const matchLang = lang === 'All' || m.language?.includes(lang)
        const matchGenre = genre === 'All' || m.genre?.includes(genre)
        return matchSearch && matchLang && matchGenre
    })

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="py-10 px-4" style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-primary))' }}>
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black font-display text-primary-color mb-2">🎬 Movies</h1>
                    <p className="text-muted-color">Book tickets for the latest blockbusters</p>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 mt-6">
                        {['now-showing', 'upcoming'].map(t => (
                            <button key={t} onClick={() => setTab(t)} id={`movies-tab-${t}`}
                                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${tab === t ? 'text-white' : 'border border-default text-secondary-color'
                                    }`}
                                style={tab === t ? { background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' } : { background: 'var(--glass-bg)' }}>
                                {t === 'now-showing' ? '🎬 Now Showing' : '⏰ Coming Soon'}
                            </button>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search movies..."
                                className="input-field pl-10 py-2.5 w-56" id="movies-search" />
                            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-color" /></button>}
                        </div>
                        <select value={lang} onChange={e => setLang(e.target.value)}
                            className="input-field py-2.5 w-36" style={{ background: 'var(--glass-bg)' }}>
                            {languages.map(l => <option key={l} value={l} style={{ background: 'var(--card-bg)' }}>{l}</option>)}
                        </select>
                        <select value={genre} onChange={e => setGenre(e.target.value)}
                            className="input-field py-2.5 w-36" style={{ background: 'var(--glass-bg)' }}>
                            {genres.map(g => <option key={g} value={g} style={{ background: 'var(--card-bg)' }}>{g}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {filtered.map((movie, i) => (
                        <motion.div key={movie.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                            <Link to={`/movies/${movie.id}`} className="event-card block group" id={`movie-card-${movie.id}`}>
                                <div className="relative aspect-[2/3] overflow-hidden">
                                    <img src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80'} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <button className="btn-primary w-full text-xs py-2 px-3 rounded-lg">Book Ticket</button>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <span className="flex items-center gap-1 bg-black/70 rounded-lg px-2 py-1 text-xs font-bold text-yellow-400 backdrop-blur-sm">
                                            <Star className="w-3 h-3 fill-yellow-400" />
                                            {movie.rating?.toFixed(1) || 'N/A'}
                                        </span>
                                    </div>
                                    {!movie.isNowShowing && (
                                        <div className="absolute top-2 left-2">
                                            <span className="badge badge-blue text-xs">Coming Soon</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-sm text-primary-color truncate">{movie.title}</h3>
                                    <p className="text-xs text-muted-color mt-0.5">{movie.genre}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="flex items-center gap-1 text-xs text-muted-color">
                                            <Clock className="w-3 h-3" />
                                            {movie.duration ? `${movie.duration} min` : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs font-bold" style={{ color: '#FF2D55' }}>₹299+</span>
                                        <span className="text-xs text-muted-color">{movie.language}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🎬</div>
                        <p className="text-xl font-bold text-primary-color">No movies found</p>
                        <button onClick={() => { setSearch(''); setLang('All'); setGenre('All') }} className="btn-primary mt-4">Clear Filters</button>
                    </div>
                )}
            </div>
        </div>
    )
}
