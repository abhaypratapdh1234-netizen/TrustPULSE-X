import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Star, ArrowRight, Filter, AlertTriangle, Award, Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';

const INDUSTRIES = ['All', 'Technology', 'Finance', 'Healthcare', 'E-Commerce', 'Automotive', 'IT Services', 'Fintech', 'Social Media'];

// FALLBACK DATASETS (used if MongoDB has no records seeded)
const FALLBACK_TRENDING = [
  { name: 'Stripe', ratings: { overall: 4.5 }, reviewCount: 12345, trend: 'rising', industry: 'Fintech', trustScore: 91, weeklyGrowth: 12 },
  { name: 'Google', ratings: { overall: 4.4 }, reviewCount: 92847, trend: 'rising', industry: 'Technology', trustScore: 88, weeklyGrowth: 8 },
  { name: 'Salesforce', ratings: { overall: 4.3 }, reviewCount: 23456, trend: 'rising', industry: 'Technology', trustScore: 84, weeklyGrowth: 9 },
  { name: 'Microsoft', ratings: { overall: 4.3 }, reviewCount: 78234, trend: 'rising', industry: 'Technology', trustScore: 85, weeklyGrowth: 6 },
  { name: 'Apple', ratings: { overall: 4.2 }, reviewCount: 65123, trend: 'stable', industry: 'Technology', trustScore: 82, weeklyGrowth: 0 },
  { name: 'TCS', ratings: { overall: 3.9 }, reviewCount: 89012, trend: 'rising', industry: 'IT Services', trustScore: 73, weeklyGrowth: 5 },
  { name: 'Tesla', ratings: { overall: 3.9 }, reviewCount: 28943, trend: 'rising', industry: 'Automotive', trustScore: 72, weeklyGrowth: 11 },
  { name: 'Infosys', ratings: { overall: 3.8 }, reviewCount: 56789, trend: 'stable', industry: 'IT Services', trustScore: 71, weeklyGrowth: 0 },
];

const FALLBACK_TOP = [
  { name: 'Nvidia', ratings: { overall: 4.8 }, reviewCount: 8421, positiveSentimentPercent: 94, industry: 'Technology', trustScore: 96 },
  { name: 'Stripe', ratings: { overall: 4.5 }, reviewCount: 12345, positiveSentimentPercent: 88, industry: 'Fintech', trustScore: 91 },
  { name: 'Google', ratings: { overall: 4.4 }, reviewCount: 92847, positiveSentimentPercent: 86, industry: 'Technology', trustScore: 88 },
  { name: 'Adobe', ratings: { overall: 4.4 }, reviewCount: 15423, positiveSentimentPercent: 85, industry: 'Technology', trustScore: 87 },
  { name: 'Salesforce', ratings: { overall: 4.3 }, reviewCount: 23456, positiveSentimentPercent: 83, industry: 'Technology', trustScore: 84 },
  { name: 'Microsoft', ratings: { overall: 4.3 }, reviewCount: 78234, positiveSentimentPercent: 84, industry: 'Technology', trustScore: 85 },
];

const FALLBACK_LOWEST = [
  { name: 'Comcast', ratings: { overall: 2.1 }, reviewCount: 4520, negativeSentimentPercent: 78, industry: 'Telecommunications', cons: ['Slow customer response', 'Unexpected billing increases', 'Frequent service outages'] },
  { name: 'Ticketmaster', ratings: { overall: 2.3 }, reviewCount: 3120, negativeSentimentPercent: 72, industry: 'Entertainment', cons: ['High convenience fees', 'Poor customer support', 'Scalping issues'] },
  { name: 'Meta', ratings: { overall: 3.8 }, reviewCount: 45678, negativeSentimentPercent: 42, industry: 'Social Media', cons: ['Privacy concerns', 'Frequent policy shifts', 'Ad delivery disputes'] },
  { name: 'Amazon', ratings: { overall: 3.7 }, reviewCount: 112456, negativeSentimentPercent: 38, industry: 'E-Commerce', cons: ['High work pressure', 'Strict vendor rules', 'Packaging waste'] },
];

// 🔥 Trending Card Component
function TrendingCard({ company, rank, delay }) {
  const navigate = useNavigate();
  const direction = company.trend || company.reputationTrend || (company.trendDirection === 'up' ? 'rising' : company.trendDirection === 'down' ? 'declining' : 'stable') || 'stable';
  const isRising = direction === 'rising' || direction === 'up';
  const isDeclining = direction === 'declining' || direction === 'down';
  const TrendIcon = isRising ? TrendingUp : isDeclining ? TrendingDown : Minus;
  const trendColor = isRising ? '#10b981' : isDeclining ? '#ef4444' : '#f59e0b';
  
  const rating = company.ratings?.overall || company.overallRating || company.rating || 0;
  const reviews = company.reviewCount || company.totalReviews || company.reviews || 0;
  const trust = company.trustScore || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.01, x: 4 }}
      onClick={() => navigate(`/dashboard?q=${company.name}`)}
      className="glass-card border p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Rank */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
          rank <= 3 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-white/5 text-slate-400'
        }`}>
          #{rank}
        </div>

        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-base font-black text-white flex-shrink-0">
          {company.name ? company.name[0] : '?'}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="text-sm font-bold text-primary-color truncate">{company.name}</h3>
            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              <TrendIcon size={10} style={{ color: trendColor }} />
              <span className="text-[10px] font-semibold capitalize" style={{ color: trendColor }}>
                {direction}
              </span>
            </div>
            {(company.weeklyGrowth > 0 || (isRising && !company.weeklyGrowth)) && (
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +{company.weeklyGrowth || 8}% this week
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate">{company.industry}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5 ml-14 sm:ml-0">
        <div className="text-left sm:text-right">
          <div className="flex items-center gap-1 justify-start sm:justify-end mb-0.5">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-black text-primary-color">{rating.toFixed(1)}</span>
          </div>
          <div className="text-[10px] text-secondary-color font-medium">{(reviews).toLocaleString()} reviews</div>
        </div>

        <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />

        <div className="text-left sm:text-right min-w-[70px]">
          <div className="text-xs font-black text-blue-400 mb-0.5">Score {trust || 75}</div>
          <div className="text-[9px] text-secondary-color font-bold uppercase tracking-wider">Trust Score</div>
        </div>
      </div>
    </motion.div>
  );
}

// 🏆 Top Rated Card Component
function TopRatedCard({ company, rank, delay }) {
  const navigate = useNavigate();
  const rating = company.ratings?.overall || company.overallRating || company.rating || 0;
  const reviews = company.reviewCount || company.totalReviews || company.reviews || 0;
  const trust = company.trustScore || 0;
  const sentiment = company.positiveSentimentPercent || company.positivePercent || 85;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.01, x: 4 }}
      onClick={() => navigate(`/dashboard?q=${company.name}`)}
      className="glass-card border p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Badge */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white`}>
          #{rank}
        </div>

        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-base font-black text-white flex-shrink-0">
          {company.name ? company.name[0] : '?'}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="text-sm font-bold text-primary-color truncate">{company.name}</h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Leader
            </span>
          </div>
          <p className="text-xs text-secondary-color truncate">{company.industry}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5 ml-14 sm:ml-0">
        <div className="text-left sm:text-right">
          <div className="flex items-center gap-1 justify-start sm:justify-end mb-0.5">
            <Star size={14} className="fill-emerald-400 text-emerald-400" />
            <span className="text-base font-black text-emerald-400">{rating.toFixed(1)}</span>
          </div>
          <div className="text-[10px] text-secondary-color font-medium">{(reviews).toLocaleString()} reviews</div>
        </div>

        <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />

        <div className="text-left sm:text-right min-w-[90px]">
          <div className="text-xs font-black text-emerald-400 mb-0.5">👍 {sentiment}%</div>
          <div className="text-[9px] text-secondary-color font-bold uppercase tracking-wider">Positive Sentiment</div>
        </div>
      </div>
    </motion.div>
  );
}

// ⚠️ Lowest Rated Card Component
function LowestRatedCard({ company, rank, delay }) {
  const navigate = useNavigate();
  const rating = company.ratings?.overall || company.overallRating || company.rating || 0;
  const reviews = company.reviewCount || company.totalReviews || company.reviews || 0;
  const sentiment = company.negativeSentimentPercent || company.negativePercent || 60;
  const consList = company.cons || company.topCons || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.01, x: 4 }}
      onClick={() => navigate(`/dashboard?q=${company.name}`)}
      className="glass-card border p-5 cursor-pointer flex flex-col gap-4 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all"
      style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Badge */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 bg-gradient-to-br from-red-500 to-rose-600 text-white`}>
            #{rank}
          </div>

          {/* Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/20 flex items-center justify-center text-base font-black text-white flex-shrink-0">
            {company.name ? company.name[0] : '?'}
          </div>

          {/* Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="text-sm font-bold text-primary-color truncate">{company.name}</h3>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Needs Improvement
              </span>
            </div>
            <p className="text-xs text-secondary-color truncate">{company.industry}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5 ml-14 sm:ml-0">
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-1 justify-start sm:justify-end mb-0.5">
              <Star size={14} className="fill-rose-500 text-rose-500" />
              <span className="text-base font-black text-rose-500">{rating.toFixed(1)}</span>
            </div>
            <div className="text-[10px] text-secondary-color font-medium">{(reviews).toLocaleString()} reviews</div>
          </div>

          <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />

          <div className="text-left sm:text-right min-w-[90px]">
            <div className="text-xs font-black text-rose-500 mb-0.5">👎 {sentiment}%</div>
            <div className="text-[9px] text-secondary-color font-bold uppercase tracking-wider">Negative Sentiment</div>
          </div>
        </div>
      </div>

      {/* Cons List */}
      {consList.length > 0 && (
        <div className="bg-red-500/5 rounded-xl border border-red-500/10 p-3 sm:ml-14">
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-2">Key Critical Areas</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {consList.slice(0, 4).map((con, idx) => (
              <div key={con} className="flex items-start gap-2 text-xs text-secondary-color">
                <span className="text-rose-500 mt-0.5 font-bold">•</span>
                <span className="truncate">{con}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function TrendingPage() {
  const {
    trending, trendingLoading, fetchTrending,
    topRated, topRatedLoading, fetchTopRated,
    lowestRated, lowestRatedLoading, fetchLowestRated
  } = useApp();

  const [activeTab, setActiveTab] = useState('trending');
  const [industry, setIndustry] = useState('All');
  const [sort, setSort] = useState('rating');

  // Fetch when tab or filters change
  useEffect(() => {
    if (activeTab === 'trending') {
      fetchTrending();
    } else if (activeTab === 'top') {
      fetchTopRated(industry);
    } else if (activeTab === 'lowest') {
      fetchLowestRated();
    }
  }, [activeTab, industry, fetchTrending, fetchTopRated, fetchLowestRated]);

  // Set default sorting based on active tab
  useEffect(() => {
    if (activeTab === 'trending') setSort('trending');
    else if (activeTab === 'top') setSort('rating');
    else if (activeTab === 'lowest') setSort('rating');
  }, [activeTab]);

  // Retrieve active dataset (falls back to mock if empty)
  const getRawData = () => {
    if (activeTab === 'trending') return trending.length > 0 ? trending : FALLBACK_TRENDING;
    if (activeTab === 'top') return topRated.length > 0 ? topRated : FALLBACK_TOP;
    return lowestRated.length > 0 ? lowestRated : FALLBACK_LOWEST;
  };

  const data = getRawData()
    .filter(c => industry === 'All' || c.industry === industry)
    .sort((a, b) => {
      const ratingA = a.ratings?.overall || a.overallRating || a.rating || 0;
      const ratingB = b.ratings?.overall || b.overallRating || b.rating || 0;
      const reviewsA = a.reviewCount || a.totalReviews || a.reviews || 0;
      const reviewsB = b.reviewCount || b.totalReviews || b.reviews || 0;
      const trustA = a.trustScore || 0;
      const trustB = b.trustScore || 0;

      if (sort === 'rating') {
        // Lowest tab sorts ascending if desired, but let's sort worst first (which is lowest overall)
        return activeTab === 'lowest' ? ratingA - ratingB : ratingB - ratingA;
      }
      if (sort === 'reviews') return reviewsB - reviewsA;
      if (sort === 'trust') return trustB - trustA;
      
      // Trending sorting
      const trendScoreA = a.trendScore || 0;
      const trendScoreB = b.trendScore || 0;
      return trendScoreB - trendScoreA;
    });

  // Calculate dynamic stats metrics
  const getStats = () => {
    if (activeTab === 'trending') {
      return [
        { label: 'Rising Trend', count: data.filter(c => {
          const dir = c.trend || c.reputationTrend || c.trendDirection || '';
          return dir === 'rising' || dir === 'up';
        }).length, color: '#10b981' },
        { label: 'Stable Trend', count: data.filter(c => {
          const dir = c.trend || c.reputationTrend || c.trendDirection || '';
          return dir === 'stable' || dir === '';
        }).length, color: '#f59e0b' },
        { label: 'Declining Trend', count: data.filter(c => {
          const dir = c.trend || c.reputationTrend || c.trendDirection || '';
          return dir === 'declining' || dir === 'down';
        }).length, color: '#ef4444' },
      ];
    }

    if (activeTab === 'top') {
      const avg = data.length > 0 ? (data.reduce((acc, c) => acc + (c.ratings?.overall || c.overallRating || c.rating || 0), 0) / data.length) : 0;
      const maxScore = data.length > 0 ? Math.max(...data.map(c => c.trustScore || 0)) : 0;
      return [
        { label: 'Top Leaders', count: data.length, color: '#10b981' },
        { label: 'Average Rating', count: `${avg.toFixed(2)} ⭐`, color: '#60a5fa' },
        { label: 'Peak Trust Score', count: `${maxScore}/100`, color: '#a78bfa' },
      ];
    }

    // lowest-rated tab
    const avgRating = data.length > 0 ? (data.reduce((acc, c) => acc + (c.ratings?.overall || c.overallRating || c.rating || 0), 0) / data.length) : 0;
    const avgNeg = data.length > 0 ? Math.round(data.reduce((acc, c) => acc + (c.negativeSentimentPercent || c.negativePercent || 50), 0) / data.length) : 0;
    return [
      { label: 'At Risk', count: data.length, color: '#ef4444' },
      { label: 'Average Rating', count: `${avgRating.toFixed(2)} ⭐`, color: '#f59e0b' },
      { label: 'Avg Neg Sentiment', count: `${avgNeg}%`, color: '#f87171' },
    ];
  };

  const isLoading = activeTab === 'trending' ? trendingLoading : activeTab === 'top' ? topRatedLoading : lowestRatedLoading;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="section-container pt-28 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="section-label mb-3">Live Rankings & Metrics</div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary-color mb-2">
                Reputation <span className="text-gradient">Rankings</span>
              </h1>
              <p className="text-secondary-color">
                Explore real-time momentum, industry giants, and critical public sentiments
              </p>
            </div>
            <Link to="/dashboard" className="btn-primary text-sm w-fit">
              Analyze a Company <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-secondary-color border border-theme mb-8 w-fit gap-1">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'trending'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-secondary-color hover:text-primary-color hover:bg-white/5'
            }`}
          >
            <Zap size={14} />
            Trending Now
          </button>
          <button
            onClick={() => setActiveTab('top')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'top'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-secondary-color hover:text-primary-color hover:bg-white/5'
            }`}
          >
            <Award size={14} />
            Top Performers
          </button>
          <button
            onClick={() => setActiveTab('lowest')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'lowest'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-secondary-color hover:text-primary-color hover:bg-white/5'
            }`}
          >
            <AlertTriangle size={14} />
            Needs Improvement
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card-static border rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          style={{ borderColor: 'var(--glass-border)' }}>
          <Filter size={16} className="text-slate-400 flex-shrink-0" />

          {/* Industry Filter (only relevant if not looking at general lowest-rated) */}
          <div className="flex gap-2 flex-wrap">
            {INDUSTRIES.map(ind => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  industry === ind
                    ? activeTab === 'top'
                      ? 'bg-emerald-600 text-white'
                      : activeTab === 'lowest'
                        ? 'bg-red-600 text-white'
                        : 'bg-blue-600 text-white'
                    : 'text-secondary-color hover:text-primary-color hover:bg-white/5'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          <div className="sm:ml-auto flex-shrink-0">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
            >
              {activeTab === 'trending' && <option value="trending">Sort by Growth</option>}
              <option value="rating">Sort by Rating</option>
              <option value="reviews">Sort by Reviews</option>
              {activeTab !== 'lowest' && <option value="trust">Sort by Trust Score</option>}
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {getStats().map(({ label, count, color }) => (
            <div key={label} className="glass-card-static border rounded-xl p-4 text-center"
              style={{ borderColor: 'var(--glass-border)' }}>
              <div className="text-2xl font-black mb-0.5" style={{ color }}>{count}</div>
              <div className="text-xs text-secondary-color font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Dynamic List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-xl opacity-80" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {data.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 text-secondary-color glass-card border rounded-2xl"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  No companies match this filter.
                </motion.div>
              ) : (
                data.map((company, i) => {
                  if (activeTab === 'trending') {
                    return <TrendingCard key={company.name || i} company={company} rank={i + 1} delay={i * 0.04} />;
                  } else if (activeTab === 'top') {
                    return <TopRatedCard key={company.name || i} company={company} rank={i + 1} delay={i * 0.04} />;
                  } else {
                    return <LowestRatedCard key={company.name || i} company={company} rank={i + 1} delay={i * 0.04} />;
                  }
                })
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
