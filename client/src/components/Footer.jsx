import { Link } from 'react-router-dom';
import { Activity, Github, Twitter, Linkedin, Mail, ArrowRight, ExternalLink } from 'lucide-react';
import BrandLogo from './BrandLogo';

const LINKS = {
  Platform: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Trending Companies', to: '/trending' },
    { label: 'Compare Companies', to: '/compare' },
    { label: 'Watchlist', to: '/watchlist' },
  ],
  Company: [
    { label: 'About TrustPULSE', to: '/' },
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
    { label: 'Contact Us', to: '/' },
  ],
  Resources: [
    { label: 'API Documentation', to: '/' },
    { label: 'Help Center', to: '/' },
    { label: 'Blog', to: '/' },
    { label: 'Changelog', to: '/' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t mt-24" style={{ borderColor: 'var(--glass-border)' }}>
      {/* Newsletter Banner */}
      <div className="section-container py-12">
        <div className="glass-card-static border rounded-2xl p-8 md:p-12 mb-16 relative overflow-hidden"
          style={{ borderColor: 'var(--glass-border)' }}>
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="section-label mb-2">Newsletter</div>
              <h3 className="text-2xl font-black text-primary-color mb-2">
                Stay ahead with AI reputation insights
              </h3>
              <p className="text-secondary-color">
                Weekly digest of company reputation trends, AI analytics, and platform updates.
              </p>
            </div>
            <div className="flex gap-3 min-w-[320px]">
              <input
                type="email"
                placeholder="your@email.com"
                className="input-field flex-1"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <BrandLogo size="md" showTagline={false} />
            </Link>
            <p className="text-sm text-secondary-color mb-6 leading-relaxed">
              AI-Powered Company Reputation Intelligence Platform. Analyze, compare, and track company reviews in real-time.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Github, href: 'https://github.com' },
                { Icon: Twitter, href: 'https://twitter.com' },
                { Icon: Linkedin, href: 'https://linkedin.com' },
                { Icon: Mail, href: 'mailto:hello@trustpulse.ai' },
              ].map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg glass-card-static border flex items-center justify-center text-secondary-color hover:text-blue-400 hover:border-blue-500/40 transition-all"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-bold text-primary-color mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-secondary-color hover:text-blue-400 transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
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
          <p className="text-xs text-slate-600">
            Built with ❤️ using React, Node.js & AI/ML
          </p>
        </div>
      </div>
    </footer>
  );
}
