import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Home, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center pt-24 pb-16 relative overflow-hidden">
        {/* Decorative mesh gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="section-container relative z-10 text-center space-y-6 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card border p-8 md:p-12"
            style={{ borderColor: 'rgba(239,68,68,0.2)' }}
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-6 text-red-400">
              <AlertCircle size={32} />
            </div>

            <h1 className="text-6xl font-black text-primary-color mb-2">404</h1>
            <h2 className="text-xl font-bold text-primary-color mb-3">Reputation Coordinate Lost</h2>
            <p className="text-sm text-secondary-color leading-relaxed mb-8">
              The platform could not locate the company metrics or analytics coordinate specified. It may have been renamed or archived.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard" className="btn-primary text-sm px-6 py-3 flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Return to Dashboard
              </Link>
              <Link to="/" className="btn-secondary text-sm px-6 py-3 flex items-center justify-center gap-2">
                <Home size={16} /> Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
