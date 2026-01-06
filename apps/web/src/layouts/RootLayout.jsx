import { useEffect, useState, useRef } from 'react';
import {
  NavLink,
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useCart } from '../Hooks/CartContext';
import ScrollToTop from '../pages/ScrollToTop.jsx';
import { useAuth } from '../Hooks/AuthContext';
import Footer from '../components/Footer.jsx';
import { apiFetch } from '../lib/api';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ShoppingCart,
  Heart,
  LogOut,
  LogIn,
  Package,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RootLayout() {
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthed, user, loading: authLoading } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setQuery(q);
    setSuggestions([]);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isSearchOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSuggestions([]);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setSuggestions([]);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  async function fetchSuggestions(term) {
    const trimmed = term.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setSuggestLoading(true);
      const params = new URLSearchParams();
      params.set('q', trimmed);
      params.set('page', '1');
      params.set('limit', '5');

      const res = await apiFetch(`/api/products?${params.toString()}`);
      setSuggestions(res.data || []);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  }

  function handleSearchSubmit(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const q = query.trim();
    if (!q) return;
    setSuggestions([]);
    setIsSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleSuggestionClick(prod) {
    setSuggestions([]);
    setQuery('');
    setIsSearchOpen(false);
    navigate(`/products/${prod.slug || prod.id}`);
  }

  const greetingName =
    user?.first_name ||
    user?.firstName ||
    (user?.email ? user.email.split('@')[0] : '');

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <ScrollToTop />

      {!location.pathname.startsWith('/seller') && (
        <header
          className={cn(
            'tw-sticky tw-top-0 tw-z-50 tw-transition-all tw-duration-300 tw-bg-white',
            isScrolled ? 'tw-shadow-md tw-bg-white/95 tw-backdrop-blur-md' : ''
          )}
        >
          <div className="tw-max-w-[100rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
            <div className="tw-flex tw-items-center tw-justify-between tw-h-16 lg:tw-h-20">
              <Link to="/" className="tw-flex tw-items-center">
                <span className="tw-text-xl lg:tw-text-2xl tw-font-heading tw-font-bold tw-text-foreground hover:tw-scale-105 tw-transition-transform tw-duration-200">
                  GroomingCo
                </span>
              </Link>

              <nav className="tw-hidden lg:tw-flex tw-items-center tw-space-x-6 xl:tw-space-x-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                      cn(
                        'tw-font-paragraph tw-text-sm xl:tw-text-base tw-transition-colors tw-duration-300 hover:tw-text-soft-gold',
                        isActive ? 'tw-text-soft-gold' : 'tw-text-foreground'
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>

              <div className="tw-flex tw-items-center tw-gap-2 lg:tw-gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="tw-hidden md:tw-flex tw-p-2"
                  title="Search Products (Ctrl+K)"
                  onClick={() => {
                    setIsSearchOpen(true);
                    setSuggestions([]);
                  }}
                >
                  <Search className="tw-h-4 tw-w-4" />
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="tw-hidden md:tw-flex tw-p-2"
                >
                  <Link to="/wishlist">
                    <Heart className="tw-h-4 tw-w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="tw-relative tw-p-2"
                >
                  <Link to="/cart">
                    <ShoppingCart className="tw-h-4 tw-w-4" />
                    {count > 0 && (
                      <Badge className="tw-absolute -tw-top-1 -tw-right-1 tw-h-4 tw-w-4 lg:tw-h-5 lg:tw-w-5 tw-flex tw-items-center tw-justify-center tw-p-0 tw-bg-soft-gold tw-text-white tw-text-xs hover:tw-bg-soft-gold/90">
                        {count}
                      </Badge>
                    )}
                  </Link>
                </Button>

                {authLoading ? (
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <div className="tw-hidden lg:tw-inline tw-w-16 tw-h-4 tw-rounded tw-bg-gray-200 tw-animate-pulse" />
                  </div>
                ) : isAuthed ? (
                  <div className="tw-flex tw-items-center tw-gap-2">
                    {greetingName && (
                      <span className="tw-hidden lg:tw-inline tw-text-xs xl:tw-text-sm tw-font-paragraph tw-text-foreground">
                        Hi, {greetingName}
                      </span>
                    )}

                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="tw-p-2"
                      title="My Orders"
                    >
                      <Link to="/my-orders">
                        <Package className="tw-h-4 tw-w-4" />
                      </Link>
                    </Button>

                    {(user?.role === 'seller' || user?.role === 'admin') && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="tw-text-xs hover:tw-text-foreground"
                      >
                        <Link to="/seller">Dashboard</Link>
                      </Button>
                    )}

                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="tw-p-2"
                      title="Logout"
                    >
                      <Link to="/logout">
                        <LogOut className="tw-h-4 tw-w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="tw-flex tw-items-center tw-text-xs xl:tw-text-sm"
                  >
                    <Link to="/auth">
                      <LogIn className="tw-h-4 tw-w-4 tw-mr-1 lg:tw-mr-2" />
                      Sign In
                    </Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:tw-hidden tw-p-2"
                >
                  <Menu className="tw-h-4 tw-w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {isSearchOpen && (
        <div
          className="tw-fixed tw-inset-0 tw-z-[60] tw-bg-black/60 tw-backdrop-blur-sm tw-flex tw-items-start tw-justify-center tw-animate-in tw-fade-in tw-duration-200"
          onClick={() => {
            setIsSearchOpen(false);
            setSuggestions([]);
          }}
        >
          <div
            className="tw-bg-white tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-lg tw-mx-4 tw-mt-20 md:tw-mt-32 tw-overflow-hidden tw-animate-in tw-zoom-in-95 tw-duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tw-flex tw-items-center tw-gap-4 tw-p-5 tw-border-b tw-border-gray-100">
              <Search className="tw-h-6 tw-w-6 tw-text-gray-400" />
              <form onSubmit={handleSearchSubmit} className="tw-flex-1">
                <input
                  ref={inputRef}
                  type="search"
                  placeholder="What are you looking for?"
                  aria-label="Search products"
                  value={query}
                  onChange={handleSearchChange}
                  className="tw-w-full tw-border-none tw-bg-transparent tw-text-xl tw-font-heading tw-text-foreground tw-placeholder:tw-text-gray-300 focus:tw-outline-none focus:tw-ring-0"
                  autoComplete="off"
                />
              </form>
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSuggestions([]);
                }}
                className="tw-p-2 tw-rounded-full hover:tw-bg-gray-50 tw-text-gray-400 hover:tw-text-gray-600 tw-transition-colors"
                aria-label="Close search"
              >
                <X className="tw-h-5 tw-w-5" />
              </button>
            </div>

            <div className="tw-bg-gray-50/50 tw-min-h-[100px]">
              {suggestLoading ? (
                <div className="tw-p-8 tw-text-center tw-text-gray-400">
                  <div className="tw-inline-block tw-h-6 tw-w-6 tw-animate-spin tw-rounded-full tw-border-2 tw-border-solid tw-border-current tw-border-r-transparent tw-align-[-0.125em] motion-reduce:tw-animate-[spin_1.5s_linear_infinite]" />
                  <p className="tw-mt-2 tw-text-sm">Searching...</p>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="tw-max-h-[60vh] tw-overflow-y-auto tw-p-2">
                  <div className="tw-mb-2 tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-gray-400 tw-uppercase tw-tracking-wider">
                    Products
                  </div>
                  <ul className="tw-space-y-1">
                    {suggestions.map((p) => {
                      const priceText =
                        typeof p.price_cents === 'number'
                          ? `${(p.price_cents / 100).toFixed(2)} ${p.currency || 'USD'}`
                          : '—';
                      const categoryLabel =
                        p.category?.name || p.category_name || 'Premium Grooming';

                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(p)}
                            className="tw-w-full tw-group tw-flex tw-items-center tw-gap-3 tw-p-2 tw-rounded-lg hover:tw-bg-white hover:tw-shadow-sm tw-transition-all tw-duration-200"
                          >
                            <div className="tw-h-12 tw-w-12 tw-flex-shrink-0 tw-bg-white tw-rounded-md tw-border tw-border-gray-100 tw-p-0.5 tw-overflow-hidden">
                              <img
                                src={p.thumbnail || '/images/placeholder-product.jpg'}
                                alt={p.title}
                                className="tw-h-full tw-w-full tw-object-contain tw-transition-transform group-hover:tw-scale-105"
                              />
                            </div>

                            <div className="tw-flex-1 tw-text-left">
                              <h4 className="tw-font-heading tw-font-semibold tw-text-foreground tw-text-base group-hover:tw-text-primary tw-transition-colors">
                                {p.title}
                              </h4>
                              <p className="tw-text-xs tw-text-gray-500 tw-truncate tw-max-w-[180px]">
                                {categoryLabel}
                              </p>
                            </div>

                            <div className="tw-text-right">
                              <div className="tw-font-heading tw-font-semibold tw-text-foreground tw-text-sm">
                                {priceText}
                              </div>
                              <span className="tw-text-xs tw-text-gray-300 group-hover:tw-text-primary/60 tw-transition-colors">
                                View  &rarr;
                              </span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="tw-p-2 tw-mt-2 tw-border-t tw-border-gray-100">
                    <button
                      onClick={handleSearchSubmit}
                      className="tw-w-full tw-py-3 tw-text-center tw-text-sm tw-font-medium tw-text-gray-500 hover:tw-text-primary tw-transition-colors"
                    >
                      View all results for &quot;{query}&quot;
                    </button>
                  </div>
                </div>
              ) : query.trim().length >= 2 ? (
                <div className="tw-p-12 tw-text-center">
                  <Package className="tw-h-12 tw-w-12 tw-mx-auto tw-text-gray-200 tw-mb-4" />
                  <p className="tw-text-foreground tw-font-medium">No products found</p>
                  <p className="tw-text-sm tw-text-gray-400">
                    We couldn&apos;t find anything for &quot;{query}&quot;. Try different keywords.
                  </p>
                </div>
              ) : (
                <div className="tw-p-12 tw-text-center tw-text-gray-400">
                  <Search className="tw-h-12 tw-w-12 tw-mx-auto tw-text-gray-200 tw-mb-4" />
                  <p className="tw-text-sm">Start typing to search...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main
        className={cn(
          location.pathname !== '/' &&
          !location.pathname.startsWith('/products') &&
          !location.pathname.startsWith('/wishlist') &&
          !location.pathname.startsWith('/contact') &&
          !location.pathname.startsWith('/cart') &&
          !location.pathname.startsWith('/my-orders') &&
          !location.pathname.startsWith('/checkout') &&
          !location.pathname.startsWith('/orders') &&
          !location.pathname.startsWith('/seller') &&
          !location.pathname.startsWith('/auth') &&
          'tw-container tw-mx-auto tw-px-4 tw-py-8'
        )}
      >
        <Outlet />
      </main>

      <Footer />
    </>
  );
}