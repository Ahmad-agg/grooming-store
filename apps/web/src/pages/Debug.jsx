import { apiFetch, API_BASE } from '../lib/api';

export default function Debug() {
  const env = import.meta.env; 
  return (
    <div className="container my-4">
      <h1>Debug</h1>

      <h2 className="h5 mt-4">Vite Environment</h2>
      <ul className="list-unstyled">
        <li><strong>MODE:</strong> {String(env.MODE)}</li>
        <li><strong>DEV:</strong> {String(env.DEV)}</li>
        <li><strong>PROD:</strong> {String(env.PROD)}</li>
        <li><strong>BASE_URL:</strong> {String(env.BASE_URL)}</li>
      </ul>

      <h2 className="h5 mt-4">Custom (VITE_* vars)</h2>
      <p className="text-muted">
        جرّب لاحقًا إضافة متغير في ملف <code>.env</code> مثل <code>VITE_API_URL</code> وتحقق أنه يظهر هنا.
      </p>

      <div className="mt-4">
  <div
    style={{
      width: 100, height: 100,
      transition: 'transform 200ms',
      background: '#e9ecef'
    }}
    className="tw-inline-block"
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
  />
  <p className="text-muted mt-2">حرّك الماوس فوق المربع لملاحظة الحركة.</p>
</div>



<h2 className="h5 mt-4">API</h2>
<p className="text-muted">Base: {API_BASE}</p>

<button
  className="btn btn-outline-primary btn-sm"
  onClick={async () => {
    const out = document.getElementById('debug-api-result');
    out.textContent = 'Loading...';
    try {
      const data = await apiFetch('/healthz'); 
      out.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      out.textContent = `Error: ${err.message}`;
    }
  }}
>
  Ping /healthz
</button>

<pre id="debug-api-result" className="mt-3 bg-light p-3 rounded small"></pre>




<h3 className="h6 mt-4">Catalog</h3>

<div className="d-flex gap-2">
  <button
    className="btn btn-outline-secondary btn-sm"
    onClick={async () => {
      const out = document.getElementById('debug-categories-result');
      out.textContent = 'Loading...';
      try {
        const data = await apiFetch('/api/categories');
        out.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        out.textContent = `Error: ${err.message}`;
      }
    }}
  >
    List Categories
  </button>

  <button
    className="btn btn-outline-secondary btn-sm"
    onClick={async () => {
      const out = document.getElementById('debug-products-result');
      out.textContent = 'Loading...';
      try {
        const data = await apiFetch('/api/products?page=1&limit=12');
        out.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        out.textContent = `Error: ${err.message}`;
      }
    }}
  >
    List Products (page=1, limit=12)
  </button>
  
</div>

<pre id="debug-categories-result" className="mt-3 bg-light p-3 rounded small"></pre>
<pre id="debug-products-result"   className="mt-3 bg-light p-3 rounded small"></pre>


    </div>

    
  );
}
