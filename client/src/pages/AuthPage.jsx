import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Mail, Lock, User, Eye, EyeOff, ArrowRight,
  Shield, CheckCircle, Brain, TrendingUp, BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

// ─── Password Strength ───────────────────────────────────────
function PasswordStrength({ password }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color: colors[strength] }}>
        {labels[strength]}
      </p>
    </div>
  );
}

// ─── Floating Blob ───────────────────────────────────────────
function FloatingBlob({ color, size, x, y, delay }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color, opacity: 0.15 }}
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 30, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

// ─── Input Field ─────────────────────────────────────────────
function AuthInput({ icon: Icon, type, name, value, onChange, placeholder, disabled, label, extra }) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label className="block text-xs font-bold text-secondary-color uppercase tracking-widest mb-2">{label}</label>
      <div className="relative flex items-center">
        <Icon size={16} className="absolute left-4 text-slate-500" />
        <input
          type={isPassword && showPwd ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required
          className="input-field pl-11 pr-11"
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors">
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {extra}
    </div>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, register, forgotPassword, authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated]);

  // Load remembered credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    if (savedEmail || savedPassword) {
      setForm(prev => ({
        ...prev,
        email: savedEmail || '',
        password: savedPassword || ''
      }));
    }
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (isForgot) {
      const data = await forgotPassword(form.email);
      if (data?.success && data?.resetUrl) {
        // Dev mode bypass URL
        setResetUrl(data.resetUrl);
      }
      return;
    }

    let success;
    if (isLogin) {
      success = await login(form.email, form.password);
    } else {
      success = await register(form.name, form.email, form.password);
    }
    
    if (success) {
      // Remember credentials in localStorage
      localStorage.setItem('remembered_email', form.email);
      localStorage.setItem('remembered_password', form.password);
      navigate('/dashboard');
    }
  };

  const PERKS = [
    { icon: Brain, text: 'AI-powered sentiment analysis' },
    { icon: Shield, text: 'Trust Score™ for every company' },
    { icon: TrendingUp, text: 'Real-time reputation tracking' },
    { icon: BarChart2, text: 'Interactive analytics dashboard' },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Left Panel (Desktop) ──────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-16 border-r"
        style={{ borderColor: 'var(--glass-border)' }}>

        {/* Background blobs */}
        <FloatingBlob color="#3b82f6" size={400} x="-10%" y="-10%" delay={0} />
        <FloatingBlob color="#8b5cf6" size={300} x="60%" y="60%" delay={3} />
        <FloatingBlob color="#06b6d4" size={200} x="30%" y="40%" delay={1.5} />

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-block mb-12">
            <BrandLogo size="lg" showTagline={false} />
          </Link>

          <h2 className="text-4xl font-black text-primary-color leading-tight mb-4">
            AI-Powered Company<br />
            <span className="text-gradient">Reputation Intelligence</span>
          </h2>
          <p className="text-secondary-color mb-10 leading-relaxed">
            Analyze reviews from thousands of companies with advanced AI sentiment analysis, trust scoring, and real-time reputation tracking.
          </p>

          <div className="space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-blue-400" />
                </div>
                <span className="text-sm text-secondary-color font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-12 glass-card-static border rounded-xl p-5 flex items-center gap-4"
            style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex -space-x-2">
              {['A', 'B', 'C', 'D'].map(l => (
                <div key={l} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-[var(--bg-primary)] flex items-center justify-center text-xs font-bold text-white">
                  {l}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-primary-color">12,840+ companies analyzed</p>
              <p className="text-xs text-slate-500">Trusted by HR teams worldwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <FloatingBlob color="#3b82f6" size={300} x="70%" y="10%" delay={2} />
        <FloatingBlob color="#8b5cf6" size={200} x="-10%" y="70%" delay={4} />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <Link to="/" className="inline-block mb-8 lg:hidden">
            <BrandLogo size="md" showTagline={false} />
          </Link>

          <motion.div
            key={isForgot ? 'forgot' : isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-card-static border rounded-2xl p-8"
              style={{ borderColor: 'var(--glass-border)' }}>

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-black text-primary-color mb-1">
                  {isForgot ? 'Reset Password' : isLogin ? 'Welcome back' : 'Create account'}
                </h1>
                <p className="text-sm text-secondary-color">
                  {isForgot 
                    ? 'Enter your email to receive a password reset link' 
                    : isLogin ? 'Sign in to your TrustPULSE dashboard' : 'Start analyzing companies for free'}
                </p>
              </div>

              {/* Tab Toggle (Only show if NOT in forgot password mode) */}
              {!isForgot && (
                <div className="flex p-1 rounded-xl mb-8"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
                  {['Sign In', 'Sign Up'].map((label, i) => (
                    <button
                      key={label}
                      onClick={() => setIsLogin(i === 0)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        (i === 0) === isLogin
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-secondary-color hover:text-primary-color'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {isForgot ? (
                  <>
                    <AuthInput
                      icon={Mail}
                      type="email"
                      name="email"
                      label="Email Address"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      disabled={authLoading}
                    />

                    {resetUrl && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-3">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={16} />
                          <p className="text-xs text-green-400 leading-normal font-medium">
                            <strong>Dev Mode Link:</strong> A password reset link has been generated! Click the button below to update your password directly.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const tokenMatch = resetUrl.match(/\/reset-password\/([^/]+)/);
                            if (tokenMatch && tokenMatch[1]) {
                              navigate(`/reset-password/${tokenMatch[1]}`);
                            } else {
                              window.location.href = resetUrl;
                            }
                          }}
                          className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-500 transition-colors shadow-lg shadow-green-600/25 flex items-center justify-center gap-1.5"
                        >
                          Reset Password Now ⚡
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="btn-primary w-full py-4 text-base mt-2 disabled:opacity-60"
                    >
                      {authLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending Link...
                        </div>
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => { setIsForgot(false); setResetUrl(''); }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <AnimatePresence>
                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <AuthInput
                            icon={User}
                            type="text"
                            name="name"
                            label="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            disabled={authLoading}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AuthInput
                      icon={Mail}
                      type="email"
                      name="email"
                      label="Email Address"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      disabled={authLoading}
                    />

                    <AuthInput
                      icon={Lock}
                      type="password"
                      name="password"
                      label="Password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={authLoading}
                      extra={!isLogin && <PasswordStrength password={form.password} />}
                    />

                    {isLogin && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsForgot(true)}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="btn-primary w-full py-4 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {authLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {isLogin ? 'Signing In...' : 'Creating Account...'}
                        </div>
                      ) : (
                        <>
                          {isLogin ? 'Sign In to Dashboard' : 'Create Free Account'}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>

              {/* Social login UI */}
              <div className="mt-6">
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
                  <span className="text-xs text-slate-500 font-medium">or continue with</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Google', color: '#ea4335' },
                    { label: 'GitHub', color: '#94a3b8' },
                  ].map(({ label, color }) => (
                    <button
                      key={label}
                      type="button"
                      className="btn-secondary text-sm py-3 opacity-60 cursor-not-allowed"
                      title="Coming soon"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-slate-500 mt-3">Social login — coming soon</p>
              </div>
            </div>
          </motion.div>

          <p className="text-center text-xs text-slate-600 mt-6">
            By continuing, you agree to our{' '}
            <Link to="/" className="text-blue-400 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/" className="text-blue-400 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
