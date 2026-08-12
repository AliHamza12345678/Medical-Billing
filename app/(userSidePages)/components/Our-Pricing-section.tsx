'use client';

import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

interface PricingHeroBannerProps {
  title?: string;
  description?: string;
  currentPage?: string;
}

export default function PricingHeroBanner({
  title = "Transparent Healthcare Pricing",
  description = "Explore clear, upfront pricing for our comprehensive medical services, specialist consultations, and diagnostic procedures with no hidden fees.",
  currentPage = "PRICING",
}: PricingHeroBannerProps) {
  return (
    <section className="relative text-white max-h-screen h-[80vh] pt-32 pb-16 overflow-hidden flex items-center bg-cover bg-center bg-no-repeat">
      
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('/Healthcare.png')" 
        }}
      />

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-4">
        
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          {title}
        </h1>

        {/* Subtitle / Description */}
        <p className="text-slate-200 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal">
          {description}
        </p>

        {/* Breadcrumb Capsule Pill */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-5 py-2 bg-black/40 backdrop-blur-md text-xs font-bold tracking-wider uppercase">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-[#00c5c8] hover:text-[#00b2b5] transition-colors"
            >
              <Home className="w-3.5 h-3.5 fill-[#00c5c8]" />
              <span>HOME</span>
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-white">{currentPage}</span>
          </div>
        </div>

      </div>

    </section>
  );
}