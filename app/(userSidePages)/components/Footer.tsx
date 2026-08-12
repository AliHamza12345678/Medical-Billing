'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRight,
    PhoneCall,
    Plus,
    Handshake
} from 'lucide-react';

import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaXTwitter
} from 'react-icons/fa6';

export default function FooterWithCTABanner() {
    return (
        <div className="w-full font-sans relative">



            {/* ----------------- MAIN DARK FOOTER CONTENT ----------------- */}
            <footer className="w-full bg-[#050709] text-white pt-16 pb-12">
                {/* ----------------- TOP CTA BANNER SECTION (OVERLAPPING DOCTORS) ----------------- */}
                <div className="mb-20 w-full pt-12 pb-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                        <div className="bg-[#00c5c8] rounded-2xl sm:rounded-3xl px-6 sm:px-10 md:px-12 py-7 sm:py-8 flex flex-col md:flex-row items-center justify-between relative shadow-2xl min-h-[140px]">

                            {/* Left Side: Offer Title with Blue "Enjoy" Badge */}
                            <div className="flex items-center gap-4 z-10 text-center md:text-left mb-6 md:mb-0">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md">
                                    <Handshake className="w-6 h-6 sm:w-7 sm:h-7 text-[#00c5c8]" />
                                </div>

                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                                    <span className="bg-[#0052cc] text-white px-3 py-1 rounded-md text-2xl sm:text-3xl md:text-4xl font-extrabold shadow-sm">
                                        Enjoy
                                    </span>
                                    <span>10% Off</span>
                                </h2>
                            </div>

                            {/* Center: CTA Book Appointment Button */}
                            <div className="z-10 mb-6 md:mb-0 md:mr-64 lg:mr-80">
                                <Link
                                    href="/login"
                                    className="bg-black hover:bg-zinc-900 text-white font-bold text-xs sm:text-sm tracking-wider px-6 sm:px-8 py-3.5 rounded-full inline-flex items-center gap-3 transition-transform hover:scale-105 shadow-xl uppercase"
                                >
                                    <span>BOOK APPOINTMENT</span>
                                    <div className="w-7 h-7 bg-white text-[#00c5c8] rounded-full flex items-center justify-center shrink-0">
                                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                                    </div>
                                </Link>
                            </div>

                            {/* Right Side: Doctors Cutout Image Popping Out Above Teal Banner */}
                            <div className="relative md:absolute right-2 sm:right-6 bottom-0 w-[280px] sm:w-[340px] md:w-[390px] h-[200px] sm:h-[240px] md:h-[275px] pointer-events-none z-20 shrink-0">
                                <Image
                                    src="/doctor-7.png"
                                    alt="Medical Team Doctors"
                                    fill
                                    className="object-contain object-bottom"
                                    priority
                                />
                            </div>

                        </div>
                    </div>
                </div>
                <div className="px-6 lg:px-12 max-w-7xl mx-auto border-b border-zinc-900 pb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

                        {/* Column 1: Brand Info & Socials */}
                        <div className="lg:col-span-4 space-y-5">

                            {/* Logo */}
                            <Link href="/" className="inline-flex items-center gap-1 text-3xl font-black tracking-wider">
                                <span className="text-[#00c5c8]">MED</span>
                                <span className="text-xl font-bold bg-[#00c5c8] text-white w-7 h-7 rounded flex items-center justify-center">+</span>
                                <span className="text-white">BILLS</span>
                            </Link>

                            {/* Social Icons */}
                            <div className="flex items-center gap-2.5 pt-1">
                                <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-[#00c5c8] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <FaFacebookF className="w-4 h-4 fill-current" />
                                </a>
                                <a href="#" aria-label="X / Twitter" className="w-9 h-9 rounded-full bg-[#00c5c8] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <FaXTwitter className="w-4 h-4 fill-current" />
                                </a>
                                <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-[#00c5c8] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <FaInstagram className="w-4 h-4" />
                                </a>
                                <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-[#00c5c8] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <FaLinkedinIn className="w-4 h-4 fill-current" />
                                </a>
                            </div>

                            {/* Description Text */}
                            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-xs">
                                Professional medical billing and coding services to maximize your revenue, reduce claim denials, and streamline your healthcare practice&apos;s daily financial workflow.</p>

                            {/* For Booking Widget */}
                            <div className="flex items-center gap-3.5 pt-2">
                                <div className="w-11 h-11 rounded-full bg-[#00c5c8] text-white flex items-center justify-center shrink-0">
                                    <PhoneCall className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-white tracking-wide">
                                        For Booking
                                    </span>
                                    <a href="tel:+11236667988" className="text-xs text-zinc-300 hover:text-[#00c5c8] transition-colors">
                                        (+123) 666 79 88
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-base font-bold text-white tracking-wide">Quick Links</h3>
                            <ul className="space-y-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                <li><Link href="/" className="hover:text-[#00c5c8] transition-colors">HOME</Link></li>
                                <li><Link href="/about" className="hover:text-[#00c5c8] transition-colors">ABOUT US</Link></li>
                                <li><Link href="/services" className="hover:text-[#00c5c8] transition-colors">SERVICES</Link></li>
                                <li><Link href="/pricing" className="hover:text-[#00c5c8] transition-colors">PRICING PLAN</Link></li>
                                <li><Link href="/faqs" className="hover:text-[#00c5c8] transition-colors">FAQ</Link></li>
                                <li><Link href="/contact" className="hover:text-[#00c5c8] transition-colors">CONTACT US</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Our Services */}
                        <div className="lg:col-span-3 space-y-4">
                            <h3 className="text-base font-bold text-white tracking-wide">Our Services</h3>
                            <ul className="space-y-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                <li><Link href="/services" className="hover:text-[#00c5c8] transition-colors">ORTHOPAEDICS</Link></li>
                                <li><Link href="/services" className="hover:text-[#00c5c8] transition-colors">CARDIOLOGY</Link></li>
                                <li><Link href="/services" className="hover:text-[#00c5c8] transition-colors">INTENSIVE CARE</Link></li>
                                <li><Link href="/services" className="hover:text-[#00c5c8] transition-colors">MATERNITY</Link></li>
                                <li><Link href="/services" className="hover:text-[#00c5c8] transition-colors">ORTHOPEDICS</Link></li>
                                <li><Link href="/services" className="hover:text-[#00c5c8] transition-colors">DENTAL-CARE</Link></li>
                            </ul>
                        </div>

                        {/* Column 4: Our Offices */}
                        <div className="lg:col-span-3 space-y-4">
                            <h3 className="text-base font-bold text-white tracking-wide">Our Offices</h3>

                            <div className="space-y-4 text-xs">
                                <div>
                                    <h4 className="font-bold text-[#00c5c8] text-sm">Headquarters– USA</h4>
                                    <p className="text-zinc-400 mt-1 leading-relaxed">
                                        Seattle (Major City In The State Washington).
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-[#00c5c8] text-sm">Operations – China</h4>
                                    <p className="text-zinc-400 mt-1 leading-relaxed">
                                        Shanghai Major Financial Hub & China's Largest Cities
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ----------------- BOTTOM COPYRIGHT BAR ----------------- */}
                <div className="pt-6 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
                    <p className="font-medium">
                        Copyright © 2025 Meden By Themewolfs. All Rights Reserved.
                    </p>

                    <div className="flex items-center gap-6 font-bold uppercase tracking-wider text-[11px]">
                        <Link href="#" className="hover:text-white transition-colors">PRIVACY</Link>
                        <Link href="#" className="hover:text-white transition-colors">POLICY</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">CONTACT US</Link>
                    </div>
                </div>

            </footer>
        </div>
    );
}