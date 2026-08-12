'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ArrowRight, Play, Headset } from 'lucide-react';

// Interface for Progress Bars
interface ProgressBar {
  id: number;
  label: string;
  percentage: number;
}

// Progress Bars Data Array
const progressData: ProgressBar[] = [
  { id: 1, label: "Book Appointment", percentage: 80 },
  { id: 2, label: "Doctors Success", percentage: 90 },
];

export default function PrescriptionPromoSection() {
  const [progressValues, setProgressValues] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
  });
  
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          progressData.forEach((item) => {
            let start = 0;
            const duration = 1500; // 1.5 seconds animation
            const stepTime = Math.abs(Math.floor(duration / item.percentage));

            const timer = setInterval(() => {
              start += 1;
              setProgressValues((prev) => ({ ...prev, [item.id]: start }));
              if (start >= item.percentage) {
                clearInterval(timer);
              }
            }, stepTime);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative mx-10 min-h-[500px] py-16 px-6 md:px-12 font-sans overflow-hidden rounded-3xl my-8"
    >
      
      {/* Fixed Background Image Layer */}
      <div 
        className="absolute inset-0 bg-fixed bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('/Healthcare.png')" 
        }}
      />
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/75 z-0" />

      {/* Main Grid Content */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[400px]">
        
        {/* Left Side: Cutout Doctor Image with Floating Support Badge */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-start items-end h-full min-h-[350px]">
          {/* Doctor Cutout Image */}
          <div className="relative w-[280px] sm:w-[320px] h-[380px] sm:h-[420px] z-10">
            <Image
              src="/doctor-4.png"
              alt="Medical Professional"
              fill
              className="object-cover object-top rounded-2xl shadow-2xl"
            />
          </div>

          {/* Floating 24/7 Support Card */}
          <div className="absolute bottom-6 left-0 sm:-left-4 z-20 bg-[#00c5c8] text-white p-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20">
            <div className="bg-white/20 p-2 rounded-xl">
              <Headset className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-wide">24/7 Online Support</h4>
              <p className="text-[11px] text-white/90">Instant Care & Assistance</p>
            </div>
          </div>
        </div>

        {/* Right Side: Promo Content & Animated Progress Bars */}
        <div className="lg:col-span-7 text-white space-y-6">
          
          {/* Top Discount Tag */}
          <div className="inline-flex items-center gap-1.5 border border-white/20 rounded-md px-3 py-1 bg-black/40 backdrop-blur-md text-[10px] font-bold text-white tracking-wider uppercase">
            <Plus className="w-3 h-3 text-[#00c5c8]" />
            <span>50% DISCOUNT NOW</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Save 50% On Every <br />
            <span className="text-[#00c5c8]">Prescription</span>
          </h2>

          {/* Dynamic Progress Bars with Floating Tooltip Badge */}
          <div className="space-y-7 max-w-lg pt-2">
            {progressData.map((item) => {
              const currentVal = progressValues[item.id] || 0;
              return (
                <div key={item.id} className="space-y-2">
                  {/* Progress Bar Header / Label */}
                  <div className="text-xs font-bold tracking-wide">
                    <span>{item.label}</span>
                  </div>

                  {/* Track with Floating Badge */}
                  <div className="relative w-full bg-white/20 rounded-full h-2">
                    
                    {/* Progress Fill */}
                    <div 
                      className="bg-[#00c5c8] h-full rounded-full transition-all duration-75 ease-out"
                      style={{ width: `${currentVal}%` }}
                    />

                    {/* Floating Percentage Badge (Top-Right Tooltip Style) */}
                    <div 
                      className="absolute -top-8 transition-all duration-75 ease-out -translate-x-full"
                      style={{ left: `${currentVal}%` }}
                    >
                      <div className="relative bg-[#00c5c8] text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-md shadow-md flex items-center justify-center">
                        {currentVal}%
                        {/* Tooltip Bottom-Right Triangle Pointer */}
                        <div className="absolute -bottom-1 right-1.5 w-2 h-2 bg-[#00c5c8] rotate-45" />
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtitle / Description */}
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl pt-1">
            Access affordable healthcare services and genuine medication discounts. Our certified specialists are available round-the-clock to guide your treatment plan.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            {/* Appointment Button */}
            <Link
              href="/register"
              className="bg-[#00c5c8] hover:bg-[#00b2b5] text-white text-xs font-bold tracking-wider py-3.5 px-6 rounded-full inline-flex items-center gap-3 transition-all shadow-lg"
            >
              <span>APPOINTMENT NOW</span>
              <span className="bg-white text-[#00c5c8] p-1 rounded-full flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Video Play Button */}
            <button
              type="button"
              className="w-11 h-11 bg-[#00c5c8] hover:bg-[#00b2b5] text-white rounded-full flex items-center justify-center transition-all shadow-lg group"
              aria-label="Play Video"
            >
              <Play className="w-4 h-4 fill-white ml-0.5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}