import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, Globe, Heart, Star, Shield } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';

export default function About() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState([]);
  const [values, setValues] = useState([]);

  async function load(signal) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiFetch('/api/about', { signal });
      setMetrics(data?.metrics || []);
      setValues(data?.values || []);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, []);

  const displayMetrics =
    metrics.length > 0
      ? metrics
      : [
        { value: '10+', label: 'Years of Excellence', icon: <Award className="tw-h-6 tw-w-6" /> },
        { value: '50K+', label: 'Happy Customers', icon: <Users className="tw-h-6 tw-w-6" /> },
        { value: '25+', label: 'Countries Served', icon: <Globe className="tw-h-6 tw-w-6" /> },
        { value: '100+', label: 'Premium Products', icon: <Star className="tw-h-6 tw-w-6" /> },
      ].map((m, i) => ({ ...m, id: i }));

  const displayValues =
    values.length > 0
      ? values
      : [
        {
          title: 'Passion for Quality',
          text: 'We are passionate about delivering the highest quality grooming products that exceed expectations.',
          icon: <Heart className="tw-h-8 tw-w-8" />,
        },
        {
          title: 'Trust & Reliability',
          text: 'Built on trust, we ensure every product meets our rigorous standards for safety and effectiveness.',
          icon: <Shield className="tw-h-8 tw-w-8" />,
        },
        {
          title: 'Customer First',
          text: 'Our customers are at the heart of everything we do, driving our commitment to excellence.',
          icon: <Users className="tw-h-8 tw-w-8" />,
        },
        {
          title: 'Global Reach',
          text: 'Serving gentlemen worldwide with premium grooming solutions and exceptional service.',
          icon: <Globe className="tw-h-8 tw-w-8" />,
        },
      ].map((v, i) => ({ ...v, id: i }));

  const valueIcons = [
    <Heart key="1" className="tw-h-8 tw-w-8" />,
    <Shield key="2" className="tw-h-8 tw-w-8" />,
    <Users key="3" className="tw-h-8 tw-w-8" />,
    <Globe key="4" className="tw-h-8 tw-w-8" />,
  ];
  const metricIcons = [
    <Award key="1" className="tw-h-6 tw-w-6" />,
    <Users key="2" className="tw-h-6 tw-w-6" />,
    <Globe key="3" className="tw-h-6 tw-w-6" />,
    <Star key="4" className="tw-h-6 tw-w-6" />,
  ];

  if (loading) {
    return (
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-background">
        <div className="tw-animate-spin tw-rounded-full tw-h-32 tw-w-32 tw-border-b-2 tw-border-primary" />
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-background">
      <section className="tw-bg-white tw-pt-0 tw-pb-8 lg:tw-pt-0 lg:tw-pb-12">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-12 tw-items-center">
            <div>
              <div className="tw-mb-6">
                <Badge className="tw-bg-soft-gold tw-text-white tw-px-3 tw-py-1 tw-rounded-md tw-text-xs tw-font-medium tw-mb-1 hover:tw-bg-soft-gold">
                  Our Story
                </Badge>
                <h1 className="tw-text-5xl tw-font-heading tw-font-semibold tw-text-foreground tw-mt-0">
                  Crafting Excellence in Men&apos;s Grooming
                </h1>
              </div>

              <p className="tw-text-lg tw-font-paragraph tw-text-secondary tw-leading-relaxed tw-mb-8">
                Founded with a passion for quality and a commitment to excellence, GroomingCo has been
                serving discerning gentlemen worldwide with premium grooming essentials. Our journey began
                with a simple belief: every man deserves access to the finest grooming products.
              </p>

              <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4">
                <Button asChild size="lg" className="tw-bg-primary hover:tw-bg-primary/90">
                  <Link to="/products" className="hover:tw-text-primary-foreground">
                    Shop Our Collection <ArrowRight className="tw-ml-2 tw-h-5 tw-w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/contact" className="hover:tw-text-foreground">
                    Get in Touch
                  </Link>
                </Button>
              </div>
            </div>

            <div className="tw-relative">
              <Image
                src="/images/Hero/hero.jpg"
                alt="Premium grooming products showcase"
                width={600}
                height={600}
                className="tw-rounded-lg tw-shadow-2xl tw-w-full tw-h-auto tw-object-cover"
              />
              <div className="tw-absolute -tw-bottom-6 -tw-left-6 tw-bg-soft-gold tw-text-white tw-p-6 tw-rounded-lg tw-shadow-lg tw-hidden md:tw-block">
                <div className="tw-text-center">
                  <div className="tw-text-2xl tw-font-heading tw-font-bold">10+</div>
                  <div className="tw-text-sm tw-font-paragraph">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tw-py-16 tw-bg-background">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          <div className="tw-text-center tw-mb-12">
            <h2 className="tw-text-4xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-4">
              Our Impact in Numbers
            </h2>
            <p className="tw-text-lg tw-font-paragraph tw-text-secondary tw-max-w-2xl tw-mx-auto">
              These numbers reflect our commitment to excellence and the trust our customers place in us.
            </p>
          </div>

          <div className="tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-8">
            {displayMetrics.map((stat, index) => (
              <div key={stat.id} className="tw-text-center">
                <Card className="tw-p-6 tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow tw-duration-300">
                  <CardContent className="tw-p-0">
                    <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-12 tw-h-12 tw-bg-soft-gold/10 tw-text-soft-gold tw-rounded-full tw-mb-4">
                      {stat.icon || metricIcons[index % metricIcons.length]}
                    </div>
                    <div className="tw-text-3xl tw-font-heading tw-font-bold tw-text-foreground tw-mb-2">
                      {stat.value}
                    </div>
                    <div className="tw-font-paragraph tw-text-secondary">{stat.label}</div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="tw-pt-20 tw-pb-8 tw-bg-white">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          <div className="tw-text-center tw-mb-16">
            <h2 className="tw-text-4xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-6">
              Our Core Values
            </h2>
            <p className="tw-text-lg tw-font-paragraph tw-text-secondary tw-max-w-2xl tw-mx-auto">
              These principles guide everything we do and shape our commitment to excellence.
            </p>
          </div>

          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">
            {displayValues.map((value, index) => (
              <div key={value.id} className="tw-flex tw-items-start tw-gap-6 tw-p-6">
                <div className="tw-flex-shrink-0 tw-w-16 tw-h-16 tw-bg-soft-gold/10 tw-text-soft-gold tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  {value.icon || valueIcons[index % valueIcons.length]}
                </div>
                <div>
                  <h3 className="tw-text-xl tw-font-heading tw-font-medium tw-text-foreground tw-mb-3">
                    {value.title}
                  </h3>
                  <p className="tw-font-paragraph tw-text-secondary tw-leading-relaxed">
                    {value.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      <section className="tw-pt-12 tw-pb-20 tw-bg-white">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          <div className="tw-text-center">
            <h2 className="tw-text-4xl tw-font-heading tw-font-medium tw-text-foreground tw-mب-4">
              Our Mission
            </h2>
            <div className="tw-max-w-4xl tw-mx-auto">
              <blockquote className="tw-text-2xl tw-font-paragraph tw-font-light tw-text-secondary tw-leading-relaxed tw-italic tw-mb-8">
                &quot;To empower every gentleman with premium grooming essentials that enhance confidence,
                elevate daily rituals, and celebrate the art of traditional craftsmanship in the modern world.&quot;
              </blockquote>
              <div className="tw-flex tw-justify-center">
                <Button asChild size="lg" className="tw-bg-primary hover:tw-bg-primary/90">
                  <Link to="/products" className="hover:tw-text-primary-foreground">
                    Experience Our Products <ArrowRight className="tw-ml-2 tw-h-5 tw-w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}