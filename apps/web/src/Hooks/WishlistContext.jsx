import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistCtx = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthed, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const ids = useMemo(() => new Set(items.map(p => p.id)), [items]);
  const count = items.length;

  async function refresh() {
    if (authLoading) return;
    if (!isAuthed) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/wishlist');
      setItems(res?.items || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, [isAuthed, authLoading]);

  async function toggle(productId) {
    if (authLoading) throw new Error('Checking sign-in status…');
    if (!isAuthed) {
      const err = new Error('Not authenticated');
      err.status = 401;
      throw err;
    }

    const had = ids.has(productId);
    setItems(prev => (had ? prev.filter(p => p.id !== productId) : prev));

    try {
      const res = await apiFetch(`/api/wishlist/${productId}`, { method: 'POST' });
      
      await refresh();
      return res;
    } catch (e) {
      await refresh();
      throw e;
    }
  }

  async function remove(productId) {
    if (authLoading) throw new Error('Checking sign-in status…');
    if (!isAuthed) {
      const err = new Error('Not authenticated');
      err.status = 401;
      throw err;
    }

    setItems(prev => prev.filter(p => p.id !== productId));
    try {
      await apiFetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
    } catch (e) {
      await refresh();
      throw e;
    }
  }

  const value = { items, ids, count, loading, refresh, toggle, remove };
  return <WishlistCtx.Provider value={value}>{children}</WishlistCtx.Provider>;
}

export function useWishlist() {
  const v = useContext(WishlistCtx);
  if (!v) throw new Error('useWishlist must be used within WishlistProvider');
  return v;
}
