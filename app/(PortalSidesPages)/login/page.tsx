'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaArrowRight,
  FaHeartbeat,
  FaShieldAlt,
  FaExclamationCircle
} from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || 'Invalid email address or password');
        setLoading(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch (err) {
      console.error('[LOGIN_ERROR]', err);
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
              <FaHeartbeat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              Welcome Back to<br />
              <span className="text-white/90">MediBill Pro</span>
            </h1>
            <p className="text-white/80 text-lg max-w-md">
              Secure access to your medical billing dashboard. Manage claims, patients, and payments with confidence.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <FaShieldAlt className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">HIPAA Compliant & Encrypted</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <FaHeartbeat className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">Real-time Claim Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#00c2cb] rounded-xl flex items-center justify-center">
              <FaHeartbeat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-zinc-800">MediBill Pro</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-800 mb-2">
                Sign In
              </h2>
              <p className="text-gray-500 text-sm">
                Enter your credentials to access your billing dashboard
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <FaExclamationCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@clinic.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 outline-none transition-all text-sm text-zinc-800 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 outline-none transition-all text-sm text-zinc-800 placeholder:text-gray-400"
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

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#00c2cb] focus:ring-[#00c2cb]"
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="font-semibold text-[#00c2cb] hover:text-[#00a6af] transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00c2cb] hover:bg-[#00a6af] disabled:opacity-50 text-white font-bold tracking-wider py-3.5 rounded-full flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl mt-2"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                {!loading && (
                  <span className="bg-white text-[#00c2cb] p-1 rounded-full flex items-center justify-center">
                    <FaArrowRight className="w-3 h-3" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-[#00c2cb] hover:text-[#00a6af] transition-colors">
                Create Account
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2025 MediBill Pro. All rights reserved. HIPAA Compliant.
          </p>
        </div>
      </div>
    </div>
  );
}