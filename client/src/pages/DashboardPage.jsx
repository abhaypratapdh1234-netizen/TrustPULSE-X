import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, TrendingUp, TrendingDown, Minus, Brain, Shield,
  ThumbsUp, ThumbsDown, AlertTriangle, Bookmark, BookmarkCheck,
  RefreshCw, Building2, Users, Award, Globe, ChevronDown,
  BarChart2, Filter, SortAsc, Download, ExternalLink
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SentimentChart from '../components/charts/SentimentChart';
import PlatformBarChart from '../components/charts/PlatformBarChart';
import RatingDistributionChart from '../components/charts/RatingDistributionChart';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

// ─── Trust Score Gauge ───────────────────────────────────────
function TrustGauge({ score }) {
  const getColor = (s) =>
    s >= 80 ? '#10b981' : s >= 65 ? '#3b82f6' : s >= 45 ? '#f59e0b' : '#ef4444';
  const getLabel = (s) =>
    s >= 80 ? 'Excellent' : s >= 65 ? 'Good' : s >= 45 ? 'Average' : 'Poor';

  const color = getColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle
            cx="70" cy="70" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-primary-color">{score}</span>
          <span className="text-xs text-secondary-color font-medium">/100</span>
        </div>
      </div>
      <div className="mt-2 badge" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
        {getLabel(score)}
      </div>
    </div>
  );
}

// ─── Metric Bar ──────────────────────────────────────────────
function MetricBar({ label, value, maxValue = 5, color = '#3b82f6' }) {
  const pct = (value / maxValue) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-secondary-color w-28 font-medium">{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-bold text-primary-color w-8">{value?.toFixed(1)}</span>
    </div>
  );
}

// ─── Review Card ─────────────────────────────────────────────
function ReviewCard({ review }) {
  const PLATFORM_COLORS = {
    Google: '#ea4335', Glassdoor: '#0caa41',
    Indeed: '#2164f3', Trustpilot: '#00b67a',
  };
  const sentimentColor = {
    positive: '#10b981', negative: '#ef4444',
    neutral: '#94a3b8', mixed: '#f59e0b',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-static border rounded-xl p-5"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12}
                className={i < Math.round(review.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />
            ))}
            <span className="text-xs font-bold text-primary-color ml-1">{review.rating?.toFixed(1)}</span>
          </div>
          <h4 className="text-sm font-bold text-primary-color">{review.title || 'Review'}</h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {review.sentiment && (
            <span className="badge text-[10px]"
              style={{ background: `${sentimentColor[review.sentiment]}15`, color: sentimentColor[review.sentiment], border: `1px solid ${sentimentColor[review.sentiment]}25` }}>
              {review.sentiment}
            </span>
          )}
          <span className="badge text-[10px]"
            style={{ background: `${PLATFORM_COLORS[review.platform] || '#3b82f6'}15`, color: PLATFORM_COLORS[review.platform] || '#3b82f6', border: `1px solid ${PLATFORM_COLORS[review.platform] || '#3b82f6'}25` }}>
            {review.platform}
          </span>
        </div>
      </div>
      <p className="text-xs text-secondary-color leading-relaxed line-clamp-3">{review.text}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <span className="text-xs text-slate-500">{review.author}</span>
        <span className="text-xs text-slate-600">{review.date}</span>
      </div>
    </motion.div>
  );
}

// ─── AI Insight Box ──────────────────────────────────────────
function AIInsightBox({ summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="skeleton h-24 rounded-xl" />
    );
  }
  return (
    <div className="rounded-xl p-5 border"
      style={{ background: 'rgba(59,130,246,0.07)', borderColor: 'rgba(59,130,246,0.2)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Brain size={16} className="text-blue-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">AI Analysis</span>
      </div>
      <p className="text-sm text-secondary-color leading-relaxed">{summary}</p>
    </div>
  );
}

// ─── Search Bar ──────────────────────────────────────────────
function DashboardSearch({ onSearch }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const containerRef = useRef(null);

  // Debounce fetching Clearbit Autocomplete suggestions
  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(q)}`,
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
  }, [q]);

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

  const handleSubmit = e => {
    e.preventDefault();
    if (q.trim()) {
      onSearch(q.trim());
      setShowSuggestions(false);
    }
  };

  const handleSelect = (name) => {
    setQ(name);
    onSearch(name);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search size={18} className="absolute left-4 text-slate-400" />
        <input
          value={q}
          onChange={e => {
            setQ(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search another company..."
          className="input-field pl-11 pr-32"
        />
        <button type="submit" className="absolute right-2 btn-primary text-sm px-4 py-2">
          Analyze
        </button>
      </form>

      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || isSearching) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card-static border rounded-xl overflow-hidden z-50 shadow-2xl"
            style={{ borderColor: 'var(--glass-border)', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)' }}
          >
            {isSearching && suggestions.length === 0 ? (
              <div className="p-4 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin text-blue-400" />
                <span>Searching suggestions...</span>
              </div>
            ) : (
              <div className="p-2 max-h-64 overflow-y-auto">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-1.5">Suggestions</div>
                {suggestions.map((s, idx) => {
                  const hasError = imageErrors[s.domain];
                  return (
                    <button
                      key={`${s.domain}-${idx}`}
                      onClick={() => handleSelect(s.name)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                          <div className="text-[10px] text-slate-500">
                            {s.domain}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ─── Empty State ─────────────────────────────────────────────
function EmptyState({ onSearch }) {
  const QUICK = ['Google', 'Microsoft', 'Tesla', 'Infosys', 'Amazon'];
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center mb-6">
        <BarChart2 size={36} className="text-blue-400" />
      </div>
      <h2 className="text-2xl font-black text-primary-color mb-2">Start Your Analysis</h2>
      <p className="text-secondary-color mb-8 max-w-md">
        Search any company to get AI-powered insights, sentiment analysis, trust scores, and interactive charts.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK.map(name => (
          <button key={name} onClick={() => onSearch(name)}
            className="badge badge-blue text-sm py-2 px-4 cursor-pointer hover:opacity-80 transition-opacity">
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────
export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const { company, loading, error, searchCompany } = useApp();
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isWatched } = useApp();

  const [platform, setPlatform] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showAll, setShowAll] = useState(false);

  const qParam = searchParams.get('q');
  useEffect(() => {
    if (qParam && qParam !== company?.name) {
      searchCompany(qParam);
    }
  }, [qParam]);

  // Filter + sort reviews
  const allReviews = company?.reviews || [];
  const filtered = allReviews
    .filter(r => platform === 'All' || r.platform === platform)
    .sort((a, b) => {
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'rating_asc') return a.rating - b.rating;
      if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
      return new Date(b.date) - new Date(a.date);
    });

  const displayed = showAll ? filtered : filtered.slice(0, 12);
  const platforms = ['All', ...new Set(allReviews.map(r => r.platform))];

  // Sentiment data for chart
  const sentimentData = company ? {
    positive: Math.round((company.positivePercent / 100) * company.totalReviews),
    negative: Math.round((company.negativePercent / 100) * company.totalReviews),
    neutral: Math.round((company.neutralPercent / 100) * company.totalReviews),
  } : null;

  const watched = company ? isWatched(company.name) : false;

  const trendIcon = company?.reputationTrend === 'rising'
    ? <TrendingUp size={14} className="text-green-400" />
    : company?.reputationTrend === 'declining'
    ? <TrendingDown size={14} className="text-red-400" />
    : <Minus size={14} className="text-yellow-400" />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="section-container pt-24 pb-20">

        {/* ── Search Bar ─── */}
        <div className="mb-8">
          <DashboardSearch onSearch={searchCompany} />
        </div>

        {/* ── Loading ─── */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
            </div>
            <div className="skeleton h-64 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-48 rounded-xl" />)}
            </div>
            <p className="text-center text-sm text-slate-500 animate-pulse mt-4">
              AI is analyzing reviews and generating insights...
            </p>
          </div>
        )}

        {/* ── Error ─── */}
        {!loading && error && (
          <div className="glass-card-static border rounded-2xl p-10 text-center"
            style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
            <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-color mb-2">Analysis Failed</h3>
            <p className="text-secondary-color mb-6">{error}</p>
            <button onClick={() => searchCompany(company?.name || qParam)}
              className="btn-secondary flex items-center gap-2 mx-auto">
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}

        {/* ── Empty ─── */}
        {!loading && !error && !company && (
          <EmptyState onSearch={searchCompany} />
        )}

        {/* ── Company Data ─── */}
        {!loading && !error && company && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Company Header */}
            <div className="glass-card-static border rounded-2xl p-6 md:p-8"
              style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
                    {company.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h1 className="text-2xl md:text-3xl font-black text-primary-color">{company.name}</h1>
                      <div className="flex items-center gap-1.5">
                        {trendIcon}
                        <span className="text-xs font-semibold capitalize"
                          style={{ color: company.reputationTrend === 'rising' ? '#10b981' : company.reputationTrend === 'declining' ? '#ef4444' : '#f59e0b' }}>
                          {company.reputationTrend}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {company.industry && <span className="badge badge-blue">{company.industry}</span>}
                      {company.location && (
                        <span className="badge badge-purple">
                          {typeof company.location === 'object'
                            ? `${company.location.city || ''}${company.location.city && company.location.country ? ', ' : ''}${company.location.country || ''}`.trim()
                            : company.location}
                        </span>
                      )}
                      {company.size && <span className="badge badge-cyan">{company.size}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Star size={18} className="fill-amber-400 text-amber-400" />
                        <span className="text-2xl font-black text-primary-color">{company.overallRating?.toFixed(1)}</span>
                        <span className="text-muted-color text-sm">/5.0</span>
                      </div>
                      <span className="text-muted-color">·</span>
                      <span className="text-sm text-secondary-color">{company.totalReviews?.toLocaleString()} reviews</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isAuthenticated && (
                    <button
                      onClick={() => watched ? removeFromWatchlist(company.name) : addToWatchlist(company.name)}
                      className={`btn-secondary flex items-center gap-2 text-sm ${watched ? 'border-blue-500/40 text-blue-400' : ''}`}
                    >
                      {watched ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      {watched ? 'Saved' : 'Save'}
                    </button>
                  )}
                  <Link to={`/compare?a=${company.name}`} className="btn-secondary flex items-center gap-2 text-sm">
                    <ExternalLink size={16} /> Compare
                  </Link>
                </div>
              </div>

              {/* AI Summary */}
              {company.aiSummary && (
                <div className="mt-6">
                  <AIInsightBox summary={company.aiSummary} />
                </div>
              )}
            </div>

            {/* ── Top Metrics Row ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Trust Score */}
              <div className="glass-card-static border rounded-2xl p-6 flex flex-col items-center"
                style={{ borderColor: 'var(--glass-border)' }}>
                <div className="text-xs font-bold uppercase tracking-widest text-secondary-color mb-4">Trust Score™</div>
                <TrustGauge score={company.trustScore || 0} />
              </div>

              {/* Sentiment Pie */}
              <div className="glass-card-static border rounded-2xl p-6"
                style={{ borderColor: 'var(--glass-border)' }}>
                <div className="text-xs font-bold uppercase tracking-widest text-secondary-color mb-4">Sentiment Analysis</div>
                <SentimentChart data={sentimentData} />
              </div>

              {/* Platform Ratings */}
              <div className="glass-card-static border rounded-2xl p-6"
                style={{ borderColor: 'var(--glass-border)' }}>
                <div className="text-xs font-bold uppercase tracking-widest text-secondary-color mb-4">By Platform</div>
                <PlatformBarChart data={company.platformRatings} />
              </div>
            </div>

            {/* ── Second Row ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Rating Distribution */}
              <div className="glass-card-static border rounded-2xl p-6"
                style={{ borderColor: 'var(--glass-border)' }}>
                <div className="text-xs font-bold uppercase tracking-widest text-secondary-color mb-5">Rating Distribution</div>
                <RatingDistributionChart distribution={company.ratingDistribution} />
              </div>

              {/* Sub-Metrics */}
              <div className="glass-card-static border rounded-2xl p-6"
                style={{ borderColor: 'var(--glass-border)' }}>
                <div className="text-xs font-bold uppercase tracking-widest text-secondary-color mb-5">Work Metrics</div>
                <div className="space-y-4">
                  <MetricBar label="Work-Life Balance" value={company.workLifeBalance} color="#3b82f6" />
                  <MetricBar label="Salary & Benefits" value={company.salaryBenefits} color="#8b5cf6" />
                  <MetricBar label="Career Growth" value={company.careerGrowth} color="#10b981" />
                  <MetricBar label="Management" value={company.management} color="#f59e0b" />
                  <MetricBar label="Culture" value={company.culture} color="#06b6d4" />
                  <MetricBar label="Diversity" value={company.diversityInclusion} color="#ec4899" />
                </div>
              </div>
            </div>

            {/* ── Pros / Cons & Keywords ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pros */}
              <div className="glass-card-static border rounded-2xl p-6"
                style={{ borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp size={16} className="text-green-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-green-400">Top Pros</span>
                </div>
                <ul className="space-y-2.5">
                  {(company.topPros || []).map(p => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-secondary-color">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="glass-card-static border rounded-2xl p-6"
                style={{ borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsDown size={16} className="text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400">Top Cons</span>
                </div>
                <ul className="space-y-2.5">
                  {(company.topCons || []).map(c => (
                    <li key={c} className="flex items-center gap-2.5 text-sm text-secondary-color">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keywords */}
              <div className="glass-card-static border rounded-2xl p-6"
                style={{ borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={16} className="text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400">AI Keywords</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(company.keywords || []).slice(0, 12).map(kw => (
                    <span key={kw} className="badge badge-blue text-xs">{kw}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Reviews Section ─── */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-black text-primary-color">
                  Reviews
                  <span className="ml-2 text-sm text-slate-500 font-medium">({filtered.length})</span>
                </h2>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Platform filter */}
                  <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
                    {platforms.map(p => (
                      <button key={p} onClick={() => setPlatform(p)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          platform === p ? 'bg-blue-600 text-white' : 'text-secondary-color hover:text-primary-color'
                        }`}>
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Sort */}
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                    <option value="date_desc">Newest</option>
                    <option value="date_asc">Oldest</option>
                    <option value="rating_desc">Highest Rating</option>
                    <option value="rating_asc">Lowest Rating</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayed.map((r, i) => <ReviewCard key={i} review={r} />)}
              </div>

              {filtered.length > 12 && (
                <div className="mt-6 text-center">
                  <button onClick={() => setShowAll(!showAll)} className="btn-secondary">
                    {showAll ? 'Show Less' : `Load ${filtered.length - 12} More Reviews`}
                    <ChevronDown size={16} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
