import React from 'react';
import Image from 'next/image';
import { ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';

// Custom SVG Icons
const HomeIcon = () => (
    <svg className="w-6 h-6 text-[#00c5c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const DoctorIcon = () => (
    <svg className="w-6 h-6 text-[#00c5c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const HeartIcon = () => (
    <svg className="w-6 h-6 text-[#00c5c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

// Interface
interface ServiceItem {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    icon: React.ReactNode;
}

// Actual Medical Content Array
const servicesData: ServiceItem[] = [
    {
        id: 1,
        title: "Advanced\nDiagnostics",
        description: "State-of-the-art MRI, CT scans, and lab testing for precise patient care.",
        imageUrl: "/CT-Scan-img.png",
        icon: <HomeIcon />,
    },
    {
        id: 2,
        title: "Orthopedics\nServices",
        description: "Comprehensive bone, joint, and spine treatments by specialist surgeons.",
        imageUrl: "/Chest-X-Ray-img.png",
        icon: <DoctorIcon />,
    },
    {
        id: 3,
        title: "Cardiology\nHealth",
        description: "Expert cardiac care including screenings, surgery, and rehabilitation.",
        imageUrl: "/Surgical-img.png",
        icon: <HeartIcon />,
    },
];

export default function ServicesSection() {
    return (
        <section className="bg-[#f0fbfb] min-h-screen py-16 px-6 md:px-16 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-1.5 border border-slate-300 rounded-md px-3 py-1 bg-white/60 text-[11px] font-bold text-slate-700 mb-6 tracking-wide uppercase">
                            <Plus className="w-3 h-3 text-[#00c5c8]" />
                            <span>OUR SERVICES</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] tracking-tight">
                            Specialized <span className="text-[#00c5c8]">Services</span> <br />
                            For Better Health
                        </h2>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-6 max-w-lg lg:pt-4">
                        <p className="text-slate-500 text-sm leading-relaxed lg:text-right">
                            Providing compassionate and personalized healthcare services tailored to your individual needs with cutting-edge medical technology.
                        </p>

                        <Link href="/services" className="inline-flex items-center gap-3 bg-[#00c5c8] hover:bg-[#00b2b5] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-full transition-colors shadow-sm">
                            SEE MORE SERVICES
                            <span className="bg-white rounded-full p-1 text-[#00c5c8]">
                                <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {servicesData.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-[2rem] p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl md:text-3xl font-bold text-black whitespace-pre-line leading-tight">
                                        {item.title}
                                    </h3>
                                    <button className="bg-[#00c5c8] text-white p-3.5 rounded-full hover:bg-[#00b2b5] transition-colors shrink-0 ml-2">
                                        <ArrowRight className="w-5 h-5 -rotate-45" />
                                    </button>
                                </div>

                                <p className="text-slate-500 text-sm mb-6 max-w-[88%] leading-snug">
                                    {item.description}
                                </p>
                            </div>

                            <div className="relative w-full h-64 rounded-2xl overflow-hidden">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title.replace('\n', ' ')}
                                    fill
                                    className="object-cover"
                                />

                                <div className="absolute bottom-0 right-0 bg-white pt-2.5 pl-2.5 rounded-tl-2xl">
                                    <div className="bg-[#f0fbfb] p-3.5 rounded-xl flex items-center justify-center">
                                        {item.icon}
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