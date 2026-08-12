'use client';

import React from 'react';
import Image from 'next/image';
import { Quote } from 'lucide-react';

// Interface for Testimonial Card
interface Testimonial {
  id: number;
  name: string;
  department: string;
  image: string;
  review: string;
}

// Real Medical & Healthcare Reviews Data Array
const testimonialsData: Testimonial[] = [
  {
    id: 1,
    name: "Dr. Emily Johnson",
    department: "Orthopedics",
    image: "/doctor1.png",
    review: "The orthopedic department provided top-notch post-surgery rehabilitation. The care plan was detailed, personalized, and helped me regain mobility faster than expected."
  },
  {
    id: 2,
    name: "Dr. Sophie Lee",
    department: "Cardiology",
    image: "/doctor2.png",
    review: "Exceptional cardiovascular treatment and continuous patient monitoring. Their specialists took the time to explain every detail, ensuring complete peace of mind."
  },
  {
    id: 3,
    name: "Dr. Emily Johnson",
    department: "Dermatology",
    image: "/doctor3.png",
    review: "Outstanding dermatological consultation! The prescribed skincare routine and targeted clinical treatment yielded visible improvements in just two weeks."
  },
  {
    id: 4,
    name: "Dr. Emily Johnson",
    department: "Orthopedics",
    image: "/doctor1.png",
    review: "The orthopedic department provided top-notch post-surgery rehabilitation. The care plan was detailed, personalized, and helped me regain mobility faster than expected."
  },
  {
    id: 5,
    name: "Dr. Sophie Lee",
    department: "Cardiology",
    image: "/doctor2.png",
    review: "Exceptional cardiovascular treatment and continuous patient monitoring. Their specialists took the time to explain every detail, ensuring complete peace of mind."
  },
  {
    id: 6,
    name: "Dr. Emily Johnson",
    department: "Dermatology",
    image: "/doctor3.png",
    review: "Outstanding dermatological consultation! The prescribed skincare routine and targeted clinical treatment yielded visible improvements in just two weeks."
  }
];

export default function TestimonialsGrid() {
  return (
    <section className="bg-white py-12 px-6 md:px-12 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto">
        
        {/* 3-Column Testimonials Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonialsData.map((item) => (
            <div
              key={item.id}
              className="bg-[#f0fafb] border border-[#d6f2f4] rounded-2xl p-8 flex flex-col items-center text-center space-y-4 shadow-xs hover:shadow-md transition-shadow duration-300"
            >
              
              {/* Header: Teal Quote Icon & Rounded Doctor Avatar */}
              <div className="flex items-center justify-center gap-5 w-full pt-1">
                <Quote className="w-9 h-9 text-[#00c5c8] fill-[#00c5c8] rotate-180 shrink-0" />
                
                <div className="relative w-16 h-16 rounded-full border-2 border-[#00c5c8] overflow-hidden shrink-0 shadow-sm">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Doctor / Specialist Info */}
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-base md:text-lg text-zinc-900 tracking-tight">
                  {item.name}
                </h3>
                <p className="text-xs font-semibold text-[#00c5c8]">
                  {item.department}
                </p>
              </div>

              {/* Patient Review Content */}
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs pt-1">
                "{item.review}"
              </p>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}