import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { companyAPI, watchlistAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('tp_theme') || 'dark');

  // Company state
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Trending
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  // Top Rated & Lowest Rated
  const [topRated, setTopRated] = useState([]);
  const [topRatedLoading, setTopRatedLoading] = useState(false);
  const [lowestRated, setLowestRated] = useState([]);
  const [lowestRatedLoading, setLowestRatedLoading] = useState(false);

  // Comparison
  const [compareList, setCompareList] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);

  // Watchlist
  const [watchlist, setWatchlist] = useState([]);

  // Search history (local)
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tp_history') || '[]'); } catch { return []; }
  });

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tp_theme', theme);
  }, [theme]);

  // Fetch watchlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      watchlistAPI.get()
        .then(({ data }) => setWatchlist(data.data || []))
        .catch(() => {});
    } else {
      setWatchlist([]);
    }
  }, [isAuthenticated]);

  // Fetch company
  const searchCompany = useCallback(async (name) => {
    if (!name?.trim()) return;
    setLoading(true);
    setError(null);
    setSearchQuery(name);

    // Update history
    const updated = [name, ...searchHistory.filter(h => h !== name)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('tp_history', JSON.stringify(updated));

    try {
      const { data } = await companyAPI.getCompany(name.trim());
      setCompany(data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch company data. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [searchHistory]);

  // Fetch trending
  const fetchTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const { data } = await companyAPI.getTrending();
      setTrending(data.data || []);
    } catch {
      // Silently fail trending
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  // Fetch top rated
  const fetchTopRated = useCallback(async (ind) => {
    setTopRatedLoading(true);
    try {
      const { data } = await companyAPI.getTopRated(ind);
      setTopRated(data.data || []);
    } catch {
      // Silently fail top-rated
    } finally {
      setTopRatedLoading(false);
    }
  }, []);

  // Fetch lowest rated
  const fetchLowestRated = useCallback(async () => {
    setLowestRatedLoading(true);
    try {
      const { data } = await companyAPI.getLowestRated();
      setLowestRated(data.data || []);
    } catch {
      // Silently fail lowest-rated
    } finally {
      setLowestRatedLoading(false);
    }
  }, []);

  // Compare companies
  const compareCompanies = useCallback(async (names) => {
    if (!names || names.length < 2) return toast.error('Select at least 2 companies to compare');
    setCompareLoading(true);
    try {
      const { data } = await companyAPI.compare(names);
      setCompareData(data.data || []);
    } catch (err) {
      toast.error('Comparison failed. Please try again.');
    } finally {
      setCompareLoading(false);
    }
  }, []);

  // Watchlist
  const addToWatchlist = useCallback(async (name) => {
    if (!isAuthenticated) return toast.error('Please login to save companies');
    try {
      const { data } = await watchlistAPI.add(name);
      setWatchlist(data.data);
      toast.success(`${name} added to watchlist ⭐`);
    } catch { toast.error('Failed to update watchlist'); }
  }, [isAuthenticated]);

  const removeFromWatchlist = useCallback(async (name) => {
    try {
      const { data } = await watchlistAPI.remove(name);
      setWatchlist(data.data);
      toast.success(`${name} removed from watchlist`);
    } catch { toast.error('Failed to update watchlist'); }
  }, []);

  const isWatched = useCallback((name) =>
    watchlist.some(w => w.toLowerCase() === name?.toLowerCase()),
  [watchlist]);

  const clearCompany = useCallback(() => {
    setCompany(null);
    setError(null);
    setSearchQuery('');
  }, []);

  return (
    <AppContext.Provider value={{
      theme, setTheme,
      company, loading, error, searchQuery,
      searchCompany, clearCompany,
      trending, trendingLoading, fetchTrending,
      topRated, topRatedLoading, fetchTopRated,
      lowestRated, lowestRatedLoading, fetchLowestRated,
      compareList, setCompareList,
      compareData, compareCompanies, compareLoading,
      watchlist, addToWatchlist, removeFromWatchlist, isWatched,
      searchHistory, setSearchHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export default AppContext;
