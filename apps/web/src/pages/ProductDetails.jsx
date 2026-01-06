import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';

import { apiFetch } from '../lib/api';
import { useAuth } from '../Hooks/AuthContext';
import { useCart } from '../Hooks/CartContext';
import { useWishlist } from '../Hooks/WishlistContext';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import ReviewsSection from './ReviewsSection';

function money(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format((cents || 0) / 100);
}

export default function ProductDetails() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthed, loading: authLoading } = useAuth();
  const { refresh: refreshCart } = useCart();
  const { ids, toggle: toggleWishlist } = useWishlist();

  const isNumericId = /^\d+$/.test(idOrSlug);
  const apiPath = isNumericId
    ? `/api/products/${idOrSlug}`
    : `/api/products/slug/${idOrSlug}`;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [adding, setAdding] = useState(false);
  const [addErr, setAddErr] = useState(null);
  const [addOk, setAddOk] = useState('');

  const okTimerRef = useRef(null);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, related } = await apiFetch(apiPath, { signal: ac.signal });
        setProduct(data);
        setRelatedProducts(related || []);
        if (data?.title) {
          document.title = `${data.title} • Grooming Store`;
        }
      } catch (e) {
        if (e.name !== 'AbortError') setError(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [apiPath]);

  useEffect(() => {
    return () => {
      if (okTimerRef.current) clearTimeout(okTimerRef.current);
    };
  }, []);

  function showOk(msg = 'Added to cart ✅') {
    setAddOk(msg);
    if (okTimerRef.current) clearTimeout(okTimerRef.current);
    okTimerRef.current = setTimeout(() => setAddOk(''), 1800);
  }

  async function handleAddToCart({ goToCart = false } = {}) {
    setAddErr(null);
    setAddOk('');

    if (authLoading) {
      setAddErr(new Error('Checking sign-in status…'));
      return;
    }

    if (!isAuthed) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?next=${next}`);
      return;
    }

    try {
      setAdding(true);

      await apiFetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          qty: Number(quantity) || 1,
        }),
      });

      await refreshCart();
      showOk('Added to cart ✅');

      if (goToCart) navigate('/cart');
    } catch (e) {
      if (e?.status === 401) {
        const next = encodeURIComponent(location.pathname + location.search);
        navigate(`/auth?next=${next}`);
        return;
      }
      setAddErr(e);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleWishlist() {
    try {
      await toggleWishlist(product.id);
    } catch (e) {
      if (e?.status === 401) {
        const next = encodeURIComponent(location.pathname + location.search);
        navigate(`/auth?next=${next}`);
      }
    }
  }

  if (loading) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-background">
        <div className="tw-animate-spin tw-rounded-full tw-h-32 tw-w-32 tw-border-b-2 tw-border-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-background">
        <div className="tw-text-center">
          <h1 className="tw-text-2xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-4">
            Product not found
          </h1>
          <Button asChild>
            <Link to="/products">
              <ArrowLeft className="tw-mr-2 tw-h-4 tw-w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const mainImage = product.thumbnail || '/images/placeholder.jpg';
  const productImages = [mainImage, mainImage, mainImage, mainImage];
  const rating = Number(product.rating || 0);
  const isPopular = rating > 4.5;
  const price = money(product.price_cents, product.currency);
  const isInWishlist = ids.has(product.id);

  return (
    <div className="tw-min-h-screen tw-bg-background tw-pb-20">
      <div className="tw-bg-white tw-py-4 tw-border-b">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          <nav className="tw-flex tw-items-center tw-space-x-2 tw-text-sm tw-font-paragraph">
            <Link
              to="/"
              className="tw-text-muted-foreground hover:tw-text-foreground tw-transition-colors"
            >
              Home
            </Link>
            <span className="tw-text-muted-foreground">/</span>
            <Link
              to="/products"
              className="tw-text-muted-foreground hover:tw-text-foreground tw-transition-colors"
            >
              Products
            </Link>
            {product.category_name && (
              <>
                <span className="tw-text-muted-foreground">/</span>
                <Link
                  to={`/products?category=${product.category_slug}`}
                  className="tw-text-muted-foreground hover:tw-text-foreground tw-transition-colors"
                >
                  {product.category_name}
                </Link>
              </>
            )}
            <span className="tw-text-muted-foreground">/</span>
            <span className="tw-text-foreground tw-font-medium">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8 tw-py-8">
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-12 tw-mb-16">
          <div className="tw-space-y-4">
            <div className="tw-relative tw-aspect-square tw-overflow-hidden tw-rounded-lg tw-bg-white tw-shadow-sm tw-border tw-border-gray-100">
              <Image
                src={productImages[selectedImageIndex]}
                alt={product.title}
                className="tw-object-cover tw-w-full tw-h-full"
              />
              {isPopular && (
                <Badge className="tw-absolute tw-top-4 tw-left-4 tw-bg-soft-gold tw-text-white tw-border-none tw-gap-1">
                  <Star className="tw-h-3 tw-w-3 tw-fill-current" />
                  Popular
                </Badge>
              )}
            </div>

            
          </div>

          <div className="tw-space-y-8">
            <div>
              <h1 className="tw-text-4xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-4">
                {product.title}
              </h1>
              <p className="tw-text-lg tw-font-paragraph tw-text-muted-foreground tw-leading-relaxed">
                {product.description ||
                  "Experience premium quality with our signature grooming product."}
              </p>
            </div>

            <div className="tw-flex tw-items-center tw-justify-between">
              <div className="tw-flex tw-items-center tw-gap-4">
                <span className="tw-text-3xl tw-font-heading tw-font-semibold tw-text-foreground">
                  {price}
                </span>
                <div className="tw-flex tw-items-center tw-gap-1 tw-text-soft-gold">
                  <Star className="tw-h-5 tw-w-5 tw-fill-current" />
                  <span className="tw-text-foreground tw-font-medium tw-ml-1">
                    {rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="tw-flex tw-items-center tw-gap-2">
                <Button variant="ghost" size="icon" onClick={handleToggleWishlist}>
                  <Heart
                    className={`tw-h-5 tw-w-5 ${isInWishlist ? 'tw-fill-red-500 tw-text-red-500' : ''
                      }`}
                  />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="tw-h-5 tw-w-5" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="tw-space-y-6">
              <div className="tw-flex tw-items-center tw-gap-4">
                <label className="tw-font-paragraph tw-text-foreground">
                  Quantity:
                </label>
                <Select
                  value={quantity.toString()}
                  onValueChange={(val) => setQuantity(Number(val))}
                >
                  <SelectTrigger className="tw-w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="tw-flex tw-gap-4">
                <Button
                  size="lg"
                  className="tw-flex-1 tw-bg-primary hover:tw-bg-primary/90 tw-h-12 tw-text-base"
                  onClick={() => handleAddToCart()}
                  disabled={adding}
                >
                  <ShoppingCart className="tw-mr-2 tw-h-5 tw-w-5" />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="tw-flex-1 tw-h-12 tw-text-base"
                  onClick={() => handleAddToCart({ goToCart: true })}
                  disabled={adding}
                >
                  Buy Now
                </Button>
              </div>

              {addOk && (
                <p className="tw-text-green-600 tw-text-sm tw-font-medium">
                  {addOk}{' '}
                  <Link
                    to="/cart"
                    className="tw-underline tw-underline-offset-2"
                  >
                    View cart
                  </Link>
                </p>
              )}
              {addErr && (
                <p className="tw-text-red-600 tw-text-sm">
                  {addErr.message || String(addErr)}
                </p>
              )}
            </div>

            <Separator />

            <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-4">
              <div className="tw-flex tw-items-center tw-gap-3 tw-p-4 tw-bg-gray-50 tw-rounded-lg">
                <Truck className="tw-h-5 tw-w-5 tw-text-soft-gold" />
                <div>
                  <div className="tw-font-medium tw-text-sm">Free Shipping</div>
                  <div className="tw-text-xs tw-text-muted-foreground">
                    On orders over $50
                  </div>
                </div>
              </div>
              <div className="tw-flex tw-items-center tw-gap-3 tw-p-4 tw-bg-gray-50 tw-rounded-lg">
                <Shield className="tw-h-5 tw-w-5 tw-text-soft-gold" />
                <div>
                  <div className="tw-font-medium tw-text-sm">Secure Payment</div>
                  <div className="tw-text-xs tw-text-muted-foreground">
                    100% protected
                  </div>
                </div>
              </div>
              <div className="tw-flex tw-items-center tw-gap-3 tw-p-4 tw-bg-gray-50 tw-rounded-lg">
                <RotateCcw className="tw-h-5 tw-w-5 tw-text-soft-gold" />
                <div>
                  <div className="tw-font-medium tw-text-sm">Easy Returns</div>
                  <div className="tw-text-xs tw-text-muted-foreground">
                    30-day policy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tw-mb-16">
          <Tabs defaultValue="description" className="tw-w-full">
            <TabsList
              className="
                tw-grid tw-w-full tw-grid-cols-2
                tw-bg-muted
                tw-rounded-xl
                tw-p-1
              "
            >
              <TabsTrigger
                value="description"
                className="
                  tw-text-sm tw-font-medium
                  tw-rounded-lg
                  data-[state=active]:tw-bg-white
                  data-[state=active]:tw-text-foreground
                  data-[state=active]:tw-shadow-sm
                  data-[state=inactive]:tw-text-muted-foreground
                  tw-py-2
                  focus-visible:tw-ring-0 focus-visible:tw-ring-offset-0 focus-visible:tw-outline-none
                "
              >
                Description
              </TabsTrigger>

              <TabsTrigger
                value="reviews"
                className="
                  tw-text-sm tw-font-medium
                  tw-rounded-lg
                  data-[state=active]:tw-bg-white
                  data-[state=active]:tw-text-foreground
                  data-[state=active]:tw-shadow-sm
                  data-[state=inactive]:tw-text-muted-foreground
                  tw-py-2
                  focus-visible:tw-ring-0 focus-visible:tw-ring-offset-0 focus-visible:tw-outline-none
                "
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <Card>
                <CardContent className="tw-p-8">
                  <h3 className="tw-text-2xl tw-font-heading tw-font-medium tw-mb-4">
                    Product Description
                  </h3>
                  <div className="tw-prose tw-max-w-none">
                    <p className="tw-text-muted-foreground tw-leading-relaxed">
                      {product.long_description ||
                        product.description ||
                        'No description available.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardContent className="tw-p-8">
                  <ReviewsSection productId={product.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>


        {relatedProducts.length > 0 && (
          <section>
            <h2 className="tw-text-3xl tw-font-heading tw-font-semibold tw-mb-8">
              Related Products
            </h2>
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  to={`/products/${related.id}`}
                  className="tw-group tw-block"
                >
                  <Card className="tw-overflow-hidden tw-border-0 tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300">
                    <div className="tw-relative tw-h-48 tw-overflow-hidden tw-bg-gray-50">
                      <Image
                        src={related.thumbnail || '/images/placeholder.jpg'}
                        alt={related.title}
                        className="tw-object-cover tw-w-full tw-h-full group-hover:tw-scale-105 tw-transition-transform tw-duration-300"
                      />
                    </div>
                    <CardContent className="tw-p-4">
                      <h3 className="tw-font-heading tw-font-medium tw-mb-2 tw-line-clamp-2 tw-text-base tw-text-foreground">
                        {related.title}
                      </h3>
                      <div className="tw-flex tw-items-center tw-justify-between">
                        <span className="tw-font-heading tw-font-semibold tw-text-foreground">
                          {money(related.price_cents, related.currency)}
                        </span>
                        <Button size="sm" variant="outline" className="tw-text-xs">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}