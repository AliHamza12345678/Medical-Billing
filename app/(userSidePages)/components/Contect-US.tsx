'use client';

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

interface ContactInfoItem {
  id: number;
  title: string;
  value: string;
  href: string;
  icon: React.ReactNode;
}

const contactDetails: ContactInfoItem[] = [
  {
    id: 1,
    title: "Phone:",
    value: "(555) 222 333 999",
    href: "tel:555222333999",
    icon: <Phone className="w-6 h-6 text-[#00c5c8] fill-[#00c5c8]" />,
  },
  {
    id: 2,
    title: "Email Address:",
    value: "Domain@Example.Com",
    href: "mailto:Domain@Example.Com",
    icon: <Mail className="w-6 h-6 text-[#00c5c8] fill-[#00c5c8]" />,
  },
  {
    id: 3,
    title: "Our Address:",
    value: "2118, New York, UK.",
    href: "https://maps.google.com",
    icon: <MapPin className="w-6 h-6 text-[#00c5c8] fill-[#00c5c8]" />,
  },
];

export default function ContactInfoCards() {
  return (
    <section className="bg-white py-12 px-6 md:px-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactDetails.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target={item.id === 3 ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="bg-[#f0fafb] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              {/* Icon Container */}
              <div className="mb-1">
                {item.icon}
              </div>

              {/* Card Label */}
              <h3 className="font-bold text-zinc-900 text-base md:text-lg">
                {item.title}
              </h3>

              {/* Info Detail */}
              <p className="text-slate-500 text-xs sm:text-sm font-normal">
                {item.value}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}