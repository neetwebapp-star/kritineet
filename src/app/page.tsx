import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export const metadata: Metadata = {
  title: 'Kriti NEET – AI-Powered NEET UG 2027 Preparation Platform',
  description:
    'Prepare smarter for NEET UG 2027 with comprehensive NCERT-aligned line-by-line reading, MTG Fingertips DPP challenger, realistic CBT mock simulations, and an intelligent autonomous revision engine.',
  keywords: [
    'NEET 2027',
    'NEET UG preparation',
    'NCERT Line by Line',
    'MTG Fingertips MCQs',
    'NEET CBT Mock Test',
    'AI Study Tutor',
    'Autonomous Study Planner',
    'NTA Official Notifications',
  ],
  openGraph: {
    title: 'Kriti NEET – AI-Powered NEET UG 2027 Preparation',
    description:
      'Master NEET UG 2027 with NCERT source fidelity, MTG topic-wise DPPs, CBT simulation, and intelligent spaced repetition.',
    type: 'website',
  },
};

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex flex-col font-sans selection:bg-[#c3c0ff] selection:text-[#0f0069]">
      {/* 1. PUBLIC HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#f9f9ff]/90 backdrop-blur-xl border-b border-[#e9edff] shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/stitch/logo.png"
                alt="Kriti NEET Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-extrabold text-lg sm:text-xl tracking-tight text-[#141b2b]">
                Kriti <span className="text-[#3525cd]">NEET</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#777587]">
                AI Preparation OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-headline font-semibold text-[#464555]">
            <a href="#features" className="hover:text-[#3525cd] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#3525cd] transition-colors">
              How It Works
            </a>
            <a href="#preview" className="hover:text-[#3525cd] transition-colors">
              Platform Preview
            </a>
            <Link href="/nta-notifications" className="hover:text-[#3525cd] transition-colors flex items-center gap-1.5 text-[#ba1a1a]">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse" />
              <span>NTA Intelligence</span>
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold text-[#3525cd] hover:bg-[#e1e8fd]/60 border border-transparent hover:border-[#c3c0ff] transition-all"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold bg-[#3525cd] hover:bg-[#2b1ea8] text-white shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Start Free</span>
              <StitchIcon name="arrow_forward" size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#e0e7ff]/60 via-[#f3e8ff]/50 to-transparent blur-3xl pointer-events-none rounded-full -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Target 2027 Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#eef0ff] border border-[#c3c0ff] text-[#3525cd] text-xs font-headline font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-ping" />
            <span>Target NEET UG 2027 • 100% Free Forever Educational OS</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-headline font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-[#141b2b] leading-[1.12]">
              Prepare Smarter for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#3525cd] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                NEET UG 2027
              </span>
            </h1>
            <p className="text-base sm:text-xl text-[#464555] max-w-2xl mx-auto font-normal leading-relaxed">
              Master every NCERT line, conquer MTG Fingertips topic MCQs, simulate real NTA CBT exams, and let an autonomous preparation engine schedule your daily study and revision.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#3525cd] hover:bg-[#2b1ea8] text-white font-headline font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group"
            >
              <span>Start Preparing Free</span>
              <StitchIcon name="arrow_forward" size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-[#f1f3ff] text-[#141b2b] border border-[#e9edff] font-headline font-bold text-base shadow-2xs hover:border-[#3525cd]/40 transition-all flex items-center justify-center gap-2"
            >
              <StitchIcon name="bolt" size={18} className="text-[#3525cd]" />
              <span>Explore Instant Demo</span>
            </Link>
          </div>

          {/* Key Value Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-[#777587]">
            <div className="flex items-center gap-2">
              <StitchIcon name="check_circle" size={16} className="text-[#006c49]" />
              <span>Exact NCERT Source Fidelity</span>
            </div>
            <div className="flex items-center gap-2">
              <StitchIcon name="check_circle" size={16} className="text-[#006c49]" />
              <span>MTG Fingertips 100% Ingested</span>
            </div>
            <div className="flex items-center gap-2">
              <StitchIcon name="check_circle" size={16} className="text-[#006c49]" />
              <span>Official NTA Intelligence</span>
            </div>
            <div className="flex items-center gap-2">
              <StitchIcon name="check_circle" size={16} className="text-[#006c49]" />
              <span>Zero Ads • Zero Subscription</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM PREVIEW CARD (MOCK DASHBOARD WITHOUT PRIVATE DATA) */}
      <section id="preview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-3xl border border-[#e9edff] shadow-[0_20px_60px_rgba(53,37,205,0.08)] p-6 sm:p-10 relative overflow-hidden">
          {/* Top preview header badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#f1f3ff] gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="text-xs font-mono text-[#777587] ml-2 font-semibold">
                kriti-neet-os / student-workspace-preview
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1f3ff] text-[#3525cd] text-xs font-bold">
              <StitchIcon name="visibility" size={14} />
              <span>Interactive Student Architecture Preview</span>
            </div>
          </div>

          {/* Grid mockup */}
          <div className="mt-8 space-y-6">
            {/* Top row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#f9f9ff] border border-[#e9edff]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#777587] uppercase">NCERT Curriculum</span>
                  <div className="w-7 h-7 rounded-lg bg-[#e1e8fd] text-[#3525cd] flex items-center justify-center">
                    <StitchIcon name="menu_book" size={15} />
                  </div>
                </div>
                <div className="font-headline font-bold text-xl text-[#141b2b]">10 Complete Books</div>
                <div className="text-xs text-[#006c49] font-semibold mt-1">Class 11 & 12 Bio, Physics, Chem</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#f9f9ff] border border-[#e9edff]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#777587] uppercase">MTG Question Bank</span>
                  <div className="w-7 h-7 rounded-lg bg-[#6cf8bb]/30 text-[#006c49] flex items-center justify-center">
                    <StitchIcon name="local_fire_department" size={15} />
                  </div>
                </div>
                <div className="font-headline font-bold text-xl text-[#141b2b]">Topic-Wise DPPs</div>
                <div className="text-xs text-[#3525cd] font-semibold mt-1">100% Verified NCERT-mapped MCQs</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#f9f9ff] border border-[#e9edff]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#777587] uppercase">CBT Engine</span>
                  <div className="w-7 h-7 rounded-lg bg-[#d8e2ff] text-[#004598] flex items-center justify-center">
                    <StitchIcon name="quiz" size={15} />
                  </div>
                </div>
                <div className="font-headline font-bold text-xl text-[#141b2b]">720 Marks Simulation</div>
                <div className="text-xs text-[#004598] font-semibold mt-1">Authentic NTA NEET Test Environment</div>
              </div>
            </div>

            {/* Split row preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 p-6 rounded-2xl bg-gradient-to-br from-[#f1f3ff] to-white border border-[#e1e8fd] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-headline font-bold text-base text-[#141b2b]">
                    Autonomous 213-Day Study Engine
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3525cd] text-white text-[10px] font-bold">
                    NEET 2027
                  </span>
                </div>
                <p className="text-xs text-[#464555] leading-relaxed">
                  Automatically calculates what to study, when to revise with SM-2 spaced repetition, and schedules full-syllabus mock milestones without manual spreadsheet work.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-xl bg-white border border-[#e9edff] text-xs font-semibold text-[#141b2b]">
                    ✓ Phase 1: NCERT Foundations
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white border border-[#e9edff] text-xs font-semibold text-[#141b2b]">
                    ✓ Phase 2: High Yield
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white border border-[#e9edff] text-xs font-semibold text-[#141b2b]">
                    ✓ Phase 3: Final Mile
                  </span>
                </div>
              </div>

              <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#f9f9ff] to-[#eef0ff] border border-[#e9edff] flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#3525cd]">
                    AI Rabbit Teacher
                  </span>
                  <h4 className="font-headline font-bold text-base text-[#141b2b]">
                    Interactive Voice & Visuals
                  </h4>
                  <p className="text-xs text-[#464555]">
                    Explains complex biological diagrams, physics mechanics, and chemistry reaction mechanisms.
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 relative bg-white border border-[#c3c0ff] shadow-xs">
                  <Image
                    src="/stitch/dna-stethoscope.png"
                    alt="Study OS"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPACT CORE FEATURES */}
      <section id="features" className="py-20 bg-white border-y border-[#e9edff]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-headline font-bold text-[#3525cd] uppercase tracking-wider">
              Complete Preparation Arsenal
            </h2>
            <h3 className="font-headline font-extrabold text-3xl sm:text-4xl text-[#141b2b] tracking-tight">
              Engineered Exclusively for NEET UG
            </h3>
            <p className="text-sm sm:text-base text-[#464555]">
              Everything you need to secure top All India Ranks, integrated into a single focused workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] hover:border-[#3525cd]/40 hover:shadow-md transition-all space-y-3 group">
              <div className="w-11 h-11 rounded-xl bg-[#e1e8fd] text-[#3525cd] flex items-center justify-center group-hover:scale-105 transition-transform">
                <StitchIcon name="menu_book" size={22} />
              </div>
              <h4 className="font-headline font-bold text-lg text-[#141b2b]">
                NCERT Line-by-Line Mastery
              </h4>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Zero-loss canonical NCERT reader across all 10 books with high-res figures, tables, scientific highlights, and paragraph-level audio capsules.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] hover:border-[#3525cd]/40 hover:shadow-md transition-all space-y-3 group">
              <div className="w-11 h-11 rounded-xl bg-[#6cf8bb]/30 text-[#006c49] flex items-center justify-center group-hover:scale-105 transition-transform">
                <StitchIcon name="local_fire_department" size={22} />
              </div>
              <h4 className="font-headline font-bold text-lg text-[#141b2b]">
                MTG Fingertips DPP Practice
              </h4>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Every topic is paired with verified MTG Fingertips MCQs, instant step-by-step solutions, and detailed scientific rationale.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] hover:border-[#3525cd]/40 hover:shadow-md transition-all space-y-3 group">
              <div className="w-11 h-11 rounded-xl bg-[#d8e2ff] text-[#004598] flex items-center justify-center group-hover:scale-105 transition-transform">
                <StitchIcon name="quiz" size={22} />
              </div>
              <h4 className="font-headline font-bold text-lg text-[#141b2b]">
                Realistic CBT Simulation
              </h4>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Full 720-marks mock test interface mirroring the exact NTA exam software: palette markers, section timer, negative marking, and instant percentile analytics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] hover:border-[#3525cd]/40 hover:shadow-md transition-all space-y-3 group">
              <div className="w-11 h-11 rounded-xl bg-[#ffdcc1] text-[#934b00] flex items-center justify-center group-hover:scale-105 transition-transform">
                <StitchIcon name="history_edu" size={22} />
              </div>
              <h4 className="font-headline font-bold text-lg text-[#141b2b]">
                15+ Years PYQ Vault
              </h4>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Topic-filtered Previous Year Questions with authentic trend analysis, frequency indicators, and recurring question pattern detection.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] hover:border-[#3525cd]/40 hover:shadow-md transition-all space-y-3 group">
              <div className="w-11 h-11 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center group-hover:scale-105 transition-transform">
                <StitchIcon name="psychology" size={22} />
              </div>
              <h4 className="font-headline font-bold text-lg text-[#141b2b]">
                Smart Error Notebook
              </h4>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Automatic mistake logging from tests and DPPs. Classifies conceptual errors vs silly mistakes and schedules targeted 5-minute remedial drills.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] hover:border-[#3525cd]/40 hover:shadow-md transition-all space-y-3 group">
              <div className="w-11 h-11 rounded-xl bg-[#e2dfff] text-[#3525cd] flex items-center justify-center group-hover:scale-105 transition-transform">
                <StitchIcon name="smart_toy" size={22} />
              </div>
              <h4 className="font-headline font-bold text-lg text-[#141b2b]">
                AI Rabbit Voice Tutor
              </h4>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Animated Socratic tutor with natural voice output for quick doubt clarification, diagram breakdowns, and audio summary capsules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3-STEP METHODOLOGY) */}
      <section id="how-it-works" className="py-20 bg-[#f9f9ff]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-xs font-headline font-bold text-[#3525cd] uppercase tracking-wider">
              Proven Methodology
            </h2>
            <h3 className="font-headline font-extrabold text-3xl sm:text-4xl text-[#141b2b] tracking-tight">
              How You Prepare to Rank in Top 1%
            </h3>
            <p className="text-sm text-[#464555]">
              A scientific 3-step loop replicated every single study day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-[#e9edff] shadow-xs space-y-4 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#3525cd] text-white font-headline font-bold text-base flex items-center justify-center">
                1
              </div>
              <h4 className="font-headline font-bold text-lg text-[#141b2b]">
                Learn the NCERT Canonical Line
              </h4>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Read topic paragraphs directly from original NCERT text. Study high-yield diagrams and listen to 60-second audio capsules on key concepts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-[#e9edff] shadow-xs space-y-4 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#006c49] text-white font-headline font-bold text-base flex items-center justify-center">
                2
              </div>
              <h4 className="font-headline font-bold text-lg text-[#141b2b]">
                Solve Topic-Level DPP & PYQs
              </h4>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Lock in concepts immediately with 15–25 MCQs from MTG Fingertips and recent NEET papers. Mistake items are automatically routed to your Error Book.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-[#e9edff] shadow-xs space-y-4 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#4f46e5] text-white font-headline font-bold text-base flex items-center justify-center">
                3
              </div>
              <h4 className="font-headline font-bold text-lg text-[#141b2b]">
                Retain with Spaced Repetition
              </h4>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                The SM-2 algorithm prompts you for targeted revisions on Day 3, Day 7, Day 21, and before full-syllabus mock exams to achieve 90%+ long-term retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#1e147e] via-[#3525cd] to-[#4f46e5] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-headline font-bold backdrop-blur-md">
            <span>Free Forever • No Payment Required</span>
          </div>
          <h2 className="font-headline font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight">
            Ready to Begin Your NEET 2027 Preparation?
          </h2>
          <p className="text-sm sm:text-lg text-[#e0e7ff] max-w-xl mx-auto font-normal">
            Join now, configure your study capacity, and let the autonomous engine guide you to exam day.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-[#3525cd] hover:bg-[#f1f3ff] font-headline font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <StitchIcon name="arrow_forward" size={18} />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-headline font-bold text-base transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. MINIMAL PUBLIC FOOTER */}
      <footer className="bg-white border-t border-[#e9edff] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-7 flex-shrink-0">
              <Image
                src="/stitch/logo.png"
                alt="Kriti NEET Logo"
                fill
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span className="font-headline font-bold text-sm text-[#141b2b]">
              Kriti NEET <span className="text-[#777587] font-normal">• AI Study & Preparation OS</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#464555]">
            <Link href="/nta-notifications" className="hover:text-[#3525cd] transition">
              NTA Notifications
            </Link>
            <Link href="/login" className="hover:text-[#3525cd] transition">
              Student Login
            </Link>
            <Link href="/register" className="hover:text-[#3525cd] transition">
              Sign Up
            </Link>
          </div>

          <div className="text-xs text-[#777587]">
            © 2026 Kriti NEET. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
