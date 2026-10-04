'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface UserPreferences {
  dailyCapacityMinutes: number;
  language: 'EN' | 'HI';
  autoAdvanceQuestion: boolean;
  soundEffects: boolean;
  dailyReminders: boolean;
  fontSize: 'NORMAL' | 'LARGE' | 'XLARGE';
  highContrast: boolean;
  reducedMotion: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  dailyCapacityMinutes: 360,
  language: 'EN',
  autoAdvanceQuestion: true,
  soundEffects: true,
  dailyReminders: true,
  fontSize: 'NORMAL',
  highContrast: false,
  reducedMotion: false,
};

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'PREFERENCES' | 'ACCESSIBILITY'>('GENERAL');
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // Restore saved preferences on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kriti_user_preferences');
      if (saved) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) });
      }
    } catch {
      //
    }
  }, []);

  const handleSavePreferences = () => {
    try {
      localStorage.setItem('kriti_user_preferences', JSON.stringify(preferences));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      //
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportStatus(null);
    try {
      const res = await fetch('/api/account/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neet2027_learning_data_${Date.now()}.json`;
      a.click();
      setExportStatus('Personal learning data exported successfully (JSON)');
    } catch {
      setExportStatus('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch('/api/account/settings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Student self-service deletion request' }),
      });
      const data = await res.json();
      if (data.success) {
        setDeleted(true);
      }
    } catch {
      //
    }
  };

  return (
    <AppShell
      title="Account Settings"
      subtitle="Profile, Privacy & Preferences"
      streakDays={7}
      showBack={true}
      backHref="/"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-[#e9edff]">
          <button
            type="button"
            onClick={() => setActiveTab('GENERAL')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer ${
              activeTab === 'GENERAL'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-white text-[#464555] hover:bg-[#f1f3ff] border border-[#e9edff]'
            }`}
          >
            General & Data
          </button>
          <Link
            href="/settings/privacy"
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-headline font-bold bg-white text-[#464555] hover:bg-[#f1f3ff] border border-[#e9edff] transition-all flex items-center"
          >
            Privacy & Permissions
          </Link>
          <button
            type="button"
            onClick={() => setActiveTab('PREFERENCES')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer ${
              activeTab === 'PREFERENCES'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-white text-[#464555] hover:bg-[#f1f3ff] border border-[#e9edff]'
            }`}
          >
            Study Preferences
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACCESSIBILITY')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer ${
              activeTab === 'ACCESSIBILITY'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-white text-[#464555] hover:bg-[#f1f3ff] border border-[#e9edff]'
            }`}
          >
            Accessibility
          </button>
        </div>

        {/* Free Platform Guarantee Banner */}
        <div className="bg-[#e6f7ef] border border-[#6cf8bb] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#006c49] text-white font-bold text-sm">
              ✓
            </span>
            <div>
              <h4 className="text-sm font-headline font-bold text-[#002113]">100% Free Educational Platform</h4>
              <p className="text-xs text-[#00714d] mt-0.5">
                Kriti NEET is free forever for all aspirants. Zero subscription fees, zero paywalls, and unlimited access to all AI tools, CBT mocks, and question banks.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-white border border-[#6cf8bb] text-[#006c49] text-xs font-bold">
            Free Forever
          </span>
        </div>

        {/* Save feedback banner */}
        {saveSuccess && (
          <div className="p-3 bg-[#e6f7ef] border border-[#6cf8bb] rounded-xl text-xs text-[#006c49] font-medium flex items-center gap-2">
            <StitchIcon name="check" size={16} className="text-[#006c49]" />
            <span>Preferences saved and synchronized successfully!</span>
          </div>
        )}

        {/* TAB 1: GENERAL & DATA */}
        {activeTab === 'GENERAL' && (
          <div className="space-y-6">
            {/* Export Section */}
            <div className="bg-white border border-[#e9edff] rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
                    <StitchIcon name="download" size={18} className="text-[#3525cd]" />
                    <span>Export Personal Learning Data</span>
                  </h3>
                  <p className="text-[#464555] text-xs mt-1 max-w-xl leading-relaxed">
                    Download a complete verified archive of your NEET preparation history, including test attempts, Error Book mistakes, SM-2 spaced repetition items, and goals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="min-h-[44px] px-5 py-2.5 bg-[#3525cd] hover:bg-[#2d1eb8] disabled:opacity-50 text-white font-headline font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <StitchIcon name="download" size={16} />
                  <span>{exporting ? 'Generating...' : 'Export JSON'}</span>
                </button>
              </div>
              {exportStatus && (
                <div className="p-3 bg-[#e6f7ef] border border-[#6cf8bb] rounded-xl text-xs text-[#006c49] flex items-center gap-2">
                  <StitchIcon name="check" size={16} className="text-[#006c49]" />
                  <span>{exportStatus}</span>
                </div>
              )}
            </div>

            {/* Account Deletion */}
            <div className="bg-[#fff1f0] border border-[#ffdad6] rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-base font-headline font-bold text-[#ba1a1a] flex items-center gap-2">
                <StitchIcon name="delete" size={18} className="text-[#ba1a1a]" />
                <span>Delete Account & Purge Learning Data</span>
              </h3>
              <p className="text-[#464555] text-xs max-w-xl leading-relaxed">
                Permanently purges your student profile, test attempts, Error Book entries, spaced repetition memory traces, and mentor feedback notes. Kriti NEET does not retain any financial records because all platform features are completely free.
              </p>

              {deleted ? (
                <div className="p-4 bg-white border border-[#ffdad6] rounded-xl text-xs text-[#ba1a1a] font-semibold">
                  Account successfully deleted. All personal learning records have been purged.
                </div>
              ) : !deleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="min-h-[44px] px-4 py-2 bg-white hover:bg-[#ffdad6]/40 text-[#ba1a1a] border border-[#ffdad6] text-xs font-headline font-bold rounded-xl transition cursor-pointer"
                >
                  Request Account Deletion
                </button>
              ) : (
                <div className="p-4 bg-white border border-[#ba1a1a] rounded-xl space-y-3">
                  <div className="text-xs text-[#ba1a1a] font-bold">
                    Are you certain you want to purge your account? This action cannot be reversed.
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="min-h-[44px] px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-headline font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Yes, Delete My Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(false)}
                      className="min-h-[44px] px-4 py-2 bg-[#f1f3ff] text-[#464555] font-headline font-semibold text-xs rounded-xl hover:bg-[#e9edff] transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STUDY PREFERENCES */}
        {activeTab === 'PREFERENCES' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#e9edff] rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f3ff] pb-4">
                <div>
                  <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
                    <StitchIcon name="tune" size={18} className="text-[#3525cd]" />
                    <span>Daily Execution & Practice Settings</span>
                  </h3>
                  <p className="text-xs text-[#464555] mt-0.5">Customize daily study capacities, CBT simulator defaults, and timers.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="min-h-[44px] px-5 py-2.5 bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <StitchIcon name="save" size={16} />
                  <span>Save Changes</span>
                </button>
              </div>

              {/* Daily Target Capacity */}
              <div className="space-y-2">
                <label className="text-xs font-headline font-bold text-[#141b2b] block">Daily Study Target Capacity</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[180, 240, 360, 480].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, dailyCapacityMinutes: mins })}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-headline font-bold border transition-all cursor-pointer ${
                        preferences.dailyCapacityMinutes === mins
                          ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs'
                          : 'bg-[#f9f9ff] border-[#e9edff] text-[#464555] hover:bg-[#f1f3ff] hover:text-[#141b2b]'
                      }`}
                    >
                      {mins / 60} Hours ({mins}m)
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Preference */}
              <div className="space-y-2 pt-3 border-t border-[#f1f3ff]">
                <label className="text-xs font-headline font-bold text-[#141b2b] block">Default NCERT & Question Language</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'EN', label: 'English (Standard NTA)' },
                    { id: 'HI', label: 'हिन्दी (Hindi Medium)' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, language: l.id as any })}
                      className={`min-h-[44px] py-2 px-4 rounded-xl text-xs font-headline font-bold border transition-all cursor-pointer ${
                        preferences.language === l.id
                          ? 'bg-[#3525cd] text-white border-[#3525cd]'
                          : 'bg-[#f9f9ff] border-[#e9edff] text-[#464555] hover:bg-[#f1f3ff] hover:text-[#141b2b]'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-3 pt-3 border-t border-[#f1f3ff]">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] cursor-pointer hover:bg-[#f1f3ff] transition">
                  <div className="pr-4">
                    <span className="text-xs font-headline font-bold text-[#141b2b] block">Auto-advance in DPP Drills</span>
                    <span className="text-[11px] text-[#464555]">Advance automatically to the next question upon answer selection</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.autoAdvanceQuestion}
                    onChange={(e) => setPreferences({ ...preferences, autoAdvanceQuestion: e.target.checked })}
                    className="w-5 h-5 accent-[#3525cd] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] cursor-pointer hover:bg-[#f1f3ff] transition">
                  <div className="pr-4">
                    <span className="text-xs font-headline font-bold text-[#141b2b] block">Sound Effects & Timer Alerts</span>
                    <span className="text-[11px] text-[#464555]">Play subtle auditory cues on 10-minute CBT countdown warnings</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.soundEffects}
                    onChange={(e) => setPreferences({ ...preferences, soundEffects: e.target.checked })}
                    className="w-5 h-5 accent-[#3525cd] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] cursor-pointer hover:bg-[#f1f3ff] transition">
                  <div className="pr-4">
                    <span className="text-xs font-headline font-bold text-[#141b2b] block">Spaced Repetition Reminders</span>
                    <span className="text-[11px] text-[#464555]">Notify when Error Book mistakes reach their Leitner revision due date</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.dailyReminders}
                    onChange={(e) => setPreferences({ ...preferences, dailyReminders: e.target.checked })}
                    className="w-5 h-5 accent-[#3525cd] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACCESSIBILITY */}
        {activeTab === 'ACCESSIBILITY' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#e9edff] rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f3ff] pb-4">
                <div>
                  <h3 className="text-base font-headline font-bold text-[#141b2b] flex items-center gap-2">
                    <StitchIcon name="visibility" size={18} className="text-[#3525cd]" />
                    <span>Accessibility & Reader Ergonomics</span>
                  </h3>
                  <p className="text-xs text-[#464555] mt-0.5">High-contrast modes, font adjustments, and reduced motion settings.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="min-h-[44px] px-5 py-2.5 bg-[#3525cd] hover:bg-[#2d1eb8] text-white font-headline font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <StitchIcon name="save" size={16} />
                  <span>Save Changes</span>
                </button>
              </div>

              {/* Font Sizing */}
              <div className="space-y-2">
                <label className="text-xs font-headline font-bold text-[#141b2b] block">Question & Reading Font Size</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'NORMAL', label: 'Default (16px)' },
                    { id: 'LARGE', label: 'Large (18px)' },
                    { id: 'XLARGE', label: 'Extra Large (20px)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, fontSize: s.id as any })}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-headline font-bold border transition-all cursor-pointer ${
                        preferences.fontSize === s.id
                          ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs'
                          : 'bg-[#f9f9ff] border-[#e9edff] text-[#464555] hover:bg-[#f1f3ff] hover:text-[#141b2b]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* High Contrast & Reduced Motion */}
              <div className="space-y-3 pt-3 border-t border-[#f1f3ff]">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] cursor-pointer hover:bg-[#f1f3ff] transition">
                  <div className="pr-4">
                    <span className="text-xs font-headline font-bold text-[#141b2b] block">High Contrast Mode</span>
                    <span className="text-[11px] text-[#464555]">Increase contrast ratio across question stems, options, and diagrams</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.highContrast}
                    onChange={(e) => setPreferences({ ...preferences, highContrast: e.target.checked })}
                    className="w-5 h-5 accent-[#3525cd] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] cursor-pointer hover:bg-[#f1f3ff] transition">
                  <div className="pr-4">
                    <span className="text-xs font-headline font-bold text-[#141b2b] block">Reduced Motion</span>
                    <span className="text-[11px] text-[#464555]">Minimize sliding transitions and pulsing animations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.reducedMotion}
                    onChange={(e) => setPreferences({ ...preferences, reducedMotion: e.target.checked })}
                    className="w-5 h-5 accent-[#3525cd] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
