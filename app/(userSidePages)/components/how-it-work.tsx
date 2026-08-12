import React from 'react';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';

// Custom Icons
const PulseIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const StethoscopeIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 018 0z" />
  </svg>
);

const DoctorIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowCircleIcon = () => (
  <svg className="w-4 h-4 text-[#00c5c8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l4 4-4 4" />
  </svg>
);

// Interfaces
interface StepItem {
  stepNumber: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FeatureItem {
  id: number;
  text: string;
}

// Data Array for Container 1 (Real Medical Content)
const stepsData: StepItem[] = [
  {
    stepNumber: "01",
    title: "Treatment Procedure",
    description: "Receive personalized care plans designed by clinical specialists to ensure safe and effective recovery.",
    icon: <PulseIcon />,
  },
  {
    stepNumber: "02",
    title: "Patient Registration",
    description: "Complete a quick digital registration to book appointments and access your medical records instantly.",
    icon: <StethoscopeIcon />,
  },
  {
    stepNumber: "03",
    title: "Doctor Consultation",
    description: "Connect directly with experienced healthcare providers for expert medical advice and diagnosis.",
    icon: <DoctorIcon />,
  },
];

// Data Array for Container 2 (Real Features)
const consultationFeatures: FeatureItem[] = [
  { id: 1, text: "Confidential Consultation" },
  { id: 2, text: "Language Support" },
  { id: 3, text: "Multi-Device Support" },
  { id: 4, text: "24/7 Availability" },
  { id: 5, text: "Get Medical Advice" },
];

export default function MergedMedicalSection() {
  return (
    <section className="bg-white py-16 px-6 md:px-12 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
        
        {/* ==================== CONTAINER 1 (IMAGE 1) ==================== */}
        <div className="lg:col-span-3 flex flex-col justify-between">
          
          {/* Header Section */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-1.5 border border-slate-300 rounded-md px-2.5 py-1 bg-white text-[10px] font-bold text-slate-700 mb-4 tracking-wide uppercase">
              <Plus className="w-3 h-3 text-[#00c5c8]" />
              <span>HOW IT WORKS</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black mb-3">
              Your Health, Our <span className="text-[#00c5c8]">Priority</span>
            </h2>

            <p className="text-slate-500 text-sm md:text-base max-w-xl leading-relaxed">
              We streamline your healthcare journey through fast registration, direct doctor access, and tailored treatment plans for comprehensive patient care.
            </p>
          </div>

          {/* 3 Steps Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stepsData.map((item) => (
              <div
                key={item.stepNumber}
                className="relative bg-white border border-slate-200/80 rounded-2xl p-6 pt-10 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Floating Circle Icon */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#00c5c8] flex items-center justify-center shadow-md">
                  {item.icon}
                </div>

                {/* Step Number */}
                <span className="absolute top-3 right-4 text-3xl font-extrabold text-slate-100 select-none">
                  {item.stepNumber}
                </span>

                {/* Content */}
                <div className="text-center mt-2">
                  <h3 className="text-base font-bold text-black mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ==================== CONTAINER 2 (IMAGE 2) ==================== */}
        <div className="lg:col-span-1 relative rounded-2xl overflow-hidden shadow-xl min-h-[380px] flex flex-col justify-between p-6 text-white bg-zinc-900">
          
          {/* Background Image with Dark Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center z-0 opacity-30"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800')" }}
          />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 border-b border-white/20 pb-4">
              <h3 className="text-lg font-bold leading-snug max-w-[150px]">
                Online Doctor Consultation
              </h3>
              <div className="text-[#00c5c8] border border-[#00c5c8] p-1.5 rounded-lg bg-black/20">
                <DoctorIcon />
              </div>
            </div>

            {/* Checklist */}
            <ul className="space-y-2.5 my-4">
              {consultationFeatures.map((feature) => (
                <li key={feature.id} className="flex items-center gap-2 text-xs text-slate-200">
                  <ArrowCircleIcon />
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div className="relative z-10 pt-2">
            <Link
              href="#appointment"
              className="w-full bg-[#00c5c8] hover:bg-[#00b2b5] text-white text-[11px] font-bold uppercase tracking-wider py-3 px-4 rounded-full flex items-center justify-between transition-all"
            >
              <span>TALK TO A DOCTOR</span>
              <span className="bg-white text-[#00c5c8] p-1 rounded-full flex items-center justify-center">
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}