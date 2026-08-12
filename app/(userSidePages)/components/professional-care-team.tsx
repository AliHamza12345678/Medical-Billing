import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaPinterestP } from 'react-icons/fa';

// Doctor Interface
interface Doctor {
    id: number;
    name: string;
    specialty: string;
    image: string;
    socials: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        pinterest?: string;
    };
}

// Doctors Data Array
const doctorsData: Doctor[] = [
    {
        id: 1,
        name: "Dr. Jennifer Scott",
        specialty: "Fitness",
        image: "/doctor1.png",
        socials: { facebook: "#", twitter: "#", linkedin: "#", pinterest: "#" },
    },
    {
        id: 2,
        name: "Dr. Sarah Levine",
        specialty: "Ophthalmologist",
        image: "/doctor2.png",
        socials: { facebook: "#", twitter: "#", linkedin: "#", pinterest: "#" },
    },
    {
        id: 3,
        name: "Dr. Amanda Chen",
        specialty: "Dermatologist",
        image: "/Surgeon-img.png",
        socials: { facebook: "#", twitter: "#", linkedin: "#", pinterest: "#" },
    },
    {
        id: 4,
        name: "Dr. Laura Simmon",
        specialty: "Health Specialist",
        image: "/doctor3.png",
        socials: { facebook: "#", twitter: "#", linkedin: "#", pinterest: "#" },
    },
];

export default function DoctorsTeamSection() {
    return (
        <section className="relative  py-20 px-4 md:px-10 mx-10 my-10 overflow-hidden font-sans rounded-3xl">
            {/* Background Image with Dark Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: "url('./Healthcare.png')" }}
            />
            <div className="absolute inset-0 bg-zinc-950/85 z-0" />

            {/* Main Container */}
            <div className="relative z-10 max-w-7xl mx-auto text-center">

                {/* Top Tag */}
                <div className="inline-flex items-center gap-1.5 border border-white/20 rounded-md px-3 py-1 bg-black/40 backdrop-blur-md text-[10px] font-bold text-white mb-4 tracking-wider uppercase">
                    <Plus className="w-3 h-3 text-[#00c5c8]" />
                    <span>PROFESSIONAL CARE TEAM</span>
                </div>

                {/* Heading */}
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-12 tracking-tight">
                    Meet The Medical Minds <br className="hidden sm:block" />
                    Behind <span className="text-[#00c5c8]">Our Mission</span>
                </h2>

                {/* Doctors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
                    {doctorsData.map((doctor) => (
                        <div
                            key={doctor.id}
                            className="relative group rounded-3xl overflow-hidden bg-slate-800 h-[380px] shadow-2xl flex flex-col justify-end"
                        >
                            {/* Doctor Image */}
                            <Image
                                src={doctor.image}
                                alt={doctor.name}
                                fill
                                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Right Side Vertical Social Media Bar */}
                            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md rounded-full py-2 px-1.5 flex flex-col gap-2.5 z-10 text-[#00c5c8] shadow-md">
                                <Link href={doctor.socials.facebook || '#'} className="hover:text-black transition-colors p-1">
                                    <FaFacebookF className="w-3.5 h-3.5" />
                                </Link>
                                <Link href={doctor.socials.twitter || '#'} className="hover:text-black transition-colors p-1">
                                    <FaTwitter className="w-3.5 h-3.5" />
                                </Link>
                                <Link href={doctor.socials.linkedin || '#'} className="hover:text-black transition-colors p-1">
                                    <FaLinkedinIn className="w-3.5 h-3.5" />
                                </Link>
                                <Link href={doctor.socials.pinterest || '#'} className="hover:text-black transition-colors p-1">
                                    <FaPinterestP className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {/* Bottom Floating White Card */}
                            <div className="relative z-10 m-4 p-3 bg-white rounded-2xl text-center shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
                                {/* Floating Specialty Tag */}
                                <div className="inline-block bg-[#00c5c8] text-white text-[11px] font-semibold px-4 py-1 rounded-full mb-1">
                                    {doctor.specialty}
                                </div>

                                {/* Doctor Name */}
                                <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                                    {doctor.name}
                                </h3>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}