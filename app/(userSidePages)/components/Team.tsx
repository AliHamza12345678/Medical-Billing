'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaFacebookF, 
  FaXTwitter, 
  FaLinkedinIn, 
  FaPinterestP 
} from 'react-icons/fa6';

// Interface for Doctor Profile Item
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

// Doctor Profiles Data Array
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
    image: "/doctor3.png",
    socials: { facebook: "#", twitter: "#", linkedin: "#", pinterest: "#" },
  },
  {
    id: 4,
    name: "Dr. Laura Simmon",
    specialty: "Health Specialist",
    image: "/doctor-4.png",
    socials: { facebook: "#", twitter: "#", linkedin: "#", pinterest: "#" },
  },
  {
    id: 5,
    name: "Dr. Jennifer Scott",
    specialty: "Fitness",
    image: "/doctor1.png",
    socials: { facebook: "#", twitter: "#", linkedin: "#", pinterest: "#" },
  },
  {
    id: 6,
    name: "Dr. Sarah Levine",
    specialty: "Ophthalmologist",
    image: "/doctor2.png",
    socials: { facebook: "#", twitter: "#", linkedin: "#", pinterest: "#" },
  },
  {
    id: 7,
    name: "Dr. Amanda Chen",
    specialty: "Dermatologist",
    image: "/doctor3.png",
    socials: { facebook: "#", twitter: "#", linkedin: "#", pinterest: "#" },
  },
  {
    id: 8,
    name: "Dr. Laura Simmon",
    specialty: "Health Specialist",
    image: "/doctor-4.png",
    socials: { facebook: "#", twitter: "#", linkedin: "#", pinterest: "#" },
  },
];

export default function DoctorGridSection() {
  return (
    <section className="bg-white py-16 px-6 md:px-12 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Responsive Doctor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctorsData.map((doctor) => (
            <div
              key={doctor.id}
              className="relative group bg-[#eef0f2] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 pt-6 px-4 pb-14 flex flex-col items-center justify-end min-h-[380px]"
            >
              {/* Doctor Background Portrait Image */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Floating Vertical Social Icons Capsule (Top Right) */}
              <div className="absolute top-4 right-4 z-10 bg-white/70 backdrop-blur-md border border-[#00c5c8]/40 rounded-full py-2.5 px-1.5 flex flex-col items-center gap-2.5 shadow-sm text-[#00c5c8]">
                <Link
                  href={doctor.socials.facebook || "#"}
                  className="hover:scale-125 transition-transform"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={doctor.socials.twitter || "#"}
                  className="hover:scale-125 transition-transform"
                  aria-label="Twitter / X"
                >
                  <FaXTwitter className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={doctor.socials.linkedin || "#"}
                  className="hover:scale-125 transition-transform"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={doctor.socials.pinterest || "#"}
                  className="hover:scale-125 transition-transform"
                  aria-label="Pinterest"
                >
                  <FaPinterestP className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Overlay Doctor Info White Card Badge (Bottom Center) */}
              <div className="relative z-10 bg-white rounded-2xl py-3 px-6 text-center shadow-lg border border-slate-100 max-w-[85%] w-full flex flex-col items-center space-y-1.5 -mb-8 transition-transform duration-300 group-hover:-translate-y-1">
                
                {/* Specialty Pill Badge */}
                <div className="bg-[#00c5c8] text-white text-[11px] font-semibold tracking-wide py-1 px-4 rounded-full inline-block">
                  {doctor.specialty}
                </div>

                {/* Doctor Full Name */}
                <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight pt-0.5">
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