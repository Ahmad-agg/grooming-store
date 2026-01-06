import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Hooks/AuthContext';
import { useCart } from '../Hooks/CartContext';
import { apiFetch } from '../lib/api';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Lock,
  Truck,
  Loader2
} from 'lucide-react';

function money(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format((cents || 0) / 100);
}

export default function Checkout() {
  const { isAuthed, loading: authLoading, user } = useAuth();
  const { refresh: refreshCart } = useCart();

  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [items, setItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartErr, setCartErr] = useState(null);

  const [shipping, setShipping] = useState({
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    line1: '',
    city: '',
    zip: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthed) {
      navigate('/auth?next=/checkout');
    }
  }, [authLoading, isAuthed, navigate]);

  useEffect(() => {
    if (authLoading || !isAuthed) return;

    const ac = new AbortController();

    (async () => {
      try {
        setCartLoading(true);
        setCartErr(null);

        const res = await apiFetch('/api/cart', { signal: ac.signal });
        setItems(res.data || []);
      } catch (e) {
        if (e.status === 401) {
          navigate('/auth?next=/checkout');
          return;
        }
        if (e.name !== 'AbortError') setCartErr(e);
        setItems([]);
      } finally {
        setCartLoading(false);
      }
    })();

    return () => ac.abort();
  }, [authLoading, isAuthed, navigate]);

  const currency = items[0]?.currency || 'USD';

  const subtotalCents = useMemo(
    () => items.reduce((sum, it) => sum + (it.qty || 0) * (it.price_cents || 0), 0),
    [items]
  );

  const discountCents = 0; 
  const shippingCents = subtotalCents > 5000 ? 0 : 999;
  const taxCents = Math.round(subtotalCents * 0.08);
  const totalCents = subtotalCents - discountCents + shippingCents + taxCents;

  const totalQty = useMemo(
    () => items.reduce((s, it) => s + (it.qty || 0), 0),
    [items]
  );

  function onShippingChange(e) {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePlaceOrder(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (placing) return;

    if (
      !shipping.first_name ||
      !shipping.last_name ||
      !shipping.email ||
      !shipping.phone ||
      !shipping.line1 ||
      !shipping.city
    ) {
      setErr('Please fill in all required shipping fields.');
      return;
    }

    setErr(null);
    setPlacing(true);

    try {
      let payment_status = 'pending';
      let stripe_payment_intent_id = null;

      if (paymentMethod === 'card') {
        if (!stripe || !elements) {
          throw new Error('Payment system not ready. Please try again.');
        }

        const { clientSecret } = await apiFetch('/api/payments/intent', {
          method: 'POST',
          body: JSON.stringify({
            amount_cents: totalCents,
            currency,
          }),
        });

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error('Card input not ready.');

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${shipping.first_name} ${shipping.last_name}`.trim(),
              email: shipping.email,
            },
          },
        });

        if (result.error) throw result.error;
        if (result.paymentIntent.status !== 'succeeded') {
          throw new Error('Payment was not completed.');
        }

        payment_status = 'paid';
        stripe_payment_intent_id = result.paymentIntent.id;
      }

      const res = await apiFetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          shipping,
          payment_method: paymentMethod === 'cod' ? 'COD' : 'CARD',
          payment_status,
          stripe_payment_intent_id,
        }),
      });

      await refreshCart();

      navigate(`/orders/${res.order.id}`, { state: { justPlaced: true } });
    } catch (e) {
      setErr(e);
    } finally {
      setPlacing(false);
    }
  }


  if (authLoading || cartLoading) {
    return (
      <div className="tw-min-h-screen tw-bg-background tw-flex tw-items-center tw-justify-center">
        <Loader2 className="tw-h-8 tw-w-8 tw-animate-spin tw-text-muted-foreground" />
      </div>
    );
  }

  if (cartErr) {
    return (
      <div className="tw-min-h-screen tw-bg-background tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <h1 className="tw-text-2xl tw-font-heading tw-font-semibold tw-text-destructive tw-mb-4">
            Error Loading Checkout
          </h1>
          <p className="tw-text-muted-foreground tw-mb-6">
            {String(cartErr.message || cartErr)}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!totalQty) {
    return (
      <div className="tw-min-h-screen tw-bg-background tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <h1 className="tw-text-3xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-4">
            Your Cart is Empty
          </h1>
          <p className="tw-text-muted-foreground tw-mb-8">
            Add something to your cart before checking out.
          </p>
          <Button asChild size="lg">
            <Link to="/products">
              <ArrowLeft className="tw-mr-2 tw-h-5 tw-w-5" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="tw-min-h-screen tw-bg-background">
      <section className="tw-bg-white tw-py-8 tw-border-b">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="tw-flex tw-items-center tw-justify-between"
          >
            <div>
              <h1 className="tw-text-3xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-2">
                Checkout
              </h1>
              <p className="tw-font-paragraph tw-text-secondary">
                Complete your purchase
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="hover:tw-text-foreground hover:tw-bg-accent"
            >
              <Link to="/cart">
                <ArrowLeft className="tw-mr-2 tw-h-4 tw-w-4" />
                Back to Cart
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="tw-w-full tw-bg-gray-50 tw-py-8">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-8">
            <div className="lg:tw-col-span-2 tw-space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="tw-rounded-xl tw-border tw-border-foreground/10 tw-text-foreground tw-bg-white tw-shadow-lg">
                  <div className="tw-flex tw-flex-col tw-space-y-1.5 tw-p-6">
                    <h3 className="tw-font-semibold tw-text-lg tw-leading-none tw-tracking-tight tw-flex tw-items-center tw-gap-2">
                      <Truck className="tw-h-5 tw-w-5" />
                      Shipping Information
                    </h3>
                  </div>
                  <div className="tw-p-6 tw-pt-0 tw-space-y-4">
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                      <div>
                        <Label
                          htmlFor="firstName"
                          className="tw-text-sm tw-font-normal tw-leading-none tw-text-foreground tw-font-paragraph"
                        >
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          name="first_name"
                          placeholder="John"
                          value={shipping.first_name}
                          onChange={onShippingChange}
                          className="tw-flex tw-h-5 tw-w-min tw-rounded-md tw-border tw-border-foreground/20 tw-bg-transparent tw-px-20 tw-py-1 tw-text-sm tw-text-foreground tw-shadow-sm tw-transition-colors hover:tw-border-foreground/30 focus-visible:tw-outline-none focus-visible:tw-ring-0 focus-visible:tw-border-primary disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="lastName"
                          className="tw-text-sm tw-font-normal tw-leading-none tw-text-foreground tw-font-paragraph"
                        >
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          name="last_name"
                          placeholder="Doe"
                          value={shipping.last_name}
                          onChange={onShippingChange}
                          className="tw-flex tw-h-5 tw-w-min tw-rounded-md tw-border tw-border-foreground/20 tw-bg-transparent tw-px-20 tw-py-1 tw-text-sm tw-text-foreground tw-shadow-sm tw-transition-colors hover:tw-border-foreground/30 focus-visible:tw-outline-none focus-visible:tw-ring-0 focus-visible:tw-border-primary disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-mt-1"
                          required
                        />
                      </div>
                    </div>

                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                      <div>
                        <Label
                          htmlFor="email"
                          className="tw-text-sm tw-font-normal tw-leading-none tw-text-foreground tw-font-paragraph"
                        >
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={shipping.email}
                          onChange={onShippingChange}
                          className="tw-flex tw-h-5 tw-w-min tw-rounded-md tw-border tw-border-foreground/20 tw-bg-transparent tw-px-20 tw-py-1 tw-text-sm tw-text-foreground tw-shadow-sm tw-transition-colors hover:tw-border-foreground/30 focus-visible:tw-outline-none focus-visible:tw-ring-0 focus-visible:tw-border-primary disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="phone"
                          className="tw-text-sm tw-font-normal tw-leading-none tw-text-foreground tw-font-paragraph"
                        >
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+1 (555) 123-4567"
                          value={shipping.phone}
                          onChange={onShippingChange}
                          className="tw-flex tw-h-5 tw-w-min tw-rounded-md tw-border tw-border-foreground/20 tw-bg-transparent tw-px-20 tw-py-1 tw-text-sm tw-text-foreground tw-shadow-sm tw-transition-colors hover:tw-border-foreground/30 focus-visible:tw-outline-none focus-visible:tw-ring-0 focus-visible:tw-border-primary disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-mt-1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="address"
                        className="tw-text-sm tw-font-normal tw-leading-none tw-text-foreground tw-font-paragraph"
                      >
                        Address *
                      </Label>
                      <Input
                        id="address"
                        name="line1"
                        placeholder="123 Main Street"
                        value={shipping.line1}
                        onChange={onShippingChange}
                        className="tw-flex tw-h-5 tw-w-max tw-rounded-md tw-border tw-border-foreground/20 tw-bg-transparent tw-px-80 tw-py-1 tw-text-sm tw-text-foreground tw-shadow-sm tw-transition-colors hover:tw-border-foreground/30 focus-visible:tw-outline-none focus-visible:tw-ring-0 focus-visible:tw-border-primary disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-mt-1"
                        required
                      />
                    </div>

                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                      <div>
                        <Label
                          htmlFor="city"
                          className="tw-text-sm tw-font-normal tw-leading-none tw-text-foreground tw-font-paragraph"
                        >
                          City *
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="Tel Aviv"
                          value={shipping.city}
                          onChange={onShippingChange}
                          className="tw-flex tw-h-5 tw-w-min tw-rounded-md tw-border tw-border-foreground/20 tw-bg-transparent tw-px-20 tw-py-1 tw-text-sm tw-text-foreground tw-shadow-sm tw-transition-colors hover:tw-border-foreground/30 focus-visible:tw-outline-none focus-visible:tw-ring-0 focus-visible:tw-border-primary disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="zipCode"
                          className="tw-text-sm tw-font-normal tw-leading-none tw-text-foreground tw-font-paragraph"
                        >
                          Zip Code
                        </Label>
                        <Input
                          id="zipCode"
                          name="zip"
                          placeholder="12345"
                          value={shipping.zip}
                          onChange={onShippingChange}
                          className="tw-flex tw-h-5 tw-w-min tw-rounded-md tw-border tw-border-foreground/20 tw-bg-transparent tw-px-20 tw-py-1 tw-text-sm tw-text-foreground tw-shadow-sm tw-transition-colors hover:tw-border-foreground/30 focus-visible:tw-outline-none focus-visible:tw-ring-0 focus-visible:tw-border-primary disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  <div className="tw-rounded-xl tw-border tw-border-foreground/10 tw-text-foreground tw-bg-white tw-shadow-lg">
    <div className="tw-flex tw-flex-col tw-space-y-1.5 tw-p-6">
      <h3 className="tw-font-semibold tw-text-lg tw-leading-none tw-tracking-tight tw-flex tw-items-center tw-gap-2">
        <CreditCard className="tw-h-5 tw-w-5" />
        Payment Method
      </h3>
    </div>

    <div className="tw-border-t tw-border-foreground/10  tw-rounded-b-xl">
      <div className="tw-p-6 tw-space-y-4">
        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          className="tw-grid tw-gap-3"
        >
<div className="tw-flex tw-items-center tw-space-x-3 tw-p-3 tw-border tw-border-gray-200 tw-rounded-lg tw-cursor-pointer tw-bg-white tw-shadow-sm hover:tw-border-primary/60 hover:tw-bg-gray-50 tw-transition-all">
            <RadioGroupItem
              value="cod"
              id="cash"
              className="tw-aspect-square tw-h-4 tw-w-4 tw-rounded-full tw-border tw-border-primary tw-text-primary tw-shadow focus:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-primary/50 data-[state=checked]:tw-border-primary data-[state=checked]:tw-bg-primary disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
            />
            <Label
              htmlFor="cash"
              className="tw-text-sm tw-font-normal tw-leading-none tw-text-foreground tw-flex-1 tw-cursor-pointer"
            >
              <div className="tw-flex tw-items-center tw-gap-3">
                <Banknote className="tw-h-5 tw-w-5 tw-text-soft-gold" />
                <div>
                  <p className="tw-font-heading tw-font-medium tw-text-foreground">
                    Cash on Delivery
                  </p>
                  <p className="tw-text-sm tw-font-paragraph tw-text-secondary">
                    Pay when you receive your order
                  </p>
                </div>
              </div>
            </Label>
          </div>

<div className="tw-flex tw-items-center tw-space-x-3 tw-p-3 tw-border tw-border-gray-200 tw-rounded-lg tw-cursor-pointer tw-bg-white tw-shadow-sm hover:tw-border-primary/90 hover:tw-bg-gray-50 tw-transition-all">
            <RadioGroupItem
              value="card"
              id="visa"
              className="tw-aspect-square tw-h-4 tw-w-4 tw-rounded-full tw-border tw-border-primary tw-text-primary tw-shadow focus:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-primary/50 data-[state=checked]:tw-border-primary data-[state=checked]:tw-bg-primary disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
            />
            <Label
              htmlFor="visa"
              className="tw-text-sm tw-font-normal tw-leading-none tw-text-foreground tw-flex-1 tw-cursor-pointer"
            >
              <div className="tw-flex tw-items-center tw-gap-3">
                <CreditCard className="tw-h-5 tw-w-5 tw-text-soft-gold" />
                <div>
                  <p className="tw-font-heading tw-font-medium tw-text-foreground">
                    Credit Card (Visa)
                  </p>
                  <p className="tw-text-sm tw-font-paragraph tw-text-secondary">
                    Secure payment with your card
                  </p>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {paymentMethod === 'card' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="tw-pt-3"
          >
            <div className="tw-p-4 tw-border tw-rounded-md tw-bg-white">
              <CardElement options={{ hidePostalCode: true }} />
            </div>
            <div className="tw-flex tw-items-center tw-gap-2 tw-mt-3 tw-p-3 tw-bg-blue-50 tw-rounded-lg">
              <Lock className="tw-h-4 tw-w-4 tw-text-blue-600" />
              <p className="tw-text-sm tw-font-paragraph tw-text-blue-600">
                Your card data is encrypted and secure.
              </p>
            </div>
          </motion.div>
        )}

        {err && (
          <div className="tw-text-red-500 tw-text-sm">
            {String(err.message || err)}
          </div>
        )}
      </div>
    </div>
  </div>
</motion.div>
            </div>

            <div className="tw-space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="tw-rounded-xl tw-border tw-border-foreground/10 tw-text-foreground tw-bg-background tw-shadow-lg tw-sticky tw-top-8">
                  <div className="tw-flex tw-flex-col tw-space-y-1.5 tw-p-6">
                    <h3 className="tw-font-semibold tw-text-lg tw-leading-none tw-tracking-tight">
                      Order Summary
                    </h3>
                  </div>
                  <div className="tw-p-6 tw-pt-0 tw-space-y-4">
                    <div className="tw-space-y-3">
                      <div className="tw-flex tw-justify-between tw-font-paragraph">
                        <span className="tw-text-secondary">Subtotal</span>
                        <span className="tw-text-foreground">
                          {money(subtotalCents, currency)}
                        </span>
                      </div>

                      {discountCents > 0 && (
                        <div className="tw-flex tw-justify-between tw-font-paragraph">
                          <span className="tw-text-green-600">Discount</span>
                          <span className="tw-text-green-600">
                            -{money(discountCents, currency)}
                          </span>
                        </div>
                      )}

                      <div className="tw-flex tw-justify-between tw-font-paragraph">
                        <span className="tw-text-secondary">Shipping</span>
                        <span className="tw-text-foreground">
                          {shippingCents === 0
                            ? 'Free'
                            : money(shippingCents, currency)}
                        </span>
                      </div>

                      <div className="tw-flex tw-justify-between tw-font-paragraph">
                        <span className="tw-text-secondary">Tax</span>
                        <span className="tw-text-foreground">
                          {money(taxCents, currency)}
                        </span>
                      </div>

                      <div className="tw-shrink-0 tw-bg-foreground/15 tw-h-[1px] tw-w-full" />

                      <div className="tw-flex tw-justify-between tw-text-lg tw-font-heading tw-font-semibold">
                        <span className="tw-text-foreground">Total</span>
                        <span className="tw-text-foreground">
                          {money(totalCents, currency)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handlePlaceOrder}
                      disabled={placing || authLoading}
                      className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-text-sm tw-font-normal tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-bg-primary tw-text-primary-foreground tw-shadow hover:tw-bg-primary/90 tw-h-10 tw-rounded-md tw-px-8 tw-w-full"
                    >
                      {placing ? (
                        <>
                          <Loader2 className="tw-mr-2 tw-h-4 tw-w-4 tw-animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>

                    <div className="tw-flex tw-items-center tw-gap-2 tw-p-3 tw-bg-gray-50 tw-rounded-lg">
                      <Lock className="tw-h-4 tw-w-4 tw-text-soft-gold" />
                      <span className="tw-text-xs tw-font-paragraph tw-text-secondary">
                        Secure & trusted checkout
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}