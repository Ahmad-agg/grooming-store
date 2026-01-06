import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const footerSections = [
    {
      title: 'Browse',
      links: [
        { name: 'All Products', href: '/products' },
        { name: 'Categories', href: '/categories' },
        { name: 'Wishlist', href: '/wishlist' },
        { name: 'My Orders', href: '/my-orders' },
      ],
    },
    {
      title: 'Help & Support',
      links: [
        { name: 'Contact Us', href: '/contact' },
       
      ],
    },
    {
      title: 'About',
      links: [
        { name: 'Our Story', href: '/about' },
      
      ],
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="tw-bg-[#1c1c1c] tw-text-white">
      <div className="tw-max-w-[100rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
        <div className="tw-py-12 lg:tw-py-16">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-5 tw-gap-8">
            <div className="lg:tw-col-span-2">
              <Link to="/" className="tw-inline-block tw-mb-6">
                <div className="tw-text-xl lg:tw-text-2xl tw-font-heading tw-font-bold tw-text-white">
                  GroomingCo
                </div>
              </Link>
              <p className="tw-font-paragraph tw-text-gray-300 tw-mb-6 tw-max-w-md tw-leading-relaxed tw-text-sm lg:tw-text-base">
                We provide premium men's grooming products for the modern
                gentleman. Discover our curated collection of shaving and
                skincare essentials.
              </p>
              <div className="tw-flex tw-items-center tw-gap-3 lg:tw-gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="tw-text-white hover:tw-text-soft-gold tw-p-2 hover:tw-bg-transparent"
                >
                  <Facebook className="tw-h-4 tw-w-4 lg:tw-h-5 lg:tw-w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="tw-text-white hover:tw-text-soft-gold tw-p-2 hover:tw-bg-transparent"
                >
                  <Instagram className="tw-h-4 tw-w-4 lg:tw-h-5 lg:tw-w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="tw-text-white hover:tw-text-soft-gold tw-p-2 hover:tw-bg-transparent"
                >
                  <Twitter className="tw-h-4 tw-w-4 lg:tw-h-5 lg:tw-w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="tw-text-white hover:tw-text-soft-gold tw-p-2 hover:tw-bg-transparent"
                >
                  <Youtube className="tw-h-4 tw-w-4 lg:tw-h-5 lg:tw-w-5" />
                </Button>
              </div>
            </div>

            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="tw-font-heading tw-font-semibold tw-text-white tw-mb-4 tw-text-sm lg:tw-text-base">
                  {section.title}
                </h3>
                <ul className="tw-space-y-2 lg:tw-space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.href}
                        className="tw-font-paragraph tw-text-gray-300 hover:tw-text-soft-gold tw-transition-colors tw-text-xs lg:tw-text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="tw-py-6 lg:tw-py-8 tw-border-t tw-border-white/10">
          <div className="tw-flex tw-flex-col lg:tw-flex-row tw-items-start lg:tw-items-center tw-justify-between tw-gap-4 lg:tw-gap-6">
            <div className="tw-w-full lg:tw-w-auto">
              <h3 className="tw-font-heading tw-font-semibold tw-text-white tw-mb-2 tw-text-sm lg:tw-text-base">
                Subscribe to our Newsletter
              </h3>
              <p className="tw-font-paragraph tw-text-gray-300 tw-text-xs lg:tw-text-sm">
                Get the latest offers and new product updates
              </p>
            </div>
            <div className="tw-flex tw-gap-2 tw-w-full lg:tw-w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="tw-flex-1 lg:tw-w-64 xl:tw-w-80 tw-px-3 lg:tw-px-4 tw-py-2 tw-rounded-md tw-bg-white tw-text-gray-900 tw-font-paragraph tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-soft-gold"
              />
              <Button className="tw-bg-soft-gold hover:tw-bg-soft-gold/90 tw-text-white tw-px-4 lg:tw-px-6 tw-text-sm tw-rounded-md">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="tw-py-4 lg:tw-py-6 tw-border-t tw-border-white/10">
          <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-gap-4">
            <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-gap-4 lg:tw-gap-6 tw-text-xs lg:tw-text-sm tw-font-paragraph tw-text-gray-300">
              <span>&copy; {currentYear} GroomingCo. All rights reserved.</span>
              <div className="tw-flex tw-items-center tw-gap-2">
                <MapPin className="tw-h-3 tw-w-3 lg:tw-h-4 lg:tw-w-4" />
                <span>Tel Aviv, Israel</span>
              </div>
            </div>
            <div className="tw-flex tw-items-center tw-gap-3 lg:tw-gap-4 tw-text-xs lg:tw-text-sm tw-font-paragraph">
              <Link
                to="/privacy"
                className="tw-text-gray-300 hover:tw-text-soft-gold tw-transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="tw-text-gray-300 hover:tw-text-soft-gold tw-transition-colors"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}