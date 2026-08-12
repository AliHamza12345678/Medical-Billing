'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaPhoneAlt, FaClock } from 'react-icons/fa';

export default function HeroSection() {
  // Opening hours data array
  const openingHours = [
    { id: 1, days: 'Mon - Wed', time: '9 AM - 6 PM' },
    { id: 2, days: 'Thu - Fri', time: '9 AM - 8 PM' },
    { id: 3, days: 'Saturday', time: '10 AM - 5 PM' },
  ];

  // Dynamic Counter Logic
  const [percentage, setPercentage] = useState<number>(0);
  const targetPercentage = 90;
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1500; // 1.5 seconds animation
          const stepTime = Math.abs(Math.floor(duration / targetPercentage));

          const timer = setInterval(() => {
            start += 1;
            setPercentage(start);
            if (start >= targetPercentage) {
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
  }, [targetPercentage]);

  return (
    <section
      className="relative text-white min-h-screen pt-32 pb-16 overflow-hidden flex items-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/herosection-img.png')" }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/15 z-10"></div>

      <div className="px-6 md:px-20 mx-auto relative z-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            Delivering Excellence <br />
            In <span className="text-[#00c2cb]">Medical Services</span>
          </h1>
          
          <p className="text-gray-300 text-sm md:text-base max-w-lg">
            Providing compassionate care and advanced medical treatments with a team of experienced healthcare specialists dedicated to your well-being.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <Link
              href="/login"
              className="bg-[#00c2cb] hover:bg-[#00a6af] text-white text-xs font-bold tracking-wider px-8 py-3.5 rounded-full flex items-center gap-3 transition-all shadow-lg"
            >
              Login
              <span className="bg-white text-[#00c2cb] p-1 rounded-full flex items-center justify-center">
                <FaArrowRight className="w-3 h-3" />
              </span>
            </Link>

            {/* Contact Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00c2cb] text-white flex items-center justify-center shadow-md">
                <FaPhoneAlt className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Need Help</span>
                <span className="text-sm font-bold tracking-wide text-white">(+123) 666 79 88</span>
              </div>
            </div>
          </div>

          {/* Opening Hours Box */}
          <div className="bg-white text-zinc-900 p-6 rounded-2xl shadow-2xl max-w-md mt-8">
            <div className="flex items-center gap-2 mb-4 text-[#00c2cb]">
              <FaClock className="w-5 h-5" />
              <h3 className="font-bold text-lg text-zinc-900">Opening Hours</h3>
            </div>

            <div className="space-y-2 mb-6">
              {openingHours.map((item) => (
                <div key={item.id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                  <span className="font-medium text-gray-600">{item.days}</span>
                  <span className="font-bold text-zinc-800">{item.time}</span>
                </div>
              ))}
            </div>

            <Link
              href="#appointment"
              className="bg-[#00c2cb] hover:bg-[#00a6af] text-white text-xs font-bold tracking-wider py-3 px-4 rounded-full flex items-center justify-between transition-all"
            >
              <span>EMERGENCY CONTACT</span>
              <span className="bg-white text-[#00c2cb] p-1 rounded-full flex items-center justify-center">
                <FaArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

        </div>

        {/* Right Side / Stats with Counter Logic */}
        <div className="relative hidden lg:flex justify-end h-full items-end pb-20">
          <div>
            {/* Satisfied Patients Box with Dynamic Counter */}
            <div 
              ref={counterRef} 
              className="absolute -bottom-10 -left-16 bg-white text-zinc-900 p-6 rounded-3xl shadow-2xl flex items-center gap-6 z-30"
            >
              <div className="relative w-20 h-20">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path 
                    className="text-gray-200" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                  />
                  {/* Animated Progress Circle */}
                  <path 
                    className="text-[#00c2cb] transition-all duration-100 ease-out" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeDasharray={`${percentage}, 100`} 
                    strokeLinecap="round" 
                    transform="rotate(90 18 18)" 
                  />
                </svg>
                {/* Counter Text */}
                <div className="absolute inset-0 flex items-center justify-center font-extrabold text-xl text-[#00c2cb]">
                  {percentage}%
                </div>
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-zinc-800">Satisfied Patients</h4>
                <p className="text-sm text-gray-500">Positive Health Outcomes</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}