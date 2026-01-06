import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

import { apiFetch } from '../lib/api';
import { useAuth } from '../Hooks/AuthContext';
import { useCart } from '../Hooks/CartContext';

import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Truck,
  Shield,
  CreditCard,
  Gift,
  Loader2
} from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { refresh } = useCart();
  const { isAuthed, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  async function loadCart(signal) {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch('/api/cart', { signal });
      setItems(res.data || []);
    } catch (e) {
      if (e.status !== 401 && e.name !== 'AbortError') setErr(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthed) return; 
    const ac = new AbortController();
    loadCart(ac.signal);
    return () => ac.abort();
  }, [authLoading, isAuthed]);

  const totalQty = useMemo(
    () => items.reduce((s, it) => s + (it.qty || 0), 0),
    [items]
  );

  const subtotalCents = useMemo(
    () => items.reduce((s, it) => s + (it.qty || 0) * (it.price_cents || 0), 0),
    [items]
  );

  const discountCents = isPromoApplied ? subtotalCents * 0.1 : 0; 
  const shippingCents = subtotalCents > 5000 ? 0 : 999;
  const taxCents = Math.round((subtotalCents - discountCents) * 0.08); 
  const totalCents = subtotalCents - discountCents + shippingCents + taxCents;

  const formatPrice = (cents) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      (cents || 0) / 100
    );

  async function inc(productId, currentQty) {
    await apiFetch(`/api/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ qty: currentQty + 1 })
    });
    await loadCart();
    refresh();
  }

  async function dec(productId, currentQty) {
    const next = currentQty - 1;
    if (next <= 0) {
      await remove(productId);
      return;
    }
    await apiFetch(`/api/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ qty: next })
    });
    await loadCart();
    refresh();
  }

  async function remove(productId) {
    await apiFetch(`/api/cart/items/${productId}`, { method: 'DELETE' });
    await loadCart();
    refresh();
  }

  function applyPromoCode() {
    if (promoCode.toLowerCase() === 'save10') {
      setIsPromoApplied(true);
    }
  }


  if (authLoading || (loading && items.length === 0)) {
    return (
      <div className="tw-min-h-screen tw-bg-background tw-flex tw-items-center tw-justify-center">
        <Loader2 className="tw-h-8 tw-w-8 tw-animate-spin tw-text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="tw-min-h-screen tw-bg-background tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <ShoppingCart className="tw-h-16 tw-w-16 tw-text-muted-foreground tw-mx-auto tw-mb-6" />
          <h1 className="tw-text-3xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-4">
            Start Shopping
          </h1>
          <p className="tw-text-muted-foreground tw-mb-8">
            Sign in to view and manage your cart.
          </p>
          <Button asChild size="lg">
            <Link to="/auth" className="hover:tw-text-primary-foreground">Sign In / Register</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="tw-min-h-screen tw-bg-background">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8 tw-py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="tw-text-center"
          >
            <ShoppingCart className="tw-h-24 tw-w-24 tw-text-secondary tw-mx-auto tw-mb-6" />
            <h1 className="tw-text-4xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-4">
              Your Cart is Empty
            </h1>
            <p className="tw-text-lg tw-font-paragraph tw-text-secondary tw-mb-8 tw-max-w-md tw-mx-auto">
              Looks like you haven't added any items to your cart yet.
              Start shopping to fill it up!
            </p>
            <Button
              asChild
              size="lg"
              className="tw-text-primary-foreground hover:tw-text-primary-foreground hover:tw-bg-primary/90"
            >
              <Link to="/products">
                <ArrowLeft className="tw-mr-2 tw-h-5 tw-w-5" />
                Continue Shopping
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-background">
      <section className="tw-bg-white tw-py-8 tw-border-b">
        <div className="tw-container tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="tw-flex tw-items-center tw-justify-between"
          >
            <div>
              <h1 className="tw-text-3xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-2">
                Shopping Cart
              </h1>
              <p className="tw-font-paragraph tw-text-secondary">
                {totalQty} {totalQty === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <div className="tw-flex tw-items-center tw-gap-4">
              <Button
                asChild
                variant="outline"
                className="tw-border-foreground/20 tw-text-foreground tw-bg-transparent hover:tw-bg-foreground/5 hover:tw-border-foreground/80 hover:tw-text-foreground"
              >
                <Link to="/products">
                  <ArrowLeft className="tw-mr-2 tw-h-4 tw-w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="tw-w-full tw-bg-gray-50 tw-py-12">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-8">
            <div className="lg:tw-col-span-2 tw-space-y-4">
              {err && (
                <div className="tw-text-red-500 tw-mb-4">
                  {String(err.message || err)}
                </div>
              )}

              {items.map((item, index) => (
                <motion.div
                  key={item.id || item.product_id}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="tw-rounded-xl tw-border tw-border-foreground/10 tw-text-foreground tw-bg-white tw-overflow-hidden tw-shadow-lg">
                    <div className="tw-p-4">
                      <div className="tw-flex tw-gap-6">
                        <div className="tw-relative tw-w-20 tw-h-20 tw-flex-shrink-0">
                          <img
                            src={item.thumbnail || '/placeholder.png'}
                            alt={item.title}
                            className="tw-object-cover tw-w-full tw-h-full tw-rounded-lg"
                          />
                        </div>

                        <div className="tw-flex-1">
                          <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                            <div>
                              <h3 className="tw-text-lg tw-font-heading tw-font-medium tw-text-foreground">
                                {item.title}
                              </h3>
                              <p className="tw-text-sm tw-font-paragraph tw-text-secondary">
                                {item.category_name || item.category_slug || 'General'}
                              </p>
                            </div>
                            <button
                              onClick={() => remove(item.product_id)}
                              className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-font-normal tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-bg-transparent hover:tw-bg-secondary/10 tw-h-8 tw-rounded-md tw-px-3 tw-text-xs tw-text-destructive hover:tw-text-destructive"
                            >
                              <Trash2 className="tw-h-4 tw-w-4" />
                            </button>
                          </div>

                          <div className="tw-flex tw-items-center tw-justify-between">
                            <div className="tw-flex tw-items-center tw-gap-2">
                              <span className="tw-text-lg tw-font-heading tw-font-semibold tw-text-foreground">
                                {formatPrice(item.price_cents)}
                              </span>
                            </div>

                            <div className="tw-flex tw-items-center tw-gap-3">
                              <button
                                onClick={() => dec(item.product_id, item.qty)}
                                disabled={item.qty <= 1}
                                className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-font-normal tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-border tw-border-primary/20 tw-text-primary tw-bg-transparent tw-shadow-sm hover:tw-bg-primary/10 hover:tw-border-primary/80 tw-h-8 tw-rounded-md tw-px-3 tw-text-xs"
                              >
                                <Minus className="tw-h-3 tw-w-3" />
                              </button>
                              <span className="tw-w-8 tw-text-center tw-font-paragraph">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => inc(item.product_id, item.qty)}
                                className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-font-normal tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-border tw-border-primary/20 tw-text-primary tw-bg-transparent tw-shadow-sm hover:tw-bg-primary/10 hover:tw-border-primary/80 tw-h-8 tw-rounded-md tw-px-3 tw-text-xs"
                              >
                                <Plus className="tw-h-3 tw-w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="tw-rounded-xl tw-border tw-border-foreground/10 tw-text-foreground tw-bg-white tw-shadow-lg">
                  <div className="tw-p-6">
                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
                      <Gift className="tw-h-5 tw-w-5 tw-text-soft-gold" />
                      <h3 className="tw-font-heading tw-font-medium tw-text-foreground">
                        Promo Code
                      </h3>
                    </div>
                    <div className="tw-flex tw-gap-3">
                      <input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={isPromoApplied}
                        className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-foreground/20 tw-bg-transparent tw-px-4 tw-py-1 tw-text-base tw-text-foreground tw-shadow-sm tw-transition-colors hover:tw-border-foreground/30 focus-visible:tw-outline-none focus-visible:tw-ring-0 focus-visible:tw-border-primary disabled:tw-cursor-not-allowed disabled:tw-opacity-50 md:tw-text-sm"
                      />
                      <button
                        onClick={applyPromoCode}
                        disabled={isPromoApplied || !promoCode}
                        className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-normal tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-bg-primary tw-text-primary-foreground tw-shadow hover:tw-bg-primary/90 tw-h-9 tw-px-4 tw-py-2"
                      >
                        {isPromoApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                    {isPromoApplied && (
                      <p className="tw-text-sm tw-font-paragraph tw-text-green-600 tw-mt-2">
                        Promo code applied! You saved {formatPrice(discountCents)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:tw-col-span-1"
            >
              <div className="tw-sticky tw-top-8 tw-space-y-6">
                <div className="tw-rounded-xl tw-border tw-border-foreground/10 tw-text-foreground tw-bg-white tw-shadow-lg">
                  <div className="tw-p-6">
                    <h3 className="tw-text-xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-6">
                      Order Summary
                    </h3>

                    <div className="tw-space-y-4">
                      <div className="tw-flex tw-justify-between tw-font-paragraph">
                        <span className="tw-text-secondary">Subtotal</span>
                        <span className="tw-text-foreground">
                          {formatPrice(subtotalCents)}
                        </span>
                      </div>
                      {discountCents > 0 && (
                        <div className="tw-flex tw-justify-between tw-font-paragraph">
                          <span className="tw-text-green-600">Discount</span>
                          <span className="tw-text-green-600">
                            -{formatPrice(discountCents)}
                          </span>
                        </div>
                      )}
                      <div className="tw-flex tw-justify-between tw-font-paragraph">
                        <span className="tw-text-secondary">Shipping</span>
                        <span className="tw-text-foreground">
                          {shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}
                        </span>
                      </div>
                      <div className="tw-flex tw-justify-between tw-font-paragraph">
                        <span className="tw-text-secondary">Tax</span>
                        <span className="tw-text-foreground">
                          {formatPrice(taxCents)}
                        </span>
                      </div>
                      <div className="tw-shrink-0 tw-bg-foreground/15 tw-h-[1px] tw-w-full" />
                      <div className="tw-flex tw-justify-between tw-text-lg tw-font-heading tw-font-semibold">
                        <span className="tw-text-foreground">Total</span>
                        <span className="tw-text-foreground">
                          {formatPrice(totalCents)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/checkout')}
                      disabled={items.length === 0}
                      className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-text-sm tw-font-normal tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-bg-primary tw-text-primary-foreground tw-shadow hover:tw-bg-primary/90 tw-h-10 tw-rounded-md tw-px-8 tw-w-full tw-mt-6"
                    >
                      Proceed to Checkout
                      <ArrowRight className="tw-ml-2 tw-h-5 tw-w-5" />
                    </button>

                    {shippingCents === 0 && (
                      <div className="tw-flex tw-items-center tw-gap-2 tw-mt-4 tw-p-3 tw-bg-green-50 tw-rounded-lg">
                        <Truck className="tw-h-4 tw-w-4 tw-text-green-600" />
                        <span className="tw-text-sm tw-font-paragraph tw-text-green-600">
                          You qualify for free shipping!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="tw-rounded-xl tw-border tw-border-foreground/10 tw-text-foreground tw-bg-white tw-shadow-lg">
                  <div className="tw-p-6">
                    <h4 className="tw-font-heading tw-font-medium tw-text-foreground tw-mb-4">
                      Secure Checkout
                    </h4>
                    <div className="tw-space-y-3">
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <Shield className="tw-h-4 tw-w-4 tw-text-soft-gold" />
                        <span className="tw-text-sm tw-font-paragraph tw-text-secondary">
                          SSL Encrypted Payment
                        </span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <CreditCard className="tw-h-4 tw-w-4 tw-text-soft-gold" />
                        <span className="tw-text-sm tw-font-paragraph tw-text-secondary">
                          Multiple Payment Options
                        </span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <Truck className="tw-h-4 tw-w-4 tw-text-soft-gold" />
                        <span className="tw-text-sm tw-font-paragraph tw-text-secondary">
                          Fast & Secure Delivery
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}