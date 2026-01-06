import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  ArrowRight,
  ShoppingBag,
  Calendar,
  CreditCard,
} from 'lucide-react';

import { useAuth } from '../Hooks/AuthContext';
import { apiFetch } from '../lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function money(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format((cents || 0) / 100);
}

function formatOrderStatus(status, paymentStatus) {
  const s = (status || paymentStatus || '').toLowerCase();

  let label = status || paymentStatus || 'Unknown';
  let className = 'tw-bg-gray-50 tw-text-gray-600 tw-border-gray-200';

  if (s === 'completed' || s === 'paid') {
    label = 'Completed';
    className =
      'tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200';
  } else if (s === 'pending') {
    label = 'Pending';
    className =
      'tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200';
  } else if (s === 'shipped') {
    label = 'Shipped';
    className =
      'tw-bg-gray-50 tw-text-gray-700 tw-border-gray-200';
  } else if (s === 'cancelled') {
    label = 'Cancelled';
    className = 'tw-bg-red-50 tw-text-red-700 tw-border-red-200';
  }

  return { label, className };
}

export default function MyOrders() {
  const { isAuthed, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (authLoading || !isAuthed) return;

    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await apiFetch('/api/orders', { signal: ac.signal });
        setOrders(res.orders || []);
      } catch (e) {
        if (e.name !== 'AbortError') setErr(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [authLoading, isAuthed]);

  if (authLoading) {
    return (
      <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-animate-pulse tw-text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-items-center tw-justify-center tw-p-4">
        <Card className="tw-w-full tw-max-w-md tw-bg-white tw-border-gray-200">
          <CardHeader className="tw-text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to view your orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="tw-flex tw-justify-center">
            <Button asChild>
              <Link
                to="/auth"
                className="hover:tw-text-primary-foreground"
              >
                Go to Login / Register
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-gray-50 tw-py-12">
      <div className="tw-container tw-max-w-4xl tw-mx-auto tw-px-4">
        {(loading || err || orders.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="tw-flex tw-items-center tw-justify-between tw-mb-8"
          >
            <div>
              <h1 className="tw-text-3xl tw-font-heading tw-font-bold tw-text-foreground tw-mb-2">
                My Orders
              </h1>
              <p className="tw-text-secondary tw-font-paragraph">
                View and track your past orders.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="tw-hidden sm:tw-flex hover:tw-text-foreground"
            >
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </motion.div>
        )}

        {loading && (
          <div className="tw-flex tw-justify-center tw-py-12">
            <div className="tw-h-8 tw-w-8 tw-animate-spin tw-rounded-full tw-border-4 tw-border-primary tw-border-t-transparent" />
          </div>
        )}

        {err && (
          <div className="tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-text-red-600 tw-text-center tw-mb-8">
            {String(err.message || err)}
          </div>
        )}

        {!loading && !err && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-20 tw-text-center"
          >
            <div className="tw-h-16 tw-w-16 tw-bg-gray-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-6">
              <ShoppingBag className="tw-h-8 tw-w-8 tw-text-gray-400" />
            </div>
            <h2 className="tw-text-xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-2">
              You have no orders yet
            </h2>
            <p className="tw-text-secondary tw-max-w-sm tw-mx-auto tw-mb-8">
              Start shopping to fill your history with premium grooming
              essentials.
            </p>
            <Button
              asChild
              size="lg"
              className="tw-bg-primary hover:tw-bg-primary/90 hover:tw-text-primary-foreground"
            >
              <Link to="/products">Start Shopping</Link>
            </Button>
          </motion.div>
        )}

        {!loading && !err && orders.length > 0 && (
          <div className="tw-space-y-4">
            {orders.map((o, i) => {
              const statusInfo = formatOrderStatus(
                o.status,
                o.payment_status
              );

              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link
                    to={`/orders/${o.id}`}
                    className="tw-block tw-group hover:tw-text-foreground"
                  >
                    <Card className="tw-bg-white tw-border-gray-200 hover:tw-border-primary/50 hover:tw-shadow-md tw-transition-all tw-duration-200">
                      <CardContent className="tw-p-6">
                        <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-justify-between tw-gap-4">
                          <div className="tw-flex tw-items-center tw-gap-4">
                            <div className="tw-h-12 tw-w-12 tw-rounded-full tw-bg-primary/10 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0 group-hover:tw-bg-primary/20 tw-transition-colors">
                              <Package className="tw-h-6 tw-w-6 tw-text-primary" />
                            </div>
                            <div>
                              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-1">
                                <h3 className="tw-font-heading tw-font-semibold tw-text-lg tw-text-foreground group-hover:tw-text-primary tw-transition-colors">
                                  {o.order_number || `Order #${o.id}`}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={`tw-capitalize ${statusInfo.className}`}
                                >
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              <div className="tw-text-sm tw-text-secondary tw-flex tw-flex-wrap tw-items-center tw-gap-x-4 tw-gap-y-1">
                                <span className="tw-flex tw-items-center tw-gap-1">
                                  <Calendar className="tw-h-3.5 tw-w-3.5" />
                                  {new Date(
                                    o.created_at
                                  ).toLocaleDateString()}
                                </span>
                                <span className="tw-flex tw-items-center tw-gap-1">
                                  <CreditCard className="tw-h-3.5 tw-w-3.5" />
                                  {o.payment_method === 'CARD'
                                    ? 'Credit Card'
                                    : 'Cash on Delivery'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="tw-flex tw-items-center tw-justify-between sm:tw-justify-end tw-gap-6 tw-w-full sm:tw-w-auto tw-border-t sm:tw-border-t-0 tw-pt-4 sm:tw-pt-0 tw-mt-2 sm:tw-mt-0">
                            <div className="tw-text-right">
                              <p className="tw-text-xs tw-text-secondary tw-uppercase tw-tracking-wider">
                                Total
                              </p>
                              <p className="tw-font-heading tw-font-bold tw-text-lg tw-text-foreground">
                                {money(
                                  o.total_cents,
                                  o.currency || 'USD'
                                )}
                              </p>
                            </div>
                            <div className="tw-h-8 tw-w-8 tw-rounded-full tw-bg-gray-100 tw-flex tw-items-center tw-justify-center group-hover:tw-bg-primary group-hover:tw-text-white tw-transition-colors">
                              <ArrowRight className="tw-h-4 tw-w-4" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}