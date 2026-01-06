import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Package,
  ArrowRight,
  ShoppingBag,
  Clock,
  CreditCard,
  MapPin,
} from 'lucide-react';

import { apiFetch } from '../lib/api';
import { useAuth } from '../Hooks/AuthContext';
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

const toSlugFallback = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

function badgeColorClasses(status) {
  const s = (status || '').toLowerCase();
  if (s === 'completed')
    return 'tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200';
  if (s === 'pending')
    return 'tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200';
  if (s === 'shipped')
    return 'tw-bg-gray-50 tw-text-gray-700 tw-border-gray-200';
  if (s === 'cancelled')
    return 'tw-bg-red-50 tw-text-red-700 tw-border-red-200';
  return 'tw-bg-gray-50 tw-text-gray-600 tw-border-gray-200';
}

export default function OrderConfirmed() {
  const { orderId } = useParams();
  const location = useLocation();
  const { isAuthed, loading: authLoading } = useAuth();
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const justPlaced = location.state?.justPlaced === true;

  useEffect(() => {
    if (!authLoading && !isAuthed) {
      navigate(`/auth?next=/order-confirmed/${orderId}`);
    }
  }, [authLoading, isAuthed, navigate, orderId]);

  useEffect(() => {
    if (authLoading || !isAuthed) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await apiFetch(`/api/orders/${orderId}`, {
          signal: ac.signal,
        });
        setData(res); 
      } catch (e) {
        if (e.name !== 'AbortError') setErr(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [authLoading, isAuthed, orderId]);

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
              You need to sign in to view this order.
            </CardDescription>
          </CardHeader>
          <CardContent className="tw-flex tw-justify-center">
            <Button asChild>
              <Link to="/auth">Go to Login / Register</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-flex tw-flex-col tw-items-center tw-gap-4">
          <div className="tw-h-8 tw-w-8 tw-animate-spin tw-rounded-full tw-border-4 tw-border-primary tw-border-t-transparent" />
          <p className="tw-text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-items-center tw-justify-center tw-p-4">
        <Card className="tw-w-full tw-max-w-md tw-bg-white tw-border-red-200">
          <CardHeader className="tw-text-center">
            <CardTitle className="tw-text-red-600">
              Error Loading Order
            </CardTitle>
            <CardDescription>{String(err.message || err)}</CardDescription>
          </CardHeader>
          <CardContent className="tw-flex tw-justify-center">
            <Button asChild variant="outline">
              <Link to="/my-orders">Back to My Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-items-center tw-justify-center tw-p-4">
        <Card className="tw-w-full tw-max-w-md tw-bg-white tw-border-gray-200">
          <CardHeader className="tw-text-center">
            <CardTitle>Order Not Found</CardTitle>
            <CardDescription>
              We couldn&apos;t find the order you&apos;re looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="tw-flex tw-justify-center">
            <Button asChild variant="outline">
              <Link to="/my-orders">Back to My Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { order, items = [] } = data;
  const currency = order.currency || 'USD';
  const paymentLabel =
    order.payment_method === 'CARD' ? 'Credit Card' : 'Cash on Delivery';

  const shipping = order.shipping || {};
  const hasShipping = Boolean(order.shipping);
  const shippingName =
    (shipping.first_name || shipping.last_name) && hasShipping
      ? `${shipping.first_name || ''} ${shipping.last_name || ''}`.trim()
      : 'Shipping contact';
  const shippingLine1 =
    (shipping.line1 && hasShipping && shipping.line1) || 'Address on file';
  const shippingCityZip =
    hasShipping &&
    [shipping.city, shipping.zip].filter(Boolean).join(' ').trim();

  return (
    <div className="tw-min-h-screen tw-bg-gray-50 tw-py-12">
      <div className="tw-container tw-max-w-3xl tw-mx-auto tw-px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="tw-text-center tw-mb-8"
        >
          {justPlaced ? (
            <div className="tw-flex tw-flex-col tw-items-center">
              <div className="tw-h-20 tw-w-20 tw-rounded-full tw-bg-green-100 tw-flex tw-items-center tw-justify-center tw-mb-6 tw-shadow-sm">
                <CheckCircle className="tw-h-10 tw-w-10 tw-text-green-600" />
              </div>
              <h1 className="tw-text-3xl tw-font-heading tw-font-bold tw-text-foreground tw-mb-2">
                Order Confirmed!
              </h1>
              <p className="tw-text-secondary tw-font-paragraph tw-max-w-md tw-mx-auto">
                Thank you for your purchase. We&apos;ve received your order and
                are getting it ready.
              </p>
            </div>
          ) : (
            <div className="tw-flex tw-items-center tw-justify-center tw-gap-3">
              <Package className="tw-h-8 tw-w-8 tw-text-primary" />
              <h1 className="tw-text-3xl tw-font-heading tw-font-bold tw-text-foreground">
                Order Details
              </h1>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="tw-bg-white tw-border-gray-200 tw-shadow-sm tw-overflow-hidden tw-mb-8">
            <CardHeader className="tw-bg-gray-50/50 tw-border-b tw-border-gray-100 tw-pb-6">
              <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center md:tw-justify-between tw-gap-4">
                <div>
                  <div className="tw-text-sm tw-text-secondary tw-mb-1">
                    Order Number
                  </div>
                  <div className="tw-font-heading tw-font-semibold tw-text-lg tw-text-foreground">
                    {order.order_number || `ORD-${order.id}`}
                  </div>
                </div>
                <div className="tw-flex tw-gap-2">
                  <Badge
                    variant="outline"
                    className="tw-bg-white tw-border-gray-200"
                  >
                    <Clock className="tw-h-3 tw-w-3 tw-mr-1 tw-text-secondary" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`tw-capitalize ${badgeColorClasses(order.status)}`}
                  >
                    {order.status || 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="tw-p-6">
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">
                <div className="tw-space-y-4">
                  <h3 className="tw-font-heading tw-font-medium tw-text-foreground tw-flex tw-items-center tw-gap-2">
                    <CreditCard className="tw-h-4 tw-w-4 tw-text-primary" />
                    Payment Details
                  </h3>
                  <div className="tw-bg-gray-50 tw-rounded-lg tw-p-4 tw-border tw-border-gray-100">
                    <div className="tw-flex tw-justify-between tw-mb-2">
                      <span className="tw-text-sm tw-text-secondary">
                        Method
                      </span>
                      <span className="tw-text-sm tw-font-medium tw-text-foreground">
                        {paymentLabel}
                      </span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span className="tw-text-sm tw-text-secondary">
                        Total Amount
                      </span>
                      <span className="tw-text-sm tw-font-bold tw-text-primary">
                        {money(order.total_cents, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="tw-space-y-4">
                  <h3 className="tw-font-heading tw-font-medium tw-text-foreground tw-flex tw-items-center tw-gap-2">
                    <MapPin className="tw-h-4 tw-w-4 tw-text-primary" />
                    Shipping To
                  </h3>
                  <div className="tw-bg-gray-50 tw-rounded-lg tw-p-4 tw-border tw-border-gray-100">
                    <p className="tw-text-sm tw-text-foreground tw-font-medium">
                      {shippingName}
                    </p>
                    <p className="tw-text-sm tw-text-secondary tw-mt-1">
                      {shippingLine1}
                    </p>
                    {shippingCityZip && (
                      <p className="tw-text-sm tw-text-secondary">
                        {shippingCityZip}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="tw-mb-8"
          >
            <Card className="tw-bg-white tw-border-gray-200 tw-shadow-sm">
              <CardHeader>
                <CardTitle className="tw-text-xl tw-font-heading">
                  Items Ordered
                </CardTitle>
              </CardHeader>
              <CardContent className="tw-p-0">
                <div className="tw-divide-y tw-divide-gray-100">
                  {items.map((it) => (
                    <div
                      key={it.id || `${it.order_id}-${it.product_id}`}
                      className="tw-flex tw-items-center tw-justify-between tw-p-6 hover:tw-bg-gray-50/50 tw-transition-colors"
                    >
                      <div className="tw-flex tw-items-center tw-gap-4">
                        <div className="tw-h-16 tw-w-16 tw-rounded-md tw-bg-white tw-border tw-border-gray-200 tw-overflow-hidden tw-flex-shrink-0">
                          <img
                            src={
                              it.thumbnail ||
                              `/images/products/${toSlugFallback(it.title)}.jpg`
                            }
                            alt={it.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                '/images/placeholder-product.jpg';
                            }}
                            className="tw-w-full tw-h-full tw-object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            to={`/products/${it.slug || it.product_id}`}
                            className="tw-font-heading tw-font-medium tw-text-foreground hover:tw-text-primary hover:tw-underline tw-transition-colors"
                          >
                            {it.title}
                          </Link>
                          <p className="tw-text-sm tw-text-secondary tw-mt-1">
                            Qty: {it.qty} &times;{' '}
                            {money(it.price_cents, currency)}
                          </p>
                        </div>
                      </div>
                      <div className="tw-font-bold tw-text-foreground">
                        {money(
                          it.subtotal_cents ??
                          it.price_cents * it.qty,
                          currency
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-center tw-gap-4"
        >
          <Button
            asChild
            size="lg"
            variant="outline"
            className="tw-w-full sm:tw-w-auto tw-border-gray-300 hover:tw-bg-gray-50 hover:tw-text-foreground"
          >
            <Link to="/products">
              <ShoppingBag className="tw-mr-2 tw-h-4 tw-w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="tw-w-full sm:tw-w-auto tw-bg-primary hover:tw-bg-primary/90"
          >
            <Link to="/my-orders" className="hover:tw-text-primary-foreground">
              My Orders
              <ArrowRight className="tw-ml-2 tw-h-4 tw-w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}