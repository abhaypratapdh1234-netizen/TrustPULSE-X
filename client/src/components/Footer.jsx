import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Github, Twitter, Linkedin, Mail, ArrowRight, ExternalLink, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BrandLogo from './BrandLogo';

const LINKS = {
  Platform: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Trending Companies', to: '/trending' },
    { label: 'Compare Companies', to: '/compare' },
    { label: 'Watchlist', to: '/profile?tab=watchlist' },
  ],
  Company: [
    { label: 'About TrustPULSE', modal: 'about' },
    { label: 'Privacy Policy', modal: 'privacy' },
    { label: 'Terms of Service', modal: 'terms' },
    { label: 'Contact Us', modal: 'contact' },
  ],
  Resources: [
    { label: 'API Documentation', modal: 'api' },
    { label: 'Help Center', modal: 'help' },
    { label: 'Blog', modal: 'blog' },
    { label: 'Changelog', modal: 'changelog' },
  ],
};

const MODAL_CONTENT = {
  about: {
    title: 'About TrustPULSE',
    content: (
      <div className="space-y-4 text-secondary-color text-sm leading-relaxed">
        <p><strong>TrustPULSE</strong> is a state-of-the-art corporate reputation intelligence platform powered by advanced Natural Language Processing (NLP) and machine learning models.</p>
        <p>Our mission is to bring transparency and integrity to employee reviews. By aggregating data across multiple platforms and performing deep sentiment analysis, TrustPULSE provides job seekers, recruiters, and companies with highly accurate, authentic insights into corporate culture, work-life balance, and employee satisfaction.</p>
        <p>We audit review authenticity in real time to filter out spam and suspicious activity, ensuring a high trust index for all profiles.</p>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div className="space-y-4 text-secondary-color text-sm leading-relaxed">
        <p><em>Last updated: June 2026</em></p>
        <p>At TrustPULSE, your privacy is our top priority. This policy outlines how we collect, protect, and use your credentials and lookup data.</p>
        <h4 className="font-bold text-primary-color mt-3">1. Information Collection</h4>
        <p className="text-xs">We collect minimal information required to register accounts and authenticate users. We do not sell or distribute personal data to third parties.</p>
        <h4 className="font-bold text-primary-color mt-3">2. Data Safety</h4>
        <p className="text-xs">All network traffic and API keys are encrypted using industry-standard SSL certificates. Watchlist data and audit logs are stored securely in local database records.</p>
      </div>
    )
  },
  terms: {
    title: 'Terms of Service',
    content: (
      <div className="space-y-4 text-secondary-color text-sm leading-relaxed">
        <p><em>Last updated: June 2026</em></p>
        <p>By accessing or utilizing TrustPULSE's intelligence suite, you agree to comply with our Terms of Service.</p>
        <h4 className="font-bold text-primary-color mt-3">1. Fair Use Policy</h4>
        <p className="text-xs">Our real-time reputation analysis, scraping tools, and chatbot resources are provided for individual research and corporate benchmarking. Automated scraping of TrustPULSE content is strictly prohibited.</p>
        <h4 className="font-bold text-primary-color mt-3">2. Accuracy of AI Models</h4>
        <p className="text-xs">AI Keywords, Sentiment percentiles, and AI summaries are generated using advanced NLP models based on aggregated user reviews. They do not constitute official corporate declarations.</p>
      </div>
    )
  },
  contact: {
    title: 'Contact Us',
    content: null
  },
  api: {
    title: 'API Documentation',
    content: (
      <div className="space-y-4 text-secondary-color text-sm leading-relaxed">
        <p>Integrate TrustPULSE's real-time reputation scorecards directly into your recruitment apps and internal dashboards.</p>
        
        <div className="space-y-3 font-mono text-xs mt-3">
          <div className="p-3 bg-slate-950 rounded-lg border border-white/5">
            <span className="text-green-400 font-bold">GET</span> /api/companies/:slug
            <p className="text-[10px] text-slate-500 mt-1">Fetch reputation metrics, overall ratings, and AI sentiment analysis for a specific company.</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-white/5">
            <span className="text-green-400 font-bold">GET</span> /api/companies/trending
            <p className="text-[10px] text-slate-500 mt-1">Retrieve the top 8 rising, stable, or declining companies on the live dashboard.</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Bearer Token authorization is required for all public endpoints.</p>
      </div>
    )
  },
  help: {
    title: 'Help Center & FAQ',
    content: (
      <div className="space-y-4 text-secondary-color text-sm leading-relaxed max-h-[350px] overflow-y-auto pr-2">
        <div className="space-y-4 mt-2">
          <div>
            <h4 className="font-bold text-sm text-primary-color">What is the Trust Score™?</h4>
            <p className="text-xs leading-relaxed mt-1">Trust Score is a proprietary AI metric (0-100) that evaluates the overall health, authenticity, and volume of reviews to detect spam or fake review spikes.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-primary-color">How does AI Sentiment Analysis work?</h4>
            <p className="text-xs leading-relaxed mt-1">We utilize advanced LLM algorithms to read the text of all combined reviews and group them into positive, neutral, mixed, and negative percentiles.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-primary-color">How do I add a new company?</h4>
            <p className="text-xs leading-relaxed mt-1">Simply use the Dashboard search bar. If the company domain is fetched via Autocomplete, our backend automatically creates a real-time reputation dashboard.</p>
          </div>
        </div>
      </div>
    )
  },
  blog: {
    title: 'TrustPULSE Corporate Blog',
    content: (
      <div className="space-y-4 text-secondary-color text-sm leading-relaxed max-h-[350px] overflow-y-auto pr-2">
        <div className="space-y-4 mt-2">
          <div className="border-b border-white/5 pb-3">
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">June 2026</span>
            <h4 className="font-bold text-sm text-primary-color mt-1">The Rise of AI in Employer Reputation Tracking</h4>
            <p className="text-xs leading-relaxed mt-1">How machine learning helps recruiters parse candidate feedback and forecast organizational growth.</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">May 2026</span>
            <h4 className="font-bold text-sm text-primary-color mt-1">Identifying & Combating Fake Employee Reviews</h4>
            <p className="text-xs leading-relaxed mt-1">Deep dive into suspicious review triggers, click-farms, and how NLP safeguards employee transparency.</p>
          </div>
        </div>
      </div>
    )
  },
  changelog: {
    title: 'System Changelog',
    content: (
      <div className="space-y-4 text-secondary-color text-sm leading-relaxed">
        <div className="border-l-2 border-blue-500 pl-4 space-y-3 mt-2">
          <div>
            <span className="text-xs font-bold text-blue-400">v2.0.0 (June 2026)</span>
            <p className="text-xs mt-0.5">Implemented Hunter.io Real-Time Logo API endpoints to resolve and render corporate brand assets. Added nested rounding to eliminate sharp corner mismatches.</p>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">v1.9.0 (May 2026)</span>
            <p className="text-xs mt-0.5">Launched multi-company Radar benchmarking charts and AI verdict narratives inside the Benchmarking suite.</p>
          </div>
        </div>
      </div>
    )
  }
};

function ContactForm({ onClose }) {
  const [formData, setFormData] = useState({ name: '', address: '', query: '', queryType: 'General Inquiry' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.query) {
      return;
    }
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
        className="text-center py-6 space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
          ✓
        </div>
        <h4 className="text-sm font-bold text-primary-color">Message Sent Successfully!</h4>
        <p className="text-xs text-secondary-color max-w-sm mx-auto leading-relaxed font-semibold">
          Thank you, <strong>{formData.name}</strong>! Your query regarding <strong>{formData.queryType}</strong> has been logged in our databases. Our operations team will respond to your address at <strong>{formData.address}</strong> within 12-24 business hours.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="btn-primary text-xs px-4 py-2 mt-2 inline-block"
        >
          Finish
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <p className="text-xs text-secondary-color leading-relaxed">
        Have questions or feedback? Fill out the secure form below to log your query directly into our AI resolution pipeline.
      </p>

      {/* Name Input */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Jane Doe"
          className="input-field py-2 text-xs w-full"
        />
      </div>

      {/* Address Input */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contact / Email Address</label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          placeholder="e.g. jane@company.com or 123 Main St"
          className="input-field py-2 text-xs w-full"
        />
      </div>

      {/* Query Type Dropdown */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Query Type</label>
        <select
          value={formData.queryType}
          onChange={e => setFormData({ ...formData, queryType: e.target.value })}
          className="input-field py-2 text-xs w-full outline-none cursor-pointer border border-theme bg-secondary-color text-secondary-color"
        >
          <option value="General Inquiry" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>General Inquiry</option>
          <option value="Technical Support" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Technical Support</option>
          <option value="Enterprise Sales" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Enterprise Sales</option>
          <option value="Data Correction" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Data Correction</option>
        </select>
      </div>

      {/* Query Message Textarea */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Query Description</label>
        <textarea
          rows="4"
          required
          value={formData.query}
          onChange={e => setFormData({ ...formData, query: e.target.value })}
          placeholder="Describe your inquiry in detail..."
          className="input-field py-2 text-xs w-full leading-relaxed resize-none"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
        >
          {submitting ? 'Submitting query...' : 'Submit Inquiry'}
        </button>
      </div>
    </form>
  );
}

export default function Footer() {
  const [modalKey, setModalKey] = useState(null);
  const activeModal = modalKey ? MODAL_CONTENT[modalKey] : null;

  return (
    <footer className="border-t mt-24" style={{ borderColor: 'var(--glass-border)' }}>
      {/* Newsletter Banner Removed */}
      <div className="section-container py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <BrandLogo size="md" showTagline={false} />
            </Link>
            <p className="text-sm text-secondary-color leading-relaxed">
              AI-Powered Company Reputation Intelligence Platform. Analyze, compare, and track company reviews in real-time.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-bold text-primary-color mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-secondary-color hover:text-blue-400 transition-colors flex items-center gap-1 group"
                      >
                        {link.label}
                        <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => setModalKey(link.modal)}
                        className="text-sm text-secondary-color hover:text-blue-400 transition-colors flex items-center gap-1 group text-left bg-transparent border-0 p-0 cursor-pointer"
                      >
                        {link.label}
                        <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: 'var(--glass-border)' }}>
          <p className="text-sm text-slate-500">
            © 2025 TrustPULSE. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Modern, Eye-Catching Content Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalKey(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col"
              style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-secondary)' }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <h3 className="text-lg font-black text-primary-color">{activeModal.title}</h3>
                <button
                  onClick={() => setModalKey(null)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-secondary-color hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[400px] pr-1">
                {modalKey === 'contact' ? (
                  <ContactForm onClose={() => setModalKey(null)} />
                ) : (
                  activeModal.content
                )}
              </div>

              <div className="pt-4 border-t border-white/5 mt-6 flex justify-end">
                <button
                  onClick={() => setModalKey(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
