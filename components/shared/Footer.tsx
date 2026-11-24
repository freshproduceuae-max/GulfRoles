import React from 'react';
import Link from 'next/link';
import AlertSignup from '@/components/seeker/AlertSignup';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  showSocial?: boolean;
}

/**
 * Footer component with links, copyright, and company info
 */
const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ showSocial = true, className }, ref) => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
      product: [
        { label: 'Find Jobs', href: '/' },
        { label: 'Jobs in the UAE', href: '/ae' },
        { label: 'Jobs in Saudi Arabia', href: '/sa' },
        { label: 'Jobs in India', href: '/in' },
        { label: 'Jobs in Australia', href: '/au' },
        { label: 'Jobs in the US', href: '/us' },
        { label: 'Post a Job', href: '/employer/post-job' },
        { label: 'Salary Guide', href: '/salary-guide' },
      ],
      company: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' },
      ],
      support: [
        { label: 'Help Center', href: '/help' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
      ],
      legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookies', href: '/cookies' },
      ],
    };

    const socialLinks = [
      {
        name: 'LinkedIn',
        icon: (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
        ),
        href: 'https://linkedin.com/company/jobbrowser',
      },
      {
        name: 'Twitter',
        icon: (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z" />
          </svg>
        ),
        href: 'https://twitter.com/jobbrowser',
      },
      {
        name: 'Facebook',
        icon: (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ),
        href: 'https://facebook.com/jobbrowser',
      },
    ];

    return (
      <footer
        ref={ref}
        className={`
          bg-gray-900 dark:bg-gray-950
          text-gray-100
          border-t border-gray-800 dark:border-gray-900
          ${className || ''}
        `.trim()}
      >
        {/* Main Footer Content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            {/* Footer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8 sm:mb-12">
              {/* Brand Section */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <Link
                  href="/"
                  className="flex items-center space-x-2 hover:opacity-80 transition mb-4"
                  aria-label="JobBrowser home"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">J</span>
                  </div>
                  <span className="text-lg font-bold text-white">JobBrowser</span>
                </Link>
                <p className="text-sm text-gray-400 mb-4">
                  Find your next opportunity from top companies worldwide.
                </p>

                {/* Social Links */}
                {showSocial && (
                  <div className="flex gap-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className={`
                          text-gray-400 hover:text-primary-500
                          transition-colors duration-200
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                          focus:ring-offset-gray-900 rounded-lg p-1
                        `.trim()}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Links */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
                <ul className="space-y-2">
                  {footerLinks.product.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
                <ul className="space-y-2">
                  {footerLinks.support.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800 dark:border-gray-900" />

            {/* Footer Bottom */}
            <div className="pt-8 sm:pt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400 text-center sm:text-left">
                © {currentYear} JobBrowser. All rights reserved.
              </p>

              {/* Bottom Links */}
              <div className="flex flex-wrap gap-6 justify-center sm:justify-end">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup Section */}
        <div className="bg-primary-500 bg-opacity-10 border-t border-gray-800 py-8 sm:py-10">
          <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Stay Updated
                </h3>
                <p className="text-sm text-gray-400">
                  Get the latest job listings and career tips delivered to your inbox.
                </p>
              </div>
              <AlertSignup compact />
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export default Footer;
