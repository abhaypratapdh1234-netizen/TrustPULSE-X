import { motion } from 'framer-motion'
import BrandLogo from '../BrandLogo'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: 'var(--bg-primary)' }}>
      
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        {/* Brand Logo & Name */}
        <BrandLogo size="lg" showTagline={false} className="flex-col !gap-4 text-center justify-center items-center" />
        
        <p className="text-sm -mt-2" style={{ color: 'var(--text-muted)' }}>
          Initializing AI Intelligence...
        </p>

        {/* Progress bar */}
        <div className="w-48 h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-card)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      {/* Background particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 2 === 0 ? '#6366f1' : '#06b6d4',
            opacity: 0.3,
            left: `${15 + i * 14}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  )
}
