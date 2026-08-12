'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

// Real Medical FAQ Data
const leftFaqs: FAQItem[] = [
  {
    id: 1,
    question: "What Types Of Medical Services Do You Offer?",
    answer: "We offer comprehensive healthcare services including general consultations, specialized surgery, preventive health checkups, diagnostic imaging, pediatrics, and emergency care."
  },
  {
    id: 2,
    question: "How Quickly Can You Respond To An Emergency?",
    answer: "Our emergency response team and ambulance services operate 24/7 with an average response time of under 15 minutes within city limits."
  },
  {
    id: 3,
    question: "Are Your Medical Licensed And Insured?",
    answer: "Yes, all of our physicians, surgeons, and healthcare professionals are fully board-certified, licensed, and insured under top medical regulatory authorities."
  }
];

const rightFaqs: FAQItem[] = [
  {
    id: 4,
    question: "What Types Of Medical Services Do You Offer?",
    answer: "Our clinic provides primary care, cardiology, dermatology, orthopedic treatment, and chronic disease management tailored to individual patient needs."
  },
  {
    id: 5,
    question: "How Quickly Can You Respond To An Emergency?",
    answer: "Our on-site ER staff handles urgent cases immediately upon arrival with zero waiting time for critical condition triage."
  },
  {
    id: 6,
    question: "Are Your Medical Licensed And Insured?",
    answer: "Absolutely. We maintain strict compliance with international medical safety standards, and all clinical procedures are fully covered and insured."
  }
];

export default function FAQAccordionSection() {
  // Open the first item of each column by default (matching the UI screenshot)
  const [openLeft, setOpenLeft] = useState<number | null>(1);
  const [openRight, setOpenRight] = useState<number | null>(4);

  const toggleLeft = (id: number) => {
    setOpenLeft(openLeft === id ? null : id);
  };

  const toggleRight = (id: number) => {
    setOpenRight(openRight === id ? null : id);
  };

  return (
    <section className="bg-white py-12 px-6 md:px-12 font-sans text-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-4">
            {leftFaqs.map((faq) => {
              const isOpen = openLeft === faq.id;
              return (
                <div key={faq.id} className="rounded-xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => toggleLeft(faq.id)}
                    className={`w-full flex items-center justify-between p-4 px-6 text-left font-bold text-sm sm:text-base transition-colors duration-200 ${
                      isOpen
                        ? 'bg-[#00c5c8] text-white rounded-t-xl'
                        : 'bg-white border border-slate-200 text-zinc-900 rounded-xl hover:border-[#00c5c8]'
                    }`}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <Minus className="w-5 h-5 shrink-0 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 shrink-0 text-zinc-800" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="bg-white border border-t-0 border-slate-200 p-5 px-6 rounded-b-xl text-slate-500 text-xs sm:text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {rightFaqs.map((faq) => {
              const isOpen = openRight === faq.id;
              return (
                <div key={faq.id} className="rounded-xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => toggleRight(faq.id)}
                    className={`w-full flex items-center justify-between p-4 px-6 text-left font-bold text-sm sm:text-base transition-colors duration-200 ${
                      isOpen
                        ? 'bg-[#00c5c8] text-white rounded-t-xl'
                        : 'bg-white border border-slate-200 text-zinc-900 rounded-xl hover:border-[#00c5c8]'
                    }`}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <Minus className="w-5 h-5 shrink-0 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 shrink-0 text-zinc-800" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="bg-white border border-t-0 border-slate-200 p-5 px-6 rounded-b-xl text-slate-500 text-xs sm:text-sm leading-relaxed">
                      {faq.answer}
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