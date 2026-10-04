'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/stitch/AppShell';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface OfficialNotificationItem {
  id: string;
  noticeNumber?: string;
  title: string;
  authority: 'NTA' | 'NMC' | 'UGMEB';
  category: string;
  alertLevel: 'INFO' | 'IMPORTANT' | 'ACTION_REQUIRED' | 'CRITICAL';
  status: string;
  examYear?: number;
  isHistorical: boolean;
  publishedAt: string;
  lastVerifiedAt: string;
  officialSourceUrl: string;
  officialDocumentUrl?: string;
  documentHash?: string;
  aiSummary?: string;
  aiSummaryEvidence?: string;
  studentActionRequired?: string;
  isRead: boolean;
  facts?: any;
  source?: {
    name: string;
    code: string;
    authority: string;
    status: string;
  };
  impacts?: any[];
}

interface ExamStatusData {
  examYear: number;
  statusCard: {
    examDate: string;
    isDateOfficiallyAnnounced: boolean;
    examDateOfficialSource: string | null;
    examMode: string;
    isModeOfficiallyAnnounced: boolean;
    examModeOfficialSource: string | null;
    syllabusVersion: string;
    syllabusAuthority: string;
    syllabusLastVerified: string | null;
    applicationStatus: string;
    lastOfficialUpdate: {
      id: string;
      title: string;
      authority: string;
      publishedAt: string;
      officialDocumentUrl: string | null;
      officialSourceUrl: string;
      isHistorical: boolean;
    } | null;
    lastVerifiedAt: string;
    sourcesMonitored: string[];
  };
}

export default function NtaNotificationsPage() {
  const [notifications, setNotifications] = useState<OfficialNotificationItem[]>([]);
  const [examStatus, setExamStatus] = useState<ExamStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Load Exam Status
  const loadExamStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/student/exam-status');
      if (res.ok) {
        const json = await res.json();
        setExamStatus(json);
      }
    } catch (e) {
      console.error('Failed to load exam status:', e);
    }
  }, []);

  // Load Notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (selectedYear !== 'ALL') params.append('examYear', selectedYear);

      const res = await fetch(`/api/student/nta-notifications?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.notifications || []);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedYear]);

  useEffect(() => {
    loadExamStatus();
    loadNotifications();
  }, [loadExamStatus, loadNotifications]);

  // Mark as read
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/student/nta-notifications/${id}/read`, {
        method: 'POST',
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const filteredNotices = notifications.filter((n) => {
    if (unreadOnly && n.isRead) return false;
    return true;
  });

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return { bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]', border: 'border-[#ffb4ab]' };
      case 'ACTION_REQUIRED':
        return { bg: 'bg-[#fff8e1]', text: 'text-[#b78103]', border: 'border-[#ffe082]' };
      case 'IMPORTANT':
        return { bg: 'bg-[#e1e8fd]', text: 'text-[#3525cd]', border: 'border-[#c3c0ff]' };
      default:
        return { bg: 'bg-[#f1f3ff]', text: 'text-[#464555]', border: 'border-[#e9edff]' };
    }
  };

  return (
    <AppShell
      title="NTA Official Exam Intelligence Center"
      subtitle="Government Source Verified • NTA & NMC Official Records Only • Zero Social Media Rumors"
      streakDays={7}
      rightAction={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/nta-notifications"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-[#e9edff] text-[#464555] hover:bg-[#f1f3ff] transition-all shadow-xs"
          >
            <StitchIcon name="admin_panel_settings" size={14} />
            <span>Source Health</span>
          </Link>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* TOP STATUS CARD: NEET 2027 OFFICIAL STATUS */}
        <div className="bg-white rounded-3xl p-6 border border-[#e9edff] shadow-xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-[#f1f3ff]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#e1e8fd] flex items-center justify-center text-[#3525cd]">
                <StitchIcon name="verified" size={20} />
              </div>
              <div>
                <h2 className="font-headline font-bold text-lg text-[#141b2b]">
                  NEET (UG) 2027 Official Status
                </h2>
                <p className="text-xs text-[#777587]">
                  Authoritative facts confirmed by NTA &amp; National Medical Commission (NMC / UGMEB)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse" />
                <span>Sources Live Monitored</span>
              </span>
              <span className="text-[11px] text-[#777587]">
                Last checked: {examStatus?.statusCard.lastVerifiedAt ? new Date(examStatus.statusCard.lastVerifiedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
              </span>
            </div>
          </div>

          {/* 4 Official Status Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Exam Date */}
            <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#777587] tracking-wider">
                  Official Exam Date
                </span>
                <StitchIcon name="calendar_month" size={15} className="text-[#3525cd]" />
              </div>
              <p className="text-sm font-bold text-[#141b2b] pt-1">
                {examStatus?.statusCard.isDateOfficiallyAnnounced
                  ? examStatus?.statusCard.examDate
                  : 'Not yet officially announced'}
              </p>
              <p className="text-[11px] text-[#777587]">
                {examStatus?.statusCard.isDateOfficiallyAnnounced
                  ? 'Confirmed by official NTA notice'
                  : 'NTA has not published 2027 schedule yet'}
              </p>
            </div>

            {/* 2. Exam Mode */}
            <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#777587] tracking-wider">
                  Confirmed Exam Mode
                </span>
                <StitchIcon name="desktop_windows" size={15} className="text-[#3525cd]" />
              </div>
              <p className="text-sm font-bold text-[#141b2b] pt-1">
                {examStatus?.statusCard.examMode}
              </p>
              <p className="text-[11px] text-[#777587]">
                Pen &amp; Paper (OMR) in 2026; 2027 confirmation pending
              </p>
            </div>

            {/* 3. Official Syllabus */}
            <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#777587] tracking-wider">
                  Current Official Syllabus
                </span>
                <StitchIcon name="menu_book" size={15} className="text-[#2e7d32]" />
              </div>
              <p className="text-sm font-bold text-[#2e7d32] pt-1 truncate" title={examStatus?.statusCard.syllabusVersion}>
                {examStatus?.statusCard.syllabusAuthority} Core Edition
              </p>
              <p className="text-[11px] text-[#777587]">
                Prescribed by Under Graduate Medical Board
              </p>
            </div>

            {/* 4. Application Status */}
            <div className="p-4 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#777587] tracking-wider">
                  Application Portal
                </span>
                <StitchIcon name="assignment" size={15} className="text-[#e65100]" />
              </div>
              <p className="text-sm font-bold text-[#141b2b] pt-1">
                {examStatus?.statusCard.applicationStatus}
              </p>
              <p className="text-[11px] text-[#777587]">
                Registration typically begins in Feb/Mar
              </p>
            </div>
          </div>

          {/* Strict Provenance & Source Health Strip */}
          <div className="p-3 bg-[#e8f5e9]/40 border border-[#c8e6c9] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#2e7d32]">
              <StitchIcon name="shield" size={16} />
              <span className="font-semibold">
                Source Integrity Guard: Only authentic documents from <strong>nta.ac.in</strong>, <strong>neet.nta.nic.in</strong>, and <strong>nmc.org.in</strong> are accepted.
              </span>
            </div>
            <span className="text-[11px] text-[#464555] font-mono">
              SHA-256 Verified Provenance
            </span>
          </div>
        </div>

        {/* CONTROLS: Category Tabs, Search, and Unread Toggle */}
        <div className="bg-white rounded-2xl p-4 border border-[#e9edff] shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <StitchIcon
                name="search"
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777587]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search official notices by keyword, title, or reference number..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e9edff] bg-[#f9f9ff] text-xs font-medium text-[#141b2b] outline-none focus:border-[#3525cd]"
              />
            </div>

            {/* Exam Year Filter */}
            <div className="flex items-center gap-1 bg-[#f1f3ff] p-1 rounded-xl text-xs">
              <span className="px-2 text-[#777587] font-semibold text-[11px]">Exam:</span>
              {[
                { id: 'ALL', label: 'All Notices' },
                { id: '2027', label: 'NEET 2027' },
                { id: '2026', label: 'NEET 2026 (Historical)' },
              ].map((y) => (
                <button
                  key={y.id}
                  type="button"
                  onClick={() => setSelectedYear(y.id)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedYear === y.id
                      ? 'bg-white text-[#3525cd] shadow-xs'
                      : 'text-[#464555] hover:text-[#141b2b]'
                  }`}
                >
                  {y.label}
                </button>
              ))}
            </div>

            {/* Unread Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#464555]">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="rounded border-[#e9edff] text-[#3525cd] focus:ring-0 cursor-pointer"
              />
              <span>Unread Only</span>
            </label>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
            {[
              { id: 'ALL', label: 'All Categories' },
              { id: 'SYLLABUS', label: 'Syllabus & Scope' },
              { id: 'EXAM_DATE', label: 'Exam Dates' },
              { id: 'EXAM_MODE', label: 'Exam Mode' },
              { id: 'APPLICATION', label: 'Application & Registration' },
              { id: 'ADMIT_CARD', label: 'Admit Card' },
              { id: 'CITY_INTIMATION', label: 'City Intimation' },
              { id: 'ANSWER_KEY', label: 'Answer Keys' },
              { id: 'RESULT', label: 'Results & Merit' },
              { id: 'IMPORTANT_ADVISORY', label: 'Official Advisories' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#f1f3ff] text-[#464555] hover:bg-[#e1e8fd] hover:text-[#3525cd]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* NOTIFICATIONS FEED */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[#f1f3ff]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#777587]">
              Verified Official Feed ({filteredNotices.length} Notices)
            </span>
            <span className="text-xs text-[#006c49] font-bold">
              Provenance Certified
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[#777587]">
              Checking official registries and loading verified notices...
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#e9edff] space-y-2">
              <StitchIcon name="info" size={24} className="mx-auto text-[#777587]" />
              <p className="text-sm font-bold text-[#141b2b]">No official notices match this filter.</p>
              <p className="text-xs text-[#777587]">
                We only show authentic government publications. Unverified news is strictly excluded.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredNotices.map((notice) => {
                const alertStyle = getAlertBadge(notice.alertLevel);
                const isHistorical = notice.isHistorical;

                return (
                  <div
                    key={notice.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      !notice.isRead
                        ? 'bg-white border-[#3525cd]/40 shadow-sm ring-1 ring-[#3525cd]/10'
                        : 'bg-white border-[#e9edff] hover:border-[#c3c0ff] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Badges strip */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Alert Level */}
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${alertStyle.bg} ${alertStyle.text} ${alertStyle.border}`}>
                            {notice.alertLevel.replace(/_/g, ' ')}
                          </span>

                          {/* Authority */}
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#e1e8fd] text-[#3525cd]">
                            {notice.authority}
                          </span>

                          {/* Year / Historical Tag */}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            isHistorical ? 'bg-[#fff3e0] text-[#e65100]' : 'bg-[#e8f5e9] text-[#2e7d32]'
                          }`}>
                            {notice.examYear ? `NEET UG ${notice.examYear}` : 'General Official Notice'}
                            {isHistorical && ' (Historical)'}
                          </span>

                          {notice.noticeNumber && (
                            <span className="text-[10px] font-mono text-[#777587]">
                              Ref: {notice.noticeNumber}
                            </span>
                          )}

                          <span className="text-[11px] text-[#777587] ml-auto">
                            Published: {new Date(notice.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-base text-[#141b2b] leading-snug">
                          {notice.title}
                        </h3>

                        {/* Grounded AI Summary */}
                        {notice.aiSummary && (
                          <div className="p-3.5 rounded-2xl bg-[#f9f9ff] border border-[#e9edff] space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-[#3525cd] flex items-center gap-1">
                                <StitchIcon name="auto_awesome" size={13} />
                                <span>AI Summary • Grounded on Official Notice</span>
                              </span>
                              <span className="text-[9px] text-[#777587]">
                                Non-authoritative metadata
                              </span>
                            </div>
                            <p className="text-xs text-[#464555] leading-relaxed">
                              {notice.aiSummary}
                            </p>
                            {notice.aiSummaryEvidence && (
                              <p className="text-[10px] text-[#777587] italic border-t border-[#f1f3ff] pt-1">
                                Evidence: {notice.aiSummaryEvidence}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Student Action Required if any */}
                        {notice.studentActionRequired && (
                          <div className="p-2.5 rounded-xl bg-[#fff8e1] border border-[#ffe082] text-xs font-semibold text-[#b78103] flex items-center gap-1.5">
                            <StitchIcon name="warning" size={15} />
                            <span>Action Required: {notice.studentActionRequired}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0 pt-1">
                        {!notice.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notice.id, e)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#3525cd] bg-[#e1e8fd] hover:bg-[#3525cd] hover:text-white transition-all cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}

                        {notice.officialDocumentUrl ? (
                          <a
                            href={notice.officialDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#141b2b] bg-[#f1f3ff] hover:bg-[#e1e8fd] transition-all flex items-center gap-1"
                          >
                            <StitchIcon name="download" size={14} />
                            <span>Official PDF</span>
                          </a>
                        ) : (
                          <a
                            href={notice.officialSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#141b2b] bg-[#f1f3ff] hover:bg-[#e1e8fd] transition-all flex items-center gap-1"
                          >
                            <StitchIcon name="open_in_new" size={14} />
                            <span>Official Portal</span>
                          </a>
                        )}

                        <Link
                          href={`/nta-notifications/${notice.id}`}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#3525cd] hover:bg-[#2b1ea8] transition-all flex items-center gap-1 shadow-xs"
                        >
                          <span>Full Intelligence</span>
                          <StitchIcon name="arrow_forward" size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
