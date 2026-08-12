'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HeartPulse, Award, HeartHandshake, Users } from 'lucide-react';

// Stat Item Interface
interface StatItem {
  id: number;
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
}

// Data Array matching your image
const statsData: StatItem[] = [
  {
    id: 1,
    value: 50,
    suffix: "K",
    label: "Feel Better",
    icon: <HeartPulse className="w-10 h-10 md:w-12 md:h-12 text-white shrink-0" />,
  },
  {
    id: 2,
    value: 25,
    suffix: "+",
    label: "Years Of Service",
    icon: <Award className="w-10 h-10 md:w-12 md:h-12 text-white shrink-0" />,
  },
  {
    id: 3,
    value: 50,
    suffix: "+",
    label: "Health Sections",
    icon: <HeartHandshake className="w-10 h-10 md:w-12 md:h-12 text-white shrink-0" />,
  },
  {
    id: 4,
    value: 90,
    suffix: "%",
    label: "Satisfied Patients",
    icon: <Users className="w-10 h-10 md:w-12 md:h-12 text-white shrink-0" />,
  },
];

// Single Animated Counter Component
const AnimatedCounter = ({ targetValue, duration = 2000 }: { targetValue: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = targetValue / (duration / 16); // 60 FPS update
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

export default function StatsCounterSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Trigger animation when section scrolls into viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
    <section ref={sectionRef} className="w-full bg-[#00c5c8] py-10 px-6 font-sans text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x divide-white/20">
        {statsData.map((stat) => (
          <div
            key={stat.id}
            className="flex items-center justify-center gap-4 py-4 lg:py-0 px-4"
          >
            {/* Icon */}
            {stat.icon}

            {/* Number & Label Container */}
            <div className="flex flex-col">
              <div className="text-3xl md:text-5xl font-black tracking-tight leading-none">
                {isVisible ? <AnimatedCounter targetValue={stat.value} /> : 0}
                <span>{stat.suffix}</span>
              </div>
              <span className="text-xs md:text-sm font-semibold tracking-wide text-white/90 mt-1">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}