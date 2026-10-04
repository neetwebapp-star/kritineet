'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { StitchIcon } from '@/components/stitch/StitchIcon';

export default function FocusRoomPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#464555]">Loading focus session...</p>
          </div>
        </div>
      }
    >
      <FocusRoomContent />
    </React.Suspense>
  );
}

function FocusRoomContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');
  const sessionId = searchParams.get('sessionId');

  const [preset, setPreset] = useState<'25_5' | '45_10' | '50_10' | '60_10' | 'CUSTOM'>('45_10');
  const [totalSeconds, setTotalSeconds] = useState(45 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [taskTitle, setTaskTitle] = useState('Deep Focus Study Block');

  useEffect(() => {
    switch (preset) {
      case '25_5':
        setTotalSeconds(25 * 60);
        setRemainingSeconds(25 * 60);
        break;
      case '45_10':
        setTotalSeconds(45 * 60);
        setRemainingSeconds(45 * 60);
        break;
      case '50_10':
        setTotalSeconds(50 * 60);
        setRemainingSeconds(50 * 60);
        break;
      case '60_10':
        setTotalSeconds(60 * 60);
        setRemainingSeconds(60 * 60);
        break;
    }
  }, [preset]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  const toggleTimer = async () => {
    if (isRunning) {
      // Pause
      setIsRunning(false);
      if (sessionId && taskId) {
        fetch(`/api/student/tasks/${taskId}/pause`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'student_demo', sessionId }),
        }).catch(console.error);
      }
    } else {
      // Start or Resume
      setIsRunning(true);
      if (sessionId && taskId) {
        fetch(`/api/student/tasks/${taskId}/resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'student_demo', sessionId }),
        }).catch(console.error);
      }
    }
  };

  const handleCompleteSession = async () => {
    const elapsedMinutes = Math.max(1, Math.round((totalSeconds - remainingSeconds) / 60));
    if (sessionId && taskId) {
      await fetch(`/api/student/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'student_demo',
          sessionId,
          actualMinutes: elapsedMinutes,
        }),
      }).catch(console.error);
    }
    window.location.href = '/today';
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progressPercent = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex flex-col justify-between p-6 md:p-12 relative overflow-hidden select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 max-w-4xl mx-auto w-full">
        <Link
          href="/today"
          className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-[#e9edff] text-xs font-headline font-bold text-[#464555] hover:text-[#3525cd] transition flex items-center gap-1.5 shadow-xs"
        >
          <StitchIcon name="arrow_back" size={16} />
          <span>Return to Today Command</span>
        </Link>
        <span className="text-xs font-headline font-bold px-3 py-1.5 rounded-full bg-[#e2dfff] text-[#3525cd]">
          Focus Mode &bull; Distraction-Free
        </span>
      </div>

      {/* Center Focus Interface */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center max-w-lg mx-auto w-full">
        {/* Task Title */}
        <h1 className="text-xl md:text-2xl font-headline font-bold text-[#141b2b] mb-6 tracking-tight">
          {taskTitle}
        </h1>

        {/* Large Timer Display */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center border-4 border-[#e9edff] mb-8 bg-white shadow-xl">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="stroke-[#3525cd] transition-all duration-1000 fill-none"
              strokeWidth="8"
              strokeDasharray="1000"
              strokeDashoffset={1000 - (progressPercent / 100) * 1000}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-6xl md:text-7xl font-headline font-bold tracking-tight text-[#141b2b] font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-[#e9edff] text-xs shadow-xs">
          {(['25_5', '45_10', '50_10', '60_10'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                if (!isRunning) setPreset(p);
              }}
              disabled={isRunning}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl font-headline font-bold transition cursor-pointer ${
                preset === p
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'text-[#464555] hover:bg-[#f1f3ff]'
              }`}
            >
              {p.replace('_', ' / ')}m
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTimer}
            className={`min-h-[48px] px-8 py-3 rounded-2xl font-headline font-bold text-sm transition shadow-xs cursor-pointer flex items-center gap-2 ${
              isRunning
                ? 'bg-[#f59e0b] hover:bg-[#d97706] text-white'
                : 'bg-[#3525cd] hover:bg-[#2d1eb8] text-white'
            }`}
          >
            <StitchIcon name={isRunning ? 'pause' : 'play_arrow'} size={18} />
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>
          <button
            type="button"
            onClick={handleCompleteSession}
            className="min-h-[48px] px-6 py-3 rounded-2xl font-headline font-bold text-sm bg-white hover:bg-[#f1f3ff] border border-[#e9edff] text-[#464555] transition shadow-xs cursor-pointer"
          >
            Finish & Log
          </button>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#777587] z-10 max-w-4xl mx-auto w-full gap-2">
        <span>Session ID: {sessionId || 'local_session'}</span>
        <span>Deep work block backed by spaced repetition recall</span>
      </div>
    </div>
  );
}
