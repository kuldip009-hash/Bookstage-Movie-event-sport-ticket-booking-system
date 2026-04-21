import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useBookingStore, useAuthStore } from '../store'
import { bookingsApi, offersApi, seatsApi, eventSeatsApi } from '../services/api'
import toast from 'react-hot-toast'
import { CreditCard, Smartphone, Building2, Tag, Shield, Check, ArrowRight } from 'lucide-react'

const paymentMethods = [
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
    { id: 'upi', label: 'UPI Payment', icon: Smartphone },
    { id: 'netbanking', label: 'Net Banking', icon: Building2 },
]

const upiApps = ['GPay', 'PhonePe', 'Paytm', 'BHIM', 'WhatsApp Pay']
const banks = ['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak', 'PNB', 'Canara Bank']

export default function CheckoutPage() {
    const navigate = useNavigate()

    const {
        selectedSeats,
        showtime,
        showtimeInfo,
        event,
        totalAmount,
        subtotal,
        gst,
        convenience,
        applyCoupon,
        couponCode,
        discount,
        discountAmount,
    } = useBookingStore()
    const { user } = useAuthStore()

    const [payMethod, setPayMethod] = useState('card')
    const [couponInput, setCouponInput] = useState('')
    const [couponLoading, setCouponLoading] = useState(false)
    const [paying, setPaying] = useState(false)

    const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' })
    const [upiId, setUpiId] = useState('')
    const [selectedBank, setSelectedBank] = useState('')

    // ── Derived values ─────────────────────────────────────────────────────────
    const seatsSummary = selectedSeats?.length ? selectedSeats : []

    const baseSubtotal = seatsSummary.reduce((s, seat) => s + seat.price, 0)
    const effectiveSubtotal = typeof subtotal === 'number' ? subtotal : baseSubtotal
    const effectiveDiscountAmount =
        typeof discountAmount === 'number'
            ? discountAmount
            : Math.round((effectiveSubtotal * (discount || 0)) / 100)
    const effectiveConvenience =
        typeof convenience === 'number'
            ? convenience
            : Math.round(effectiveSubtotal * 0.05)
    const effectiveGst =
        typeof gst === 'number'
            ? gst
            : Math.round((effectiveSubtotal - effectiveDiscountAmount) * 0.18)
    const total =
        typeof totalAmount === 'number'
            ? totalAmount
            : effectiveSubtotal - effectiveDiscountAmount + effectiveConvenience + effectiveGst

    const summaryEventName =
        showtimeInfo?.eventName || event?.title || event?.name || showtime?.eventName || 'Your Event'
    const summaryDate = showtimeInfo?.date || showtime?.date || ''
    const summaryTime = showtimeInfo?.time || showtime?.time || ''
    const summaryVenue = showtimeInfo?.venue || showtime?.venue || ''
    const summaryCity = showtimeInfo?.venueCity || showtime?.venueCity || event?.venueCity || ''

    // ── Helpers for booking payload ────────────────────────────────────────────
    const isGuidLike = (val) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val || '')
    const isMovie = showtimeInfo?.eventType === 'movie' || showtime?.eventType === 'movie'
    const movieId = isMovie ? (showtimeInfo?.movieId || showtime?.movieId || null) : null
    const eventId = !isMovie ? (event?.id || showtimeInfo?.eventId || null) : null
    const rawShowTimeId = showtimeInfo?.showTimeId || showtime?.id || showtime?.showTimeId || null
    const showTimeId = isGuidLike(rawShowTimeId) ? rawShowTimeId : null
    const eventSeatLockingEnabled = !isMovie && isGuidLike(eventId)

    // Pick the most common seat category from selected seats
    const getSeatCategory = () => {
        if (!seatsSummary.length) return 'Standard'
        const counts = seatsSummary.reduce((acc, s) => {
            const cat = s.label || s.category || 'Standard'
            acc[cat] = (acc[cat] || 0) + 1
            return acc
        }, {})
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    }

    // Parse "Sat 15 Jun" or ISO string → ISO datetime string
    const parseEventDate = () => {
        try {
            const d = new Date(summaryDate)
            return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
        } catch {
            return new Date().toISOString()
        }
    }

    // Parse "2:30 PM" → "14:30:00" (C# TimeSpan compatible)
    const parseEventTime = () => {
        try {
            if (!summaryTime) return '00:00:00'
            const [timePart, meridiem] = summaryTime.split(' ')
            let [hours, minutes] = timePart.split(':').map(Number)
            if (meridiem === 'PM' && hours !== 12) hours += 12
            if (meridiem === 'AM' && hours === 12) hours = 0
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
        } catch {
            return '00:00:00'
        }
    }

    // ── Coupon ─────────────────────────────────────────────────────────────────
    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return
        setCouponLoading(true)
        try {
            const { data } = await offersApi.validateCoupon(couponInput.trim(), total)
            applyCoupon(couponInput.trim(), data.discountPercent)
            toast.success(`Coupon applied! ${data.discountPercent}% off 🎉`)
        } catch {
            if (couponInput.toUpperCase() === 'BOOK20') {
                applyCoupon('BOOK20', 20)
                toast.success('Coupon BOOK20 applied! 20% off 🎉')
            } else {
                toast.error('Invalid or expired coupon code')
            }
        } finally {
            setCouponLoading(false)
        }
    }

    // ── Pay & Submit to Backend ────────────────────────────────────────────────
    const handlePay = async () => {
        if (!user?.id) {
            toast.error('Please log in to complete your booking.')
            navigate('/login', { replace: true, state: { from: '/checkout' } })
            return
        }

        if (!seatsSummary.length) {
            toast.error('No seats selected.')
            return
        }

        setPaying(true)

        try {
            // 1️⃣ Create Booking
            const bookingPayload = {
                userId: user.id,
                movieId: movieId ?? null,
                eventId: eventId ?? null,
                showTimeId: showTimeId ?? null,
                bookingType: isMovie ? 'Movie' : 'Event',
                eventOrMovieTitle: summaryEventName,
                venueName: summaryVenue,
                venueCity: summaryCity,
                bookingDate: new Date().toISOString(),
                eventDate: parseEventDate(),
                eventTime: parseEventTime(),
                seatsBooked: seatsSummary.map(s => s.id).join(','),
                seatCategory: getSeatCategory(),
                totalPrice: Math.round(total),
                status: 'confirmed',
            }

            const bookingRes = await bookingsApi.create(bookingPayload)
            const createdBooking = bookingRes.data
            const bookingId = createdBooking?.id

            if (!bookingId) {
                throw new Error('Booking created but no ID returned.')
            }

            // 2️⃣ Confirm Seats
            const seatIds = seatsSummary.map(s => s.id)
            const sid = showtimeInfo?.showTimeId || showtime?.id

            if (isMovie && isGuidLike(sid) && seatIds.length) {
                await seatsApi.confirm(sid, seatIds)
            } else if (eventSeatLockingEnabled && seatIds.length && eventId) {
                await eventSeatsApi.confirm(eventId, seatIds)
            }

            toast.success('Booking confirmed! 🎉')
            navigate(`/booking/confirm/${bookingId}`)

        } catch (err) {
            console.error('Checkout error:', err)
            if (err?.response?.status === 401) {
                toast.error('Session expired. Please log in again.')
                navigate('/login', { replace: true, state: { from: '/checkout' } })
            } else {
                toast.error('Payment failed. Please try again.')
            }
        } finally {
            setPaying(false)
        }
    }

    const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
    const formatExpiry = v => v.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/')

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen py-8" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-primary-color font-display">Checkout</h1>
                    <p className="text-muted-color mt-1">Complete your booking securely</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* ── Left: Payment ── */}
                    <div className="lg:col-span-3 space-y-5">

                        {/* Payment Method */}
                        <div className="rounded-2xl border border-default overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                            <div className="p-5 border-b border-default">
                                <h2 className="font-bold text-primary-color">Payment Method</h2>
                            </div>
                            <div className="p-5 space-y-3">
                                {paymentMethods.map(pm => (
                                    <label key={pm.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${payMethod === pm.id ? 'border-red-400/60' : 'border-default hover:border-red-400/30'}`}
                                        style={{ background: payMethod === pm.id ? 'rgba(255,45,85,0.06)' : 'var(--glass-bg)' }}>
                                        <input type="radio" name="payMethod" value={pm.id} checked={payMethod === pm.id}
                                            onChange={() => setPayMethod(pm.id)} className="accent-red-500 w-4 h-4" />
                                        <pm.icon className="w-5 h-5" style={{ color: payMethod === pm.id ? '#FF2D55' : 'var(--text-muted)' }} />
                                        <span className="font-medium text-sm text-primary-color">{pm.label}</span>
                                        {pm.id === 'card' && (
                                            <div className="ml-auto flex items-center gap-1.5">
                                                {['💳 Visa', 'Mastercard', 'Rupay'].map(c => (
                                                    <span key={c} className="text-xs text-muted-color bg-white/10 px-2 py-0.5 rounded">{c}</span>
                                                ))}
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="rounded-2xl border border-default overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                            <div className="p-5 border-b border-default">
                                <h2 className="font-bold text-primary-color">Enter Details</h2>
                            </div>
                            <div className="p-5">
                                {payMethod === 'card' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-color mb-2">Card Number</label>
                                            <input id="card-number" value={cardForm.number}
                                                onChange={e => setCardForm(p => ({ ...p, number: formatCard(e.target.value) }))}
                                                placeholder="1234 5678 9012 3456" className="input-field tracking-widest" maxLength={19} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-color mb-2">Cardholder Name</label>
                                            <input id="card-name" value={cardForm.name}
                                                onChange={e => setCardForm(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                                                placeholder="JOHN DOE" className="input-field uppercase" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-primary-color mb-2">Expiry (MM/YY)</label>
                                                <input id="card-expiry" value={cardForm.expiry}
                                                    onChange={e => setCardForm(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                                                    placeholder="12/28" className="input-field" maxLength={5} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-primary-color mb-2">CVV</label>
                                                <input id="card-cvv" type="password" value={cardForm.cvv}
                                                    onChange={e => setCardForm(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                                    placeholder="•••" className="input-field" maxLength={4} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {payMethod === 'upi' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-color mb-2">UPI ID</label>
                                            <input id="upi-id" value={upiId} onChange={e => setUpiId(e.target.value)}
                                                placeholder="yourname@okicici" className="input-field" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-primary-color mb-3">Or choose app</p>
                                            <div className="flex flex-wrap gap-2">
                                                {upiApps.map(app => (
                                                    <button key={app} type="button"
                                                        className="px-4 py-2 rounded-xl text-sm font-medium border border-default hover:border-red-400/50 transition-colors"
                                                        style={{ background: 'var(--glass-bg)' }}>
                                                        {app}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {payMethod === 'netbanking' && (
                                    <div>
                                        <label className="block text-sm font-medium text-primary-color mb-3">Select Bank</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {banks.map(bank => (
                                                <button key={bank} type="button" onClick={() => setSelectedBank(bank)}
                                                    className={`p-3 rounded-xl text-sm font-medium border transition-all duration-200 text-left ${selectedBank === bank ? 'border-red-400/60 text-red-400' : 'border-default text-primary-color hover:border-red-400/30'}`}
                                                    style={{ background: selectedBank === bank ? 'rgba(255,45,85,0.06)' : 'var(--glass-bg)' }}>
                                                    🏦 {bank}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Coupon */}
                        <div className="rounded-2xl border border-default overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                            <div className="p-5">
                                <div className="flex items-center gap-3">
                                    <Tag className="w-5 h-5" style={{ color: '#FF2D55' }} />
                                    <span className="font-bold text-primary-color">Apply Coupon</span>
                                    {couponCode && <span className="badge-green text-xs">Applied: {couponCode}</span>}
                                </div>
                                {!couponCode && (
                                    <div className="flex gap-3 mt-4">
                                        <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                            placeholder="Enter coupon code (try BOOK20)" id="coupon-input"
                                            className="input-field flex-1" onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()} />
                                        <button onClick={handleApplyCoupon} disabled={couponLoading} className="btn-secondary px-5">
                                            {couponLoading
                                                ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                                : 'Apply'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Summary ── */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 rounded-2xl border border-default overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                            <div className="p-5 border-b border-default"
                                style={{ background: 'linear-gradient(135deg, rgba(255,45,85,0.07), rgba(255,107,53,0.04))' }}>
                                <h2 className="font-bold text-primary-color">Order Summary</h2>
                            </div>
                            <div className="p-5">
                                {/* Booking Info */}
                                <div className="mb-5 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                    <p className="font-bold text-sm text-primary-color">{summaryEventName}</p>
                                    <p className="text-xs text-muted-color mt-0.5">
                                        {[summaryDate, summaryTime, summaryVenue].filter(Boolean).join(' · ')}
                                    </p>
                                </div>

                                {/* Seats */}
                                <div className="space-y-2 mb-5">
                                    {seatsSummary.map(seat => (
                                        <div key={seat.id} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded" style={{ background: seat.color }} />
                                                <span className="text-secondary-color">{seat.id} · {seat.label}</span>
                                            </div>
                                            <span className="font-medium text-primary-color">₹{seat.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-3 border-t border-default pt-4 mb-5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-color">Subtotal</span>
                                        <span className="text-primary-color">₹{Math.round(effectiveSubtotal).toLocaleString()}</span>
                                    </div>
                                    {discount > 0 && effectiveDiscountAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-400">Discount ({discount}% off)</span>
                                            <span className="text-green-400">-₹{Math.round(effectiveDiscountAmount).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-color">Convenience Fee</span>
                                        <span className="text-primary-color">₹{Math.round(effectiveConvenience).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-color">GST (18%)</span>
                                        <span className="text-primary-color">₹{Math.round(effectiveGst).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-black pt-2 border-t border-default">
                                        <span className="text-primary-color">Total Payable</span>
                                        <span className="text-gradient">₹{Math.round(total).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Pay Button */}
                                <button id="pay-now-btn" onClick={handlePay} disabled={paying} className="btn-primary w-full py-4 text-base">
                                    {paying ? (
                                        <span className="flex items-center gap-2 justify-center">
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing Payment...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 justify-center">
                                            Pay ₹{Math.round(total).toLocaleString()} <ArrowRight className="w-5 h-5" />
                                        </span>
                                    )}
                                </button>

                                {/* Security Badge */}
                                <div className="flex items-center gap-2 justify-center mt-4">
                                    <Shield className="w-4 h-4 text-green-400" />
                                    <p className="text-xs text-muted-color">256-bit SSL encrypted · PCI DSS compliant</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}