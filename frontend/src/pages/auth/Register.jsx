import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, Ticket, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { useAuthStore } from '../../store'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'

const passwordStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
}

export default function RegisterPage() {
    const navigate = useNavigate()
    const { login } = useAuthStore()

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', city: '', dob: ''
    })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [agreed, setAgreed] = useState(false)

    const pwdScore = passwordStrength(form.password)
    const pwdColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
    const pwdLabels = ['Weak', 'Fair', 'Good', 'Strong']

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    }

    const validate = () => {
        const errs = {}
        if (!form.firstName.trim()) errs.firstName = 'First name required'
        if (!form.lastName.trim()) errs.lastName = 'Last name required'
        if (!form.email.trim()) errs.email = 'Email required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
        if (!form.phone.trim()) errs.phone = 'Phone required'
        else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Must be 10 digits'
        if (!form.password) errs.password = 'Password required'
        else if (form.password.length < 8) errs.password = 'Minimum 8 characters'
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
        if (!form.city) errs.city = 'City required'
        if (!form.dob) errs.dob = 'Date of birth required'
        if (!agreed) errs.agreed = 'You must agree to the terms'
        return errs
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        setLoading(true)
        try {
            const response = await authApi.register({
                email: form.email,
                password: form.password,
                fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
                phone: form.phone.trim(),
                city: form.city,
                dateOfBirth: form.dob,
            })
            const data = response.data
            const userObj = {
                id: data.id,
                firstName: data.fullName.split(' ')[0],
                lastName: data.fullName.split(' ').slice(1).join(' '),
                email: data.email,
                role: data.role,
            }
            login(userObj, data.token)
            toast.success('Account created successfully! 🎉')
            navigate('/')
        } catch (err) {
            console.error(err)
            const msg = err?.response?.data?.message || 'Registration failed'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Left Brand Panel */}
            <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #1a0a2e 100%)' }}>
                <div className="absolute top-0 right-0 w-96 h-96 opacity-15 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', filter: 'blur(80px)' }} />
                <div className="absolute bottom-0 left-0 w-96 h-96 opacity-15 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #FF2D55, transparent)', filter: 'blur(80px)' }} />

                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}>
                        <Ticket className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-2xl font-black font-display text-gradient">BookStage</span>
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white font-display leading-tight mb-6">
                        Join India's <span className="text-gradient">Biggest</span> Entertainment Platform
                    </h2>
                    <div className="space-y-4">
                        {[
                            'Free account with exclusive perks',
                            'Early access to top events',
                            'Real-time seat selection',
                            'Instant QR code tickets',
                            'Easy cancellations & refunds',
                        ].map(feat => (
                            <div key={feat} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(255,45,85,0.2)' }}>
                                    <Check className="w-3.5 h-3.5 text-red-400" />
                                </div>
                                <span className="text-white/70 text-sm">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-white/30 text-sm relative z-10">© 2026 BookStage Technologies Pvt. Ltd.</p>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg py-6"
                >
                    {/* Mobile Logo */}
                    <div className="flex items-center gap-2 mb-6 lg:hidden">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}>
                            <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black font-display text-gradient">BookStage</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-primary-color font-display">Create your account</h1>
                        <p className="text-muted-color mt-2">Join 10 million+ entertainment lovers</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-primary-color mb-2">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                                    <input id="reg-firstname" type="text" name="firstName" value={form.firstName} onChange={handleChange}
                                        placeholder="John" className="input-field pl-11"
                                        style={errors.firstName ? { borderColor: '#FF2D55' } : {}} />
                                </div>
                                {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-primary-color mb-2">Last Name</label>
                                <input id="reg-lastname" type="text" name="lastName" value={form.lastName} onChange={handleChange}
                                    placeholder="Doe" className="input-field"
                                    style={errors.lastName ? { borderColor: '#FF2D55' } : {}} />
                                {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-primary-color mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                                <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange}
                                    placeholder="you@example.com" className="input-field pl-11"
                                    style={errors.email ? { borderColor: '#FF2D55' } : {}} />
                            </div>
                            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-primary-color mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                                <div className="absolute left-11 top-1/2 -translate-y-1/2 text-sm font-medium text-primary-color pr-2 border-r border-default">+91</div>
                                <input id="reg-phone" type="tel" name="phone" value={form.phone} onChange={handleChange}
                                    placeholder="9876543210" className="input-field pl-24"
                                    style={errors.phone ? { borderColor: '#FF2D55' } : {}} />
                            </div>
                            {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-primary-color mb-2">City</label>
                                <select name="city" value={form.city} onChange={handleChange}
                                    className="input-field" style={{ background: 'var(--glass-bg)' }}>
                                    {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'].map(c => (
                                        <option key={c} value={c} style={{ background: 'var(--card-bg)' }}>{c}</option>
                                    ))}
                                </select>
                                {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-primary-color mb-2">Date of Birth</label>
                                <input id="reg-dob" type="date" name="dob" value={form.dob} onChange={handleChange}
                                    className="input-field" />
                                {errors.dob && <p className="text-xs text-red-400 mt-1">{errors.dob}</p>}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-primary-color mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                                <input id="reg-password" type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                                    placeholder="Min 8 characters" className="input-field pl-11 pr-12"
                                    style={errors.password ? { borderColor: '#FF2D55' } : {}} />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-color hover:text-primary-color transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                            {/* Strength Meter */}
                            {form.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwdScore ? pwdColors[pwdScore - 1] : 'bg-gray-700'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-color">{form.password ? pwdLabels[pwdScore - 1] || 'Very Weak' : ''}</p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-primary-color mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                                <input id="reg-confirm-password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                                    placeholder="Repeat your password" className="input-field pl-11"
                                    style={errors.confirmPassword ? { borderColor: '#FF2D55' } : {}} />
                                {form.confirmPassword && form.password === form.confirmPassword && (
                                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                                )}
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
                        </div>

                        {/* Terms */}
                        <div>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded border-gray-600 accent-red-500 cursor-pointer" />
                                <span className="text-sm text-muted-color">
                                    I agree to BookStage's{' '}
                                    <Link to="/terms" className="font-medium hover:underline" style={{ color: '#FF2D55' }}>Terms of Use</Link>
                                    {' '}and{' '}
                                    <Link to="/privacy" className="font-medium hover:underline" style={{ color: '#FF2D55' }}>Privacy Policy</Link>
                                </span>
                            </label>
                            {errors.agreed && <p className="text-xs text-red-400 mt-1">{errors.agreed}</p>}
                        </div>

                        {/* Submit */}
                        <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Account...
                                </span>
                            ) : (
                                <>Create Account <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-color mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold hover:underline" style={{ color: '#FF2D55' }}>Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
