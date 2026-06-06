'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const DynamicWidget = dynamic(
  () => import('@dynamic-labs/sdk-react-core').then((m) => m.DynamicWidget),
  { ssr: false }
);

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Toggle menu
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on page navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { label: 'Home', href: '/', img: '/images/nav_home_preview.png' },
    { label: 'Pricing', href: '/traders', img: '/images/nav_pricing_preview.png' },
    { label: 'How we work', href: '/portfolio', img: '/images/nav_how_we_work_preview.png' },
  ];

  return (
    <>
      {/* Floating Pill Menu */}
      <div className="floating-nav-wrapper" ref={navRef}>
        <div className={`floating-nav-container ${isOpen ? 'open' : ''}`}>
          {/* Header Row */}
          <div className="nav-header" onClick={toggleMenu}>
            <div className="nav-header-left">
              <div className="grid-icon">
                <span className="grid-dot" />
                <span className="grid-dot" />
                <span className="grid-dot" />
                <span className="grid-dot" />
              </div>
              <span>{isOpen ? 'Midu' : 'Menu'}</span>
            </div>
            <div className="nav-header-right">
              2/5 slots for May
            </div>
          </div>

          <div className="nav-divider" />

          {/* Expanded Dropdown Content */}
          <div className="nav-expanded-content">
            {/* Menu Links */}
            <div className="nav-menu-list">
              {menuItems.map((item, index) => (
                <div key={item.href}>
                  <Link href={item.href} className="nav-menu-item">
                    <span className="nav-menu-label">{item.label}</span>
                    <div className="nav-preview-box">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.img}
                        alt={`${item.label} Preview`}
                        className="nav-preview-img"
                      />
                    </div>
                  </Link>
                  {index < menuItems.length - 1 && <div className="nav-item-divider" />}
                </div>
              ))}
            </div>

            {/* Social Footer */}
            <div className="nav-footer">
              <span className="nav-social-label">Social media</span>
              <div className="nav-social-links">
                <a href="https://behance.net" target="_blank" rel="noreferrer" className="nav-social-link">Behance</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="nav-social-link">LinkedIn</a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="nav-social-link">The X</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Trigger (Top-Right) */}
      <div className="floating-action-wrapper">
        {pathname === '/' ? (
          <Link href="/traders" className="launch-app-btn">
            <span>+</span> Launch App
          </Link>
        ) : (
          <DynamicWidget />
        )}
      </div>
    </>
  );
}
