import { motion } from 'framer-motion'
import { Ticket } from 'lucide-react'

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex flex-col items-center gap-8">
                {/* Animated Logo */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="relative"
                >
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}>
                        <Ticket className="w-10 h-10 text-white" />
                    </div>
                    <motion.div
                        className="absolute -inset-2 rounded-2xl opacity-30"
                        style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}
                        animate={{ opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.div>

                {/* Brand Name */}
                <div className="text-center">
                    <h1 className="text-3xl font-black font-display text-gradient">BookStage</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Loading your experience...</p>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center gap-2">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
