import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Hooks/AuthContext';
import { useWishlist } from '../Hooks/WishlistContext';
import { Button } from '@/components/ui/button';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

function money(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    (cents || 0) / 100
  );
}

export default function Wishlist() {
  const nav = useNavigate();
  const { isAuthed, loading: authLoading } = useAuth();
  const { items, count, loading, remove } = useWishlist();

  if (authLoading) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-background">
        <Loader2 className="tw-h-8 tw-w-8 tw-animate-spin tw-text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <main className="tw-min-h-screen tw-bg-background tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Heart className="tw-h-16 tw-w-16 tw-text-muted-foreground tw-mx-auto tw-mb-6" />
          <h1 className="tw-text-3xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-4">
            Sign in to view your wishlist
          </h1>
          <p className="tw-text-muted-foreground tw-mb-8">
            Create an account or sign in to save items for later.
          </p>
          <Button asChild size="lg">
            <Link to="/auth" className="hover:tw-text-primary-foreground">Sign In / Register</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="tw-min-h-screen tw-bg-background">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8 tw-py-20">
          <div className="tw-text-center tw-animate-in tw-fade-in tw-slide-in-from-bottom-4 tw-duration-700">
            <Heart className="tw-h-24 tw-w-24 tw-text-secondary tw-mx-auto tw-mb-6" />
            <h1 className="tw-text-4xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="tw-text-lg tw-font-paragraph tw-text-secondary tw-mb-8 tw-max-w-md tw-mx-auto">
              You haven't added any products to your wishlist yet. Start
              shopping to fill it up!
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-background">
      <section className="tw-bg-white tw-py-6 tw-border-b">
        <div className="tw-container tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <div className="tw-flex tw-items-center tw-justify-between">
            <div>
              <h1 className="tw-text-3xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-2">
                My Wishlist
              </h1>
              <p className="tw-font-paragraph tw-text-secondary">
                {count} {count === 1 ? 'item' : 'items'} in your wishlist
              </p>
            </div>
            <div className="tw-flex tw-items-center tw-gap-4">
              <Button
                asChild
                variant="outline"
                className="tw-border-foreground/20 tw-text-foreground tw-bg-transparent tw-shadow-sm hover:tw-bg-foreground/5 hover:tw-border-foreground/80 hover:tw-text-foreground"
              >
                <Link to="/products">
                  <ArrowLeft className="tw-mr-2 tw-h-4 tw-w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="tw-container tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-8 tw-pb-24">
        {loading ? (
          <div className="tw-flex tw-justify-center tw-py-20">
            <Loader2 className="tw-h-8 tw-w-8 tw-animate-spin tw-text-muted-foreground" />
          </div>
        ) : (
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
            {items.map((item) => (
              <div key={item.id} className="tw-group">
                <div className="tw-rounded-xl tw-border-foreground/10 tw-text-foreground tw-bg-background tw-overflow-hidden tw-border-0 tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300 tw-h-full">
                  <div className="tw-relative tw-h-64 tw-overflow-hidden">
                    <Link to={`/products/${item.slug || item.id}`}>
                      <img
                        src={item.thumbnail || '/placeholder.png'}
                        alt={item.title}
                        width="400"
                        height="256"
                        className="tw-object-cover tw-w-full tw-h-full group-hover:tw-scale-105 tw-transition-transform tw-duration-300"
                      />
                    </Link>

                    <div className="tw-absolute tw-top-4 tw-right-4">
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label="Remove from wishlist"
                        className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-font-normal tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-h-8 tw-text-xs tw-bg-white/90 hover:tw-bg-white tw-text-red-600 hover:tw-text-red-700 tw-rounded-full tw-p-2"
                      >
                        <Trash2 className="tw-h-4 tw-w-4" />
                      </button>
                    </div>

                    {item.price_original &&
                      item.price_original > item.price_cents && (
                        <div className="tw-absolute tw-top-4 tw-left-4">
                          <div className="tw-inline-flex tw-items-center tw-rounded-md tw-border tw-px-2.5 tw-py-1.5 tw-text-xs tw-font-medium tw-transition-colors tw-border-transparent tw-shadow tw-bg-green-600 tw-text-white">
                            Sale
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="tw-p-6 tw-flex tw-flex-col tw-h-full">
                    <div className="tw-flex-1">
                      <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2 tw-mt-2">
                        <div className="tw-flex tw-items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`tw-h-4 tw-w-4 ${i < Math.round(item.rating || 0)
                                ? 'tw-text-soft-gold tw-fill-current'
                                : 'tw-text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="tw-text-sm tw-font-paragraph tw-text-secondary">
                          ({Number(item.rating || 0).toFixed(1)})
                        </span>
                      </div>

                      <h3 className="tw-text-lg tw-font-heading tw-font-medium tw-text-foreground tw-mb-2 tw-line-clamp-2">
                        <Link
                          to={`/products/${item.slug || item.id}`}
                          className="tw-text-foreground hover:tw-text-foreground tw-transition-colors"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {item.title}
                        </Link>
                      </h3>

                      <p className="tw-text-sm tw-font-paragraph tw-text-secondary tw-mb-4">
                        {item.category_name}
                      </p>

                      <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
                        <span className="tw-text-xl tw-font-heading tw-font-semibold tw-text-foreground">
                          {money(item.price_cents, item.currency || 'USD')}
                        </span>
                        {item.price_original &&
                          item.price_original > item.price_cents && (
                            <span className="tw-text-sm tw-font-paragraph tw-text-secondary tw-line-through">
                              {money(
                                item.price_original,
                                item.currency || 'USD'
                              )}
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="tw-flex tw-gap-2 tw-mt-auto">
                      <button
                        type="button"
                        className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-normal tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-text-primary-foreground tw-shadow tw-h-9 tw-px-4 tw-py-2 tw-flex-1 tw-bg-primary hover:tw-bg-primary/90"
                        onClick={() => {
                          nav(`/products/${item.slug || item.id}`);
                        }}
                      >
                        <ShoppingCart className="tw-mr-2 tw-h-4 tw-w-4" />
                        Add to Cart
                      </button>

                      <Link
                        to={`/products/${item.slug || item.id}`}
                        className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-font-normal tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-border tw-border-primary/20 tw-text-primary tw-bg-transparent tw-shadow-sm hover:tw-bg-primary/10 hover:tw-border-primary/80 tw-h-8 tw-rounded-md tw-px-3 tw-text-xs"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}