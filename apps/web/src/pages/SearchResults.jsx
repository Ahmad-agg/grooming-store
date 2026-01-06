import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

function money(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency })
    .format((cents || 0) / 100);
}

export default function SearchResults() {
  const q = useQuery().get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!q.trim()) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await apiFetch(
          `/api/search?q=${encodeURIComponent(q)}`,
          { signal: ac.signal }
        );
        setResults(res.results || []);
      } catch (e) {
        if (e.name !== 'AbortError') setErr(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [q]);

  return (
    <main className="container" style={{ marginTop: 24, marginBottom: 40 }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>
        Search results for: <span style={{ fontWeight: 600 }}>"{q}"</span>
      </h1>

      {loading && <p>Searching…</p>}
      {err && (
        <p style={{ color: 'crimson' }}>
          {String(err.message || err)}
        </p>
      )}

      {!loading && !err && results.length === 0 && q && (
        <p>No products matched your search.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
          marginTop: 16,
        }}
      >
        {results.map((p) => (
          <article
            key={p.id}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 12,
              background: '#fff',
            }}
          >
            <div
              style={{
                aspectRatio: '1/1',
                background: '#f7f7f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <img
                src={p.thumbnail || '/placeholder.png'}
                alt={p.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
            <h2 style={{ fontSize: 16, margin: '0 0 4px' }}>{p.title}</h2>
            <div style={{ fontSize: 14, marginBottom: 4 }}>
              {money(p.price_cents, p.currency)}
            </div>
            {typeof p.rating === 'number' && (
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                ★ {p.rating.toFixed(1)}
              </div>
            )}
            <Link
              to={`/products/${p.slug || p.id}`}
              style={{ display: 'inline-block', marginTop: 8, fontSize: 14 }}
            >
              View product
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}