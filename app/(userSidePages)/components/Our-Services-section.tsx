'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Stethoscope, HeartPulse, Hospital } from 'lucide-react';

interface ServiceCard {
    id: number;
    title: string;
    description: string;
    image: string;
    icon: React.ReactNode;
    link: string;
}

// Real Medical & Healthcare Services Data
const servicesData: ServiceCard[] = [
    {
        id: 1,
        title: "Advanced Diagnostics",
        description: "State-of-the-art MRI, CT scans, and digital X-ray imaging for precise medical diagnosis.",
        image: "/CT-Scan-img.png",
        icon: <Hospital className="w-5 h-5 text-[#00c5c8]" />,
        link: "/services/diagnostics",
    },
    {
        id: 2,
        title: "Orthopedics Services",
        description: "Comprehensive joint care, bone fracture recovery, and specialized spine surgeries.",
        image: "/Chest-X-Ray-img.png",
        icon: <Stethoscope className="w-5 h-5 text-[#00c5c8]" />,
        link: "/services/orthopedics",
    },
    {
        id: 3,
        title: "Cardiology Health",
        description: "Expert cardiovascular screenings, heart disease prevention, and post-cardiac care.",
        image: "/Surgical-img.png",
        icon: <HeartPulse className="w-5 h-5 text-[#00c5c8]" />,
        link: "/services/cardiology",
    },
    {
        id: 4,
        title: "Advanced Diagnostics",
        description: "State-of-the-art MRI, CT scans, and digital X-ray imaging for precise medical diagnosis.",
        image: "/CT-Scan-img.png",
        icon: <Hospital className="w-5 h-5 text-[#00c5c8]" />,
        link: "/services/diagnostics",
    },
    {
        id: 5,
        title: "Orthopedics Services",
        description: "Comprehensive joint care, bone fracture recovery, and specialized spine surgeries.",
        image: "/Chest-X-Ray-img.png",
        icon: <Stethoscope className="w-5 h-5 text-[#00c5c8]" />,
        link: "/services/orthopedics",
    },
    {
        id: 6,
        title: "Cardiology Health",
        description: "Expert cardiovascular screenings, heart disease prevention, and post-cardiac care.",
        image: "/Surgical-img.png",
        icon: <HeartPulse className="w-5 h-5 text-[#00c5c8]" />,
        link: "/services/cardiology",
    },
];

export default function ServicesCardsGrid() {
    return (
        <section className="bg-[#f0fafb] py-16 px-6 md:px-12 font-sans text-zinc-900">
            <div className="max-w-7xl mx-auto">

                {/* Responsive 3-Column Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {servicesData.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
                        >
                            {/* Top Text & Arrow Button Header */}
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <h3 className="text-xl font-bold text-zinc-900 leading-tight max-w-[75%]">
                                        {service.title}
                                    </h3>

                                    <Link
                                        href={service.link}
                                        className="w-10 h-10 rounded-full bg-[#00c5c8] text-white flex items-center justify-center shrink-0 hover:bg-[#00a8ab] transition-colors"
                                        aria-label={`Learn more about ${service.title}`}
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>

                                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                                    {service.description}
                                </p>
                            </div>

                            {/* Bottom Image Container with Cutout Icon Badge */}
                            <div className="relative w-full h-56 sm:h-60 rounded-2xl overflow-hidden mt-2">
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    className="object-cover"
                                />

                                {/* Bottom-Right White Pill with Icon */}
                                <div className="absolute bottom-0 right-0 bg-white pt-2.5 pl-2.5 rounded-tl-2xl">
                                    <div className="w-11 h-11 bg-[#f0fafb] rounded-xl flex items-center justify-center">
                                        {service.icon}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}