'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaPlus, 
  FaStar, 
  FaClipboardCheck, 
  FaFlaskVial, 
  FaCircleCheck, 
  FaArrowRight 
} from 'react-icons/fa6';

// Feature Card Item Props Interface
interface FeatureCardProps {
  title: string;
  description: string;
  imageUrl?: string; // Image option for card
  icon?: React.ReactNode; // Icon fallback option
}

export default function AboutSectionWithCardImages() {
  // Dynamic Counter for Years of Experience
  const [experience, setExperience] = useState<number>(0);
  const targetExperience = 16;
  const expRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1500; // 1.5 seconds animation
          const stepTime = Math.abs(Math.floor(duration / targetExperience));

          const timer = setInterval(() => {
            start += 1;
            setExperience(start);
            if (start >= targetExperience) {
              clearInterval(timer);
            }
          }, stepTime);
        }
      },
      { threshold: 0.5 }
    );

    if (expRef.current) {
      observer.observe(expRef.current);
    }

    return () => observer.disconnect();
  }, [targetExperience]);

  // Right side feature cards data with Image support
  const featureCards: FeatureCardProps[] = [
    {
      title: "Our Vision",
      description: "To lead global healthcare innovation and deliver compassionate, accessible medical solutions for every community.",
      imageUrl: "/doctor3.png", 
      icon: <FaClipboardCheck className="w-6 h-6 text-white" />,
    },
    {
      title: "Our Mission",
      description: "Empowering patients through accurate diagnostics, modern medical technologies, and continuous healing support.",
      imageUrl: "/doctor2.png",
      icon: <FaFlaskVial className="w-6 h-6 text-white" />,
    },
  ];

  return (
    <section className="bg-white py-16 px-6 md:px-12 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* ---------------- LEFT SIDE: IMAGES & OVERLAY BADGES ---------------- */}
        <div className="lg:col-span-6 relative">
          
          {/* Main Large Image Container */}
          <div className="relative w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            <Image
              src="/doctor3.png"
              alt="Medical Team Consulting"
              fill
              className="object-cover"
            />
          </div>

          {/* Top-Left Floating Badge: Years Experience with Dynamic Counter */}
          <div 
            ref={expRef}
            className="absolute top-4 left-4 bg-[#00c5c8] text-white p-5 rounded-2xl shadow-2xl min-w-[150px] text-center border-2 border-white z-10"
          >
            <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              {experience}+
            </div>
            <p className="text-xs font-semibold tracking-wide text-white/95 mt-1">
              Years Experience
            </p>
          </div>

          {/* Bottom-Right Floating Card: Client Ratings */}
          <div className="absolute -bottom-6 right-2 sm:right-6 bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 z-10 max-w-[260px]">
            <h4 className="text-sm font-extrabold text-zinc-900 tracking-tight">
              Client Ratings
            </h4>
            
            {/* Rating Stars */}
            <div className="flex items-center gap-1 my-1.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>

            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              4.9 (40K REVIEWS)
            </p>

            {/* Doctor Avatar Stack */}
            <div className="flex items-center -space-x-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow">
                <Image src="/doctor3.png" alt="Doctor 1" fill className="object-cover" />
              </div>
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow">
                <Image src="/doctor2.png" alt="Doctor 2" fill className="object-cover" />
              </div>
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow">
                <Image src="/doctor1.png" alt="Doctor 3" fill className="object-cover" />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center text-xs font-bold shadow">
                <FaPlus className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

        </div>

        {/* ---------------- RIGHT SIDE: CONTENT & CARDS WITH IMAGES ---------------- */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Top Tag & Title */}
          <div>
            <div className="inline-flex items-center gap-1.5 border border-slate-200 rounded-md px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-700 tracking-wider uppercase mb-3">
              <FaPlus className="w-2.5 h-2.5 text-[#00c5c8]" />
              <span>ABOUT US</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black leading-tight tracking-tight">
              Providing Quality <br />
              Care You <span className="text-[#00c5c8]">Can Trust</span>
            </h2>

            {/* Real Content Paragraph */}
            <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed max-w-xl">
              We are committed to delivering exceptional patient-centered medical treatment through our expert medical board, state-of-the-art diagnostic facilities, and compassionate care staff available 24/7.
            </p>
          </div>

          {/* Cards Row (With Image OR Icon Support) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {featureCards.map((card, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:border-[#00c5c8] transition-all group"
              >
                {/* Image OR Icon Container */}
                <div className="mb-3">
                  {card.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                      <Image 
                        src={card.imageUrl} 
                        alt={card.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#00c5c8] flex items-center justify-center shadow-md">
                      {card.icon}
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-zinc-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Key Bullet Checklist */}
          <div className="space-y-2 pt-1 text-xs sm:text-sm font-bold text-zinc-800">
            <div className="flex items-center gap-2.5">
              <FaCircleCheck className="w-4 h-4 text-[#00c5c8] shrink-0" />
              <span>Caring For People. Improving Lives. Committed To Excellence</span>
            </div>
            <div className="flex items-center gap-2.5">
              <FaCircleCheck className="w-4 h-4 text-[#00c5c8] shrink-0" />
              <span>Healing Begins With Understanding Patient Needs</span>
            </div>
          </div>

          {/* Footer Call to Action & Doctor Profile */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-3">
            <Link
              href="/about"
              className="bg-[#00c5c8] hover:bg-[#00b2b5] text-white text-xs font-bold tracking-wider py-3.5 px-6 rounded-full inline-flex items-center gap-3 transition-all shadow-md active:scale-98"
            >
              <span>MORE ABOUT US</span>
              <div className="w-5 h-5 bg-white text-[#00c5c8] rounded-full flex items-center justify-center">
                <FaArrowRight className="w-2.5 h-2.5" />
              </div>
            </Link>

            {/* Doctor Profile Mini Avatar */}
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#00c5c8] shadow-sm">
                <Image
                  src="/doctor1.png"
                  alt="Dr. Abigail George"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-zinc-900 leading-tight">
                  Dr. Abigail George
                </h4>
                <p className="text-[11px] font-medium text-slate-500">
                  Pediatric Eye Specialist
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}