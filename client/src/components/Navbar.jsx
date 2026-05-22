import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, BarChart2, GitCompare, TrendingUp, Bookmark,
  Bell, User, LogOut, ChevronDown, Menu, X, Zap, Moon, Sun,
  Monitor, Cpu, Anchor, Ghost, Terminal, Compass, Feather,
  Sparkles, Palette, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import BrandLogo from './BrandLogo';

const THEMES = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: Cpu },
  { id: 'midnight', label: 'Midnight', icon: Monitor },
  { id: 'purple', label: 'Purple Neon', icon: Zap },
  { id: 'abyss', label: 'Abyss', icon: Anchor },
  { id: 'dracula', label: 'Dracula', icon: Ghost },
  { id: 'monokai', label: 'Monokai', icon: Terminal },
  { id: 'solarized-dark', label: 'Solarized Dark', icon: Compass },
  { id: 'solarized-light', label: 'Solarized Light', icon: Feather },
  { id: 'quiet-light', label: 'Quiet Light', icon: Sparkles },
  { id: 'tokyo-night-light', label: 'Tokyo Night Light', icon: Palette },
  { id: 'minimal', label: 'Minimal White', icon: Layers },
];

const NavLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
        : 'text-secondary-color hover:text-primary-color hover:bg-white/5'
    }`}
  >
    <Icon size={15} />
    {label}
  </Link>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setThemeMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];
  const ThemeIcon = currentTheme.icon;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-card-static border-b shadow-lg'
            : 'bg-transparent border-b border-transparent'
        }`}
        style={{ borderRadius: 0, backdropFilter: scrolled ? 'blur(20px)' : 'none' }}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/">
              <BrandLogo size="md" showTagline={false} />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" icon={Activity} label="Home" active={isActive('/')} />
              <NavLink to="/dashboard" icon={BarChart2} label="Dashboard" active={isActive('/dashboard')} />
              <NavLink to="/trending" icon={TrendingUp} label="Trending" active={isActive('/trending')} />
              <NavLink to="/compare" icon={GitCompare} label="Compare" active={isActive('/compare')} />
              {isAuthenticated && (
                <NavLink to="/profile" icon={User} label="Profile" active={isActive('/profile')} />
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">

              {/* Theme Switcher */}
              <div className="relative">
                <button
                  onClick={() => { setThemeMenuOpen(!themeMenuOpen); setUserMenuOpen(false); }}
                  className="btn-ghost p-2 rounded-lg"
                  title="Switch theme"
                >
                  <ThemeIcon size={18} />
                </button>
                <AnimatePresence>
                  {themeMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-48 glass-card-static border p-2 space-y-1 max-h-[350px] overflow-y-auto pr-1.5"
                      style={{ borderColor: 'var(--glass-border)' }}
                    >
                      {THEMES.map(t => {
                        const TIcon = t.icon;
                        return (
                          <button
                            key={t.id}
                            onClick={() => { setTheme(t.id); setThemeMenuOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              theme === t.id
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'text-secondary-color hover:bg-white/5 hover:text-primary-color'
                            }`}
                          >
                            <TIcon size={14} />
                            {t.label}
                            {theme === t.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setThemeMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card-static border hover:border-blue-500/30 transition-all text-sm font-medium"
                    style={{ borderColor: 'var(--glass-border)' }}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-white/10">
                      {user?.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        user?.name?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="hidden sm:block text-secondary-color max-w-[80px] truncate">{user?.name}</span>
                    <ChevronDown size={14} className="text-secondary-color" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-52 glass-card-static border p-2"
                        style={{ borderColor: 'var(--glass-border)' }}
                      >
                        <div className="px-3 py-2 border-b mb-2" style={{ borderColor: 'var(--glass-border)' }}>
                          <p className="text-sm font-semibold text-primary-color">{user?.name}</p>
                          <p className="text-xs text-secondary-color truncate">{user?.email}</p>
                        </div>
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-secondary-color hover:bg-white/5 hover:text-primary-color transition-all">
                          <User size={14} /> My Account
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all mt-1"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/auth" className="btn-primary text-sm px-4 py-2">
                  Get Started
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden btn-ghost p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden glass-card-static border-t"
              style={{ borderColor: 'var(--glass-border)', borderRadius: 0 }}
            >
              <div className="section-container py-4 space-y-1">
                {[
                  { to: '/', icon: Activity, label: 'Home' },
                  { to: '/dashboard', icon: BarChart2, label: 'Dashboard' },
                  { to: '/trending', icon: TrendingUp, label: 'Trending' },
                  { to: '/compare', icon: GitCompare, label: 'Compare' },
                  ...(isAuthenticated ? [{ to: '/profile', icon: User, label: 'Profile' }] : []),
                ].map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive(link.to) ? 'bg-blue-500/15 text-blue-400' : 'text-secondary-color hover:text-primary-color hover:bg-white/5'
                    }`}
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link to="/auth" className="btn-primary w-full justify-center mt-2">
                    Get Started
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Click outside to close menus */}
      {(userMenuOpen || themeMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setUserMenuOpen(false); setThemeMenuOpen(false); }}
        />
      )}
    </>
  );
}
