import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import {
  Search, TrendingUp, Shield, Zap, BarChart2, Brain, Star,
  ArrowRight, ChevronRight, CheckCircle, Activity, Users,
  Globe, Award, AlertTriangle, Heart, Sparkles, ChevronUp,
  GitCompare, Mic, Clock, Building2, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CompanyLogo from '../components/CompanyLogo';
import { useApp } from '../context/AppContext';
import { companyAPI } from '../services/api';

// ─── Animated Counter ────────────────────────────────────────
function AnimatedCounter({ end, suffix = '', duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, end);
      setCount(Math.floor(current));
      if (current >= end) clearInterval(timer);
    }, (duration * 1000) / steps);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Particle Background ─────────────────────────────────────
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#06b6d4',
            opacity: 0.4,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Hero Search Bar ─────────────────────────────────────────
function HeroSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const { searchHistory } = useApp();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Debounce fetching Clearbit Autocomplete suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Clearbit fetch error:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [query]);

  // Click outside handling to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (name) => {
    setQuery(name);
    navigate(`/dashboard?q=${encodeURIComponent(name)}`);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative max-w-2xl mx-auto w-full">
      <form onSubmit={handleSearch}>
        <div className="relative flex items-center glass-card-static border rounded-2xl overflow-visible"
          style={{ borderColor: 'var(--glass-border)' }}>
          <div className="absolute left-4 text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search any company — e.g. Google, Tesla, Infosys..."
            className="flex-1 bg-transparent pl-12 pr-4 py-4 text-primary-color placeholder-slate-500 outline-none text-base font-medium"
          />
          <button
            type="submit"
            className="m-2 btn-primary text-sm px-5 py-2.5 rounded-xl animate-fade-in"
          >
            Analyze <ArrowRight size={15} />
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || isSearching || searchHistory.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card-static border rounded-xl overflow-hidden z-50 shadow-2xl"
            style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)' }}
          >
            {isSearching && suggestions.length === 0 ? (
              <div className="p-4 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin text-blue-400" />
                <span>Searching suggestions...</span>
              </div>
            ) : (
              suggestions.length > 0 && (
                <div className="p-2 max-h-64 overflow-y-auto">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-secondary-color px-3 py-1.5">Suggestions</div>
                  {suggestions.map((s, idx) => {
                    const hasError = imageErrors[s.domain];
                    return (
                      <button
                        key={`${s.domain}-${idx}`}
                        onClick={() => handleSelect(s.name)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover-bg-theme transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-secondary-color border border-theme flex items-center justify-center overflow-hidden flex-shrink-0">
                            {s.logo && !hasError ? (
                              <img
                                src={s.logo}
                                alt={s.name}
                                className="w-5 h-5 object-contain"
                                onError={() => setImageErrors(prev => ({ ...prev, [s.domain]: true }))}
                              />
                            ) : (
                              <Building2 size={14} className="text-blue-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm text-primary-color font-semibold group-hover:text-blue-400 transition-colors">
                              {s.name}
                            </div>
                            <div className="text-[10px] text-secondary-color">
                              {s.domain}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            )}

            {searchHistory.length > 0 && (
              <div className="p-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-secondary-color px-3 py-1.5">Recent</div>
                {searchHistory.slice(0, 4).map(h => (
                  <button key={h} onClick={() => handleSelect(h)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover-bg-theme transition-all text-left">
                    <Clock size={14} className="text-secondary-color" />
                    <span className="text-sm text-secondary-color">{h}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Feature Card ────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card border p-6 neon-border group"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
        style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <h3 className="text-base font-bold text-primary-color mb-2">{title}</h3>
      <p className="text-sm text-secondary-color leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ─── Company Quick Card ──────────────────────────────────────
function CompanyQuickCard({ company, delay }) {
  const navigate = useNavigate();
  const trendColor = company.trend === 'rising' ? '#10b981' : company.trend === 'declining' ? '#ef4444' : '#f59e0b';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/dashboard?q=${company.name}`)}
      className="glass-card border p-5 cursor-pointer group"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <CompanyLogo company={company} size="md" />
        <div className="badge" style={{ background: `${trendColor}15`, color: trendColor, border: `1px solid ${trendColor}25` }}>
          {company.trend === 'rising' ? '↑' : company.trend === 'declining' ? '↓' : '→'} {company.trend}
        </div>
      </div>
      <h3 className="text-sm font-bold text-primary-color mb-0.5">{company.name}</h3>
      <p className="text-xs text-slate-500 mb-3">{company.industry}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star size={13} className="star-filled fill-amber-400" />
          <span className="text-sm font-bold text-primary-color">{company.rating?.toFixed(1)}</span>
          <span className="text-xs text-slate-500">/ 5.0</span>
        </div>
        <div className="text-xs text-slate-500">{(company.reviews || company.totalReviews || 0).toLocaleString()} reviews</div>
      </div>
      {company.trustScore != null && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${company.trustScore}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
          </div>
          <span className="text-xs text-blue-400 font-bold">TS {company.trustScore}</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Testimonial Card ────────────────────────────────────────
function TestimonialCard({ name, role, text, rating, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card border p-6"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div className="flex mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className={i < rating ? 'star-filled fill-amber-400' : 'star-empty'} />
        ))}
      </div>
      <p className="text-sm text-secondary-color leading-relaxed mb-4">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-primary-color">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Home Contact Form ──────────────────────────────────────
function HomeContactForm() {
  const [formData, setFormData] = useState({ name: '', address: '', query: '', queryType: 'General Inquiry' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.query) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
          ✓
        </div>
        <h4 className="text-lg font-bold text-primary-color">Message Sent Successfully!</h4>
        <p className="text-sm text-secondary-color max-w-sm mx-auto leading-relaxed">
          Thank you, <strong>{formData.name}</strong>! Your query regarding <strong>{formData.queryType}</strong> has been logged. Our operations team will respond to your address at <strong>{formData.address}</strong> within 12-24 business hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', address: '', query: '', queryType: 'General Inquiry' });
          }}
          className="btn-primary text-xs px-4 py-2 mt-2 inline-block mx-auto"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left max-w-lg mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Jane Doe"
            className="input-field py-2.5 text-xs w-full"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contact / Email Address</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. jane@company.com"
            className="input-field py-2.5 text-xs w-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Query Type</label>
        <select
          value={formData.queryType}
          onChange={e => setFormData({ ...formData, queryType: e.target.value })}
          className="input-field py-2.5 text-xs w-full outline-none cursor-pointer border border-theme bg-secondary-color text-secondary-color"
        >
          <option value="General Inquiry" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>General Inquiry</option>
          <option value="Technical Support" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Technical Support</option>
          <option value="Enterprise Sales" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Enterprise Sales</option>
          <option value="Data Correction" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Data Correction</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Query Description</label>
        <textarea
          rows="4"
          required
          value={formData.query}
          onChange={e => setFormData({ ...formData, query: e.target.value })}
          placeholder="Describe your inquiry in detail..."
          className="input-field py-2.5 text-xs w-full leading-relaxed resize-none"
        />
      </div>
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full text-xs py-3 flex items-center justify-center gap-2"
        >
          {submitting ? 'Submitting query...' : 'Submit Inquiry'}
        </button>
      </div>
    </form>
  );
}

// ─── Main HomePage ───────────────────────────────────────────
export default function HomePage() {
  const { trending, fetchTrending, trendingLoading, theme } = useApp();
  const videoRef = useRef(null);

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    let hls = null;
    const video = videoRef.current;
    if (video) {
      // Premium stable multi-bitrate HLS live test stream
      const src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
      
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((err) => {
            console.log("HLS autoplay failed:", err);
          });
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Apple Safari/iOS player support
        video.src = src;
        video.play().catch((err) => {
          console.log("Native HLS autoplay failed:", err);
        });
      }
    }
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  const FEATURES = [
    { icon: Brain, title: 'AI Sentiment Analysis', desc: 'Advanced NLP analysis of thousands of reviews to determine positive, negative, neutral and toxic sentiment patterns.', color: '#3b82f6', delay: 0 },
    { icon: Shield, title: 'Trust Score™', desc: 'Proprietary AI algorithm combining ratings, review volume, authenticity signals, and trend data into a single Trust Score.', color: '#8b5cf6', delay: 0.05 },
    { icon: AlertTriangle, title: 'Fake Review Detection', desc: 'ML-powered detection of suspicious review patterns, spam, and inauthentic activity to surface genuine employee sentiment.', color: '#ef4444', delay: 0.1 },
    { icon: TrendingUp, title: 'Reputation Forecasting', desc: 'Trend analysis identifies whether company reputation is rising, declining, or stable based on historical review patterns.', color: '#10b981', delay: 0.15 },
    { icon: GitCompare, title: 'Company Comparison', desc: 'Side-by-side comparison of up to 4 companies across 6 dimensions: culture, salary, management, growth, and more.', color: '#06b6d4', delay: 0.2 },
    { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Interactive charts, heatmaps, and AI-generated insights for deep analysis of any company\'s review landscape.', color: '#f59e0b', delay: 0.25 },
    { icon: Globe, title: 'Multi-Platform Aggregation', desc: 'Reviews aggregated from Google, Glassdoor, Indeed, Trustpilot and more for comprehensive coverage.', color: '#ec4899', delay: 0.3 },
    { icon: Heart, title: 'Smart Watchlist', desc: 'Save companies you care about and get instant access to their reputation analytics anytime.', color: '#f97316', delay: 0.35 },
  ];

  const STATS = [
    { label: 'Companies Analyzed', value: 12840, suffix: '+' },
    { label: 'Reviews Processed', value: 4200000, suffix: '+' },
    { label: 'AI Insights Generated', value: 890000, suffix: '+' },
    { label: 'Accuracy Rate', value: 94, suffix: '%' },
  ];

  const TESTIMONIALS = [
    { name: 'Priya Sharma', role: 'HR Director, TechCorp', text: 'TrustPULSE transformed how we understand our employer brand. The AI insights are incredibly accurate and actionable.', rating: 5, delay: 0 },
    { name: 'James Mitchell', role: 'Talent Acquisition Lead', text: 'The sentiment analysis saved us hundreds of hours. We can now instantly understand what candidates think about competitor companies.', rating: 5, delay: 0.1 },
    { name: 'Ananya Singh', role: 'Product Manager', text: 'The company comparison feature is genius. Radar charts showing 6 metrics side by side is exactly what we needed for competitive research.', rating: 5, delay: 0.2 },
  ];

  const displayTrending = trending.length > 0 ? trending.slice(0, 8) : [
    { name: 'Google', rating: 4.4, reviews: 92847, trend: 'rising', industry: 'Technology', trustScore: 88 },
    { name: 'Microsoft', rating: 4.3, reviews: 78234, trend: 'rising', industry: 'Technology', trustScore: 85 },
    { name: 'Apple', rating: 4.2, reviews: 65123, trend: 'stable', industry: 'Consumer Electronics', trustScore: 82 },
    { name: 'Tesla', rating: 3.9, reviews: 28943, trend: 'rising', industry: 'Automotive', trustScore: 72 },
    { name: 'Stripe', rating: 4.5, reviews: 12345, trend: 'rising', industry: 'Fintech', trustScore: 91 },
    { name: 'Meta', rating: 3.8, reviews: 45678, trend: 'declining', industry: 'Social Media', trustScore: 68 },
    { name: 'Salesforce', rating: 4.3, reviews: 23456, trend: 'rising', industry: 'Cloud Software', trustScore: 84 },
    { name: 'Amazon', rating: 3.7, reviews: 112456, trend: 'stable', industry: 'E-Commerce', trustScore: 70 },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* ── HERO SECTION ──────────────────────────────────── */}
      {(() => {
        const isDark = theme === 'dark';
        const isCream = theme === 'cream-green';
        
        const heroBgOverlay = isDark 
          ? 'bg-gradient-to-tr from-slate-950/95 via-slate-950/80 to-slate-900/60' 
          : isCream 
            ? 'bg-gradient-to-tr from-[#fcfaf2]/95 via-[#fcfaf2]/85 to-[#fcfaf2]/70' 
            : 'bg-gradient-to-tr from-white/95 via-white/85 to-white/70';

        const heroRadialOverlay = isDark 
          ? 'bg-[radial-gradient(circle_at_bottom_left,transparent_20%,rgba(10,10,20,0.85)_70%)]' 
          : isCream 
            ? 'bg-[radial-gradient(circle_at_bottom_left,transparent_20%,rgba(252,250,242,0.85)_70%)]' 
            : 'bg-[radial-gradient(circle_at_bottom_left,transparent_20%,rgba(255,255,255,0.85)_70%)]';

        return (
          <section className="relative min-h-screen flex items-center justify-center pt-32 pb-24 md:pb-32 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
            {/* Full-Screen HLS Video Background */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                loop
                autoPlay
              />
              {/* Overlay layers to create a premium look and perfect contrast that adapts to theme */}
              <div className={`absolute inset-0 backdrop-blur-[4px] z-1 transition-all duration-500 ${heroBgOverlay}`} />
              <div className={`absolute inset-0 z-1 transition-all duration-500 ${heroRadialOverlay}`} />
              <div className="grid-bg absolute inset-0 opacity-20 pointer-events-none z-1" />
            </div>

            <div className="section-container relative z-10 text-center w-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 glass mx-auto"
                style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)' }}
              >
                <Sparkles size={14} className="text-blue-400 animate-pulse" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">AI-Powered Reputation Intelligence v2.0</span>
              </motion.div>

              {/* Headline (Apple/Vercel inspired typography) */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-6 tracking-tight text-primary-color text-center"
              >
                <span>Analyze Company</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Reputation with AI</span>
                <br />
                <span>& ML Intelligence</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-lg text-secondary-color max-w-2xl mx-auto mb-8 leading-relaxed font-medium text-center"
              >
                The most powerful AI platform for company review analytics. Search any company to instantly get sentiment analysis, trust scores, fake review detection, and actionable insights.
              </motion.p>

              {/* Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8 w-full max-w-2xl mx-auto"
              >
                <HeroSearch />
              </motion.div>

              {/* Popular searches */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                <span className="text-xs text-secondary-color font-semibold uppercase tracking-wider">Popular:</span>
                {['Google', 'Microsoft', 'Tesla', 'Amazon', 'Infosys'].map(name => (
                  <Link
                    key={name}
                    to={`/dashboard?q=${name}`}
                    className="text-xs px-3 py-1.5 rounded-full border border-theme text-secondary-color font-bold transition-all hover:border-blue-500/40 hover:text-blue-400 glass"
                  >
                    {name}
                  </Link>
                ))}
              </motion.div>
            </div>

            {/* Vertical Scroll Indicator (Aligned Bottom-Right) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-12 right-12 hidden md:flex flex-col items-center gap-3 z-10 select-none"
            >
              <span className="text-[10px] text-secondary-color font-bold uppercase tracking-[0.25em]" style={{ writingMode: 'vertical-rl' }}>Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-px h-16 bg-gradient-to-b from-blue-400 to-transparent"
              />
            </motion.div>
          </section>
        );
      })()}

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="py-16 border-y" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-gradient-blue mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING COMPANIES ────────────────────────────── */}
      <section className="py-20">
        <div className="section-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="section-label mb-2">Live Rankings</div>
              <h2 className="text-3xl md:text-4xl font-black text-primary-color">Trending Companies</h2>
            </div>
            <Link to="/trending" className="btn-secondary text-sm hidden md:flex">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayTrending.slice(0, 8).map((company, i) => (
              <CompanyQuickCard key={company.name} company={company} delay={i * 0.06} />
            ))}
          </div>

          <div className="mt-6 md:hidden">
            <Link to="/trending" className="btn-secondary w-full justify-center">
              View All Trending <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="py-20 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="section-container">
          <div className="text-center mb-16">
            <div className="section-label mb-3">Platform Capabilities</div>
            <h2 className="text-3xl md:text-5xl font-black text-primary-color mb-4">
              The Complete AI Toolkit for<br />
              <span className="text-gradient">Reputation Intelligence</span>
            </h2>
            <p className="text-secondary-color max-w-xl mx-auto">
              Everything you need to understand, analyze, and benchmark company reputations using advanced AI and machine learning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-20 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="section-container">
          <div className="text-center mb-16">
            <div className="section-label mb-3">Simple Process</div>
            <h2 className="text-3xl md:text-4xl font-black text-primary-color">How TrustPULSE Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Search, title: 'Search Any Company', desc: 'Type any company name. Our system instantly retrieves and aggregates reviews from multiple platforms.', color: '#3b82f6' },
              { step: '02', icon: Brain, title: 'AI Analyzes Everything', desc: 'Our AI engine processes sentiment, detects fake reviews, extracts keywords, and calculates trust scores.', color: '#8b5cf6' },
              { step: '03', icon: BarChart2, title: 'Get Rich Insights', desc: 'View interactive charts, AI summaries, radar comparisons, and reputation trends in a beautiful dashboard.', color: '#10b981' },
            ].map(({ step, icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={28} style={{ color }} />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border flex items-center justify-center text-xs font-black"
                    style={{ borderColor: color, color }}>
                    {step.split('')[1]}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary-color mb-3">{title}</h3>
                <p className="text-secondary-color leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-20 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="section-container">
          <div className="text-center mb-12">
            <div className="section-label mb-3">Trusted By Professionals</div>
            <h2 className="text-3xl md:text-4xl font-black text-primary-color">What Users Are Saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => <TestimonialCard key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-static border rounded-2xl p-10 md:p-16 text-center relative overflow-hidden"
            style={{ borderColor: 'rgba(59,130,246,0.2)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/8 to-cyan-600/10 pointer-events-none" />
            <div className="relative">
              <div className="section-label mb-4">Get Started Free</div>
              <h2 className="text-3xl md:text-5xl font-black text-primary-color mb-4">
                Start Analyzing Company<br />
                <span className="text-gradient">Reputation Today</span>
              </h2>
              <p className="text-secondary-color mb-8 max-w-lg mx-auto">
                Join thousands of HR professionals, recruiters, and business analysts using TrustPULSE for real-time reputation intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth" className="btn-primary text-base px-8 py-4">
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link to="/dashboard" className="btn-secondary text-base px-8 py-4">
                  Try Dashboard <BarChart2 size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOME CONTACT US FORM ─────────────────────────── */}
      <section className="py-20 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="section-container max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card border rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 pointer-events-none" />
            
            <div className="relative text-center mb-8">
              <div className="section-label mb-2">Get In Touch</div>
              <h2 className="text-3xl font-black text-primary-color mb-3">Contact Us</h2>
              <p className="text-xs text-secondary-color max-w-md mx-auto leading-relaxed">
                Have questions or feedback? Fill out the secure form below to log your query directly into our AI resolution pipeline.
              </p>
            </div>

            <HomeContactForm />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
