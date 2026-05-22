import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Calendar, Shield, Bookmark, Trash2,
  Settings, LogOut, ArrowRight, ExternalLink, RefreshCw, Key
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { watchlist, removeFromWatchlist, searchHistory, setSearchHistory } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Data = reader.result;
      try {
        const { data } = await userAPI.updateProfile({ avatar: base64Data });
        if (data.success) {
          updateUser({ avatar: base64Data });
          toast.success('Profile picture updated successfully! 📸');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to upload profile picture.');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      toast.error('Error reading file');
      setUploading(false);
    };
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('tp_history');
    toast.success('Search history cleared');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="section-container pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card border rounded-2xl p-6 text-center" style={{ borderColor: 'var(--glass-border)' }}>
              <label htmlFor="avatar-input" className="relative group block w-20 h-20 mx-auto mb-4 cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white border border-blue-400/25 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-blue-400/50 shadow-lg">
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    user?.name?.[0] || 'U'
                  )}
                </div>
                
                {/* Hover camera overlay */}
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                </div>
                
                {/* Upload loader overlay */}
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/80 flex items-center justify-center">
                    <RefreshCw className="animate-spin text-blue-400" size={16} />
                  </div>
                )}
              </label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="avatar-input"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
              <h3 className="text-lg font-bold text-primary-color mb-1 truncate">{user?.name}</h3>
              <p className="text-xs text-muted-color mb-6 truncate">{user?.email}</p>

              <button
                onClick={handleLogout}
                className="btn-secondary w-full justify-center text-red-400 hover:bg-red-500/10 hover:border-red-500/30 flex items-center gap-2"
              >
                <LogOut size={16} /> Logout Account
              </button>
            </div>

            <div className="glass-card border rounded-2xl p-2 space-y-1" style={{ borderColor: 'var(--glass-border)' }}>
              {[
                { id: 'profile', label: 'User Account Info', icon: User },
                { id: 'watchlist', label: 'Starred Watchlist', icon: Bookmark },
                { id: 'history', label: 'Audits & History', icon: Settings },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${
                      activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-secondary-color hover:text-primary-color hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} /> {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Panel Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border rounded-2xl p-6 md:p-8 space-y-6"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <h2 className="text-2xl font-black text-primary-color">Account Information</h2>
                <p className="text-xs text-secondary-color mt-1">Manage credentials, review status limits, and registration details.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-color uppercase tracking-wider">
                      <User size={12} /> Full Display Name
                    </div>
                    <p className="text-sm font-bold text-primary-color">{user?.name}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-color uppercase tracking-wider">
                      <Mail size={12} /> Verified Email Address
                    </div>
                    <p className="text-sm font-bold text-primary-color">{user?.email}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-color uppercase tracking-wider">
                      <Shield size={12} /> Access Authorization Role
                    </div>
                    <p className="text-sm font-bold text-emerald-400 capitalize">{user?.role || 'Premium User'}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-color uppercase tracking-wider">
                      <Calendar size={12} /> Account Established
                    </div>
                    <p className="text-sm font-bold text-primary-color">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 mt-8">
                  <h4 className="text-sm font-bold text-primary-color mb-1 flex items-center gap-2">
                    <Key size={14} className="text-blue-400" /> API Access Keys
                  </h4>
                  <p className="text-xs text-secondary-color leading-relaxed">
                    Premium access keys are enabled for automatic sentiment aggregation. Keep your credentials private to prevent API threshold limit overruns.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'watchlist' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border rounded-2xl p-6 md:p-8 space-y-6"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-primary-color">Your Starred Watchlist</h2>
                    <p className="text-xs text-secondary-color mt-1">Instantly access saved companies and review dynamic updates.</p>
                  </div>
                  <span className="badge badge-purple text-xs font-bold">{watchlist.length} Companies</span>
                </div>

                <div className="border-t pt-6" style={{ borderColor: 'var(--glass-border)' }}>
                  {watchlist.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Bookmark size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No companies in your watchlist yet.</p>
                      <Link to="/dashboard" className="text-xs text-blue-400 font-bold hover:underline mt-2 inline-block">
                        Go Find Companies
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {watchlist.map(name => (
                        <div
                          key={name}
                          className="glass-card border rounded-xl p-4 flex items-center justify-between"
                          style={{ borderColor: 'var(--glass-border)' }}
                        >
                          <div
                            onClick={() => navigate(`/dashboard?q=${encodeURIComponent(name)}`)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-sm font-black text-white">
                              {name[0]}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-primary-color group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                {name} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </h4>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromWatchlist(name)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border rounded-2xl p-6 md:p-8 space-y-6"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-primary-color">Search Audit Logs</h2>
                    <p className="text-xs text-secondary-color mt-1">Audit log of analyzed company entities saved on this device.</p>
                  </div>
                  {searchHistory.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-red-400 font-bold hover:underline"
                    >
                      Clear Logs
                    </button>
                  )}
                </div>

                <div className="border-t pt-6" style={{ borderColor: 'var(--glass-border)' }}>
                  {searchHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Settings size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No search logs registered.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchHistory.map((query, i) => (
                        <div
                          key={i}
                          onClick={() => navigate(`/dashboard?q=${encodeURIComponent(query)}`)}
                          className="glass-card-static border rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                          style={{ borderColor: 'var(--glass-border)' }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-color font-bold"># {i + 1}</span>
                            <span className="text-sm font-bold text-primary-color">{query}</span>
                          </div>
                          <ArrowRight size={14} className="text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
