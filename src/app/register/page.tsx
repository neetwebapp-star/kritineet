'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetYear, setTargetYear] = useState('2027');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, targetYear }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo_login' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start demo');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with brand logo */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-9 w-9 flex-shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/stitch/logo.png"
              alt="Kriti NEET"
              fill
              sizes="36px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-extrabold text-base tracking-tight text-[#141b2b]">
              Kriti <span className="text-[#3525cd]">NEET</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#777587] font-bold">
              Preparation OS
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-[#464555] hover:text-[#3525cd] flex items-center gap-1"
        >
          <StitchIcon name="arrow_back" size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e9edff] shadow-[0_12px_40px_rgba(53,37,205,0.06)] space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f7ef] text-[#006c49] text-xs font-bold border border-[#6cf8bb]">
              <StitchIcon name="verified" size={14} />
              <span>100% Free Forever</span>
            </div>
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#141b2b]">
              Begin Your Journey
            </h1>
            <p className="text-xs sm:text-sm text-[#464555]">
              Join thousands of NEET UG aspirants preparing systematically
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-[#fff1f0] border border-[#ffdad6] rounded-xl text-xs text-[#ba1a1a] font-medium flex items-center gap-2">
              <StitchIcon name="error" size={16} className="text-[#ba1a1a] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Access Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#eef0ff] to-[#f4f2ff] border border-[#c3c0ff] hover:border-[#3525cd] transition-all group text-left shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <StitchIcon name="bolt" size={20} />
              </div>
              <div>
                <div className="font-headline font-bold text-xs text-[#141b2b] flex items-center gap-1.5">
                  <span>Explore Demo Workspace</span>
                  <span className="text-[10px] font-bold text-[#006c49] bg-[#6cf8bb]/30 px-1.5 py-0.2 rounded">
                    Instant
                  </span>
                </div>
                <div className="text-[11px] text-[#464555]">
                  Experience pre-configured NEET 2027 plan
                </div>
              </div>
            </div>
            <StitchIcon name="chevron_right" size={18} className="text-[#3525cd] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#e9edff] w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-[#777587] uppercase tracking-wider shrink-0">
              or create your own account
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-headline font-bold text-[#141b2b] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                  <StitchIcon name="person" size={17} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kriti Sharma"
                  className="w-full pl-10 pr-4 py-3 bg-[#f9f9ff] border border-[#e9edff] focus:border-[#3525cd] focus:bg-white rounded-xl text-sm text-[#141b2b] placeholder-[#777587]/60 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-headline font-bold text-[#141b2b] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                  <StitchIcon name="mail" size={17} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aspirant@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#f9f9ff] border border-[#e9edff] focus:border-[#3525cd] focus:bg-white rounded-xl text-sm text-[#141b2b] placeholder-[#777587]/60 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-headline font-bold text-[#141b2b] mb-1.5">
                Target Exam Year
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['2027', '2028'].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTargetYear(yr)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-headline font-bold transition flex items-center justify-center gap-1.5 ${
                      targetYear === yr
                        ? 'bg-[#e1e8fd] border-[#3525cd] text-[#3525cd]'
                        : 'bg-[#f9f9ff] border-[#e9edff] text-[#464555] hover:bg-[#f1f3ff]'
                    }`}
                  >
                    <span>NEET UG {yr}</span>
                    {targetYear === yr && <StitchIcon name="check" size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[46px] mt-2 py-3 px-4 bg-[#3525cd] hover:bg-[#2b1ea8] disabled:opacity-50 text-white font-headline font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Start Free Preparation</span>
                  <StitchIcon name="arrow_forward" size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-[#464555]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-[#3525cd] hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#777587]">
        © 2026 Kriti NEET • 100% Free AI Preparation OS for NEET UG Aspirants
      </div>
    </div>
  );
}
