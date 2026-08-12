'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

// Testimonial Item Interface
interface Testimonial {
  id: number;
  name: string;
  department: string;
  image: string;
  review: string;
}

// Real Content Data Array
const testimonialsData: Testimonial[] = [
  {
    id: 1,
    name: "Dr. Sophie Lee",
    department: "Cardiology",
    image: "/doctor2.png",
    review: "The cardiovascular team provided exceptional care during my treatment. Highly professional and compassionate healthcare staff."
  },
  {
    id: 2,
    name: "Dr. Emily Johnson",
    department: "Dermatology",
    image: "/doctor3.png",
    review: "Outstanding service! The skin care consultation was thorough, and the prescribed treatment yielded excellent results quickly."
  },
  {
    id: 3,
    name: "Dr. John Smith",
    department: "Orthopedic Surgery",
    image: "/doctor1.png",
    review: "Recovering from joint surgery was seamless thanks to their expert rehabilitation guidance and state-of-the-art facilities."
  },
  {
    id: 4,
    name: "Dr. Amanda Chen",
    department: "Pediatrics",
    image: "/Surgical-img.png",
    review: "Their pediatric care team is amazing with children. They made our family feel comfortable and well cared for throughout."
  },
  {
    id: 5,
    name: "Dr. Marcus Vance",
    department: "Neurology",
    image: "/Surgeon-img.png",
    review: "Very precise diagnosis and attentive follow-ups. I am deeply grateful for the continuous support provided by the doctors."
  }
];

export default function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  
  // Dynamic Counter State for Patient Satisfaction
  const [satisfactionRate, setSatisfactionRate] = useState<number>(0);
  const targetRate = 98;

  // Intersection Observer for Satisfaction Counter Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1500; // 1.5 Seconds animation duration
          const stepTime = Math.abs(Math.floor(duration / targetRate));

          const timer = setInterval(() => {
            start += 1;
            setSatisfactionRate(start);
            if (start >= targetRate) {
              clearInterval(timer);
            }
          }, stepTime);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [targetRate]);

  // Smooth Scroll Handlers
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340; // Approx card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="bg-white py-16 px-6 md:px-12 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          
          {/* Left Side: Tag & Headings */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 border border-slate-300 rounded-md px-2.5 py-1 bg-white text-[10px] font-bold text-slate-700 tracking-wide uppercase">
              <Plus className="w-3 h-3 text-[#00c5c8]" />
              <span>TESTIMONIALS</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-black leading-tight">
              Honest Review From Our <br />
              <span className="text-[#00c5c8]">Happy Patients</span>
            </h2>

            <p className="text-slate-500 text-xs md:text-sm max-w-2xl leading-relaxed">
              Discover real stories and feedback from patients who have experienced our compassionate medical care, advanced facilities, and dedicated team of specialist doctors.
            </p>
          </div>

          {/* Right Side: Animated Satisfaction Counter Teal Box */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div 
              ref={counterRef}
              className="bg-[#00c5c8] text-white p-6 sm:p-8 rounded-2xl text-center w-full max-w-sm shadow-xl flex flex-col items-center justify-center space-y-3"
            >
              <h3 className="text-4xl sm:text-5xl font-black tracking-tight font-mono">
                {satisfactionRate} %
              </h3>
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-white/95">
                Patient Satisfaction Rate
              </p>
              
              {/* Overlapping Avatar Stack */}
              <div className="flex -space-x-3 pt-2">
                {testimonialsData.slice(0, 4).map((item) => (
                  <div key={item.id} className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Scroll Controls (Left / Right Buttons) */}
        <div className="flex justify-end items-center gap-3 mb-4">
          <button
            onClick={() => handleScroll('left')}
            className="w-10 h-10 rounded-full border border-[#00c5c8] text-[#00c5c8] hover:bg-[#00c5c8] hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-10 h-10 rounded-full border border-[#00c5c8] text-[#00c5c8] hover:bg-[#00c5c8] hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Testimonials Cards Wrapper */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 pt-2 -mx-2 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonialsData.map((item) => (
            <div
              key={item.id}
              className="min-w-[290px] sm:min-w-[320px] max-w-[340px] bg-[#f0fafb] border border-[#d6f2f4] rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shrink-0 shadow-sm transition-all hover:shadow-md"
            >
              {/* Header: Quote Icon & Doctor Avatar */}
              <div className="flex items-center justify-center gap-4 w-full">
                <Quote className="w-8 h-8 text-[#00c5c8] fill-[#00c5c8] rotate-180 shrink-0" />
                <div className="relative w-14 h-14 rounded-full border-2 border-[#00c5c8] overflow-hidden shrink-0 shadow-xs">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Doctor Info */}
              <div className="w-full">
                <h4 className="font-bold text-base text-zinc-900">{item.name}</h4>
                <p className="text-xs font-semibold text-[#00c5c8]">{item.department}</p>
              </div>

              {/* Review Text */}
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-4">
                "{item.review}"
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}