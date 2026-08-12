'use client';

import React from 'react';
import Link from 'next/link';
import { FaHouse, FaAngleRight } from 'react-icons/fa6';

export default function AboutHeroSection() {
  return (
    <section className="relative text-white max-h-screen h-[80vh] pt-32 pb-16 overflow-hidden flex items-center bg-cover bg-center bg-no-repeat ">
      
      {/* Fixed Background Image with Dark Overlay */}
      <div
        className="absolute inset-0  bg-cover bg-center z-0 "
        style={{ 
          backgroundImage: "url('/Healthcare.png')"
        }}
      />

      {/* Dark Overlay for Text Legibility */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-4">
        
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
          About Us
        </h1>

        {/* Real Healthcare Content Text */}
        <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          We are dedicated to providing compassionate healthcare, cutting-edge medical technologies, and specialized care tailored to improve every patient’s quality of life.
        </p>

        {/* Breadcrumb Navigation Badge */}
        <div className="pt-2 inline-block">
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-xs font-bold text-white tracking-wider uppercase">
            <FaHouse className="w-3.5 h-3.5 text-[#00c5c8]" />
            <Link href="/" className="hover:text-[#00c5c8] transition-colors">
              HOME
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-[#00c5c8]">ABOUT</span>
          </div>
        </div>

      </div>

    </section>
  );
}