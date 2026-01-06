import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { useAuth } from '../Hooks/AuthContext';
import { apiFetch } from '../lib/api';

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return diffMonths <= 1 ? '1 month ago' : `${diffMonths} months ago`;
}

function Stars({ value }) {
  const full = Math.round(value || 0);
  return (
    <span style={{ color: '#c19a6b', fontSize: 14 }}>
      {Array.from({ length: 5 }).map((_, i) => (i < full ? '★' : '☆'))}
    </span>
  );
}

export default function ReviewsSection({ productId }) {
  const { isAuthed, user } = useAuth();
  const location = useLocation(); 
  const next = encodeURIComponent(location.pathname + location.search); 

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState(null);

  const [hasMyReview, setHasMyReview] = useState(false);

  async function reload(signal) {
    const options = signal ? { signal } : {};
    const res = await apiFetch(
      `/api/products/${productId}/reviews`,
      options
    );

    setReviews(res.reviews || []);
    setAverageRating(Number(res.averageRating || 0));
    setCount(Number(res.count || 0));

    const mine = (res.reviews || []).find(
      (r) => String(r.user_id) === String(user?.id)
    );

    if (mine) {
      setHasMyReview(true);
      setMyRating(mine.rating);   
      setMyComment('');
    } else {
      setHasMyReview(false);
      setMyRating(0);
      setMyComment('');
    }
  }

  useEffect(() => {
    if (!productId) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        await reload(ac.signal);
      } catch (e) {
        if (e.name !== 'AbortError') setErr(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [productId, user?.id]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!hasMyReview && !myRating) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitErr(null);

      const payload = {
        comment: myComment.trim() || null,
      };

      if (!hasMyReview || (myRating && Number.isFinite(myRating))) {
        payload.rating = myRating;
      }

      await apiFetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setMyComment('');
      await reload();
    } catch (e) {
      setSubmitErr(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      style={{
        borderRadius: 12,
        border: '1px solid #eee',
        background: '#fff',
        padding: '20px 24px',
      }}
    >
      <h2
        style={{
          fontSize: 18,
          margin: 0,
          marginBottom: 16,
          fontWeight: 600,
        }}
      >
        Customer Reviews
      </h2>

      <div style={{ marginBottom: 16, fontSize: 14, color: '#4b5563' }}>
        <Stars value={averageRating} />{' '}
        <span style={{ marginLeft: 8 }}>
          {averageRating.toFixed(1)} ({count} reviews)
        </span>
      </div>

      {loading && <p>Loading reviews…</p>}
      {err && (
        <p style={{ color: 'crimson' }}>{String(err.message || err)}</p>
      )}

      {reviews.map((r) => {
        const comments =
          r.comments && Array.isArray(r.comments) && r.comments.length
            ? r.comments
            : r.comment
            ? [{ id: r.id, comment: r.comment, created_at: r.created_at }]
            : [];

        return (
          <article
            key={r.id}
            style={{
              padding: '12px 0',
              borderTop: '1px solid #f3f4f6',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 4,
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>
                  {r.user_name}
                </div>
                <Stars value={r.rating} />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: '#4b5563',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {c.comment || 'No comment'}
                  </p>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatRelative(c.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        );
      })}

      {!loading && !reviews.length && (
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          No reviews yet. Be the first to review this product.
        </p>
      )}

      {!isAuthed && (
        <div
          style={{
            marginTop: 24,
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px dashed #e5e7eb',
            background: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: 14,
          }}
        >
         <span style={{ color: '#4b5563' }}>
  Want to share your thoughts?{' '}
  <span style={{ fontWeight: 600 }}>Log in</span> to write a review.
</span>
          <Link
            to={`/auth?next=${next}`}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #111827',
              background: '#111827',
              color: '#fff',
              fontSize: 13,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Sign in to review
          </Link>
        </div>
      )}

      {isAuthed && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            Write a Review
          </div>

          <div>
            <label
              style={{ display: 'block', fontSize: 13, marginBottom: 4 }}
            >
              Rating
            </label>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 5 }).map((_, i) => {
                const v = i + 1;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMyRating(v)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: 22,
                      cursor: 'pointer',
                      color: v <= myRating ? '#c19a6b' : '#d1d5db',
                    }}
                  >
                    ★
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              style={{ display: 'block', fontSize: 13, marginBottom: 4 }}
            >
              Comment (optional)
            </label>
            <textarea
              rows={3}
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                padding: 8,
                fontSize: 14,
              }}
            />
          </div>

          {submitErr && (
            <p style={{ color: 'crimson', fontSize: 13 }}>
              {String(submitErr.message || submitErr)}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || (!hasMyReview && !myRating)}
            style={{
              alignSelf: 'flex-start',
              marginTop: 4,
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              background: '#111827',
              color: '#fff',
              fontSize: 14,
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Saving…' : 'Submit review'}
          </button>
        </form>
      )}
    </section>
  );
}