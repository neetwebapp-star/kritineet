'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function NcertMoneraArchaebacteriaPage() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>('a');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [isBookmarked, setIsBookmarked] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [audioProgress, setAudioProgress] = useState(40);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [userNote, setUserNote] = useState('High-Yield: β-1,3 linkages in Pseudomurein. Invariant NEET PYQ fact!');
  const [shareCopied, setShareCopied] = useState(false);
  const [navNotification, setNavNotification] = useState<string | null>(null);

  const showNavNotice = (msg: string) => {
    setNavNotification(msg);
    setTimeout(() => setNavNotification(null), 2500);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        'NCERT Biology Class 11, Chapter 2, Page 19: "Archaebacteria differ from other bacteria in having a different cell wall structure and this feature is responsible for their survival in extreme conditions."'
      );
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <AppShell
      title="Kriti NEET"
      subtitle="NCERT Line-by-Line Reader"
      showBack={true}
      backHref="/ncert"
      fluid={true}
    >
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Sticky Reader Sub-Header Toolbar */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-[#e9edff] shadow-xs flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-xs text-[#464555]">
              <span className="font-headline font-bold uppercase tracking-wider text-[#3525cd]">
                Class 11 Bio
              </span>
              <span className="text-[#c7c4d8]">•</span>
              <span className="truncate font-medium">Ch 2: Biological Classification</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                className="inline-flex items-center gap-1 bg-[#f1f3ff] hover:bg-[#e1e8fd] px-2.5 py-0.5 rounded-full text-[#141b2b] transition-colors cursor-pointer"
                id="page-picker-btn"
                onClick={() => showNavNotice('Chapter 2: Currently on Page 19 of 28 (Monera: Archaebacteria)')}
              >
                <span className="font-headline font-bold text-xs text-[#3525cd]">
                  Page 19
                </span>
                <span className="text-[11px] text-[#464555]">of 28</span>
                <StitchIcon name="expand_more" size={14} className="text-[#464555]" />
              </button>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#6cf8bb]/40 text-[#00714d] text-[10px] font-bold tracking-tight">
                NCERT Original
              </span>
              {navNotification && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#3525cd] text-white text-[11px] font-medium animate-fade-in">
                  {navNotification}
                </span>
              )}
            </div>
          </div>

          {/* Action Toolbar Buttons (Non-overlapping with fixed dimensions and tooltips) */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#464555] hover:bg-[#f1f3ff] hover:text-[#141b2b] transition-colors active:scale-95"
              title="Search within Chapter 2 text, diagrams, and PYQs"
              aria-label="Search page"
            >
              <StitchIcon name="search" size={19} />
            </button>

            <button
              onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold font-headline transition-colors active:scale-95 ${
                textSize === 'large'
                  ? 'bg-[#e2dfff] text-[#3525cd]'
                  : 'text-[#464555] hover:bg-[#f1f3ff] hover:text-[#141b2b]'
              }`}
              title="Adjust text size"
              aria-label="Toggle text size"
            >
              Aa
            </button>

            <button
              onClick={toggleAudio}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors active:scale-95 ${
                isPlayingAudio
                  ? 'bg-[#e2dfff] text-[#3525cd]'
                  : 'text-[#3525cd] hover:bg-[#f1f3ff]'
              }`}
              title={isPlayingAudio ? 'Pause line-by-line audio' : 'Listen line-by-line audio mnemonics'}
              aria-label="Audio narrator"
            >
              <StitchIcon
                name={isPlayingAudio ? 'pause' : 'volume_up'}
                size={19} />
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors active:scale-95 ${
                isBookmarked
                  ? 'text-[#3525cd] bg-[#e2dfff]'
                  : 'text-[#777587] hover:bg-[#f1f3ff]'
              }`}
              title="Bookmark Page 19"
              aria-label="Bookmark page"
            >
              <StitchIcon name="bookmark" size={19} fill={isBookmarked } />
            </button>
          </div>
        </div>

        {/* Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl border border-[#e9edff] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-base text-[#141b2b]">
                  Search Chapter 2
                </h3>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#777587] hover:bg-[#f1f3ff]"
                >
                  <StitchIcon name="close" size={18} />
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. halophiles, cell wall, methanogens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#c7c4d8] text-sm focus:outline-none focus:border-[#4f46e5]"
                  autoFocus
                />
                <div className="absolute left-3 top-3 text-[#777587]">
                  <StitchIcon name="search" size={16} />
                </div>
              </div>
              <div className="text-xs text-[#777587]">
                Quick matches: Archaebacteria, Methanogens, Peptidoglycan, Thermoacidophiles
              </div>
            </div>
          </div>
        )}

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Reading Column (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* High Yield Header Card */}
            <section className="bg-white p-5 rounded-2xl border border-[#e9edff] shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold">
                  <StitchIcon name="local_fire_department" size={15} />
                  <span>High Yield: 5–8 Qs in NEET</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#464555] font-medium">NTA Focus Rating</span>
                  <div className="flex text-amber-500 gap-0.5">
                    <StitchIcon name="star" size={15} fill />
                    <StitchIcon name="star" size={15} fill />
                    <StitchIcon name="star" size={15} fill />
                    <StitchIcon name="star" size={15} fill />
                    <StitchIcon name="star_half" size={15} fill />
                  </div>
                </div>
              </div>
              <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#141b2b] tracking-tight">
                2.1 KINGDOM MONERA
              </h1>
              <p className="text-xs sm:text-sm text-[#464555] leading-relaxed">
                Classified under Robert H. Whittaker&apos;s 5 Kingdom Scheme (1969). Unicellular, Prokaryotic organisms without nuclear membrane.
              </p>
            </section>

            {/* Smart NCERT Content Feed */}
            <article className="bg-white rounded-2xl p-5 sm:p-7 border border-[#e9edff] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#f1f3ff] pb-3">
                <span className="font-headline font-bold text-base text-[#3525cd] uppercase tracking-wide">
                  2.1.1 Archaebacteria
                </span>
                <div className="flex items-center gap-1.5 bg-[#f1f3ff] px-3 py-1 rounded-full text-[#464555] text-xs font-semibold">
                  <StitchIcon name="auto_awesome" size={14} className="text-[#3525cd]" />
                  <span>Smart NCERT Feed</span>
                </div>
              </div>

              {/* Text Body with adjustable font size */}
              <div
                className={`text-[#141b2b] leading-relaxed space-y-4 ${
                  textSize === 'large' ? 'text-lg leading-loose' : 'text-sm sm:text-base'
                }`}
              >
                <p>
                  <strong className="text-[#141b2b] font-semibold">
                    Bacteria are the sole members of the Kingdom Monera.
                  </strong>{' '}
                  They are the most abundant micro-organisms. Bacteria occur almost everywhere.
                  Hundreds of bacteria are present in a handful of soil.
                </p>

                {/* Concept Keynotes Box */}
                <div className="bg-[#f1f3ff] p-4 sm:p-5 rounded-2xl border border-[#e1e8fd] space-y-2">
                  <span className="font-headline font-bold text-xs sm:text-sm text-[#3525cd] block uppercase tracking-wide">
                    Concept Keynotes:
                  </span>
                  <p className="text-xs sm:text-sm text-[#141b2b] leading-relaxed">
                    These bacteria are special since they live in some of the most harsh habitats such as extreme salty areas (
                    <button
                      onClick={() =>
                        setActiveTooltip(
                          activeTooltip === 'halophiles'
                            ? null
                            : 'Halophiles tolerate saturated NaCl up to 4-5M via unique intracellular KCl accumulation!'
                        )
                      }
                      className="bg-emerald-100 text-[#006c49] px-2 py-0.5 rounded-md font-semibold cursor-pointer inline-flex items-center gap-1 mx-1 hover:bg-emerald-200 transition-colors"
                    >
                      halophiles
                      <StitchIcon name="info" size={13} />
                    </button>
                    ), hot springs (
                    <button
                      onClick={() =>
                        setActiveTooltip(
                          activeTooltip === 'thermoacidophiles'
                            ? null
                            : 'Thermoacidophiles withstand 80-100°C and pH 2 with homopolar ether lipids!'
                        )
                      }
                      className="bg-emerald-100 text-[#006c49] px-2 py-0.5 rounded-md font-semibold cursor-pointer inline-flex items-center gap-1 mx-1 hover:bg-emerald-200 transition-colors"
                    >
                      thermoacidophiles
                      <StitchIcon name="info" size={13} />
                    </button>
                    ) and marshy areas (
                    <button
                      onClick={() =>
                        setActiveTooltip(
                          activeTooltip === 'methanogens'
                            ? null
                            : 'Methanogens produce biogas (CH4) under strict anaerobic rumen environments!'
                        )
                      }
                      className="bg-emerald-100 text-[#006c49] px-2 py-0.5 rounded-md font-semibold cursor-pointer inline-flex items-center gap-1 mx-1 hover:bg-emerald-200 transition-colors"
                    >
                      methanogens
                      <StitchIcon name="info" size={13} />
                    </button>
                    ).
                  </p>

                  {/* Interactive Tooltip Card */}
                  {activeTooltip && (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-emerald-300 text-xs text-[#006c49] flex items-center justify-between">
                      <span>{activeTooltip}</span>
                      <button
                        onClick={() => setActiveTooltip(null)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* PYQ Highlight Callout Card */}
                <div className="bg-amber-50 p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      <StitchIcon name="local_fire_department" size={14} />
                      <span>NEET 2014 • 2017 • 2020 PYQ</span>
                    </span>
                    <Link
                      href="/pyq-vault"
                      className="text-amber-800 hover:text-amber-950 text-xs font-bold inline-flex items-center gap-1"
                    >
                      Inspect Question
                      <StitchIcon name="chevron_right" size={14} />
                    </Link>
                  </div>
                  <p className="text-amber-950 text-xs sm:text-sm leading-relaxed">
                    &ldquo;Archaebacteria differ from other bacteria in having a{' '}
                    <mark className="bg-amber-300 text-black px-1.5 py-0.5 rounded font-bold">
                      different cell wall structure
                    </mark>{' '}
                    and this feature is{' '}
                    <mark className="bg-amber-300 text-black px-1.5 py-0.5 rounded font-bold">
                      responsible for their survival in extreme conditions
                    </mark>
                    .&rdquo;
                  </p>
                </div>

                {/* NTA Favorite Trap Alert Card */}
                <div className="bg-purple-50 p-4 sm:p-5 rounded-2xl border border-purple-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-900">
                    <StitchIcon name="warning" size={17} className="text-purple-700" />
                    <span className="font-headline font-bold text-xs sm:text-sm text-purple-950">
                      NTA Favorite Trap Alert
                    </span>
                  </div>
                  <p className="text-purple-900 text-xs sm:text-sm leading-relaxed">
                    Archaebacteria cell wall lacks{' '}
                    <span className="font-bold underline decoration-purple-400">peptidoglycan</span> (pseudomurein present).
                    Their cell membrane contains{' '}
                    <span className="font-bold text-purple-950">branched chain ether-linked lipids</span> which
                    reduces membrane fluidity under extreme thermal and osmotic stress!
                  </p>
                </div>

                <p>
                  <strong className="text-[#3525cd] font-semibold">Methanogens</strong> are present in the gut of several ruminant animals such as cows and buffaloes and they are responsible for the production of biogas (methane) from the dung of these animals.
                </p>
              </div>

              {/* Action Toolbar on Bottom of Article */}
              <div className="flex flex-col gap-3 pt-3 border-t border-[#f1f3ff] text-xs text-[#777587]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowNoteEditor(!showNoteEditor)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-medium transition-colors cursor-pointer"
                    >
                      <StitchIcon name="edit_note" size={16} />
                      <span>{showNoteEditor ? "Close Note" : "Add My Note"}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-medium transition-colors cursor-pointer"
                    >
                      <StitchIcon name={shareCopied ? "check" : "share"} size={15} />
                      <span>{shareCopied ? "Citation Copied!" : "Share Excerpt"}</span>
                    </button>
                  </div>
                  <span>Paragraph 3 of 5</span>
                </div>

                {showNoteEditor && (
                  <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff] space-y-2 animate-fade-in">
                    <label className="block text-xs font-bold text-[#141b2b]">
                      Sticky Annotation (Page 19)
                    </label>
                    <textarea
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 bg-white rounded-lg border border-[#e9edff] text-xs text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                      placeholder="Add personal retention note or mnemonics..."
                    />
                    <div className="flex items-center justify-between text-[11px] text-[#006c49]">
                      <span className="flex items-center gap-1">
                        <StitchIcon name="check" size={13} />
                        Auto-saved to personal Notebook
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowNoteEditor(false)}
                        className="px-2.5 py-1 rounded-md bg-[#3525cd] text-white font-bold"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>

            {/* NEET 2020 Real Exam Question Card */}
            <section className="bg-[#3525cd] text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <StitchIcon name="quiz" size={18} className="text-white" />
                  </div>
                  <h3 className="font-headline font-bold text-sm sm:text-base text-white">
                    NEET 2020 Real Exam Question
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-mono font-medium">
                  Paper Code G3
                </span>
              </div>

              <p className="text-sm sm:text-base text-[#dad7ff] leading-relaxed">
                <strong className="text-white">Q.</strong> Which of the following are found in extreme saline conditions?
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { key: 'a', label: 'Archaebacteria', correct: true },
                  { key: 'b', label: 'Eubacteria', correct: false },
                  { key: 'c', label: 'Cyanobacteria', correct: false },
                  { key: 'd', label: 'Mycobacteria', correct: false },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedAnswer(opt.key)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                      selectedAnswer === opt.key && opt.correct
                        ? 'bg-white/25 border-2 border-[#6cf8bb] shadow-sm'
                        : selectedAnswer === opt.key
                        ? 'bg-white/20 border-2 border-red-300'
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                  >
                    <span className="text-sm text-white font-medium">
                      <span className="font-bold mr-2">({opt.key})</span> {opt.label}
                    </span>
                    {selectedAnswer === opt.key && opt.correct && (
                      <span className="text-xs bg-[#6cf8bb] text-[#002113] px-2.5 py-0.5 rounded-full font-bold">
                        Correct (+4)
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs text-[#dad7ff]">
                <span>Tested concept: Halophilic survival mechanism</span>
                <Link
                  href="/ai-tutor"
                  className="inline-flex items-center gap-1 font-bold text-white hover:underline"
                >
                  <span>View Tutor Breakdown</span>
                  <StitchIcon name="play_circle" size={16} />
                </Link>
              </div>
            </section>
          </div>

          {/* Right Companion Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Micro Audio Capsule Card */}
            <section className="bg-white p-5 rounded-2xl border border-[#e9edff] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#e1e8fd] flex items-center justify-center text-[#3525cd]">
                    <StitchIcon name="record_voice_over" size={16} />
                  </div>
                  <h3 className="font-headline font-bold text-sm text-[#141b2b]">
                    Micro Audio Capsule
                  </h3>
                </div>
                <span className="text-xs text-[#777587]">0:45 min</span>
              </div>

              <div className="bg-[#f1f3ff] p-3.5 rounded-xl flex items-center gap-3">
                <button
                  onClick={toggleAudio}
                  className="w-10 h-10 rounded-full bg-[#3525cd] text-white flex items-center justify-center flex-shrink-0 shadow-sm hover:scale-105 active:scale-95 transition-transform"
                >
                  <StitchIcon name={isPlayingAudio ? 'pause' : 'play_arrow'} size={20} fill />
                </button>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-headline font-bold text-xs text-[#141b2b] truncate">
                    Prof. Sharma • Rapid Note
                  </span>
                  <span className="text-[11px] text-[#464555] truncate">
                    Why Archaebacteria survive 100°C
                  </span>
                  <div className="w-full bg-[#dce2f7] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[#3525cd] h-full rounded-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#777587] flex-shrink-0">
                  0:18
                </span>
              </div>
            </section>

            {/* Comparative Diagrammatic Card */}
            <section className="bg-white p-5 rounded-2xl border border-[#e9edff] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-sm text-[#141b2b]">
                  Comparative Schematic
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006c49] bg-[#6cf8bb]/30 px-2 py-0.5 rounded-full">
                  High Resolution
                </span>
              </div>

              <div className="space-y-3">
                {/* Archaebacteria diagram */}
                <div className="bg-[#f1f3ff] p-3 rounded-xl space-y-1.5 border border-[#e1e8fd]">
                  <span className="font-headline font-bold text-xs text-[#3525cd]">
                    Archaebacteria (Ether-linked)
                  </span>
                  <p className="text-[11px] text-[#464555]">
                    Ether lipid monolayer/bilayer with branched phytanyl chains. Non-saponifiable.
                  </p>
                  <div className="h-16 bg-white rounded-lg flex items-center justify-center relative p-2">
                    <svg className="w-full h-full text-[#3525cd]" fill="none" viewBox="0 0 160 50">
                      <path
                        d="M10 15C30 8 50 22 70 15C90 8 110 22 130 15C140 12 150 14 160 15"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10 35C30 28 50 42 70 35C90 28 110 42 130 35C140 32 150 34 160 35"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="30"
                        y1="15"
                        x2="30"
                        y2="35"
                        stroke="currentColor"
                        strokeDasharray="2 2"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="70"
                        y1="15"
                        x2="70"
                        y2="35"
                        stroke="currentColor"
                        strokeDasharray="2 2"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="110"
                        y1="15"
                        x2="110"
                        y2="35"
                        stroke="currentColor"
                        strokeDasharray="2 2"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-[#e2dfff] text-[#3525cd] px-1 rounded">
                      Ether Link
                    </span>
                  </div>
                </div>

                {/* Eubacteria diagram */}
                <div className="bg-[#f9f9ff] p-3 rounded-xl space-y-1.5 border border-[#e9edff]">
                  <span className="font-headline font-bold text-xs text-[#141b2b]">
                    Eubacteria (Ester-linked)
                  </span>
                  <p className="text-[11px] text-[#464555]">
                    Ester-linked unbranched fatty acids. Peptidoglycan cell wall.
                  </p>
                  <div className="h-16 bg-white rounded-lg flex items-center justify-center relative p-2">
                    <svg className="w-full h-full text-[#777587]" fill="none" viewBox="0 0 160 50">
                      <path d="M10 15L150 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M10 35L150 35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="35" cy="15" r="2.5" fill="currentColor" />
                      <circle cx="75" cy="15" r="2.5" fill="currentColor" />
                      <circle cx="115" cy="15" r="2.5" fill="currentColor" />
                      <circle cx="35" cy="35" r="2.5" fill="currentColor" />
                      <circle cx="75" cy="35" r="2.5" fill="currentColor" />
                      <circle cx="115" cy="35" r="2.5" fill="currentColor" />
                    </svg>
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-[#f1f3ff] text-[#464555] px-1 rounded">
                      Ester Link
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Next Section On Deck */}
            <section className="bg-white p-5 rounded-2xl border border-[#e9edff] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-sm text-[#141b2b]">
                  Next Section
                </h3>
                <span className="text-xs font-bold text-[#3525cd]">Page 20 Preview</span>
              </div>
              <Link
                href="/ncert/monera-eubacteria"
                className="flex items-center gap-3 bg-[#f1f3ff] hover:bg-[#e9edff] p-3 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#e1e8fd] text-[#3525cd] font-headline font-bold text-xs flex items-center justify-center flex-shrink-0">
                  2.1.2
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-headline font-semibold text-xs text-[#141b2b] truncate group-hover:text-[#3525cd]">
                    Eubacteria (&apos;True Bacteria&apos;)
                  </span>
                  <span className="text-[11px] text-[#464555] truncate">
                    Cyanobacteria, Heterotrophs &amp; Mycoplasma
                  </span>
                </div>
                <StitchIcon name="arrow_forward" size={16} className="text-[#464555] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </section>

            {/* Quick Actions Cluster */}
            <div className="space-y-2.5">
              <Link
                href="/dpp/challenger"
                className="w-full py-3 px-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl font-headline font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
              >
                <StitchIcon name="checklist" size={18} />
                <span>Solve 10 Qs on P.19</span>
              </Link>
              <Link
                href="/ai-tutor"
                className="w-full py-3 px-4 bg-white hover:bg-[#f1f3ff] text-[#141b2b] border border-[#e9edff] rounded-xl font-headline font-semibold text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
              >
                <StitchIcon name="smart_toy" size={18} className="text-[#3525cd]" />
                <span>Ask AI Tutor About P.19</span>
              </Link>
            </div>

            {/* Page Navigation Progress Widget */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#e9edff] shadow-xs flex items-center justify-between gap-3">
              <button
                onClick={() => showNavNotice('Navigating to Page 18: Kingdom Systems Overview...')}
                className="flex items-center gap-1 text-xs text-[#464555] hover:text-[#141b2b] py-1 px-2 rounded-lg hover:bg-[#f1f3ff] transition-colors cursor-pointer"
              >
                <StitchIcon name="arrow_back_ios" size={13} />
                <span className="font-medium">P.18 Intro</span>
              </button>
              <div className="flex items-center gap-2 flex-1 px-2">
                <div className="w-full bg-[#e1e8fd] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#3525cd] h-full rounded-full" style={{ width: '68%' }} />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#141b2b] flex-shrink-0">
                  P.19 (68%)
                </span>
              </div>
              <button
                onClick={() => showNavNotice('Navigating to Page 20: Eubacteria & Cyanobacteria...')}
                className="flex items-center gap-1 text-xs text-[#3525cd] font-semibold hover:text-[#4f46e5] py-1 px-2 rounded-lg hover:bg-[#f1f3ff] transition-colors cursor-pointer"
              >
                <span className="font-medium">P.20 Eubact.</span>
                <StitchIcon name="arrow_forward_ios" size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
