import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
  Loader2,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

export default function Contact() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  async function load(signal) {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch('/api/contact', { signal });
      setData(json?.data || null);
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

  // عنوان الصفحة
  useEffect(() => {
    document.title = 'Contact • GroomingCo';
  }, []);

  const getIcon = (title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('email') || t.includes('mail'))
      return <Mail className="tw-h-6 tw-w-6" />;
    if (t.includes('phone') || t.includes('call'))
      return <Phone className="tw-h-6 tw-w-6" />;
    if (t.includes('whatsapp') || t.includes('chat'))
      return <MessageCircle className="tw-h-6 tw-w-6" />;
    if (t.includes('visit') || t.includes('address') || t.includes('store'))
      return <MapPin className="tw-h-6 tw-w-6" />;
    if (t.includes('hours') || t.includes('time'))
      return <Clock className="tw-h-6 tw-w-6" />;
    return <HelpCircle className="tw-h-6 tw-w-6" />;
  };

  return (
    <main className="tw-min-h-screen tw-bg-background">
      <section className="tw-pt-8 tw-pb-10 tw-bg-white">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8 tw-text-center">
          <h1 className="tw-text-5xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-6 tw-fade-in tw-animate-in tw-duration-500">
            {data?.hero?.title || 'Get in Touch'}
          </h1>
          <p className="tw-text-lg tw-font-paragraph tw-text-muted-foreground tw-max-w-2xl tw-mx-auto tw-fade-in tw-animate-in tw-duration-500 tw-delay-100">
            {data?.hero?.subtitle ||
              "Have questions about our products or need assistance? We're here to help you find the perfect grooming solution."}
          </p>
        </div>
      </section>

      <div className="tw-w-full tw-bg-gray-50 tw-py-16">
        <div className="tw-max-w-[100rem] tw-mx-auto tw-px-8">
          {loading && (
            <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-20 tw-text-muted-foreground">
              <Loader2 className="tw-h-8 tw-w-8 tw-animate-spin tw-mb-4" />
              <p>Loading contact info...</p>
            </div>
          )}

          {error && (
            <div className="tw-max-w-md tw-mx-auto tw-mt-8 tw-p-6 tw-bg-red-50 tw-border tw-border-red-100 tw-rounded-lg tw-text-center">
              <AlertCircle className="tw-h-8 tw-w-8 tw-text-red-500 tw-mx-auto tw-mb-3" />
              <h3 className="tw-text-lg tw-font-medium tw-text-red-800 tw-mb-2">
                Failed to load info
              </h3>
              <p className="tw-text-sm tw-text-red-600 tw-mb-4">
                We couldn&apos;t fetch the contact details. Please try again later.
              </p>
              <Button onClick={() => load()}>Retry</Button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-12">
                <div className="tw-space-y-6 tw-fade-in tw-animate-in tw-slide-in-from-left-4 tw-duration-700 tw-delay-200">
                  {data.channels?.map((ch) => (
                    <div
                      key={ch.id}
                      className="tw-rounded-xl tw-border tw-border-foreground/10 tw-text-foreground tw-bg-white tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow tw-duration-300"
                    >
                      <div className="tw-p-6">
                        <div className="tw-flex tw-items-start tw-gap-4">
                          <div className="tw-flex-shrink-0 tw-w-12 tw-h-12 tw-bg-soft-gold/10 tw-text-soft-gold tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                            {getIcon(ch.title)}
                          </div>

                          <div className="tw-flex-1">
                            <h3 className="tw-text-xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-2">
                              {ch.title}
                            </h3>

                            <div className="tw-mb-1 tw-space-y-1">
                              {(ch.items || []).map((it, i) => (
                                <div key={i}>
                                  {it.href ? (
                                    <a
                                      href={it.href}
                                      className="tw-font-paragraph tw-text-foreground hover:tw-text-soft-gold tw-transition-colors"
                                      target={
                                        it.href.startsWith('http')
                                          ? '_blank'
                                          : undefined
                                      }
                                      rel={
                                        it.href.startsWith('http')
                                          ? 'noopener noreferrer'
                                          : undefined
                                      }
                                    >
                                      {it.label}
                                    </a>
                                  ) : (
                                    <p className="tw-font-paragraph tw-text-foreground">
                                      {it.label}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>

                            {ch.description && (
                              <p className="tw-font-paragraph tw-text-muted-foreground tw-text-sm tw-mb-4">
                                {ch.description}
                              </p>
                            )}

                            {ch.cta && (
                              <a
                                href={ch.cta.href}
                                className="tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-normal tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-1 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-shadow tw-h-9 tw-px-4 tw-py-2 tw-bg-soft-gold hover:tw-bg-soft-gold/90 tw-text-white hover:tw-text-white"
                              >
                                {(() => {
                                  const icon = getIcon(ch.title);
                                  return (
                                    <icon.type
                                      {...icon.props}
                                      className="tw-mr-2 tw-h-4 tw-w-4"
                                    />
                                  );
                                })()}
                                {ch.cta.label}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="tw-space-y-8 tw-fade-in tw-animate-in tw-slide-in-from-right-4 tw-duration-700 tw-delay-300">
                  <div className="tw-rounded-xl tw-border tw-border-foreground/10 tw-text-foreground tw-bg-white tw-shadow-lg">
                    <div className="tw-p-6">
                      <h3 className="tw-text-2xl tw-font-heading tw-font-semibold tw-text-foreground tw-mb-6">
                        Frequently Asked Questions
                      </h3>

                      <div className="tw-space-y-4">
                        {data.faqs?.map((f, i) => (
                          <div key={i} className="tw-space-y-2">
                            <div className="tw-flex tw-items-center tw-gap-2">
                              <div className="tw-text-soft-gold">
                                {f.q.toLowerCase().includes('return') ? (
                                  <ShoppingBag className="tw-h-5 tw-w-5" />
                                ) : f.q.toLowerCase().includes('track') ? (
                                  <MessageCircle className="tw-h-5 tw-w-5" />
                                ) : (
                                  <HelpCircle className="tw-h-5 tw-w-5" />
                                )}
                              </div>
                              <h4 className="tw-font-heading tw-font-medium tw-text-foreground tw-text-sm">
                                {f.q}
                              </h4>
                            </div>
                            <p className="tw-font-paragraph tw-text-secondary tw-text-sm tw-ml-7">
                              {f.a}
                            </p>
                            {i < data.faqs.length - 1 && (
                              <div
                                role="none"
                                className="tw-shrink-0 tw-bg-foreground/15 tw-h-[1px] tw-w-full tw-mt-4"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <section className="tw-mt-20 md:tw-mt-24">
                <div className="tw-rounded-2xl tw-border tw-border-foreground/10 tw-bg-white tw-shadow-lg tw-p-8 md:tw-p-10">
                  <h2 className="tw-text-2xl md:tw-text-3xl tw-font-heading tw-font-semibold tw-text-center tw-mb-3">
                    What You Can Expect From Our Support
                  </h2>
                  <p className="tw-text-center tw-font-paragraph tw-text-muted-foreground tw-max-w-2xl tw-mx-auto tw-mb-8">
                    We aim to make it easy for you to reach us and get the help you need as quickly as possible.
                  </p>

                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
                    <article className="tw-rounded-xl tw-bg-gray-50 tw-border tw-border-gray-200 tw-p-5 tw-text-center">
                      <h3 className="tw-font-heading tw-font-semibold tw-mb-2">
                        Fast Response
                      </h3>
                      <p className="tw-text-sm tw-font-paragraph tw-text-muted-foreground">
                        We usually reply to email and WhatsApp inquiries within 24–48 hours.
                      </p>
                    </article>

                    <article className="tw-rounded-xl tw-bg-gray-50 tw-border tw-border-gray-200 tw-p-5 tw-text-center">
                      <h3 className="tw-font-heading tw-font-semibold tw-mb-2">
                        Clear Support Hours
                      </h3>
                      <p className="tw-text-sm tw-font-paragraph tw-text-muted-foreground">
                        Sunday–Thursday, 9:00–18:00 (local time) for most support requests.
                      </p>
                    </article>

                    <article className="tw-rounded-xl tw-bg-gray-50 tw-border tw-border-gray-200 tw-p-5 tw-text-center">
                      <h3 className="tw-font-heading tw-font-semibold tw-mb-2">
                        Multiple Channels
                      </h3>
                      <p className="tw-text-sm tw-font-paragraph tw-text-muted-foreground">
                        Reach us via email, phone or WhatsApp, whichever is most convenient for you.
                      </p>
                    </article>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}