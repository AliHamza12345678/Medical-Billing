'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaPhone,
  FaArrowRight,
  FaHeartbeat,
  FaUserMd,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('[REGISTER_ERROR]', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#00c2cb] to-[#008a92] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/herosection-img.png')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <FaUserMd className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              Join MediBill Pro<br />
              <span className="text-white/90">Today</span>
            </h1>
            <p className="text-white/80 text-lg max-w-md">
              Streamline your medical billing, reduce claim denials, and get paid faster with our intelligent platform.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <FaCheckCircle className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">Free 14-day trial — no credit card</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <FaHeartbeat className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">Trusted by 2,500+ clinics</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <FaUserMd className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">Dedicated onboarding support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#00c2cb] rounded-xl flex items-center justify-center">
              <FaHeartbeat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-zinc-800">MediBill Pro</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-9 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-800 mb-2">
                Create Account
              </h2>
              <p className="text-gray-500 text-sm">
                Start managing medical billing smarter in minutes
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <FaExclamationCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Dr. Sarah Johnson"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 outline-none transition-all text-sm text-zinc-800 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@clinic.com"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 outline-none transition-all text-sm text-zinc-800 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaPhone className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 outline-none transition-all text-sm text-zinc-800 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 outline-none transition-all text-sm text-zinc-800 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#00c2cb] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 outline-none transition-all text-sm text-zinc-800 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#00c2cb] transition-colors"
                  >
                    {showConfirm ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#00c2cb] focus:ring-[#00c2cb]"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="font-semibold text-[#00c2cb] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-semibold text-[#00c2cb] hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00c2cb] hover:bg-[#00a6af] disabled:opacity-50 text-white font-bold tracking-wider py-3.5 rounded-full flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && (
                  <span className="bg-white text-[#00c2cb] p-1 rounded-full flex items-center justify-center">
                    <FaArrowRight className="w-3 h-3" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#00c2cb] hover:text-[#00a6af] transition-colors">
                Sign In
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            © 2025 MediBill Pro. All rights reserved. HIPAA Compliant.
          </p>
        </div>
      </div>
    </div>
  );
}