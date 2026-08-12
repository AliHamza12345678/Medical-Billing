import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ArrowRight, CheckCircle2 } from 'lucide-react';

// Pricing Plan Interface
interface PlanFeature {
    id: number;
    name: string;
}

interface PricingPlan {
    id: number;
    planName: string;
    price: string;
    unit: string;
    image: string;
    features: PlanFeature[];
    bookLink: string;
}

// Real Medical Content Array of Objects
const pricingPlansData: PricingPlan[] = [
    {
        id: 1,
        planName: "Basic Plan",
        price: "$120",
        unit: "/Test",
        image: "/CT-Scan-img.png",
        features: [
            { id: 1, name: "Orthopaedics" },
            { id: 2, name: "Cardiology" },
            { id: 3, name: "Intensive Care" },
            { id: 4, name: "Maternity" },
            { id: 5, name: "Pediatrics" },
            { id: 6, name: "Dental-Care" },
        ],
        bookLink: "#",
    },
    {
        id: 2,
        planName: "Standard Plan",
        price: "$150",
        unit: "/Test",
        image: "/Chest-X-Ray-img.png",
        features: [
            { id: 1, name: "Orthopaedics" },
            { id: 2, name: "Cardiology" },
            { id: 3, name: "Intensive Care" },
            { id: 4, name: "Maternity" },
            { id: 5, name: "Pediatrics" },
            { id: 6, name: "Dental-Care" },
        ],
        bookLink: "#",
    },
    {
        id: 3,
        planName: "Premium Plan",
        price: "$180",
        unit: "/Test",
        image: "/Surgical-img.png",
        features: [
            { id: 1, name: "Orthopaedics" },
            { id: 2, name: "Cardiology" },
            { id: 3, name: "Intensive Care" },
            { id: 4, name: "Maternity" },
            { id: 5, name: "Pediatrics" },
            { id: 6, name: "Dental-Care" },
        ],
        bookLink: "#",
    },
];

export default function MedicalPricingSection() {
    return (
        <section className="bg-white py-16 px-6 md:px-12 font-sans text-zinc-900">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
                    <div>
                        {/* Tag */}
                        <div className="inline-flex items-center gap-1.5 border border-slate-300 rounded-md px-2.5 py-1 bg-white text-[10px] font-bold text-slate-700 mb-4 tracking-wide uppercase">
                            <Plus className="w-3 h-3 text-[#00c5c8]" />
                            <span>OUR PRICING</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-black">
                            <span className="text-[#00c5c8]">Pricing</span> For <br />
                            Exceptional Medical
                        </h2>
                    </div>

                    {/* Subtitle & See More Button */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4 max-w-md">
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed lg:text-right">
                            Transparent and affordable healthcare packages tailored to your needs. Access world-class medical specialists with no hidden fees.
                        </p>
                        <Link
                            href="/pricing"
                            className="bg-[#00c5c8] hover:bg-[#00b2b5] text-white text-xs font-bold tracking-wider py-3 px-6 rounded-full inline-flex items-center gap-3 transition-all shadow-md"
                        >
                            <span>SEE MORE</span>
                            <span className="bg-white text-[#00c5c8] p-1 rounded-full flex items-center justify-center">
                                <ArrowRight className="w-3 h-3" />
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Pricing Cards List */}
                <div className="space-y-6">
                    {pricingPlansData.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-[#f0fafb] border border-[#d6f2f4] rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all hover:shadow-md"
                        >
                            {/* Left Column: Plan Name & Price */}
                            <div className="flex-shrink-0 min-w-[160px] text-center lg:text-left">
                                <span className="inline-block bg-[#d8f4f6] text-[#00c5c8] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                                    {plan.planName}
                                </span>
                                <div className="flex items-baseline justify-center lg:justify-start">
                                    <span className="text-4xl md:text-5xl font-black text-black">
                                        {plan.price}
                                    </span>
                                    <span className="text-[#00c5c8] font-bold text-sm ml-1">
                                        {plan.unit}
                                    </span>
                                </div>
                            </div>

                            {/* Middle Column 1: Image */}
                            <div className="relative w-full max-w-[220px] h-32 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                <Image
                                    src={plan.image}
                                    alt={plan.planName}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Middle Column 2: Features Grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-grow max-w-md">
                                {plan.features.map((feature) => (
                                    <div key={feature.id} className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-[#00c5c8] shrink-0" />
                                        <span>{feature.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Right Column: Divider & Book Button */}
                            <div className="flex items-center gap-8 w-full lg:w-auto justify-center lg:justify-end border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-4 lg:pt-0 lg:pl-8">
                                <Link
                                    href={plan.bookLink}
                                    className="bg-[#00c5c8] hover:bg-[#00b2b5] text-white text-xs font-bold tracking-wider py-3.5 px-7 rounded-full inline-flex items-center gap-3 transition-all shadow-md w-full sm:w-auto justify-center"
                                >
                                    <span>BOOK NOW</span>
                                    <span className="bg-white text-[#00c5c8] p-1 rounded-full flex items-center justify-center">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </Link>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}