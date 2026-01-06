import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load(signal) {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiFetch('/api/categories', { signal });
      setCategories(data || []);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error loading categories:', e);
        setError(e);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, []);

  if (loading) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-background">
        <div className="tw-animate-spin tw-rounded-full tw-h-32 tw-w-32 tw-border-b-2 tw-border-primary" />
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-background">
      <section className="tw-bg-white tw-pt-0 tw-pb-8 lg:tw-pt-0 lg:tw-pb-10">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          <div className="tw-text-center">
            <h1 className="tw-text-5xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-6">
              Product Categories
            </h1>
            <p className="tw-text-lg tw-font-paragraph tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">
              Explore our comprehensive range of grooming categories, each carefully curated for the modern gentleman.
            </p>
          </div>
        </div>
      </section>

      <section className="tw-py-16">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          {error ? (
            <div className="tw-text-center tw-py-16">
              <p className="tw-text-red-500 tw-mb-4">Failed to load categories.</p>
              <Button onClick={() => load()}>
                Retry
              </Button>
            </div>
          ) : categories.length > 0 ? (
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="tw-group tw-cursor-pointer tw-h-full"
                >
                  <Link
                    to={`/products?category=${encodeURIComponent(category.slug)}&page=1`}
                    className="tw-h-full tw-block"
                  >
                    <Card className="tw-overflow-hidden tw-border-0 tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300 tw-h-full tw-flex tw-flex-col">
                      <div className="tw-relative tw-h-64 tw-overflow-hidden">
                        <Image
                          src={category.hero_image || '/images/placeholder.jpg'}
                          alt={category.name}
                          className="tw-object-cover tw-w-full tw-h-full group-hover:tw-scale-105 tw-transition-transform tw-duration-300"
                        />
                        <div className="tw-absolute tw-inset-0 tw-bg-black/20 group-hover:tw-bg-black/10 tw-transition-colors tw-duration-300" />
                        <div className="tw-absolute tw-top-4 tw-right-4">
                          <Badge className="tw-bg-soft-gold tw-text-white tw-border-none hover:tw-bg-soft-gold/90">
                            {category.product_count || 0} Products
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="tw-p-6 tw-flex-1 tw-flex tw-flex-col">
                        <h3 className="tw-text-2xl tw-font-heading tw-font-medium tw-text-foreground tw-mb-3">
                          {category.name}
                        </h3>
                        <p className="tw-font-paragraph tw-text-muted-foreground tw-mb-4 tw-line-clamp-3 tw-flex-1">
                          {category.description || `Explore our premium collection of ${category.name}.`}
                        </p>
                        <div className="tw-flex tw-items-center tw-justify-between tw-mt-auto">
                          <span className="tw-text-sm tw-font-paragraph tw-text-muted-foreground">
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="group-hover:tw-bg-primary group-hover:tw-text-primary-foreground tw-transition-colors tw-duration-300"
                          >
                            Explore <ArrowRight className="tw-ml-2 tw-h-4 tw-w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="tw-text-center tw-py-16">
              <Package className="tw-h-16 tw-w-16 tw-text-muted-foreground tw-mx-auto tw-mb-4" />
              <h3 className="tw-text-2xl tw-font-heading tw-font-medium tw-text-foreground tw-mb-2">
                No Categories Available
              </h3>
              <p className="tw-font-paragraph tw-text-muted-foreground tw-mb-6">
                Categories are being updated. Please check back soon.
              </p>
              <Button asChild>
                <Link to="/products?page=1">
                  Browse All Products
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="tw-py-16 tw-bg-white">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8 tw-text-center">
          <h2 className="tw-text-3xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="tw-text-lg tw-font-paragraph tw-text-muted-foreground tw-mb-8 tw-max-w-2xl tw-mx-auto">
            Browse our complete product collection or contact our experts for personalized recommendations.
          </p>
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-justify-center">
            <Button asChild size="lg" className="tw-bg-primary hover:tw-bg-primary/90">
              <Link to="/products?page=1" className="hover:tw-text-primary-foreground">
                View All Products <ArrowRight className="tw-ml-2 tw-h-5 tw-w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact" className="hover:tw-text-foreground">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}