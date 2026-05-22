import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, TrendingUp, TrendingDown, Minus, Brain, Shield,
  ThumbsUp, ThumbsDown, AlertTriangle, Bookmark, BookmarkCheck,
  RefreshCw, Building2, Users, Award, Globe, ChevronDown,
  BarChart2, Filter, Download, ExternalLink, ArrowLeft, MessageSquare, Send, CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SentimentChart from '../components/charts/SentimentChart';
import PlatformBarChart from '../components/charts/PlatformBarChart';
import RatingDistributionChart from '../components/charts/RatingDistributionChart';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// ─── Trust Gauge ──────────────────────────────────────────────
function TrustGauge({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#3b82f6' : score >= 45 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Average' : 'Poor';
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle
            cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference}
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
      <div className="mt-2 badge animate-pulse" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
        {label}
      </div>
    </div>
  );
}

// ─── Metric Bar ──────────────────────────────────────────────
function MetricBar({ label, value, maxValue = 5, color = '#3b82f6' }) {
  const pct = (value / maxValue) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-secondary-color w-28 font-medium truncate">{label}</span>
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

export default function CompanyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isWatched } = useApp();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    title: '',
    rating: 5,
    text: '',
    platform: 'Google',
    author: user?.name || 'Anonymous',
    workLifeBalance: 4,
    salaryBenefits: 4,
    careerGrowth: 4,
    management: 4,
    culture: 4,
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // AI Chatbot State
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: `Hi! I am the TrustPULSE AI Assistant. Ask me anything about employee reviews, sentiment, pros, or cons of this company.` }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Filtering reviews
  const [platformFilter, setPlatformFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Fetch Company Data
  const fetchCompanyData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('trustpulse_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`http://localhost:5000/api/companies/${slug}`, { headers });
      setCompany(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch company details.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  // Submit Review Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.text || newReview.text.length < 10) {
      return toast.error('Review text must be at least 10 characters long');
    }
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('trustpulse_token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
      await axios.post(
        `http://localhost:5000/api/reviews`,
        {
          companyName: company.name,
          ...newReview
        },
        { headers }
      );
      toast.success('Review submitted successfully! AI is analyzing it now...');
      setShowReviewModal(false);
      setNewReview({
        title: '',
        rating: 5,
        text: '',
        platform: 'Google',
        author: user?.name || 'Anonymous',
        workLifeBalance: 4,
        salaryBenefits: 4,
        careerGrowth: 4,
        management: 4,
        culture: 4,
      });
      fetchCompanyData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Chatbot Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const newMessages = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(newMessages);
    setUserMessage('');
    setChatLoading(true);

    try {
      const res = await axios.post(`http://localhost:5000/api/companies/chatbot`, {
        companyName: company.name,
        question: userMessage
      });
      setChatMessages([...newMessages, { role: 'assistant', content: res.data.data.response }]);
    } catch (err) {
      setChatMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between" style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="section-container py-32 flex flex-col items-center justify-center">
          <RefreshCw className="animate-spin text-blue-500 mb-4" size={48} />
          <p className="text-secondary-color font-bold">Analyzing reputation metrics & AI data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex flex-col justify-between" style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="section-container py-32 text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-primary-color mb-2">Company Not Found</h2>
          <p className="text-secondary-color mb-6">{error || 'The requested company could not be located.'}</p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter + sort reviews
  const allReviews = company.reviews || [];
  const filteredReviews = allReviews
    .filter(r => platformFilter === 'All' || r.platform === platformFilter)
    .sort((a, b) => {
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'rating_asc') return a.rating - b.rating;
      if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
      return new Date(b.date) - new Date(a.date);
    });

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 8);
  const platforms = ['All', ...new Set(allReviews.map(r => r.platform))];

  const sentimentData = {
    positive: Math.round((company.positivePercent / 100) * company.totalReviews) || 0,
    negative: Math.round((company.negativePercent / 100) * company.totalReviews) || 0,
    neutral: Math.round((company.neutralPercent / 100) * company.totalReviews) || 0,
  };

  const isCompanyWatched = isWatched(company.name);

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="section-container pt-28 pb-20">
        {/* Back Button */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-secondary-color hover:text-primary-color mb-6 transition-all">
          <ArrowLeft size={16} /> Back to Search
        </Link>

        {/* Company Header */}
        <div className="glass-card border rounded-2xl p-6 md:p-8 mb-8" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-4xl font-black text-primary-color flex-shrink-0">
                {company.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-3xl md:text-4xl font-black text-primary-color">{company.name}</h1>
                  <div className="flex items-center gap-1.5">
                    {company.reputationTrend === 'rising' ? (
                      <TrendingUp size={16} className="text-emerald-400" />
                    ) : company.reputationTrend === 'declining' ? (
                      <TrendingDown size={16} className="text-red-400" />
                    ) : (
                      <Minus size={16} className="text-amber-400" />
                    )}
                    <span className="text-xs font-bold capitalize" style={{ color: company.reputationTrend === 'rising' ? '#10b981' : company.reputationTrend === 'declining' ? '#ef4444' : '#f59e0b' }}>
                      {company.reputationTrend} Trend
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {company.industry && <span className="badge badge-blue">{company.industry}</span>}
                  {company.location && <span className="badge badge-purple">{company.location}</span>}
                  {company.size && <span className="badge badge-cyan">{company.size}</span>}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star size={18} className="fill-amber-400 text-amber-400" />
                    <span className="text-2xl font-black text-primary-color">{company.overallRating?.toFixed(1)}</span>
                    <span className="text-muted-color text-sm">/ 5.0</span>
                  </div>
                  <span className="text-muted-color">·</span>
                  <span className="text-sm text-secondary-color">{company.totalReviews?.toLocaleString()} overall reviews</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={() => isCompanyWatched ? removeFromWatchlist(company.name) : addToWatchlist(company.name)}
                className={`btn-secondary flex items-center gap-2 text-sm ${isCompanyWatched ? 'border-blue-500/40 text-blue-400' : ''}`}
              >
                {isCompanyWatched ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isCompanyWatched ? 'Watching' : 'Add Watchlist'}
              </button>
              <Link to={`/compare?a=${company.name}`} className="btn-secondary flex items-center gap-2 text-sm">
                <ExternalLink size={16} /> Compare
              </Link>
              {isAuthenticated ? (
                <button onClick={() => setShowReviewModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                  Add Review
                </button>
              ) : (
                <Link to="/auth" className="btn-primary flex items-center gap-2 text-sm">
                  Login to Review
                </Link>
              )}
            </div>
          </div>

          {/* AI Generated Overview */}
          {company.aiSummary && (
            <div className="mt-8 p-5 rounded-xl border relative overflow-hidden bg-blue-500/5" style={{ borderColor: 'rgba(59,130,246,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Brain size={18} className="text-blue-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">AI Deep Reputation Summary</span>
              </div>
              <p className="text-sm text-secondary-color leading-relaxed">{company.aiSummary}</p>
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Trust Score Card */}
          <div className="glass-card border rounded-2xl p-6 flex flex-col items-center justify-center text-center" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="text-xs font-bold uppercase tracking-widest text-secondary-color mb-4 flex items-center gap-1">
              <Shield size={14} className="text-blue-400" /> Trust Score™
            </div>
            <TrustGauge score={company.trustScore || 0} />
            <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-xs">
              AI aggregated score calculated based on rating, volume, sentiment authenticity and fake review triggers.
            </p>
          </div>

          {/* Sentiment Chart */}
          <div className="glass-card border rounded-2xl p-6" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="text-xs font-bold uppercase tracking-widest text-secondary-color mb-4 flex items-center gap-1">
              <Brain size={14} className="text-purple-400" /> AI Sentiment Analysis
            </div>
            <SentimentChart data={sentimentData} />
          </div>

          {/* Platform Performance */}
          <div className="glass-card border rounded-2xl p-6" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="text-xs font-bold uppercase tracking-widest text-secondary-color mb-4 flex items-center gap-1">
              <Globe size={14} className="text-cyan-400" /> Platform Ratings
            </div>
            <PlatformBarChart data={company.platformRatings || []} />
          </div>
        </div>

        {/* Metric breakdown, rating distribution, and pros/cons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sub-Metrics */}
          <div className="glass-card border rounded-2xl p-6" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="text-xs font-bold uppercase tracking-widest text-secondary-color mb-5">Sub-Rating Breakdown</div>
            <div className="space-y-4">
              <MetricBar label="Work-Life Balance" value={company.workLifeBalance || 0} color="#3b82f6" />
              <MetricBar label="Salary & Benefits" value={company.salaryBenefits || 0} color="#8b5cf6" />
              <MetricBar label="Career Growth" value={company.careerGrowth || 0} color="#10b981" />
              <MetricBar label="Management" value={company.management || 0} color="#f59e0b" />
              <MetricBar label="Company Culture" value={company.culture || 0} color="#06b6d4" />
              <MetricBar label="Diversity & Inclusion" value={company.diversityInclusion || 0} color="#ec4899" />
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="glass-card border rounded-2xl p-6" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="text-xs font-bold uppercase tracking-widest text-secondary-color mb-5">Distribution of Star Ratings</div>
            <RatingDistributionChart distribution={company.ratingDistribution || {}} />
          </div>
        </div>

        {/* Pros & Cons & Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Pros */}
          <div className="glass-card border rounded-2xl p-6 bg-emerald-500/5" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <ThumbsUp size={16} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Top Highlights (Pros)</span>
            </div>
            <ul className="space-y-2.5">
              {(company.topPros || []).map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-secondary-color">
                  <span className="text-emerald-400 font-bold select-none">✓</span>
                  <span>{pro}</span>
                </li>
              ))}
              {(!company.topPros || company.topPros.length === 0) && (
                <li className="text-slate-500 text-xs italic">No notable pros generated yet.</li>
              )}
            </ul>
          </div>

          {/* Cons */}
          <div className="glass-card border rounded-2xl p-6 bg-red-500/5" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <ThumbsDown size={16} className="text-red-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Key Paint Points (Cons)</span>
            </div>
            <ul className="space-y-2.5">
              {(company.topCons || []).map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-secondary-color">
                  <span className="text-red-400 font-bold select-none">✗</span>
                  <span>{con}</span>
                </li>
              ))}
              {(!company.topCons || company.topCons.length === 0) && (
                <li className="text-slate-500 text-xs italic">No notable cons generated yet.</li>
              )}
            </ul>
          </div>

          {/* Key Phrases */}
          <div className="glass-card border rounded-2xl p-6" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} className="text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">AI Extracted Keywords</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(company.keywords || []).map((kw, i) => (
                <span key={i} className="badge badge-blue text-xs font-semibold hover:scale-105 transition-transform cursor-default">
                  {kw}
                </span>
              ))}
              {(!company.keywords || company.keywords.length === 0) && (
                <span className="text-slate-500 text-xs italic">No key phrases identified.</span>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-black text-primary-color flex items-center gap-2">
              Reviews Logs
              <span className="text-sm font-medium text-slate-500">({filteredReviews.length} analyzed)</span>
            </h2>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Platform Selector */}
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
                {platforms.map(p => (
                  <button key={p} onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      platformFilter === p ? 'bg-blue-600 text-white shadow-lg' : 'text-secondary-color hover:text-primary-color'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>

              {/* Sorting */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-lg outline-none cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="rating_desc">Highest Rating</option>
                <option value="rating_asc">Lowest Rating</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedReviews.map((review, i) => {
              const platformColors = { Google: '#ea4335', Glassdoor: '#0caa41', Indeed: '#2164f3', Trustpilot: '#00b67a' };
              const sentimentColors = { positive: '#10b981', negative: '#ef4444', neutral: '#94a3b8', mixed: '#f59e0b' };

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card border p-6 flex flex-col justify-between"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} size={13} className={idx < Math.round(review.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />
                          ))}
                          <span className="text-xs font-bold text-primary-color ml-2">{review.rating?.toFixed(1)}</span>
                        </div>
                        <h4 className="text-base font-bold text-primary-color leading-snug">{review.title || 'Work Experience Review'}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {review.sentiment && (
                          <span className="badge text-[10px] font-bold" style={{ background: `${sentimentColors[review.sentiment]}15`, color: sentimentColors[review.sentiment], border: `1px solid ${sentimentColors[review.sentiment]}25` }}>
                            {review.sentiment}
                          </span>
                        )}
                        <span className="badge text-[10px] font-bold" style={{ background: `${platformColors[review.platform] || '#3b82f6'}15`, color: platformColors[review.platform] || '#3b82f6', border: `1px solid ${platformColors[review.platform] || '#3b82f6'}25` }}>
                          {review.platform}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-secondary-color leading-relaxed mb-4">{review.text}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                    <span className="text-xs text-slate-500 font-semibold">{review.author}</span>
                    <span className="text-xs text-slate-600">{review.date ? new Date(review.date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredReviews.length > 8 && (
            <div className="mt-8 text-center">
              <button onClick={() => setShowAllReviews(!showAllReviews)} className="btn-secondary">
                {showAllReviews ? 'Show Less Reviews' : `Load ${filteredReviews.length - 8} More Reviews`}
                <ChevronDown className={`transition-transform duration-300 ${showAllReviews ? 'rotate-180' : ''}`} size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating chatbot bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatbotOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card border w-80 sm:w-96 h-[480px] flex flex-col overflow-hidden shadow-2xl mb-4"
              style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-secondary)' }}
            >
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-blue-500/10" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-2">
                  <Brain className="text-blue-400 animate-pulse" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-primary-color">{company.name} AI Agent</h4>
                    <p className="text-[10px] text-secondary-color font-medium">Reputation Assistant</p>
                  </div>
                </div>
                <button onClick={() => setChatbotOpen(false)} className="text-secondary-color hover:text-primary-color text-xs font-bold">
                  Close
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl p-3 text-sm leading-relaxed ${
                      msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'glass-card border text-secondary-color rounded-tl-none'
                    }`} style={msg.role !== 'user' ? { borderColor: 'var(--glass-border)' } : {}}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="glass-card border rounded-xl rounded-tl-none p-3 text-sm text-slate-400 flex items-center gap-2" style={{ borderColor: 'var(--glass-border)' }}>
                      <RefreshCw size={14} className="animate-spin text-blue-400" />
                      AI is typing...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--glass-border)' }}>
                <input
                  type="text"
                  value={userMessage}
                  onChange={e => setUserMessage(e.target.value)}
                  placeholder="Ask a question about this company..."
                  className="input-field py-2 text-xs flex-1"
                />
                <button type="submit" className="btn-primary px-3 rounded-lg flex items-center justify-center">
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-white border border-blue-400/30"
        >
          <MessageSquare size={24} />
        </button>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 p-6 max-h-[90vh] overflow-y-auto"
              style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-secondary)' }}
            >
              <h2 className="text-2xl font-black text-primary-color mb-2">Write Review for {company.name}</h2>
              <p className="text-xs text-secondary-color mb-6">AI will automatically compute sentiment analysis and audit for trust indicators.</p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-color mb-1.5">Review Title</label>
                    <input
                      type="text"
                      required
                      value={newReview.title}
                      onChange={e => setNewReview({ ...newReview, title: e.target.value })}
                      placeholder="e.g. Great Culture & Great Benefits"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-color mb-1.5">Platform Origin</label>
                    <select
                      value={newReview.platform}
                      onChange={e => setNewReview({ ...newReview, platform: e.target.value })}
                      className="input-field text-sm outline-none cursor-pointer"
                    >
                      <option value="Google">Google</option>
                      <option value="Glassdoor">Glassdoor</option>
                      <option value="Indeed">Indeed</option>
                      <option value="Trustpilot">Trustpilot</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Overall Rating</label>
                    <input
                      type="number" min="1" max="5" required
                      value={newReview.rating}
                      onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                      className="input-field py-1.5 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Work-Life Balance</label>
                    <input
                      type="number" min="1" max="5" required
                      value={newReview.workLifeBalance}
                      onChange={e => setNewReview({ ...newReview, workLifeBalance: Number(e.target.value) })}
                      className="input-field py-1.5 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Salary & Benefits</label>
                    <input
                      type="number" min="1" max="5" required
                      value={newReview.salaryBenefits}
                      onChange={e => setNewReview({ ...newReview, salaryBenefits: Number(e.target.value) })}
                      className="input-field py-1.5 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Career Growth</label>
                    <input
                      type="number" min="1" max="5" required
                      value={newReview.careerGrowth}
                      onChange={e => setNewReview({ ...newReview, careerGrowth: Number(e.target.value) })}
                      className="input-field py-1.5 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Management</label>
                    <input
                      type="number" min="1" max="5" required
                      value={newReview.management}
                      onChange={e => setNewReview({ ...newReview, management: Number(e.target.value) })}
                      className="input-field py-1.5 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Culture</label>
                    <input
                      type="number" min="1" max="5" required
                      value={newReview.culture}
                      onChange={e => setNewReview({ ...newReview, culture: Number(e.target.value) })}
                      className="input-field py-1.5 text-xs text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-color mb-1.5">Review Experience Text</label>
                  <textarea
                    rows="4"
                    required
                    value={newReview.text}
                    onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                    placeholder="Write details of your experience here. Minimum 10 characters."
                    className="input-field text-sm leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                  <button type="button" onClick={() => setShowReviewModal(false)} className="btn-secondary text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingReview} className="btn-primary text-sm flex items-center gap-2">
                    {submittingReview ? <RefreshCw className="animate-spin" size={14} /> : null}
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
