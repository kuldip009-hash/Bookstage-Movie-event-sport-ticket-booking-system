import { Link } from 'react-router-dom'
import { Ticket, Instagram, Twitter, Youtube, Facebook, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
    Movies: [
        { label: 'Now Showing', href: '/movies?status=now-showing' },
        { label: 'Coming Soon', href: '/movies?status=upcoming' },
        { label: 'Top Rated', href: '/movies?sort=rating' },
        { label: 'Theatres', href: '/venues' },
    ],
    Events: [
        { label: 'Concerts', href: '/events?cat=concerts' },
        { label: 'Sports', href: '/events?cat=sports' },
        { label: 'Comedy Shows', href: '/events?cat=comedy' },
        { label: 'Theatre', href: '/events?cat=theatre' },
    ],
    Company: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
        { label: 'Advertise', href: '/advertise' },
    ],
    Support: [
        { label: 'Help Center', href: '/help' },
        { label: 'Terms of Use', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Refund Policy', href: '/refund' },
    ],
}

const socials = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Facebook, href: '#', label: 'Facebook' },
]

export default function Footer() {
    return (
        <footer className="border-t border-default mt-20" style={{ background: 'var(--bg-secondary)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}>
                                <Ticket className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black font-display text-gradient">BookStage</span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                            India's premier destination for booking movies, live events, sports, and concerts. Experience entertainment like never before.
                        </p>

                        {/* Contact */}
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <Mail className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <span>support@bookstage.in</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <span>1800-XXX-XXXX (Toll Free)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <span>Mumbai, Maharashtra, India</span>
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="flex items-center gap-3">
                            {socials.map(s => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 border border-default hover:border-red-400/50"
                                    style={{ background: 'var(--glass-bg)' }}
                                >
                                    <s.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                {title}
                            </h3>
                            <ul className="space-y-3">
                                {links.map(link => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-sm transition-colors duration-200 hover:text-red-400"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* App Download Banner */}
                <div className="rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4"
                    style={{ background: 'linear-gradient(135deg, rgba(255,45,85,0.1), rgba(255,107,53,0.05))', border: '1px solid rgba(255,45,85,0.2)' }}>
                    <div>
                        <h3 className="font-bold text-lg mb-1 text-primary-color">Download the BookStage App</h3>
                        <p className="text-sm text-muted-color">Get exclusive deals & seamless booking on the go</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="btn-secondary text-sm py-2.5 px-5">
                            📱 App Store
                        </button>
                        <button className="btn-secondary text-sm py-2.5 px-5">
                            🤖 Play Store
                        </button>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-default">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        © {new Date().getFullYear()} BookStage Technologies Pvt. Ltd. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span>🔒 Secured by</span>
                        <span className="font-semibold text-primary-color">SSL</span>
                        <span>•</span>
                        <span className="font-semibold text-primary-color">PCI DSS Compliant</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
