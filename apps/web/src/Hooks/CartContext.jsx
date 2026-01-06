import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './AuthContext';

const CartCtx = createContext(null);

function extractItemsAndCount(payload) {
  const items =
    (Array.isArray(payload) ? payload :

    Array.isArray(payload?.items) ? payload.items :
    Array.isArray(payload?.cart?.items) ? payload.cart.items :

    Array.isArray(payload?.data) ? payload.data :
    Array.isArray(payload?.data?.items) ? payload.data.items :
    Array.isArray(payload?.data?.cart?.items) ? payload.data.cart.items :

    Array.isArray(payload?.data?.cartItems) ? payload.data.cartItems :
    Array.isArray(payload?.cartItems) ? payload.cartItems :

    []);

  const count = items.reduce((sum, it) => {
    const q = Number(it.qty ?? it.quantity ?? it.count ?? 0);
    return sum + (Number.isFinite(q) ? q : 0);
  }, 0);

  return { items, count };
}


export function CartProvider({ children }) {
  const { isAuthed, loading: authLoading } = useAuth();

  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function refresh(signal) {
    if (authLoading || !isAuthed) {
      setCount(0);
      setErr(null);
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch('/api/cart', { signal });
      const { count } = extractItemsAndCount(res);
      setCount(count);
    } catch (e) {
      if (e?.status === 401) {
        setCount(0);
        setErr(null);
      } else {
        setErr(e);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ac = new AbortController();

    if (!authLoading && isAuthed) refresh(ac.signal);
    if (!authLoading && !isAuthed) setCount(0);

    return () => ac.abort();
  }, [authLoading, isAuthed]);

  const value = useMemo(() => ({
    count,
    loading,
    err,
    refresh,
    setCount, 
  }), [count, loading, err]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const v = useContext(CartCtx);
  if (!v) throw new Error('useCart must be used within CartProvider');
  return v;
}
