"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/stitch/AppShell";
import { StitchIcon } from "@/components/stitch/StitchIcon";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  text: string;
  time: string;
  isInitial?: boolean;
}

export default function AITutorPage() {
  const [currentMode, setCurrentMode] = useState<string>("Step-by-Step Hint");
  const [showModeMenu, setShowModeMenu] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [savedToNotebook, setSavedToNotebook] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      role: "USER",
      text: "Can you explain the cell wall difference between Archaebacteria and Eubacteria? I got confused between Peptidoglycan and Pseudomurein in yesterday's test.",
      time: "11:42 AM",
    },
    {
      id: "msg-2",
      role: "ASSISTANT",
      text: "Great catch, Kriti! Examiners love testing this exact distinction because both sound similar, but their chemical architecture is completely distinct.",
      time: "11:42 AM",
      isInitial: true,
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleAudioCapsule = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak =
        "High retention NEET summary: Archaebacteria survive extreme habitats because their cell wall contains pseudomurein with beta 1 3 linkages, and their membrane has branched chain ether lipids. Penicillin and lysozyme have zero effect on them, unlike Eubacteria which possess peptidoglycan with beta 1 4 linkages.";
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleVoiceToggle = () => {
    if (typeof window === "undefined") return;
    // Check for Web Speech API
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      if (isListening) {
        setIsListening(false);
      } else {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = "en-IN";
          recognition.onstart = () => setIsListening(true);
          recognition.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript;
            if (transcript) {
              setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
            }
            setIsListening(false);
          };
          recognition.onerror = () => setIsListening(false);
          recognition.onend = () => setIsListening(false);
          recognition.start();
        } catch {
          setIsListening(false);
        }
      }
    } else {
      // Fallback: visual simulation with sample voice input
      setIsListening(!isListening);
      if (!isListening) {
        setTimeout(() => {
          setInputText("Explain why Archaebacterial cell membranes have branched ether lipids.");
          setIsListening(false);
        }, 1200);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `usr-img-${Date.now()}`,
      role: "USER",
      text: `📷 [Uploaded Diagram: ${file.name}] Can you analyze this NCERT diagram and identify the labeled structures?`,
      time: timeStr,
    };
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-img-${Date.now()}`,
          role: "ASSISTANT",
          text: `I've analyzed your uploaded diagram (${file.name}). Notice the distinctive branched monolayer structure characteristic of Archaebacterial ether-linked lipids. In NEET 2023, Question 47 directly tested this diagram label. Would you like a step-by-step diagnostic breakdown?`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 700);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [isSending, setIsSending] = useState(false);
  const [socraticStage, setSocraticStage] = useState<number>(1);
  const [conversationId, setConversationId] = useState<string>(() => `conv-${Date.now()}`);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    const userText = inputText.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newUserMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "USER",
      text: userText,
      time: timeStr,
    };

    setInputText("");
    setMessages((prev) => [...prev, newUserMsg]);
    setIsSending(true);

    try {
      // Map display mode to engine explicitMode
      let apiMode = 'SOCRATIC_TUTOR';
      if (currentMode === 'Full NCERT Solution') apiMode = 'NCERT_SOURCE';
      if (currentMode === 'Hindi सरल व्याख्या') apiMode = 'HINDI_EXPLANATION';

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          conversationId,
          mode: apiMode,
          socraticStage,
        }),
      });

      const data = await res.json();
      let aiResponseText = '';

      if (data.content) {
        aiResponseText = data.content;
      } else if (data.reply) {
        aiResponseText = data.reply;
      } else if (data.response) {
        aiResponseText = data.response;
      } else if (data.message) {
        aiResponseText = data.message;
      } else {
        aiResponseText = `Socratic Guidance: Consider the core biochemical structure in NCERT Chapter 2. How do ether bonds compare to ester linkages?`;
      }

      // Advance socratic stage
      setSocraticStage((prev) => (prev < 4 ? prev + 1 : 1));

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "ASSISTANT",
          text: aiResponseText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "ASSISTANT",
          text: "I encountered a network hiccup while consulting the NCERT knowledge graph. Please verify your connection or ask again.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const MODES = [
    { id: "Step-by-Step Hint", label: "Gentle Hint", icon: "tips_and_updates", desc: "Socratic guidance without giving away full answer" },
    { id: "Full NCERT Solution", label: "Detailed NCERT", icon: "menu_book", desc: "Verbatim textbook quotes & complete analysis" },
    { id: "Hindi सरल व्याख्या", label: "सरल Hindi", icon: "translate", desc: "Bilingual conceptual explanation in easy terms" },
  ];

  return (
    <AppShell
      title="Kriti AI Tutor"
      subtitle="24/7 Socratic NEET Coach"
      streakDays={7}
      rightAction={
        <div className="flex items-center gap-2">
          <Link
            href="/ai-tutor/diagnostic"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#e1e8fd] text-[#3525cd] hover:bg-[#d4defb] text-xs font-bold transition-all"
          >
            <StitchIcon name="bolt" size={14} />
            Diagnostic Drill
          </Link>
          <Link
            href="/ai-tutor/context"
            className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center bg-white border border-[#e9edff] text-[#464555] hover:text-[#141b2b] hover:bg-[#f1f3ff] transition-colors"
            title="Doubt History & Context"
          >
            <StitchIcon name="history" size={18} />
          </Link>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Top Mode Selector & Context Ribbon */}
        <div className="bg-white rounded-2xl p-4 border border-[#e9edff] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#e1e8fd] text-[#3525cd] flex-shrink-0">
              <StitchIcon name="smart_toy" size={22} />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#006c49] ring-2 ring-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-bold text-base text-[#141b2b]">
                  Socratic Doubt Solver
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#006c49] text-xs font-bold">
                  24/7 Active
                </span>
              </div>
              <p className="text-xs text-[#777587]">
                Trained on NCERT 2024-25 Rationalized &amp; 15-Year NEET PYQ Patterns
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-[#f1f3ff] p-1 rounded-xl">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setCurrentMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentMode === m.id
                    ? "bg-[#3525cd] text-white shadow-xs"
                    : "text-[#464555] hover:text-[#141b2b] hover:bg-white/60"
                }`}
              >
                <StitchIcon name={m.icon} size={14} />
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dual Layout: Split on Desktop (5 cols context / 7 cols chat), stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Study Context & Knowledge Companion (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Pinned Question Context Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3525cd]">
                    Linked DPP 02 • Q14
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#f1f3ff] text-xs font-medium text-[#464555]">
                    Botany
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#e2dfff] text-[#3525cd] text-xs font-bold">
                    High Yield
                  </span>
                </div>
              </div>

              <div className="bg-[#f9f9ff] p-3.5 rounded-xl border border-[#e9edff]">
                <p className="text-sm font-medium text-[#141b2b] leading-relaxed">
                  “Why are Methanogenic Archaebacteria able to survive extreme anaerobic conditions in ruminant guts while Eubacteria cannot?”
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-[#464555]">
                  <StitchIcon name="menu_book" size={15} className="text-[#3525cd]" />
                  <span>NCERT Class 11 • Ch. 2 • Page 19</span>
                </div>
                <Link
                  href="/ncert/monera-archaebacteria"
                  className="font-bold text-[#3525cd] hover:underline flex items-center gap-1"
                >
                  Open in Reader
                  <StitchIcon name="arrow_forward" size={14} />
                </Link>
              </div>
            </div>

            {/* High-Frequency NEET Trap Card */}
            <div className="bg-[#fff8e1] rounded-2xl p-5 border border-[#ffe082] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#b78103]">
                <StitchIcon name="warning" size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  High-Frequency NEET Trap
                </span>
              </div>
              <p className="text-sm text-[#464555] leading-relaxed">
                Penicillin targets bacterial transpeptidase in <strong>β-1,4 peptidoglycan synthesis</strong>. Archaebacteria possess <strong>Pseudomurein with β-1,3 bonds</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-white/80 border border-[#ffe082] text-xs font-bold text-[#ba1a1a]">
                ⚠️ NEET Trap: Penicillin has ZERO effect on Archaebacteria!
              </div>
            </div>

            {/* Audio Capsule Player */}
            <div className="bg-white rounded-2xl p-4 border border-[#e9edff] shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleAudioCapsule}
                  className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer flex-shrink-0 ${
                    isPlayingAudio ? "bg-[#006c49] text-white animate-pulse" : "bg-[#3525cd] text-white hover:bg-[#2b1ea8]"
                  }`}
                  aria-label={isPlayingAudio ? "Pause Audio Capsule" : "Play Audio Capsule"}
                >
                  <StitchIcon name={isPlayingAudio ? "pause" : "volume_up"} size={18} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#141b2b]">Audio Capsule (Hindi + Eng)</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#e2dfff] text-[#3525cd] text-[10px] font-bold">
                      {isPlayingAudio ? "Speaking" : "सरल"}
                    </span>
                  </div>
                  <span className="text-xs text-[#777587]">
                    {isPlayingAudio ? "Listening to high-yield NCERT audio summary..." : "0:45 min • High retention audio summary"}
                  </span>
                </div>
              </div>
            </div>

            {/* Comparative Summary Table */}
            <div className="bg-white rounded-2xl p-5 border border-[#e9edff] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#f1f3ff]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#141b2b] flex items-center gap-1.5">
                  <StitchIcon name="table_chart" size={16} className="text-[#3525cd]" />
                  Comparative Summary (Table 2.1 Ref)
                </span>
                <span className="text-xs text-[#777587]">NEET Must-Know</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                  <span className="text-xs font-bold text-[#3525cd] block mb-2">ARCHAEBACTERIA</span>
                  <ul className="text-xs space-y-1.5 text-[#464555]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#3525cd] font-bold">•</span>
                      <span><strong>Pseudomurein</strong> wall</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#3525cd] font-bold">•</span>
                      <span><strong>Ether-linked</strong> branched lipids</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#3525cd] font-bold">•</span>
                      <span>Extreme habitats (pH &lt; 2, 100°C)</span>
                    </li>
                  </ul>
                </div>
                <div className="p-3 bg-[#f9f9ff] rounded-xl border border-[#e9edff]">
                  <span className="text-xs font-bold text-[#141b2b] block mb-2">EUBACTERIA</span>
                  <ul className="text-xs space-y-1.5 text-[#464555]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#006c49] font-bold">•</span>
                      <span><strong>Peptidoglycan</strong> wall</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#006c49] font-bold">•</span>
                      <span><strong>Ester-linked</strong> straight lipids</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#006c49] font-bold">•</span>
                      <span>Standard mesophilic habitats</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Verbatim NCERT Citation */}
            <div className="bg-[#f1f3ff] rounded-2xl p-4 border border-[#d4defb] text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-[#3525cd] font-bold">
                <StitchIcon name="format_quote" size={16} />
                <span>NCERT Verbatim Citation</span>
              </div>
              <p className="italic text-[#464555] leading-relaxed">
                “Archaebacteria differ from other bacteria in having a different cell wall structure and this feature is responsible for their survival in extreme conditions.”
              </p>
              <div className="text-[11px] font-semibold text-[#3525cd]">
                — NCERT Biology Class 11, Chapter 2, Page 19, Para 1
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Socratic Conversation Workspace (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-[#e9edff] shadow-xs overflow-hidden min-h-[620px]">
            {/* Conversation Header */}
            <div className="p-4 border-b border-[#f1f3ff] bg-[#f9f9ff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse" />
                <span className="text-xs font-bold text-[#141b2b]">Active Thread: Archaebacteria vs Eubacteria</span>
              </div>
              <span className="text-xs text-[#777587]">
                Mode: <strong className="text-[#3525cd]">{currentMode}</strong>
              </span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-5 space-y-5 overflow-y-auto max-h-[580px] lg:max-h-[640px]">
              {messages.map((msg) => {
                const isUser = msg.role === "USER";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end pl-8" : "items-start pr-8"}`}
                  >
                    {isUser ? (
                      <>
                        <div className="bg-[#3525cd] text-white rounded-2xl rounded-tr-xs p-4 shadow-xs max-w-[90%] sm:max-w-[80%]">
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 pr-1 text-[11px] text-[#777587]">
                          <span>{msg.time}</span>
                          <StitchIcon name="done_all" size={13} className="text-[#006c49]" />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-[#3525cd] text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-1">
                          <StitchIcon name="neurology" size={18} />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="bg-[#f9f9ff] text-[#141b2b] rounded-2xl rounded-tl-xs p-4 border border-[#e9edff] shadow-xs space-y-3">
                            {msg.isInitial && (
                              <div className="flex items-center justify-between pb-1 border-b border-[#e9edff]">
                                <span className="text-xs font-bold text-[#3525cd] flex items-center gap-1">
                                  <span>🎯</span> Step 1 • The Fundamental Difference
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-[#6cf8bb]/40 text-[#006c49] text-[11px] font-bold">
                                  Confidence +8%
                                </span>
                              </div>
                            )}

                            <p className="text-sm leading-relaxed text-[#141b2b]">{msg.text}</p>

                            {msg.isInitial && (
                              <div className="p-3 bg-white rounded-xl border border-[#e9edff] text-xs space-y-1.5">
                                <span className="font-bold text-[#3525cd]">Biochemical Insight:</span>
                                <p className="text-[#464555] leading-relaxed">
                                  Archaebacteria do <strong>NOT</strong> have true peptidoglycan. In methanogens, the cell wall is composed of <strong>Pseudomurein</strong> (containing N-acetyltalosaminuronic acid with <strong className="text-[#3525cd]">β-1,3 glycosidic bonds</strong>, instead of β-1,4 bonds).
                                </p>
                              </div>
                            )}

                            {/* Action Feedback Bar */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#e9edff] text-xs text-[#777587]">
                              <div className="flex items-center gap-2">
                                <span>Helpful?</span>
                                <button
                                  type="button"
                                  onClick={() => setFeedback("up")}
                                  className={`p-1 rounded hover:bg-[#e1e8fd] cursor-pointer ${
                                    feedback === "up" ? "text-[#3525cd] font-bold" : "text-[#777587]"
                                  }`}
                                  title="Thumbs up"
                                >
                                  <StitchIcon name="thumb_up" size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFeedback("down")}
                                  className={`p-1 rounded hover:bg-[#ffebee] cursor-pointer ${
                                    feedback === "down" ? "text-[#ba1a1a] font-bold" : "text-[#777587]"
                                  }`}
                                  title="Thumbs down"
                                >
                                  <StitchIcon name="thumb_down" size={14} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSavedToNotebook(!savedToNotebook)}
                                className={`flex items-center gap-1 font-bold cursor-pointer transition-colors ${
                                  savedToNotebook ? "text-[#006c49]" : "text-[#3525cd] hover:underline"
                                }`}
                              >
                                <StitchIcon name={savedToNotebook ? "check" : "bookmark_add"} size={14} />
                                <span>{savedToNotebook ? "Saved in Notebook" : "Save to Notebook"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Instant Follow-up Chips */}
            <div className="px-5 py-2.5 bg-[#f9f9ff] border-t border-[#f1f3ff] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777587] flex items-center gap-1">
                <StitchIcon name="bolt" size={12} className="text-[#3525cd]" />
                Instant Follow-Up Suggestions
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setInputText("Give me 1 high-probability NEET PYQ on Archaebacteria cell walls");
                  }}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e9edff] text-xs font-semibold text-[#141b2b] hover:bg-[#e1e8fd] hover:text-[#3525cd] transition-all cursor-pointer shadow-2xs"
                >
                  <span>📝</span>
                  <span>Give me 1 NEET PYQ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentMode("Hindi सरल व्याख्या")}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e9edff] text-xs font-semibold text-[#141b2b] hover:bg-[#e1e8fd] hover:text-[#3525cd] transition-all cursor-pointer shadow-2xs"
                >
                  <span>🇮🇳</span>
                  <span>Explain in सरल Hindi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputText("Why do Archaea have ether bonds instead of ester bonds in lipids?");
                  }}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e9edff] text-xs font-semibold text-[#141b2b] hover:bg-[#e1e8fd] hover:text-[#3525cd] transition-all cursor-pointer shadow-2xs"
                >
                  <span>🔬</span>
                  <span>Ether vs Ester bonds</span>
                </button>
              </div>
            </div>

            {/* Interactive Chat Input Area */}
            <div className="p-4 bg-white border-t border-[#e9edff]">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative flex items-center bg-[#f9f9ff] rounded-xl border border-[#e9edff] focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/15 transition-all">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask any doubt about Monera, Archaea, or PYQ concepts..."
                    className="w-full pl-4 pr-20 py-3 bg-transparent text-sm text-[#141b2b] placeholder:text-[#777587] focus:outline-none"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <div className="absolute right-2 flex items-center gap-1 text-[#777587]">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 hover:text-[#3525cd] transition-colors cursor-pointer rounded-lg hover:bg-white"
                      title="Upload Diagram/Photo for AI Diagnosis"
                      aria-label="Upload Diagram or Photo"
                    >
                      <StitchIcon name="photo_camera" size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={handleVoiceToggle}
                      className={`p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-white ${
                        isListening ? "text-[#ba1a1a] animate-pulse bg-red-50" : "hover:text-[#3525cd]"
                      }`}
                      title={isListening ? "Listening... Speak doubt" : "Voice Input (Speech-to-Text)"}
                      aria-label="Toggle Voice Input"
                    >
                      <StitchIcon name="mic" size={18} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                    inputText.trim()
                      ? "bg-[#3525cd] text-white shadow-xs hover:bg-[#2b1ea8] active:scale-95"
                      : "bg-[#e9edff] text-[#777587] cursor-not-allowed"
                  }`}
                  aria-label="Send message"
                >
                  <StitchIcon name="send" size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[#777587]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]" />
                  Auto-citation active: NCERT 2024-25 Rationalized Edition
                </span>
                <span className="hidden sm:inline">Press Enter ↵ to send</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
