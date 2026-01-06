import { useState, useEffect, useRef } from 'react';
import { Search, Grid, List, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { apiFetch } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [priceDraft, setPriceDraft] = useState({ min: '', max: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [priceValidationError, setPriceValidationError] = useState(null);

  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    hasMore: false,
  });

  const timeoutRef = useRef(null);
  const listTopRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false); 

  const sortOptions = {
    newest: 'Newest Arrivals',
    price_asc: 'Price: Low to High',
    price_desc: 'Price: High to Low',
    rating_desc: 'Popularity',
  };

  useEffect(() => {
    const ac = new AbortController();

    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const initialQ = params.get('q') || '';
        const initialCat = params.get('category') || '';
        const initialMin = params.get('price_min') || '';
        const initialMax = params.get('price_max') || '';
        const initialPage = Number(params.get('page') || '1');

        if (initialQ) setSearchQuery(initialQ);
        if (initialMin || initialMax) {
          setPriceDraft({ min: initialMin, max: initialMax });
          setPriceRange({ min: initialMin, max: initialMax });
        }
        if (!Number.isNaN(initialPage) && initialPage > 0) {
          setPage(initialPage);
        }

        const res = await apiFetch('/api/categories', { signal: ac.signal });
        if (res?.data) {
          const mapped = res.data.map((c) => ({ name: c.name, slug: c.slug }));
          setCategories(mapped);

          if (initialCat && mapped.some((c) => c.slug === initialCat)) {
            setSelectedCategories([initialCat]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    init();
    return () => ac.abort();
  }, []);

  const fetchProducts = async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (selectedCategories.length > 0) {
        params.append('category', selectedCategories[0]); 
      }
      if (priceRange.min) params.append('price_min', priceRange.min);
      if (priceRange.max) params.append('price_max', priceRange.max);

      params.append('sort', sortBy);
      params.append('page', String(page));
      params.append('limit', String(pagination.limit || 24));

      const res = await apiFetch(`/api/products?${params.toString()}`, {
        signal,
      });

      const items = res.data || [];

      setProducts(
        items.map((p) => ({
          id: p.id,
          name: p.title,
          slug: p.slug,
          price: (p.price_cents / 100).toFixed(2),
          image: p.thumbnail || '/images/placeholder.jpg',
          description: p.description || '',
          rating: p.rating || 0,
          isPopular: (p.rating || 0) > 4.5,
        }))
      );

      if (res.pagination) {
        setPagination(res.pagination);
      } else {
        const limit = Number(pagination.limit || 24);
        setPagination({
          page,
          limit,
          total: items.length,
          hasMore: items.length === limit,
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      fetchProducts(ac.signal);
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      ac.abort();
    };
  }, [searchQuery, selectedCategories, priceRange, sortBy, page]);

  useEffect(() => {
    if (!hasInteracted) return;
    if (!listTopRef.current) return;

    const rect = listTopRef.current.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const offset = 120; 
    const target = Math.max(absoluteTop - offset, 0);

    window.scrollTo({
      top: target,
      behavior: 'smooth',
    });
  }, [products, hasInteracted]);


  const handleCategoryChange = (slug) => {
    setHasInteracted(true);
    setSelectedCategories((prev) =>
      prev.includes(slug) ? [] : [slug]
    );
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setHasInteracted(true);
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setHasInteracted(true);
    setSortBy(value);
    setPage(1);
  };

  const handleApplyPrice = () => {
    const minStr = (priceDraft.min || '').trim();
    const maxStr = (priceDraft.max || '').trim();

    if (minStr && maxStr && Number(minStr) > Number(maxStr)) {
      setPriceValidationError('Min price cannot be greater than max price.');
      return;
    }

    setPriceValidationError(null);
    setHasInteracted(true);
    setPriceRange({ min: minStr, max: maxStr });
    setPage(1);
  };

  const handleClearAll = () => {
    setHasInteracted(true);
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceDraft({ min: '', max: '' });
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setPriceValidationError(null);
    setPage(1);
  };

  const handlePageChange = (direction) => {
    setHasInteracted(true);
    setPage((prev) => {
      if (direction === 'prev') return Math.max(1, prev - 1);
      if (direction === 'next') {
        if (!pagination.hasMore) return prev;
        return prev + 1;
      }
      return prev;
    });
  };


  if (loading && products.length === 0) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-background">
        <div className="tw-animate-spin tw-rounded-full tw-h-32 tw-w-32 tw-border-b-2 tw-border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-background">
        <p className="tw-text-red-500">
          Failed to load products. Please try again later.
        </p>
      </div>
    );
  }

  const totalCount =
    typeof pagination.total === 'number' ? pagination.total : products.length;


  return (
    <div className="tw-bg-background tw-min-h-screen">
      <div className="tw-bg-white tw-py-8">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-text-center">
          <h1 className="tw-text-4xl md:tw-text-5xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-4">
            Premium Grooming Collection
          </h1>
          <p className="tw-text-base md:tw-text-lg tw-font-paragraph tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">
            Discover our complete range of premium men&apos;s grooming products,
            carefully curated for the modern gentleman.
          </p>
        </div>
      </div>

      <div
        ref={listTopRef}
        className="tw-max-w-[100rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-8"
      >
        <div className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-8">
          <aside className="tw-w-72 tw-flex-shrink-0 tw-hidden lg:tw-block">
            <div className="tw-bg-white tw-rounded-2xl tw-border tw-border-gray-200 tw-shadow-sm tw-p-6">
              <div className="tw-flex tw-items-center tw-justify-between tw-mb-6">
                <h3 className="tw-text-sm tw-font-semibold tw-text-gray-900">
                  Filters
                </h3>
                <button
                  onClick={handleClearAll}
                  className="tw-text-xs tw-text-gray-600 hover:tw-text-gray-900 tw-transition-colors tw-border tw-border-gray-300 tw-rounded-full tw-px-3 tw-py-1"
                >
                  Clear All
                </button>
              </div>

              <div className="tw-mb-6 tw-w-full">
                <label className="tw-text-xs tw-font-medium tw-text-gray-700 tw-block tw-mb-2">
                  Search Products
                </label>
                <div className="tw-relative tw-w-full">
                  <Search className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-h-4 tw-w-4 tw-text-gray-400" />
                  <input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className=" tw-h-9 tw-rounded-md tw-border tw-border-gray-300 tw-bg-white tw-px-3 tw-pl-9 tw-text-sm tw-text-gray-900 placeholder:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-gray-400 focus:tw-border-gray-400"
                  />
                </div>
              </div>

              <div className="tw-h-px tw-bg-gray-200 tw-my-5"></div>

              <div className="tw-mb-6">
                <label className="tw-text-xs tw-font-medium tw-text-gray-700 tw-block tw-mb-3">
                  Categories
                </label>
                <div className="tw-space-y-2.5">
                  {categories.map((category) => (
                    <div
                      key={category.slug}
                      className="tw-flex tw-items-center"
                    >
                      <input
                        type="checkbox"
                        id={category.slug}
                        checked={selectedCategories.includes(category.slug)}
                        onChange={() => handleCategoryChange(category.slug)}
                        className="tw-h-4 tw-w-4 tw-rounded tw-border-gray-300 tw-text-gray-900 focus:tw-ring-gray-500 tw-cursor-pointer"
                      />
                      <label
                        htmlFor={category.slug}
                        className="tw-ml-2.5 tw-text-sm tw-text-gray-700 tw-cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tw-h-px tw-bg-gray-200 tw-my-5"></div>

              <div>
                <label className="tw-text-xs tw-font-medium tw-text-gray-700 tw-block tw-mb-3">
                  Price Range (USD)
                </label>
                <div className="tw-flex tw-gap-2 tw-mb-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={priceDraft.min}
                    onChange={(e) =>
                      setPriceDraft((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="tw-w-full tw-h-9 tw-rounded-md tw-border tw-border-gray-300 tw-bg-white tw-px-3 tw-text-sm tw-text-gray-900 placeholder:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-gray-400 focus:tw-border-gray-400"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={priceDraft.max}
                    onChange={(e) =>
                      setPriceDraft((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="tw-w-full tw-h-9 tw-rounded-md tw-border tw-border-gray-300 tw-bg-white tw-px-3 tw-text-sm tw-text-gray-900 placeholder:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-gray-400 focus:tw-border-gray-400"
                  />
                </div>
                {priceValidationError && (
                  <p className="tw-text-xs tw-text-red-500 tw-mb-2">
                    {priceValidationError}
                  </p>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="tw-text-xs tw-px-3 tw-py-1"
                  onClick={handleApplyPrice}
                >
                  Apply
                </Button>
              </div>
            </div>
          </aside>

          <main className="tw-flex-1">
            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-mb-8 tw-gap-4">
              <span className="tw-font-paragraph tw-text-muted-foreground">
                {totalCount} products found
              </span>

              <div className="tw-flex tw-items-center tw-gap-4 tw-w-full sm:tw-w-auto">
                <div className="tw-w-52">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="tw-bg-white tw-border-gray-300 tw-border-solid tw-cursor-pointer">
                      <span className="tw-truncate">
                        {sortOptions[sortBy]}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest Arrivals</SelectItem>
                      <SelectItem value="price_asc">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price_desc">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="rating_desc">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="tw-flex tw-items-center tw-bg-white tw-rounded-md tw-border tw-border-input tw-p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`tw-flex tw-items-center tw-justify-center tw-p-1.5 tw-rounded-sm tw-transition-colors tw-border-none tw-cursor-pointer ${viewMode === 'grid'
                      ? 'tw-bg-foreground tw-text-white'
                      : 'tw-text-muted-foreground hover:tw-text-foreground tw-bg-transparent'
                      }`}
                  >
                    <Grid className="tw-h-4 tw-w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`tw-flex tw-items-center tw-justify-center tw-p-1.5 tw-rounded-sm tw-transition-colors tw-border-none tw-cursor-pointer ${viewMode === 'list'
                      ? 'tw-bg-foreground tw-text-white'
                      : 'tw-text-muted-foreground hover:tw-text-foreground tw-bg-transparent'
                      }`}
                  >
                    <List className="tw-h-4 tw-w-4" />
                  </button>
                </div>
              </div>
            </div>

            {products.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-8'
                      : 'tw-space-y-6'
                  }
                >
                  {products.map((product) => (
                    <Link
                      to={`/products/${product.slug}`}
                      key={product.id}
                      className="tw-group tw-block"
                    >
                      {viewMode === 'grid' ? (
                        <Card className="tw-rounded-xl tw-border-foreground/10 tw-text-foreground tw-bg-background tw-overflow-hidden tw-border-0 tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300">
                          <div className="tw-relative tw-h-64 tw-overflow-hidden">
                            <Image
                              src={product.image}
                              alt={product.name}
                              className="tw-object-cover tw-w-full tw-h-full group-hover:tw-scale-105 tw-transition-transform tw-duration-300"
                            />
                            {product.isPopular && (
                              <Badge className="tw-absolute tw-top-4 tw-left-4 tw-bg-soft-gold tw-text-white tw-border-none tw-gap-1">
                                <Star className="tw-h-3 tw-w-3 tw-fill-current" />{' '}
                                Popular
                              </Badge>
                            )}
                          </div>
                          <div className="tw-p-6">
                            <h3 className="tw-text-xl tw-font-heading tw-font-medium tw-text-foreground tw-mb-2 tw-line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="tw-font-paragraph tw-text-secondary tw-mb-4 tw-line-clamp-2">
                              {product.description || 'Product description.'}
                            </p>
                            <div className="tw-flex tw-items-center tw-justify-between">
                              <div className="tw-flex tw-flex-col">
                                <span className="tw-text-lg tw-font-heading tw-font-semibold tw-text-foreground">
                                  ${product.price}
                                </span>
                              </div>
                              <Button className="tw-h-8 tw-rounded-md tw-px-3 tw-text-xs tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <Card className="tw-rounded-xl tw-border-foreground/10 tw-text-foreground tw-bg-background tw-overflow-hidden tw-border-0 tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300">
                          <div className="tw-flex">
                            <div className="tw-relative tw-w-48 tw-h-32 tw-overflow-hidden tw-flex-shrink-0">
                              <Image
                                src={product.image}
                                alt={product.name}
                                className="tw-object-cover tw-w-full tw-h-full group-hover:tw-scale-105 tw-transition-transform tw-duration-300"
                              />
                            </div>
                            <div className="tw-flex-1 tw-p-6">
                              <div className="tw-flex tw-justify-between tw-items-start">
                                <div className="tw-flex-1">
                                  <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                                    <h3 className="tw-text-xl tw-font-heading tw-font-medium tw-text-foreground">
                                      {product.name}
                                    </h3>
                                    {product.isPopular && (
                                      <Badge className="tw-inline-flex tw-items-center tw-rounded-md tw-border tw-px-2.5 tw-py-1.5 tw-text-xs tw-font-medium tw-border-transparent tw-shadow tw-bg-soft-gold tw-text-white tw-gap-1">
                                        <Star className="tw-h-3 tw-w-3 tw-fill-current" />{' '}
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="tw-font-paragraph tw-text-secondary tw-mb-4 tw-line-clamp-2">
                                    {product.description ||
                                      'Product description.'}
                                  </p>
                                </div>
                                <div className="tw-flex tw-flex-col tw-items-end tw-gap-4 tw-ml-6">
                                  <div className="tw-text-right">
                                    <span className="tw-text-lg tw-font-heading tw-font-semibold tw-text-foreground">
                                      ${product.price}
                                    </span>
                                  </div>
                                  <Button className="tw-h-8 tw-rounded-md tw-px-3 tw-text-xs tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </Link>
                  ))}
                </div>

                {totalCount > pagination.limit && (
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-4 tw-mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange('prev')}
                      disabled={page <= 1 || loading}
                    >
                      Prev
                    </Button>
                    <span className="tw-text-sm tw-text-muted-foreground">
                      Page {pagination.page || page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange('next')}
                      disabled={!pagination.hasMore || loading}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="tw-text-center tw-py-20">
                <h3 className="tw-text-xl tw-font-heading tw-mb-2">
                  No products found
                </h3>
                <p className="tw-text-muted-foreground">
                  Try adjusting your filters.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}