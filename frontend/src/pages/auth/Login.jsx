import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Ticket, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuthStore()

    const [form, setForm] = useState({ email: '', password: '' })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email || !form.password) {
            setError('Please fill in all fields.')
            return
        }
        setLoading(true)
        try {
            const response = await authApi.login(form)
            const data = response.data
            // server returns AuthResponse
            const userObj = {
                id: data.id,
                firstName: data.fullName.split(' ')[0],
                lastName: data.fullName.split(' ').slice(1).join(' '),
                email: data.email,
                role: data.role,
            }
            login(userObj, data.token)
            toast.success(`Welcome back, ${userObj.firstName}! 🎉`)
            navigate('/')
        } catch (err) {
            console.error(err)
            const msg = err?.response?.data?.message || 'Login failed'
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #1a0a2e 100%)' }}>
                {/* Glows */}
                <div className="absolute top-0 left-0 w-96 h-96 opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #FF2D55, transparent)', filter: 'blur(80px)' }} />
                <div className="absolute bottom-0 right-0 w-96 h-96 opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', filter: 'blur(80px)' }} />

                {/* Logo */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}>
                        <Ticket className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-2xl font-black font-display text-gradient">BookStage</span>
                </div>

                {/* Center Content */}
                <div className="relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h2 className="text-5xl font-black text-white font-display leading-tight mb-6">
                            Your Gateway to<br />
                            <span className="text-gradient">Unforgettable</span><br />
                            Experiences
                        </h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            Book movies, concerts, sports & more.<br />
                            10M+ happy customers trust BookStage.
                        </p>
                    </motion.div>

                    {/* Floating cards */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-10 space-y-3"
                    >
                        {[
                            { emoji: '🎬', text: 'Book movies in 3 taps', color: '#FF2D55' },
                            { emoji: '🎵', text: 'Concert tickets with VIP access', color: '#7C3AED' },
                            { emoji: '🏟️', text: 'Live sports with best seats', color: '#FF6B35' },
                        ].map(item => (
                            <div key={item.text} className="flex items-center gap-4 p-4 rounded-2xl border"
                                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                                <span className="text-2xl">{item.emoji}</span>
                                <span className="text-white/80 font-medium">{item.text}</span>
                                <div className="ml-auto w-2 h-2 rounded-full hidden" style={{ background: item.color }} />
                            </div>
                        ))}
                    </motion.div>
                </div>

                <p className="text-white/30 text-sm relative z-10">© 2026 BookStage Technologies Pvt. Ltd.</p>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}>
                            <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black font-display text-gradient">BookStage</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-primary-color font-display">Welcome back 👋</h1>
                        <p className="text-muted-color mt-2">Sign in to your BookStage account</p>
                    </div>

            

                    {/* Error */}
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 rounded-xl mb-5 border"
                            style={{ background: 'rgba(255,45,85,0.07)', borderColor: 'rgba(255,45,85,0.25)' }}>
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-400">{error}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-primary-color mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="input-field pl-11"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-primary-color">Password</label>
                                <Link to="/forgot-password" className="text-sm font-medium" style={{ color: '#FF2D55' }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                                <input
                                    id="login-password"
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="input-field pl-11 pr-12"
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-color hover:text-primary-color transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-base mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing In...
                                </span>
                            ) : (
                                <>Sign In <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-color mt-6">
                        New to BookStage?{' '}
                        <Link to="/register" className="font-semibold hover:underline" style={{ color: '#FF2D55' }}>
                            Create an account
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
