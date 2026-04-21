import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Download, Mail, Share2, QrCode, Calendar, MapPin, Ticket, Users } from 'lucide-react'
import QRCode from 'qrcode'
import { useBookingStore, useAuthStore } from '../store'

export default function BookingConfirmPage() {
    const { bookingId } = useParams()
    const qrCanvasRef = useRef(null)
    const [qrGenerated, setQrGenerated] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [emailing, setEmailing] = useState(false)
    const [paymentId] = useState(() => 'pay_' + Math.random().toString(36).slice(2, 18))
    const [bookedAt] = useState(() => new Date().toLocaleString('en-IN'))

    const {
        selectedSeats,
        showtimeInfo,
        totalAmount,
        subtotal,
        gst,
        convenience,
        discount,
        discountAmount,
        showtime,
        event,
    } = useBookingStore()
    const { user } = useAuthStore()

    const seats = (selectedSeats && selectedSeats.length > 0)
        ? selectedSeats.map(s => `${s.id} - ${s.label || 'Seat'}`)
        : []

    const baseSubtotal = (selectedSeats || []).reduce((s, seat) => s + seat.price, 0)
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
    const effectiveTotal =
        typeof totalAmount === 'number'
            ? totalAmount
            : effectiveSubtotal - effectiveDiscountAmount + effectiveConvenience + effectiveGst

    const attendeeName = user?.fullName || user?.name || user?.username || user?.email || 'Guest'
    const attendeeEmail = user?.email || ''
    const attendeePhone = user?.phone || user?.mobile || ''

    const booking = useMemo(() => ({
        id: bookingId || ('BKS' + Date.now()),
        event: showtimeInfo?.eventName || event?.title || event?.name || showtime?.eventName || 'Your Event',
        date: showtimeInfo?.date || showtime?.date || '',
        time: showtimeInfo?.time || showtime?.time || '',
        venue: showtimeInfo?.venue || showtime?.venue || '',
        seats,
        category: seats.length > 0 ? (selectedSeats?.[0]?.label || 'General') : 'General',
        totalPaid: `₹${Math.round(effectiveTotal).toLocaleString()}`,
        paymentMethod: 'Online Payment',
        paymentId,
        user: attendeeName,
        email: attendeeEmail,
        phone: attendeePhone,
        bookedAt,
    }), [
        bookingId,
        showtimeInfo,
        showtime,
        event,
        seats,
        selectedSeats,
        effectiveTotal,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        paymentId,
        bookedAt,
    ])

    const qrPayload = [
        'BOOKSTAGE TICKET',
        `Booking ID: ${booking.id}`,
        `Event: ${booking.event}`,
        `Date: ${booking.date}`,
        `Time: ${booking.time}`,
        `Venue: ${booking.venue}`,
        `Seats: ${booking.seats.join(', ') || 'N/A'}`,
        `Category: ${booking.category}`,
        `Paid: ${booking.totalPaid}`,
        `Payment ID: ${booking.paymentId}`,
        `Attendee: ${booking.user}`,
        `Phone: ${booking.phone || 'N/A'}`,
        `Booked At: ${booking.bookedAt}`,
    ].join('\n')

    useEffect(() => {
        if (qrCanvasRef.current) {
            QRCode.toCanvas(qrCanvasRef.current, qrPayload, {
                width: 180,
                margin: 2,
                color: { dark: '#111111', light: '#FFFFFF' },
                errorCorrectionLevel: 'M',
            }, (err) => {
                if (!err) setQrGenerated(true)
            })
        }
    }, [qrPayload])

    const handleDownload = async () => {
        setDownloading(true)
        const { default: jsPDF } = await import('jspdf')
        const { default: html2canvas } = await import('html2canvas')
        const ticketEl = document.getElementById('ticket-card')
        const canvas = await html2canvas(ticketEl, { scale: 2, useCORS: true, backgroundColor: '#1A1A1A' })
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [150, 80] })
        pdf.addImage(imgData, 'PNG', 0, 0, 150, 80)
        pdf.save(`BookStage-${booking.id}.pdf`)
        setDownloading(false)
    }

    const handleEmail = async () => {
        setEmailing(true)
        await new Promise(r => setTimeout(r, 1500))
        setEmailing(false)
        import('react-hot-toast').then(({ default: toast }) => toast.success('Ticket sent to ' + booking.email))
    }

    return (
        <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-2xl mx-auto">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                    className="text-center mb-8"
                >
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'rgba(16,185,129,0.15)', border: '3px solid rgba(16,185,129,0.4)' }}>
                        <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <h1 className="text-4xl font-black text-primary-color font-display mb-2">Booking Confirmed! 🎉</h1>
                    <p className="text-muted-color">Your tickets have been booked successfully. Check your email for details.</p>
                    <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium text-green-400">Booking ID: {booking.id}</span>
                    </div>
                </motion.div>

                {/* Ticket Card */}
                <motion.div
                    id="ticket-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative rounded-3xl overflow-hidden mb-6 border border-default"
                    style={{ background: 'var(--card-bg)' }}
                >
                    {/* Top Banner */}
                    <div className="relative p-8 text-white"
                        style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0d0d0d 100%)' }}>
                        <div className="absolute top-0 right-0 w-60 h-60 opacity-10"
                            style={{ background: 'radial-gradient(circle, #FF2D55, transparent)', filter: 'blur(40px)' }} />
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <span className="badge-red text-xs mb-3 inline-block">🎟️ CONFIRMED</span>
                                <h2 className="text-2xl font-black font-display leading-tight mb-2">{booking.event}</h2>
                                <div className="flex flex-wrap gap-4 text-white/70 text-sm mt-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{booking.date} · {booking.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{booking.venue}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Perforation */}
                    <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full -ml-3 flex-shrink-0" style={{ background: 'var(--bg-primary)' }} />
                        <div className="flex-1 border-t-2 border-dashed border-default mx-1" />
                        <div className="w-6 h-6 rounded-full -mr-3 flex-shrink-0" style={{ background: 'var(--bg-primary)' }} />
                    </div>

                    {/* Bottom Detail */}
                    <div className="p-8 flex flex-col sm:flex-row gap-6">
                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Booking ID', value: booking.id, icon: Ticket },
                                    { label: 'Attendee', value: booking.user, icon: Users },
                                    { label: 'Category', value: booking.category, icon: null },
                                    { label: 'Payment', value: booking.totalPaid, icon: null },
                                ].map(item => (
                                    <div key={item.label}>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-color mb-1">{item.label}</p>
                                        <p className="text-sm font-bold text-primary-color break-words">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-color mb-2">Seats</p>
                                <div className="flex flex-wrap gap-2">
                                    {booking.seats.map(s => (
                                        <span key={s} className="badge-red text-xs px-3 py-1.5 font-bold rounded-lg">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center sm:items-end gap-2 sm:ml-auto">
                            <canvas ref={qrCanvasRef} className="rounded-xl w-[180px] h-[180px]" style={{ imageRendering: 'pixelated' }} />
                            {!qrGenerated && (
                                <div className="w-[180px] h-[180px] rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                                    <span className="text-xs text-muted-color">Generating QR...</span>
                                </div>
                            )}
                            <p className="text-xs text-muted-color text-center">Scan at venue</p>
                        </div>
                    </div>

                    {/* Booked At */}
                    <div className="px-8 pb-4">
                        <p className="text-xs text-muted-color">Booked on {booking.bookedAt} · {booking.paymentMethod}</p>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-3 gap-3 mb-6"
                >
                    <button id="download-ticket-btn" onClick={handleDownload} disabled={downloading}
                        className="btn-secondary flex-col py-4 h-auto gap-2">
                        {downloading ? <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <Download className="w-5 h-5" />}
                        <span className="text-xs">Download PDF</span>
                    </button>
                    <button id="email-ticket-btn" onClick={handleEmail} disabled={emailing}
                        className="btn-secondary flex-col py-4 h-auto gap-2">
                        {emailing ? <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <Mail className="w-5 h-5" />}
                        <span className="text-xs">Email Ticket</span>
                    </button>
                    <button className="btn-secondary flex-col py-4 h-auto gap-2"
                        onClick={() => navigator.share?.({ title: 'My BookStage Ticket', text: `I'm going to ${booking.event}!`, url: window.location.href })}>
                        <Share2 className="w-5 h-5" />
                        <span className="text-xs">Share</span>
                    </button>
                </motion.div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/my-bookings" className="btn-secondary flex-1 justify-center py-4">
                        View All Bookings
                    </Link>
                    <Link to="/" className="btn-primary flex-1 justify-center py-4">
                        Book More Events
                    </Link>
                </div>
            </div>
        </div>
    )
}
