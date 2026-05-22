import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '../../store/slices/authSlice'
import { setTheme } from '../../store/slices/themeSlice'
import { toggleChatbot, toggleNotifications } from '../../store/slices/uiSlice'
import { getInitials, getAvatarColor } from '../../utils/helpers'
import {
  FiSearch, FiBell, FiMenu, FiX, FiUser, FiLogOut, FiSettings,
  FiSun, FiMoon, FiZap, FiBarChart2, FiGitCompare, FiBookmark,
  FiMessageSquare, FiChevronDown
} from 'react-icons/fi'
import { RiRobotLine } from 'react-icons/ri'
import BrandLogo from '../BrandLogo'

const THEMES = [
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '⚡' },
  { id: 'midnight', label: 'Midnight', icon: '🌌' },
  { id: 'purple', label: 'Purple', icon: '💜' },
  { id: 'minimal', label: 'Minimal', icon: '⬜' },
]

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: <FiZap /> },
  { to: '/dashboard', label: 'Dashboard', icon: <FiBarChart2 /> },
  { to: '/compare', label: 'Compare', icon: <FiGitCompare /> },
]

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const { current: currentTheme } = useSelector((s) => s.theme)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const themeRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-intense shadow-card py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/">
            <BrandLogo size="md" showTagline={false} />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link flex items-center gap-2 ${location.pathname === to ? 'active' : ''}`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass pl-10 pr-4 py-2 text-sm w-full"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            {/* Theme Switcher */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className="w-9 h-9 rounded-xl flex items-center justify-center glass-card hover:border-brand-500 transition-all"
                title="Change theme"
              >
                <span className="text-base">
                  {THEMES.find(t => t.id === currentTheme)?.icon || '🌙'}
                </span>
              </button>

              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-12 glass-card rounded-2xl p-3 w-44 shadow-card border border-theme z-50"
                  >
                    <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                      THEME
                    </p>
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => { dispatch(setTheme(theme.id)); setThemeOpen(false) }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all ${
                          currentTheme === theme.id
                            ? 'bg-brand-500/20 text-brand-400'
                            : 'hover:bg-card-color text-secondary-color'
                        }`}
                      >
                        <span>{theme.icon}</span>
                        <span>{theme.label}</span>
                        {currentTheme === theme.id && <span className="ml-auto text-xs">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Chatbot */}
            <button
              onClick={() => dispatch(toggleChatbot())}
              className="w-9 h-9 rounded-xl flex items-center justify-center glass-card hover:border-cyan-400 transition-all"
              title="AI Assistant"
            >
              <RiRobotLine className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button
                  onClick={() => dispatch(toggleNotifications())}
                  className="w-9 h-9 rounded-xl flex items-center justify-center glass-card hover:border-amber-400 transition-all relative"
                >
                  <FiBell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User Menu */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-xl hover:border-brand-500 transition-all"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: getAvatarColor(user?.name) }}
                    >
                      {getInitials(user?.name)}
                    </div>
                    <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-primary)' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <FiChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute right-0 top-12 glass-card rounded-2xl p-2 w-52 shadow-card border border-theme z-50"
                      >
                        <div className="px-3 py-2 border-b border-theme mb-1">
                          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        </div>
                        {[
                          { to: '/profile', icon: <FiUser />, label: 'Profile' },
                          { to: '/dashboard', icon: <FiBarChart2 />, label: 'Dashboard' },
                        ].map(({ to, icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:bg-card-color"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {icon} {label}
                          </Link>
                        ))}
                        <div className="border-t border-theme mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full transition-all hover:bg-rose-500/10 text-rose-400"
                          >
                            <FiLogOut /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth" className="btn-ghost py-2 px-4 text-sm hidden sm:flex">
                  Sign In
                </Link>
                <Link to="/auth?tab=signup" className="btn-primary py-2 px-4 text-sm">
                  <span>Get Started</span>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center glass-card"
            >
              {menuOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-theme"
            >
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-glass pl-10 py-2 text-sm w-full"
                  />
                </div>
              </form>
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map(({ to, label, icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="nav-link flex items-center gap-2"
                  >
                    {icon} {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
