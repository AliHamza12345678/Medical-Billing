'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaChevronDown, FaBars, FaXmark } from 'react-icons/fa6';

// Interface for Submenu Items
interface SubMenuItem {
  title: string;
  href: string;
}

// Interface for Main Nav Links
interface NavLink {
  id: number;
  title: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: SubMenuItem[];
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setUser(data.data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  };

  // Navigation Links with Dropdown Items
  const navLinks: NavLink[] = [
    { id: 1, title: 'HOME', href: '/' },
    { id: 2, title: 'ABOUT', href: '/about' },
    { 
      id: 3, 
      title: 'PAGES', 
      href: '#', 
      hasDropdown: true,
      dropdownItems: [
        { title: 'TEAM', href: '/team' },
        { title: 'TESTIMONIALS', href: '/testimonials' },
        { title: 'PRICING', href: '/pricing' },
        { title: 'FAQS', href: '/faqs' },
      ]
    },
    { 
      id: 4, 
      title: 'SERVICES', 
      href: '/services', 
      hasDropdown: true,
      dropdownItems: [
        { title: 'SERVICES', href: '/services' },
        { title: 'SERVICES DETAILS', href: '/details' },
      ]
    },
    { id: 6, title: 'CONTACT', href: '/contact' },
  ];

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-extrabold tracking-wider text-[#00c2cb]">MED</span>
          <span className="text-xl font-bold bg-[#00c2cb] text-white w-6 h-6 rounded flex items-center justify-center">+</span>
          <span className="text-2xl font-extrabold tracking-wider text-white">BILLS</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <div 
              key={link.id} 
              className="relative group py-2"
              onMouseEnter={() => setActiveDropdown(link.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={link.href}
                className="text-white text-sm font-semibold tracking-wider hover:text-[#00c2cb] transition-colors flex items-center gap-1.5"
              >
                {link.title}
                {link.hasDropdown && (
                  <FaChevronDown className="w-2.5 h-2.5 text-gray-300 group-hover:rotate-180 transition-transform duration-200" />
                )}
              </Link>

              {/* Desktop Dropdown Menu */}
              {link.hasDropdown && link.dropdownItems && (
                <div 
                  className={`absolute top-full left-0 w-48 bg-white rounded-xl shadow-xl py-2 border border-slate-100 transition-all duration-200 origin-top-left ${
                    activeDropdown === link.id 
                      ? 'opacity-100 scale-100 pointer-events-auto' 
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  {link.dropdownItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="block px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-[#00c2cb]/10 hover:text-[#00c2cb] transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Section: Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:flex bg-[#00c2cb] hover:bg-[#00a6af] text-white text-xs font-bold tracking-wider px-5 py-2.5 rounded-full items-center gap-2 transition-all shadow-lg"
              >
                DASHBOARD
                <FaArrowRight className="w-3 h-3" />
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:flex bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold tracking-wider px-4 py-2.5 rounded-full transition-all"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:flex bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold tracking-wider px-4 py-2.5 rounded-full transition-all"
              >
                SIGN IN
              </Link>
              <Link
                href="/register"
                className="hidden sm:flex bg-[#00c2cb] hover:bg-[#00a6af] text-white text-xs font-bold tracking-wider px-5 py-2.5 rounded-full items-center gap-2 transition-all shadow-lg"
              >
                REGISTER
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white text-2xl p-2 focus:outline-none"
          >
            {mobileMenuOpen ? <FaXmark /> : <FaBars />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-md px-6 pt-4 pb-6 border-b border-slate-800 space-y-3">
          {navLinks.map((link) => (
            <div key={link.id} className="space-y-1">
              <div 
                className="flex items-center justify-between text-white text-sm font-semibold py-2 border-b border-slate-800/50"
                onClick={() => link.hasDropdown && setActiveDropdown(activeDropdown === link.id ? null : link.id)}
              >
                <Link href={link.href} onClick={() => !link.hasDropdown && setMobileMenuOpen(false)}>
                  {link.title}
                </Link>
                {link.hasDropdown && (
                  <FaChevronDown className={`w-3 h-3 text-[#00c2cb] transition-transform ${activeDropdown === link.id ? 'rotate-180' : ''}`} />
                )}
              </div>

              {/* Mobile Submenu Accordion */}
              {link.hasDropdown && activeDropdown === link.id && link.dropdownItems && (
                <div className="pl-4 space-y-2 py-2 bg-slate-800/40 rounded-lg">
                  {link.dropdownItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs font-medium text-slate-300 hover:text-[#00c2cb] py-1"
                    >
                      • {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[#00c2cb] text-white text-xs font-bold tracking-wider py-3 rounded-full flex items-center justify-center gap-2"
            >
              REGISTER
              <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}