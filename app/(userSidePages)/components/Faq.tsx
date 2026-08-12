'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';

// FAQ Item Interface
interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

// Real Medical FAQ Content Data
const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What Types Of Medical Services Do You Offer?",
    answer: "We offer a wide range of specialized medical services including Cardiology, Dermatology, Orthopedic Surgery, Pediatrics, Neurology, and General Medicine along with 24/7 Emergency Care.",
  },
  {
    id: 2,
    question: "How Quickly Can You Respond To An Emergency?",
    answer: "Our emergency medical team operates 24/7 with immediate response units. On-site specialists and trauma care teams are ready to respond within minutes of arrival.",
  },
  {
    id: 3,
    question: "Are Your Medical Staff Licensed And Insured?",
    answer: "Yes, all our doctors, surgeons, and healthcare personnel are fully board-certified, licensed, and insured with years of practical hospital experience.",
  },
  {
    id: 4,
    question: "How Can I Book An Appointment With A Specialist?",
    answer: "You can easily schedule an appointment through our online booking portal, by calling our 24/7 hotline, or visiting our clinic desk directly.",
  },
];

// Animated Counter Component
const AnimatedCounter = ({ targetValue, duration = 2000 }: { targetValue: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = targetValue / (duration / 16); // 60 FPS
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetValue, duration]);

  return <span>{count}</span>;
};

export default function MedicalFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default
  const [isVisible, setIsVisible] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Toggle Accordion
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Intersection Observer for Counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (badgeRef.current) {
      observer.observe(badgeRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-white py-16 px-6 md:px-12 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Doctor Image with Floating Counter Badge */}
        <div className="lg:col-span-5 relative flex justify-center">
          {/* Main Image */}
          <div className="relative w-full max-w-[420px] h-[480px] sm:h-[520px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/doctor-6.png"
              alt="Doctor consulting patient"
              fill
              className="object-cover"
            />
          </div>

          {/* Floating Teal Counter Badge */}
          <div 
            ref={badgeRef}
            className="absolute bottom-6 right-2 sm:-right-4 bg-[#00c5c8] text-white p-6 rounded-2xl shadow-xl text-center min-w-[170px] z-10 border-2 border-white"
          >
            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              {isVisible ? <AnimatedCounter targetValue={126} /> : 0}+
            </div>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-white/95 mt-1">
              Expert Doctor
            </p>
          </div>
        </div>

        {/* Right Side: Section Heading & Accordion List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tag & Heading */}
          <div>
            <div className="inline-flex items-center gap-1.5 border border-slate-300 rounded-md px-2.5 py-1 bg-white text-[10px] font-bold text-slate-700 tracking-wide uppercase mb-3">
              <Plus className="w-3 h-3 text-[#00c5c8]" />
              <span>ASK THE FAQ</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-black leading-tight">
              Common <span className="text-[#00c5c8]">Questions</span>
            </h2>

            <p className="text-slate-500 text-xs md:text-sm mt-3 max-w-xl leading-relaxed">
              Find quick answers to common inquiries regarding our healthcare services, emergency protocols, specialist consultations, and appointment procedures.
            </p>
          </div>

          {/* Accordion Container */}
          <div className="space-y-4 pt-2">
            {faqData.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id}
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? 'border-[#00c5c8] bg-[#00c5c8] text-white shadow-md' 
                      : 'border-slate-200 bg-white text-zinc-900 hover:border-[#00c5c8]'
                  }`}
                >
                  {/* Accordion Header / Question */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base tracking-tight"
                  >
                    <span>{item.question}</span>
                    <span className={`p-1 rounded-md shrink-0 transition-all ${
                      isOpen ? 'bg-white/20 text-white' : 'bg-slate-100 text-zinc-800'
                    }`}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  {/* Accordion Body / Answer */}
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-white/90 leading-relaxed border-t border-white/20 pt-3">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}