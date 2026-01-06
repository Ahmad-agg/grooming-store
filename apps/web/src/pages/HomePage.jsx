import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Zap, Shield, Award } from 'lucide-react';

import { apiFetch } from '../lib/api';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const BANNERS = [
    {
      id: 'apex',
      title: 'Introducing The Apex Razor',
      description:
        'Experience the closest shave with our revolutionary new razor.',
      image: '/images/banners/apex-razor.jpg',
      to: '/products?category=shaving',
    },
    {
      id: 'gifts',
      title: 'Ultimate Grooming Gifts',
      description:
        'Discover ready-made gift sets for every occasion.',
      image: '/images/banners/gift-sets.jpg',
      to: '/products?category=gift-sets',
    },
  ];

  useEffect(() => {
    const ac = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setErr(null);

        const json = (await apiFetch('/api/home', { signal: ac.signal })) || {};
        const featured = Array.isArray(json.featuredProducts)
          ? json.featuredProducts
          : [];
        const cats = Array.isArray(json.categories) ? json.categories : [];

        const toSlugFallback = (text) =>
          String(text || '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        setProducts(
          featured.map((p) => ({
            id: p.id,
            slug: p.slug, 
            name: p.title,
            priceUSD: ((p.price_cents || 0) / 100).toFixed(2),
            thumbnail:
              p.thumbnail ||
              `/images/products/${toSlugFallback(p.title)}.jpg`,
            description: p.description || '',
          }))
        );

        setCategories(
          cats.map((c) => ({
            id: c.id,
            slug: c.slug, 
            name: c.name,
            description:
              c.description ||
              'Essential products for modern men’s grooming routines.',
            image:
              c.hero_image ||
              `/images/categories/${toSlugFallback(c.name)}.jpg`,
          }))
        );

        setStats(json.stats || null);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e);
          setErr(e);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => ac.abort();
  }, []);

  if (loading) {
    return (
      <div className="tw-min-h-[70vh] tw-flex tw-items-center tw-justify-center tw-bg-background">
        <div className="tw-animate-spin tw-rounded-full tw-h-16 tw-w-16 tw-border-b-2 tw-border-primary" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="tw-min-h-[60vh] tw-flex tw-items-center tw-justify-center">
        <p className="tw-text-red-600 tw-text-center">
          Failed to load home content. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="tw-w-full tw-min-h-screen tw-bg-background tw-overflow-x-hidden">
      <section className="tw-w-full tw-min-h-[70vh] tw-flex tw-items-center tw-justify-center tw-relative tw-overflow-hidden tw-py-8 lg:tw-py-10">
        <div className="tw-max-w-[120rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-w-full">
          <div className="tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-justify-between tw-gap-8 lg:tw-gap-16">
            <motion.div
              className="tw-w-full lg:tw-w-1/2 tw-text-center lg:tw-text-left tw-z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.h1
                className="tw-text-3xl sm:tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-heading tw-font-bold tw-text-foreground tw-mb-4 lg:tw-mb-6 tw-leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Elevate Your Grooming Ritual
              </motion.h1>

              <motion.p
                className="tw-text-base sm:tw-text-lg lg:tw-text-xl tw-font-paragraph tw-font-light tw-text-muted-foreground tw-mb-6 lg:tw-mb-8 tw-leading-relaxed tw-max-w-lg tw-mx-auto lg:tw-mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Discover premium men&apos;s grooming essentials crafted for the
                modern gentleman. From precision razors to luxurious skincare,
                elevate every aspect of your daily routine.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="tw-flex tw-justify-center lg:tw-justify-start"
              >
                <Button className="tw-bg-primary hover:tw-bg-primary/90 tw-text-primary-foreground tw-px-5 tw-py-2 tw-text-sm lg:tw-text-base tw-flex tw-items-center">
                  <Link
                    to="/products"
                    className="tw-text-primary-foreground hover:tw-text-primary-foreground tw-no-underline tw-flex tw-items-center"
                  >
                    Shop Collection
                    <ArrowRight className="tw-ml-2 tw-h-4 tw-w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="tw-w-full lg:tw-w-1/2 tw-relative tw-max-w-md lg:tw-max-w-xl tw-mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="tw-relative">
                <Image
                  src="/images/Hero/hero.jpg"
                  alt="Premium men's grooming kit"
                  width={600}
                  height={600}
                  className="tw-object-cover tw-rounded-lg tw-shadow-2xl tw-w-full tw-h-auto"
                />

                <div className="tw-absolute -tw-bottom-3 -tw-right-3 tw-bg-soft-gold tw-text-white tw-p-3 tw-rounded-lg tw-shadow-lg">
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <Award className="tw-h-5 tw-w-5" />
                    <span className="tw-font-paragraph tw-font-medium tw-text-sm">
                      Premium Quality
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="tw-py-12 lg:tw-py-20 tw-bg-white">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="tw-text-center tw-mb-12 lg:tw-mb-16"
          >
            <h2 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-heading tw-font-bold tw-text-foreground tw-mb-4 lg:tw-mb-6">
              Why Choose Our Products
            </h2>
            <p className="tw-text-base lg:tw-text-lg tw-font-paragraph tw-font-light tw-text-muted-foreground tw-max-w-2xl tw-mx-auto tw-px-4">
              Experience the difference with our carefully curated collection of
              premium grooming essentials.
            </p>
          </motion.div>

          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-8 lg:tw-gap-12">
            {[
              {
                icon: <Zap className="tw-h-6 tw-w-6 lg:tw-h-8 lg:tw-w-8" />,
                title: 'Premium Quality',
                description:
                  "Handpicked products from the world's finest grooming brands.",
              },
              {
                icon: <Shield className="tw-h-6 tw-w-6 lg:tw-h-8 lg:tw-w-8" />,
                title: 'Trusted by Experts',
                description:
                  'Recommended by professional barbers and grooming specialists.',
              },
              {
                icon: <Star className="tw-h-6 tw-w-6 lg:tw-h-8 lg:tw-w-8" />,
                title: 'Exceptional Service',
                description:
                  'Dedicated customer support and fast, secure delivery.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="tw-text-center tw-px-4"
              >
                <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-12 tw-h-12 lg:tw-w-16 lg:tw-h-16 tw-bg-soft-gold/10 tw-text-soft-gold tw-rounded-full tw-mb-4 lg:tw-mb-6">
                  {feature.icon}
                </div>
                <h3 className="tw-text-xl lg:tw-text-2xl tw-font-heading tw-font-medium tw-text-foreground tw-mb-3 lg:tw-mb-4">
                  {feature.title}
                </h3>
                <p className="tw-font-paragraph tw-font-light tw-text-muted-foreground tw-leading-relaxed tw-text-sm lg:tw-text-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="tw-py-12 lg:tw-py-20 tw-bg-background">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="tw-text-center tw-mb-12 lg:tw-mb-16"
          >
            <h2 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-heading tw-font-bold tw-text-foreground tw-mb-4 lg:tw-mb-6">
              Shop by Category
            </h2>
            <p className="tw-text-base lg:tw-text-lg tw-font-paragraph tw-font-light tw-text-muted-foreground tw-max-w-2xl tw-mx-auto">
              Explore our comprehensive range of grooming essentials.
            </p>
          </motion.div>

          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 lg:tw-gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="tw-cursor-pointer"
              >
                <div className="tw-group tw-h-full">
                  <Card className="tw-h-full tw-overflow-hidden tw-rounded-2xl tw-border tw-border-black/10 tw-bg-white tw-shadow-md group-hover:tw-shadow-lg tw-transition-shadow tw-duration-200">
                    <div className="tw-relative tw-h-48 sm:tw-h-56 lg:tw-h-64 tw-overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={800}
                        height={600}
                        className="tw-h-full tw-w-full tw-object-cover tw-transition-transform tw-duration-200 group-hover:tw-scale-[1.03]"
                      />
                    </div>

                    <CardContent className="tw-px-5 tw-pt-6 tw-pb-6 lg:tw-px-6">
                      <h3 className="tw-text-lg sm:tw-text-xl lg:tw-text-2xl tw-font-heading tw-font-medium tw-text-foreground tw-mb-3">
                        {category.name}
                      </h3>

                      <p className="tw-font-paragraph tw-font-light tw-text-muted-foreground tw-text-sm lg:tw-text-base tw-leading-relaxed tw-mb-6 tw-line-clamp-3">
                        {category.description}
                      </p>

                      <Link
                        to={`/products?category=${encodeURIComponent(
                          category.slug
                        )}`}
                        className="
                          tw-block tw-w-full tw-text-center
                          tw-rounded-lg
                          tw-bg-transparent
                          tw-text-gray-500
                          tw-py-3
                          tw-text-sm lg:tw-text-base
                          tw-transition-colors tw-duration-200
                          !tw-border !tw-border-solid !tw-border-gray-300
                          group-hover:tw-bg-[#2b2b2b]
                          group-hover:tw-text-white
                          group-hover:!tw-border-[#2b2b2b]
                        "
                      >
                        Explore Category
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="tw-py-12 lg:tw-py-20 tw-bg-white">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="tw-text-center tw-mb-12 lg:tw-mb-16"
          >
            <h2 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-heading tw-font-bold tw-text-foreground tw-mb-4 lg:tw-mb-6">
              Featured Products
            </h2>
            <p className="tw-text-base lg:tw-text-lg tw-font-paragraph tw-font-light tw-text-muted-foreground tw-max-w-2xl tw-mx-auto tw-px-4">
              Discover our most popular and highly-rated grooming essentials.
            </p>
          </motion.div>

          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 lg:tw-gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="tw-cursor-pointer"
              >
                <div className="tw-group tw-h-full">
                  <Link
                    to={`/products/${product.slug}`}
                    className="tw-text-inherit tw-no-underline tw-block tw-h-full"
                  >
                    <Card className="tw-h-full tw-overflow-hidden tw-rounded-2xl tw-border tw-border-black/10 tw-bg-white tw-shadow-md group-hover:tw-shadow-lg tw-transition-shadow tw-duration-200">
                      <div className="tw-relative tw-h-40 sm:tw-h-48 lg:tw-h-56 tw-overflow-hidden">
                        <Image
                          src={product.thumbnail}
                          alt={product.name}
                          width={400}
                          height={256}
                          className="tw-object-cover tw-w-full tw-h-full tw-transition-transform tw-duration-200 group-hover:tw-scale-[1.03]"
                        />
                      </div>

                      <CardContent className="tw-p-3 lg:tw-p-4 tw-flex tw-flex-col tw-h-full">
                        <div className="tw-flex-1">
                          <h3 className="tw-text-lg lg:tw-text-xl tw-font-heading tw-font-medium tw-text-foreground tw-mb-1 tw-line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="tw-font-paragraph tw-font-light tw-text-muted-foreground tw-mb-3 tw-line-clamp-2 tw-text-sm">
                            {product.description || product.name}
                          </p>
                        </div>

                        <div className="tw-flex tw-items-center tw-justify-between tw-mt-auto">
                          <div className="tw-flex tw-flex-col">
                            <span className="tw-text-base lg:tw-text-lg tw-font-heading tw-font-bold tw-text-foreground">
                              ${product.priceUSD}
                            </span>
                          </div>

                          <Button
                            size="sm"
                            className="
                              tw-text-xs lg:tw-text-sm
                              tw-transition-colors tw-duration-200
                              tw-bg-transparent tw-text-gray-500
                              !tw-border !tw-border-solid !tw-border-gray-300
                              group-hover:tw-bg-[#2b2b2b]
                              group-hover:tw-text-white
                              group-hover:!tw-border-[#2b2b2b]
                            "
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="tw-text-center tw-mt-8 lg:tw-mt-12"
          >
            <Button
              asChild
              variant="outline"
              className="tw-px-5 tw-py-2 tw-text-sm lg:tw-text-base"
            >
              <Link
                to="/products"
                className="tw-text-foreground hover:tw-text-foreground tw-no-underline"
              >
                View All Products <ArrowRight className="tw-ml-2 tw-h-4 tw-w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="tw-py-12 lg:tw-py-20 tw-bg-background">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6 lg:tw-gap-8">
            {BANNERS.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="tw-group tw-cursor-pointer"
              >
                <Link
                  to={banner.to}
                  className="tw-block tw-no-underline"
                >
                  <div className="tw-relative tw-overflow-hidden tw-rounded-2xl tw-shadow-lg group-hover:tw-shadow-xl tw-transition-shadow tw-duration-200">
                    <div className="tw-relative tw-h-64 sm:tw-h-72 lg:tw-h-80">
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        width={1200}
                        height={700}
                        className="tw-object-cover tw-w-full tw-h-full tw-transition-transform tw-duration-200 tw-ease-out group-hover:tw-scale-[1.03]"
                      />

                      <div className="tw-absolute tw-inset-0 tw-bg-black/35 tw-transition-colors tw-duration-200 group-hover:tw-bg-black/25" />

                      <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-text-center tw-p-6 lg:tw-p-10">
                        <div className="tw-max-w-[28rem]">
                          <h3 className="tw-text-2xl sm:tw-text-3xl lg:tw-text-4xl tw-font-heading tw-font-medium tw-text-white tw-mb-3">
                            {banner.title}
                          </h3>

                          <p className="tw-font-paragraph tw-text-white/85 tw-mb-5 tw-text-sm sm:tw-text-base tw-leading-relaxed">
                            {banner.description}
                          </p>

                          <Button
                            className="
                              tw-bg-soft-gold tw-text-white
                              tw-px-6 tw-py-2.5 tw-text-sm sm:tw-text-base
                              tw-rounded-lg
                              tw-transition-all tw-duration-200
                              group-hover:tw-bg-soft-gold/90
                              group-hover:tw-shadow-md
                            "
                          >
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}