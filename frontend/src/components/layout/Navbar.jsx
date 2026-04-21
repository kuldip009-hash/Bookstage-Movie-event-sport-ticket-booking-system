import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Moon, Sun, User, LogOut, Menu, X,
    Ticket, Film, Music, Trophy, ChevronDown
} from 'lucide-react'
import { useAuthStore, useThemeStore } from '../../store'

const categories = [
    { label: 'Movies', icon: Film, href: '/movies', color: 'text-red-400' },
    { label: 'Events', icon: Music, href: '/events', color: 'text-purple-400' },
    { label: 'Sports', icon: Trophy, href: '/events?cat=sports', color: 'text-orange-400' },
]

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuthStore()
    const { isDark, toggleTheme } = useThemeStore()
    const navigate = useNavigate()

    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    const profileRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
            setIsSearchFocused(false)
        }
    }

    const handleLogout = () => {
        logout()
        setIsProfileOpen(false)
        navigate('/')
    }

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'shadow-lg backdrop-blur-xl border-b border-default'
                    : 'border-b border-transparent'
                    }`}
                style={{ background: isScrolled ? 'var(--nav-bg)' : 'transparent' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center h-16 gap-4">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}>
                                <Ticket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black font-display text-gradient hidden sm:block">BookStage</span>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center gap-1 ml-4">
                            {categories.map(cat => (
                                <NavLink
                                    key={cat.label}
                                    to={cat.href}
                                    className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}
                                >
                                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                                    {cat.label}
                                </NavLink>
                            ))}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative hidden sm:block">
                            <div className={`relative flex items-center transition-all duration-300 ${isSearchFocused ? 'w-72' : 'w-52'
                                }`}>
                                <Search className="absolute left-3 w-4 h-4 text-muted-color pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    placeholder="Search events, movies..."
                                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl outline-none transition-all duration-200 border"
                                    style={{
                                        background: 'var(--glass-bg)',
                                        borderColor: isSearchFocused ? '#FF2D55' : 'var(--glass-border)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                            </div>
                        </form>

                        {/* Theme Toggle */}
                        <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme" id="theme-toggle">
                            <AnimatePresence mode="wait">
                                {isDark ? (
                                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Sun className="w-5 h-5 text-yellow-400" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Moon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        {/* Auth Buttons / Profile */}
                        {isAuthenticated ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/10"
                                    id="profile-menu-trigger"
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                        style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}>
                                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden md:block text-sm font-medium text-primary-color">
                                        {user?.firstName || 'User'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-muted-color transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden z-50"
                                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                                        >
                                            <div className="p-3 border-b border-default">
                                                <p className="font-semibold text-sm text-primary-color">{user?.firstName} {user?.lastName}</p>
                                                <p className="text-xs text-muted-color truncate">{user?.email}</p>
                                            </div>
                                            <div className="p-2">
                                                <ProfileMenuItem icon={Ticket} label="My Bookings" to="/my-bookings" onClick={() => setIsProfileOpen(false)} />
                                                <ProfileMenuItem icon={User} label="Profile" to="/profile" onClick={() => setIsProfileOpen(false)} />
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/10 text-red-400 mt-1"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="btn-secondary hidden sm:flex text-sm py-2 px-4">Sign In</Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="btn-icon md:hidden" id="mobile-menu-btn">
                            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden border-t border-default overflow-hidden"
                            style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)' }}
                        >
                            <div className="p-4 space-y-2">
                                {/* Mobile Search */}
                                <form onSubmit={handleSearch} className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search events, movies..."
                                        className="input-field pl-10"
                                    />
                                </form>

                                {categories.map(cat => (
                                    <Link
                                        key={cat.label}
                                        to={cat.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm hover:bg-white/10 transition-colors"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        <cat.icon className={`w-5 h-5 ${cat.color}`} />
                                        {cat.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Spacer */}
            <div className="h-16" />
        </>
    )
}

function ProfileMenuItem({ icon: Icon, label, to, onClick, accent }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${accent
                ? 'hover:bg-purple-500/10 text-purple-400'
                : 'hover:bg-white/10 text-primary-color'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </Link>
    )
}
