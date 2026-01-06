import { useEffect, useState } from 'react';
import { useAuth } from '../../Hooks/AuthContext';
import { apiFetch } from '../../lib/api';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  Users,
  ShoppingBag,
  BarChart3,
  Plus,
  Eye,
  Edit2,
  Trash2,
  LogOut,
  ExternalLink,
  DollarSign,
} from 'lucide-react';

function money(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format((cents || 0) / 100);
}

const CUSTOMER_INSIGHTS = {
  totalCustomers: 89,
  avgRating: 4.8,
  avgOrderValue: 140,
};

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function monthLabelFromDate(maybeDate) {
  if (!maybeDate) return '';
  const d = new Date(maybeDate);
  const m = d.getMonth();
  return MONTH_LABELS[m] || '';
}

const actionBtnClass =
  'tw-h-8 tw-w-8 tw-rounded-full tw-border tw-border-gray-200 tw-bg-white tw-flex tw-items-center tw-justify-center hover:tw-bg-gray-50 tw-transition-colors';

export default function SellerDashboard() {
  const { isAuthed, loading: authLoading, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [prodErr, setProdErr] = useState(null);

  const [editing, setEditing] = useState(null); 
  const [form, setForm] = useState({
    title: '',
    price_cents: '',
    stock_qty: '',
    thumbnail: '',
  });

  const [showForm, setShowForm] = useState(false);

  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsErr, setMetricsErr] = useState(null);

  const isSeller =
    isAuthed && (user?.role === 'seller' || user?.role === 'admin');

  async function loadProducts(signal) {
    setLoadingProducts(true);
    setProdErr(null);
    try {
      const res = await apiFetch('/api/seller/products', { signal });
      setProducts(res.products || []);
    } catch (e) {
      if (e.name !== 'AbortError') setProdErr(e);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadMetrics(signal) {
    setMetricsLoading(true);
    setMetricsErr(null);
    try {
      const res = await apiFetch('/api/seller/dashboard/metrics', { signal });
      setMetrics(res);
    } catch (e) {
      if (e.name !== 'AbortError') setMetricsErr(e);
    } finally {
      setMetricsLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isSeller) return;
    const ac = new AbortController();
    loadProducts(ac.signal);
    loadMetrics(ac.signal);
    return () => ac.abort();
  }, [authLoading, isSeller]);

  function onFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startAdd() {
    setEditing(null);
    setForm({
      title: '',
      price_cents: '',
      stock_qty: '',
      thumbnail: '',
    });
    setShowForm(true);
  }

  function startEdit(p) {
    setEditing(p);
    setForm({
      title: p.title || '',
      price_cents: p.price_cents ?? '',
      stock_qty: p.stock_qty ?? '',
      thumbnail: p.thumbnail || '',
    });
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title || !form.price_cents) return;

    const body = {
      title: form.title,
      price_cents: Number(form.price_cents),
      stock_qty: form.stock_qty === '' ? null : Number(form.stock_qty),
      thumbnail: form.thumbnail || null,
    };

    try {
      if (editing) {
        await apiFetch(`/api/seller/products/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch('/api/seller/products', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      await loadProducts();
      setEditing(null);
      setShowForm(false);
    } catch (e2) {
      setProdErr(e2);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await apiFetch(`/api/seller/products/${id}`, { method: 'DELETE' });
      await loadProducts();
    } catch (e) {
      setProdErr(e);
    }
  }

  async function handleLogout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (e) {
      console.error(e);
    }
  }

  if (authLoading) {
    return (
      <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-animate-pulse tw-text-muted-foreground">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-items-center tw-justify-center tw-p-4">
        <Card className="tw-w-full tw-max-w-md tw-bg-white tw-border-gray-200">
          <CardHeader className="tw-text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be signed in as a seller or admin to view this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalSalesCents = metrics?.summary?.totalSalesCents ?? 0;
  const ordersCount = metrics?.summary?.ordersCount ?? 0;
  const customersCount = metrics?.summary?.customersCount ?? 0;
  const totalProducts = metrics?.summary?.productsCount ?? products.length;

  function AnalyticsTab({ metrics, loading, error }) {
    const monthly = metrics?.charts?.monthlySales || [];
    const ordersTrend = metrics?.charts?.ordersTrend || [];
    const categoryDist = metrics?.charts?.categoryDistribution || [];

    return (
      <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-7 tw-gap-6">
        <Card className="lg:tw-col-span-4 tw-bg-white tw-border-gray-200 tw-shadow-sm">
          <CardHeader className="tw-pb-4">
            <CardTitle className="tw-text-base tw-font-heading tw-flex tw-items-center tw-gap-2">
              <BarChart3 className="tw-h-4 tw-w-4 tw-text-primary" />
              Monthly Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="tw-text-destructive tw-text-sm tw-mb-4">
                {String(error.message || error)}
              </p>
            )}
            <MonthlySalesChart data={monthly} loading={loading} />
          </CardContent>
        </Card>

        <Card className="lg:tw-col-span-3 tw-bg-white tw-border-gray-200 tw-shadow-sm">
          <CardHeader className="tw-pb-4">
            <CardTitle className="tw-text-base tw-font-heading tw-flex tw-items-center tw-gap-2">
              <Package className="tw-h-4 tw-w-4 tw-text-primary" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart data={categoryDist} loading={loading} />
          </CardContent>
        </Card>

        <Card className="lg:tw-col-span-7 tw-bg-white tw-border-gray-200 tw-shadow-sm">
          <CardHeader className="tw-pb-4">
            <CardTitle className="tw-text-base tw-font-heading tw-flex tw-items-center tw-gap-2">
              <ShoppingBag className="tw-h-4 tw-w-4 tw-text-primary" />
              Orders Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersTrendChart data={ordersTrend} loading={loading} />
          </CardContent>
        </Card>
      </div>
    );
  }

  function MonthlySalesChart({ data, loading }) {
    const [hover, setHover] = useState(null); 

    let points = (data || []).map((row) => ({
      label: monthLabelFromDate(row.month),
      value: Math.round((row.total_cents || 0) / 100),
    }));

    if (!points.length) {
      points = [
        { label: 'Jan', value: 0 },
        { label: 'Feb', value: 0 },
        { label: 'Mar', value: 0 },
        { label: 'Apr', value: 0 },
        { label: 'May', value: 0 },
        { label: 'Jun', value: 0 },
      ];
    }

    const max = Math.max(...points.map((p) => p.value), 1);
    const steps = 4;
    const stepValue = Math.ceil(max / steps / 100) * 100 || 1;
    const totalRange = stepValue * steps || 1;
    const yTicks = [];
    for (let i = 0; i <= steps; i++) yTicks.push(stepValue * i);

    return (
      <div style={{ height: 260, position: 'relative' }}>
        {loading && (
          <p style={{ fontSize: 12, opacity: 0.7 }}>Loading chart…</p>
        )}

        <div
          style={{
            position: 'relative',
            height: '100%',
            paddingLeft: 32,
            paddingBottom: 28,
          }}
        >
          {yTicks.map((v) => (
            <div
              key={v}
              style={{
                position: 'absolute',
                left: 32,
                right: 0,
                bottom: 28 + (v / totalRange) * 200,
                borderTop: '1px dashed #e5e7eb',
                fontSize: 10,
                color: '#999',
              }}
            >
              <span style={{ position: 'absolute', left: -30 }}>{v}</span>
            </div>
          ))}

          <div
            style={{
              position: 'absolute',
              left: 32,
              right: 0,
              bottom: 28,
              top: 20,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
            }}
          >
            {points.map((d) => {
              const heightPct = d.value / totalRange;
              const isActive = hover && hover.label === d.label;

              return (
                <div
                  key={d.label}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHover(d)}
                  onMouseLeave={() => setHover(null)}
                >
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: `${heightPct * 100 + 45}%`,
                        transform: 'translateX(-50%)',
                        left: '50%',
                        padding: '6px 10px',
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 6,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        fontSize: 11,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{d.label}</div>
                      <div style={{ opacity: 0.8 }}>sales : {d.value}</div>
                    </div>
                  )}

                  <div
                    style={{
                      width: 32,
                      height: `${heightPct * 100}%`,
                      borderRadius: 4,
                      backgroundColor: '#c19a6b',
                      transition: 'opacity 0.15s ease',
                      opacity: isActive ? 0.9 : 0.7,
                    }}
                  />
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: '#666',
                    }}
                  >
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function CategoryDistributionChart({ data, loading }) {
    const [hover, setHover] = useState(null); 

    const segments = (data || []).map((row, idx) => ({
      label: row.label || `Item ${idx + 1}`,
      percentage: row.percentage || 0,
      items: row.items || 0,
      color:
        [
          '#c19a6b',
          '#333333',
          '#b3b3b3',
          '#e5e5e5',
          '#8c8c8c',
          '#d4c4ad',
        ][idx] || '#e5e5e5',
    }));

    let currentAngle = 0;
    const stops = segments.map((s) => {
      const start = currentAngle;
      const angle = ((s.percentage || 0) / 100) * 360;
      currentAngle += angle;
      return { ...s, start, end: start + angle };
    });

    const bg = stops
      .map((s) => `${s.color} ${s.start}deg ${s.end}deg`)
      .join(', ');

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '160px 1fr',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 160,
            height: 160,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundImage: `conic-gradient(${bg || '#f0f0f0 0deg 360deg'
                })`,
              boxShadow: '0 0 0 4px #fff',
            }}
          />
          {hover && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '6px 10px',
                background: '#fff',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontSize: 11,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontWeight: 600 }}>{hover.label}</div>
              <div style={{ opacity: 0.8 }}>
                {hover.items} items ({hover.percentage}%)
              </div>
            </div>
          )}
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13 }}>
          {segments.map((s) => (
            <li
              key={s.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 6,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(null)}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: s.color,
                  display: 'inline-block',
                  marginRight: 8,
                }}
              />
              <span style={{ color: '#555' }}>
                {s.label} {s.percentage}%
              </span>
            </li>
          ))}
          {!segments.length && !loading && (
            <li style={{ fontSize: 12, opacity: 0.7 }}>No data yet.</li>
          )}
        </ul>
      </div>
    );
  }

  function OrdersTrendChart({ data, loading }) {
    const [hover, setHover] = useState(null); 

    let points = (data || []).map((row) => ({
      label: monthLabelFromDate(row.month),
      value: Number(row.order_count || 0),
    }));

    if (!points.length) {
      points = [
        { label: 'Jan', value: 0 },
        { label: 'Feb', value: 0 },
        { label: 'Mar', value: 0 },
        { label: 'Apr', value: 0 },
        { label: 'May', value: 0 },
        { label: 'Jun', value: 0 },
      ];
    }

    const max = Math.max(...points.map((p) => p.value), 1);
    const width = 600;
    const height = 220;
    const paddingLeft = 40;
    const paddingBottom = 30;

    const usableWidth = width - paddingLeft - 20;
    const usableHeight = height - paddingBottom - 20;

    const svgPoints = points
      .map((p, i) => {
        const x =
          paddingLeft + (usableWidth / (points.length - 1 || 1)) * i;
        const y = 20 + usableHeight - (p.value / max) * usableHeight;
        return `${x},${y}`;
      })
      .join(' ');

    const tooltip = hover && (
      <div
        style={{
          position: 'absolute',
          left: `${hover.xRatio * 100}%`,
          top: `${hover.yRatio * 100}%`,
          transform: 'translate(-50%, -120%)',
          padding: '6px 10px',
          background: '#fff',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: 11,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ fontWeight: 600 }}>{hover.label}</div>
        <div style={{ opacity: 0.8 }}>orders : {hover.value}</div>
      </div>
    );

    return (
      <div style={{ position: 'relative' }}>
        {loading && (
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
            Loading chart…
          </p>
        )}

        {tooltip}

        <svg width="100%" height={height}>
          {[0, max / 4, (max / 4) * 2, (max / 4) * 3, max].map((v, idx) => {
            const y = 20 + usableHeight - (v / max) * usableHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  x2={width - 20}
                  y1={y}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  fontSize="10"
                  fill="#999"
                  textAnchor="end"
                >
                  {Math.round(v)}
                </text>
              </g>
            );
          })}

          <polyline
            fill="none"
            stroke="#111"
            strokeWidth="2"
            points={svgPoints}
          />

          {points.map((p, i) => {
            const x =
              paddingLeft + (usableWidth / (points.length - 1 || 1)) * i;
            const y = 20 + usableHeight - (p.value / max) * usableHeight;

            return (
              <g key={p.label}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#ffffff"
                  stroke="#111"
                  strokeWidth="1.5"
                  onMouseEnter={() =>
                    setHover({
                      label: p.label,
                      value: p.value,
                      xRatio: x / width,
                      yRatio: y / height,
                    })
                  }
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                />
                <text
                  x={x}
                  y={height - 8}
                  fontSize="11"
                  fill="#666"
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  function OrdersTab() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
      const ac = new AbortController();
      loadOrders(ac.signal);
      return () => ac.abort();
    }, []);

    async function loadOrders(signal) {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiFetch('/api/seller/dashboard/orders', { signal });
        setOrders(res.orders || []);
      } catch (e) {
        if (e.name !== 'AbortError') setErr(e);
      } finally {
        setLoading(false);
      }
    }

    async function handleStatusChange(id, newStatus) {
      const oldOrders = orders;
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );

      try {
        await apiFetch(`/api/seller/dashboard/orders/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (e) {
        console.error(e);
        setOrders(oldOrders);
      }
    }

    function badgeColorClasses(status) {
  const s = (status || '').toLowerCase();

  if (s === 'completed') {
    return 'tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200';
  }

  if (s === 'pending') {
    return 'tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200';
  }

  if (s === 'shipped') {
    return 'tw-bg-gray-50 tw-text-gray-700 tw-border-gray-200';
  }

  return 'tw-bg-gray-50 tw-text-gray-600 tw-border-gray-200';
}

    return (
      <Card className="tw-bg-white tw-border-gray-200 tw-shadow-sm">
        <CardHeader className="tw-pb-4">
          <CardTitle className="tw-text-base tw-font-heading">
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {err && (
            <div className="tw-text-destructive tw-text-sm tw-mb-4">
              {String(err.message || err)}
            </div>
          )}
          {loading && (
            <div className="tw-text-sm tw-text-muted-foreground">
              Loading orders...
            </div>
          )}

          <div className="tw-space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-justify-between tw-gap-4 tw-p-4 tw-rounded-lg tw-bg-gray-50/50 tw-border tw-border-gray-100 hover:tw-border-gray-200 tw-transition-colors"
              >
                <div>
                  <div className="tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                    {o.number}
                  </div>
                  <div className="tw-text-sm tw-text-secondary">
                    {o.customer}
                  </div>
                </div>

                <div className="tw-text-sm tw-font-bold tw-text-foreground">
                  {money(o.amount_cents, 'USD')}
                </div>

                <div className="tw-flex tw-items-center tw-gap-3 sm:tw-justify-end">
                  <select
                    value={(o.status || '').toLowerCase()}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="tw-text-xs tw-py-1 tw-px-2 tw-rounded-md tw-border tw-border-gray-200 tw-bg-white hover:tw-bg-gray-50 tw-cursor-pointer focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-primary"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                  </select>

                  <Badge
  variant="outline"
  className={`tw-capitalize tw-text-xs tw-font-medium tw-px-3 tw-py-1 ${badgeColorClasses(o.status)}`}
>
  {o.status}
</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  function CustomerMetricCard({ icon, value, label }) {
    return (
      <Card className="tw-bg-gray-50/50 tw-border-gray-100 dark:tw-bg-gray-900 dark:tw-border-gray-800">
        <CardContent className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-6 tw-text-center tw-h-full">
          <div className="tw-text-3xl tw-mb-3">{icon}</div>
          <div className="tw-text-2xl tw-font-bold tw-text-foreground tw-mb-1">
            {value}
          </div>
          <div className="tw-text-sm tw-text-muted-foreground">{label}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-gray-50 tw-pb-20">
      <div className="tw-container tw-max-w-7xl tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-space-y-8">
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-bg-white tw-p-6 tw-rounded-xl tw-border tw-border-gray-100 tw-shadow-sm">
            <div>
              <h1 className="tw-text-2xl tw-font-heading tw-font-bold tw-text-foreground">
                Seller Dashboard
              </h1>
              <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                Welcome back,{' '}
                <span className="tw-font-medium tw-text-foreground">
                  {user?.first_name || user?.name || 'Seller'}
                </span>
              </p>
            </div>
            <div className="tw-flex tw-items-center tw-gap-3 tw-mt-4 md:tw-mt-0">
              <Button
                variant="outline"
                size="sm"
                className="tw-gap-2"
                asChild
              >
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="tw-h-4 tw-w-4" />
                  View Site
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="tw-gap-2 tw-text-muted-foreground hover:tw-text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="tw-h-4 tw-w-4" />
                Logout
              </Button>
            </div>
          </div>

          <section className="tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
            <DashCard
              label="Total Sales"
              value={money(totalSalesCents)}
              sub="+12% from last month"
              icon={<DollarSign className="tw-h-5 tw-w-5 tw-text-primary" />}
            />
            <DashCard
              label="Orders"
              value={ordersCount.toString()}
              sub="+8% from last month"
              icon={<Package className="tw-h-5 tw-w-5 tw-text-primary" />}
            />
            <DashCard
              label="Customers"
              value={customersCount.toString()}
              sub="+15% from last month"
              icon={<Users className="tw-h-5 tw-w-5 tw-text-primary" />}
            />
            <DashCard
              label="Products"
              value={totalProducts.toString()}
              sub="+3% from last month"
              icon={<ShoppingBag className="tw-h-5 tw-w-5 tw-text-primary" />}
            />
          </section>

          <Tabs defaultValue="analytics" className="tw-w-full">
            <TabsList className="tw-w-full sm:tw-w-auto tw-min-w-[400px] tw-grid tw-grid-cols-4 tw-rounded-lg tw-bg-gray-100/80 tw-p-1 tw-mx-auto md:tw-mx-0">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
            </TabsList>

            <div className="tw-mt-8">
              <TabsContent value="analytics">
                <AnalyticsTab
                  metrics={metrics}
                  loading={metricsLoading}
                  error={metricsErr}
                />
              </TabsContent>

              <TabsContent value="orders">
                <OrdersTab />
              </TabsContent>

              <TabsContent value="customers">
                <Card className="tw-bg-white tw-border-gray-200">
                  <CardHeader>
                    <CardTitle className="tw-text-base tw-font-heading">
                      Customer Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metricsErr && (
                      <p className="tw-text-destructive tw-mb-4">
                        {String(metricsErr.message || metricsErr)}
                      </p>
                    )}
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
                      <CustomerMetricCard
                        icon="👥"
                        value={
                          metrics?.customers?.totalCustomers ??
                          CUSTOMER_INSIGHTS.totalCustomers
                        }
                        label="Total Customers"
                      />
                      <CustomerMetricCard
                        icon="★"
                        value={
                          metrics?.customers?.avgRating != null
                            ? Number(
                              metrics.customers.avgRating
                            ).toFixed(1)
                            : CUSTOMER_INSIGHTS.avgRating
                        }
                        label="Average Rating"
                      />
                      <CustomerMetricCard
                        icon="$"
                        value={
                          metrics?.customers?.avgOrderValueCents != null
                            ? money(
                              metrics.customers.avgOrderValueCents
                            )
                            : `$${CUSTOMER_INSIGHTS.avgOrderValue}`
                        }
                        label="Avg Order Value"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products">
                <section className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-8 tw-items-start">
                  <Card className="lg:tw-col-span-2 tw-bg-white tw-border-gray-200 tw-shadow-sm">
                    <CardHeader className="tw-pb-3">
                      <div className="tw-flex tw-justify-between tw-items-center">
                        <CardTitle className="tw-text-base tw-font-heading">
                          Product Management
                        </CardTitle>
                        <Button size="sm" onClick={startAdd} className="tw-h-8">
                          <Plus className="tw-h-4 tw-w-4 tw-mr-1.5" />
                          Add Product
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingProducts && (
                        <p className="tw-text-sm tw-text-muted-foreground">
                          Loading products...
                        </p>
                      )}
                      {prodErr && (
                        <p className="tw-text-destructive tw-text-sm">
                          {String(prodErr.message || prodErr)}
                        </p>
                      )}

                      {!loadingProducts && products.length === 0 && (
                        <p className="tw-text-sm tw-text-muted-foreground tw-py-4">
                          No products found.
                        </p>
                      )}

                      <div className="tw-space-y-1">
                        {products.map((p) => (
                          <div
                            key={p.id}
                            className="tw-flex tw-items-center tw-justify-between tw-py-3 tw-border-b tw-border-gray-50 last:tw-border-0"
                          >
                            <div>
                              <div className="tw-font-medium tw-text-sm tw-text-foreground">
                                {p.title}
                              </div>
                              <div className="tw-text-xs tw-text-muted-foreground tw-mt-0.5">
                                Stock: {p.stock_qty ?? 0} | Sales:{' '}
                                {p.sales_count ?? 0}
                              </div>
                            </div>

                            <div className="tw-flex tw-items-center tw-gap-2">
                              <div className="tw-font-semibold tw-text-sm tw-mr-4">
                                {money(
                                  p.price_cents || 0,
                                  p.currency || 'USD'
                                )}
                              </div>

                              <button
                                className={actionBtnClass}
                                onClick={() =>
                                  window.open(
                                    `/products/${p.slug || p.id}`,
                                    '_blank'
                                  )
                                }
                                title="View"
                              >
                                <Eye className="tw-h-4 tw-w-4 tw-text-gray-500" />
                              </button>
                              <button
                                className={actionBtnClass}
                                onClick={() => startEdit(p)}
                                title="Edit"
                              >
                                <Edit2 className="tw-h-4 tw-w-4 tw-text-gray-500" />
                              </button>
                              <button
                                className={actionBtnClass}
                                onClick={() => deleteProduct(p.id)}
                                title="Delete"
                              >
                                <Trash2 className="tw-h-4 tw-w-4 tw-text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {(showForm || editing) && (
                    <Card className="tw-bg-white tw-border-gray-200 tw-sticky tw-top-24">
                      <CardHeader className="tw-pb-4">
                        <div className="tw-flex tw-justify-between tw-items-center">
                          <CardTitle className="tw-text-base tw-font-heading">
                            {editing ? 'Edit Product' : 'Add Product'}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditing(null);
                              setShowForm(false);
                            }}
                            className="tw-h-6 tw-px-2 tw-text-muted-foreground hover:tw-text-foreground"
                          >
                            Close
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <form
                          onSubmit={handleSave}
                          className="tw-space-y-4"
                        >
                          <div className="tw-space-y-1.5">
                            <label className="tw-text-sm tw-font-medium">
                              Title *
                            </label>
                            <input
                              className="tw-flex tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-transparent tw-px-3 tw-py-1 tw-text-sm tw-shadow-sm tw-transition-colors file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                              name="title"
                              value={form.title}
                              onChange={onFormChange}
                              required
                            />
                          </div>
                          <div className="tw-space-y-1.5">
                            <label className="tw-text-sm tw-font-medium">
                              Price (cents) *
                            </label>
                            <input
                              className="tw-flex tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-transparent tw-px-3 tw-py-1 tw-text-sm tw-shadow-sm tw-transition-colors file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                              name="price_cents"
                              type="number"
                              min="0"
                              value={form.price_cents}
                              onChange={onFormChange}
                              required
                            />
                          </div>
                          <div className="tw-space-y-1.5">
                            <label className="tw-text-sm tw-font-medium">
                              Stock Qty
                            </label>
                            <input
                              className="tw-flex tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-transparent tw-px-3 tw-py-1 tw-text-sm tw-shadow-sm tw-transition-colors file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                              name="stock_qty"
                              type="number"
                              min="0"
                              value={form.stock_qty}
                              onChange={onFormChange}
                            />
                          </div>
                          <div className="tw-space-y-1.5">
                            <label className="tw-text-sm tw-font-medium">
                              Thumbnail URL
                            </label>
                            <input
                              className="tw-flex tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-transparent tw-px-3 tw-py-1 tw-text-sm tw-shadow-sm tw-transition-colors file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                              name="thumbnail"
                              value={form.thumbnail}
                              onChange={onFormChange}
                              placeholder="/images/..."
                            />
                          </div>
                          <Button type="submit" className="tw-w-full">
                            {editing ? 'Save changes' : 'Create product'}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </section>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function DashCard({ label, value, sub, icon }) {
  return (
    <Card className="tw-bg-white tw-border-gray-200 tw-shadow-sm tw-h-full">
      <CardContent className="tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-h-full">
        <div className="tw-mb-3 tw-p-3 tw-rounded-full tw-bg-gray-50 tw-flex tw-items-center tw-justify-center">
          {icon}
        </div>
        <div className="tw-space-y-1">
          <div className="tw-text-sm tw-font-medium tw-text-muted-foreground">
            {label}
          </div>
          <div className="tw-text-2xl tw-font-bold tw-text-foreground">
            {value}
          </div>
          <div className="tw-text-xs tw-text-emerald-600 tw-font-medium">
            {sub}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}