'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function ContactFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    // Add form submission logic here (API call, Toast notification, etc.)
  };

  return (
    <section className="bg-white py-12 px-6 md:px-12 font-sans">
      <div className="max-w-6xl mx-auto bg-[#f0fafb] rounded-3xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Side - Image Container */}
          <div className="relative min-h-[350px] lg:min-h-[500px] w-full">
            <Image
              src="/doctor1.png"
              alt="Medical team reviewing X-ray scan"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right Side - Contact Form */}
          <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            
            {/* Header Content */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mb-3">
              Send Us A Message
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
              Have questions or need to schedule a consultation? Fill out the form below and our medical team will get back to you promptly.
            </p>

            {/* Interactive Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white rounded-lg px-4 py-3 text-xs sm:text-sm text-zinc-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c5c8] transition-all"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white rounded-lg px-4 py-3 text-xs sm:text-sm text-zinc-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c5c8] transition-all"
                />
              </div>

              {/* Row 2: Email & Select Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white rounded-lg px-4 py-3 text-xs sm:text-sm text-zinc-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c5c8] transition-all"
                />
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full bg-white rounded-lg px-4 py-3 text-xs sm:text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00c5c8] transition-all cursor-pointer"
                >
                  <option value="" disabled hidden>
                    Select Services
                  </option>
                  <option value="diagnostics" className="text-zinc-800">Advanced Diagnostics</option>
                  <option value="orthopedics" className="text-zinc-800">Orthopedics Services</option>
                  <option value="cardiology" className="text-zinc-800">Cardiology Health</option>
                  <option value="dermatology" className="text-zinc-800">Dermatology Care</option>
                  <option value="general" className="text-zinc-800">General Consultation</option>
                </select>
              </div>

              {/* Row 3: Message Textarea */}
              <div>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Enter Your Message Here"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full bg-white rounded-lg p-4 text-xs sm:text-sm text-zinc-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c5c8] transition-all resize-none"
                />
              </div>

              {/* Row 4: Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#00c5c8] hover:bg-[#00a8ab] text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-full flex items-center justify-center gap-2 uppercase tracking-wider transition-colors duration-200 mt-2 shadow-sm"
              >
                <span>SUBMIT NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

          </div>

        </div>
      </div>
    </section>
  );
}