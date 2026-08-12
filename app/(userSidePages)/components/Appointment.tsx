'use client';

import React, { useState } from 'react';
import { Plus, MessageSquareQuote, PhoneCall, ArrowRight } from 'lucide-react';

export default function AppointmentBookingSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Thank you! Your appointment request has been submitted.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <section id="appointment" className="relative mx-10  py-16 md:py-24 px-4 md:px-10 font-sans overflow-hidden rounded-3xl my-8">
      
      {/* Background Image Layer with Fixed Position (bg-fixed) */}
      <div 
        className="absolute inset-0 bg-fixed bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('/Healthcare.png')" 
        }}
      />
      {/* Dark Overlay for text legibility */}
      <div className="absolute inset-0 bg-zinc-950/80 z-0" />

      {/* Main Grid Container */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Heading & Content */}
        <div className="lg:col-span-6 text-white space-y-6">
          
          {/* Top Tag */}
          <div className="inline-flex items-center gap-1.5 border border-white/20 rounded-md px-3 py-1 bg-black/40 backdrop-blur-md text-[10px] font-bold text-white tracking-wider uppercase">
            <Plus className="w-3 h-3 text-[#00c5c8]" />
            <span>APPOINTMENT TODAY</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Book Your First <br />
            <span className="text-[#00c5c8]">Appointment</span> Today
          </h2>

          {/* Actual Healthcare Content */}
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            Schedule a consultation with our experienced medical specialists. We provide personalized healthcare solutions, state-of-the-art diagnostic facilities, and compassionate patient care.
          </p>

          {/* Sub Feature Tag */}
          <div className="flex items-center gap-3 pt-2 text-xs sm:text-sm font-semibold text-slate-200">
            <MessageSquareQuote className="w-5 h-5 text-[#00c5c8] shrink-0" />
            <span>Your Feedback Drives Our Excellence</span>
          </div>

        </div>

        {/* Right Column: Appointment Form Container */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="bg-[#f0fafb] border border-[#d6f2f4] p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md text-zinc-900">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Input Fields Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-800 placeholder-slate-400 focus:outline-none focus:border-[#00c5c8] transition-colors"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-800 placeholder-slate-400 focus:outline-none focus:border-[#00c5c8] transition-colors"
                />
              </div>

              {/* Input Fields Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone No"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-800 placeholder-slate-400 focus:outline-none focus:border-[#00c5c8] transition-colors"
                />

                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-800 placeholder-slate-400 focus:outline-none focus:border-[#00c5c8] transition-colors"
                />
              </div>

              {/* Message Box */}
              <div>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-zinc-800 placeholder-slate-400 focus:outline-none focus:border-[#00c5c8] transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#00c5c8] hover:bg-[#00b2b5] text-white text-xs sm:text-sm font-bold tracking-wider py-3.5 px-6 rounded-full inline-flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <span>BOOK NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Submission Status Message */}
            {statusMessage && (
              <p className="text-xs font-semibold text-emerald-600 text-center mt-3">
                {statusMessage}
              </p>
            )}

            {/* Contact Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-4">
              <div className="w-11 h-11 bg-[#00c5c8] text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Call For Appointment
                </span>
                <a 
                  href="tel:+51234568888" 
                  className="text-base sm:text-lg font-extrabold text-black hover:text-[#00c5c8] transition-colors tracking-tight"
                >
                  +(5123) 456-8888
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}