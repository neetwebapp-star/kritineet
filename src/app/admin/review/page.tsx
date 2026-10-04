'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Edit3,
  FileText,
  AlertTriangle,
  Save,
  ArrowLeft,
  RefreshCw,
  Search,
  ExternalLink,
  GitMerge,
  Flag,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function AdminReviewCenterPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [qualityBandFilter, setQualityBandFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modals / Inputs
  const [showMergeInput, setShowMergeInput] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const fetchQuestions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== 'ALL') params.set('status', filterStatus);
    if (sourceFilter !== 'ALL') params.set('source', sourceFilter);
    if (typeFilter !== 'ALL') params.set('type', typeFilter);
    if (qualityBandFilter !== 'ALL') params.set('qualityBand', qualityBandFilter);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());

    fetch(`/api/admin/questions?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setQuestions(json.questions || []);
        if (json.questions?.length > 0) {
          // If current selectedQuestion is still in the list, keep it; else select first
          const existing = json.questions.find((q: any) => q.id === selectedQuestion?.id);
          setSelectedQuestion(existing || json.questions[0]);
          setFormData(existing || json.questions[0]);
        } else {
          setSelectedQuestion(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, [filterStatus, sourceFilter, typeFilter, qualityBandFilter]);

  const handleSelectQuestion = (q: any) => {
    setSelectedQuestion(q);
    setFormData(q);
    setIsEditing(false);
    setShowMergeInput(false);
    setShowFlagInput(false);
  };

  const handleAction = async (action: 'APPROVE' | 'EDIT' | 'REJECT' | 'MARK_VERIFIED' | 'MERGE' | 'FLAG') => {
    if (!selectedQuestion) return;
    setStatusMessage(`Processing ${action}...`);

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          action,
          questionText: formData.questionText,
          correctOption: formData.correctOption,
          explanation: formData.explanation,
          difficulty: formData.difficulty,
          options: formData.options,
          targetQuestionId: action === 'MERGE' ? mergeTargetId : undefined,
          flagReason: action === 'FLAG' ? flagReason : undefined,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setStatusMessage(`Successfully executed ${action} for ${selectedQuestion.id}`);
        setIsEditing(false);
        setShowMergeInput(false);
        setShowFlagInput(false);
        setMergeTargetId('');
        setFlagReason('');
        fetchQuestions();
      } else {
        setStatusMessage(`Error: ${json.error}`);
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Content Review &amp; Quality Workbench (Phase 3)
            </h1>
            <p className="text-xs text-slate-400">Three-Column Audit: Source Provenance ↔ Structured Content ↔ AI Verification</p>
          </div>
        </div>

        {/* Source Filter Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSourceFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sourceFilter === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Sources
          </button>
          <button
            onClick={() => setSourceFilter('PYQ')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              sourceFilter === 'PYQ' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3 text-blue-300" /> PYQs
          </button>
          <button
            onClick={() => setSourceFilter('FINGERTIPS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              sourceFilter === 'FINGERTIPS' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-300" /> Fingertips
          </button>
          <button
            onClick={() => setSourceFilter('NCERT')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              sourceFilter === 'NCERT' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3 h-3 text-emerald-300" /> NCERT
          </button>
        </div>
      </header>

      {/* Filter Ribbon */}
      <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-2.5 flex flex-wrap items-center gap-3 text-xs">
        {/* Verification Status */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="DUPLICATE_CANDIDATE">Duplicate Candidate</option>
            <option value="FLAGGED">Flagged</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Question Type */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="SINGLE_CORRECT">Single Correct</option>
            <option value="STATEMENT_BASED">Statement Based</option>
            <option value="ASSERTION_REASON">Assertion-Reason</option>
            <option value="MATCHING">Matching</option>
            <option value="DIAGRAM_BASED">Diagram Based</option>
            <option value="NUMERICAL">Numerical</option>
            <option value="PASSAGE">Passage</option>
          </select>
        </div>

        {/* Quality Band */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">Quality:</span>
          <select
            value={qualityBandFilter}
            onChange={(e) => setQualityBandFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Quality Bands</option>
            <option value="VERIFIED">Verified (95-100)</option>
            <option value="GOOD">Good (85-94)</option>
            <option value="REVIEW_RECOMMENDED">Review Recommended (70-84)</option>
            <option value="NEEDS_REVIEW">Needs Review (&lt;70)</option>
          </select>
        </div>

        {/* Keyword Search */}
        <div className="flex items-center gap-2 flex-1 max-w-xs ml-auto">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search stem or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          </div>
          <button
            onClick={fetchQuestions}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            title="Search"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 text-emerald-300 text-xs px-6 py-2 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN (Cols 1-3): Question List & Source Document Info */}
        <div className="col-span-3 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-115px)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Questions ({questions.length})
            </span>
            <button onClick={fetchQuestions} className="text-slate-400 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {questions.map((q) => (
              <div
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedQuestion?.id === q.id
                    ? 'bg-slate-800/90 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-indigo-400 font-semibold">{q.id.slice(0, 16)}...</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      q.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : q.verificationStatus === 'DUPLICATE_CANDIDATE'
                        ? 'bg-purple-500/20 text-purple-300'
                        : q.verificationStatus === 'FLAGGED'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {q.verificationStatus}
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-2">{q.questionText}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    {q.sourceType} {q.examYear ? `(${q.examYear})` : ''}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {q.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Source Document Provenance Box */}
          {selectedQuestion && (
            <div className="mt-auto p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Source PDF Provenance
              </span>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p><span className="text-slate-500">Source:</span> <strong className="text-slate-200">{selectedQuestion.sourceType}</strong></p>
                {selectedQuestion.examName && (
                  <p><span className="text-slate-500">Exam/Year:</span> {selectedQuestion.examName} {selectedQuestion.examYear} ({selectedQuestion.yearConfidence || 'HIGH'})</p>
                )}
                {selectedQuestion.bookName && (
                  <p><span className="text-slate-500">Book:</span> {selectedQuestion.bookName}</p>
                )}
                <p><span className="text-slate-500">Original Q#:</span> {selectedQuestion.originalQuestionNumber || 'N/A'}</p>
                <p><span className="text-slate-500">Page:</span> {selectedQuestion.sourcePage || 1}</p>
                <p><span className="text-slate-500">Method:</span> {selectedQuestion.extractionMethod || 'PARSED'}</p>
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN (Cols 4-8): Extracted Content & Edit Studio */}
        <div className="col-span-5 border-r border-slate-800 p-6 overflow-y-auto max-h-[calc(100vh-115px)] space-y-5">
          {selectedQuestion ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Extracted Question Content</h2>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedQuestion.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/question/${selectedQuestion.id}`}
                    target="_blank"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Open native student preview"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditing ? 'Cancel Edit' : 'Edit Content'}
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => handleAction('EDIT')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Question Statement</label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={formData.questionText || ''}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {selectedQuestion.questionText}
                  </div>
                )}
              </div>

              {/* Attached Figures */}
              {selectedQuestion.figures && selectedQuestion.figures.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Attached Diagrams / Figures</label>
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    {selectedQuestion.figures.map((fig: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center">
                        <img
                          src={fig.assetPath}
                          alt={fig.caption || 'Extracted Figure'}
                          className="max-h-40 object-contain rounded border border-slate-800"
                        />
                        {fig.caption && (
                          <span className="text-[10px] text-slate-400 mt-1 italic text-center">{fig.caption}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options A, B, C, D */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Answer Options</label>
                <div className="space-y-2">
                  {formData.options?.map((opt: any, idx: number) => (
                    <div
                      key={opt.label}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                        formData.correctOption === opt.label
                          ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {opt.label}
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...formData.options];
                            newOpts[idx].text = e.target.value;
                            setFormData({ ...formData, options: newOpts });
                          }}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100"
                        />
                      ) : (
                        <span className="flex-1">{opt.text}</span>
                      )}
                      {formData.correctOption === opt.label && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          CORRECT
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Option Selector */}
              {isEditing && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Official Correct Answer Key</label>
                  <div className="flex gap-3">
                    {['A', 'B', 'C', 'D'].map((key) => (
                      <button
                        key={key}
                        onClick={() => setFormData({ ...formData, correctOption: key })}
                        className={`w-10 h-10 rounded-xl font-bold text-sm ${
                          formData.correctOption === key
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Verified Explanation</label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={formData.explanation || ''}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedQuestion.explanation || 'No explanation provided.'}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-sm">
              Select a question to inspect extracted content.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (Cols 9-12): AI Classification, Validation & Review Actions */}
        <div className="col-span-4 p-6 overflow-y-auto max-h-[calc(100vh-115px)] space-y-5 bg-slate-900/20">
          {selectedQuestion ? (
            <>
              <div>
                <h3 className="text-sm font-bold text-white">AI Classification &amp; Validation</h3>
                <p className="text-xs text-slate-400">Multi-Signal Intelligence Check</p>
              </div>

              {/* Quality Score Meter */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Composite Quality Score</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {(selectedQuestion.qualityScore * 100).toFixed(0)}% ({selectedQuestion.qualityBand || 'VERIFIED'})
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedQuestion.qualityScore * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400">
                  <div>OCR Conf: <span className="text-white font-medium">{(selectedQuestion.ocrConfidence * 100).toFixed(0)}%</span></div>
                  <div>Answer Status: <span className="text-emerald-400 font-medium">{selectedQuestion.answerValidationStatus || 'VERIFIED'}</span></div>
                </div>
              </div>

              {/* Mapped NCERT Concept */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300">Linked NCERT Concept</span>
                <div className="p-2.5 rounded-lg bg-slate-950 text-xs space-y-1">
                  <p className="font-semibold text-emerald-400">{selectedQuestion.primaryConcept?.name || 'General Physics / Biology / Chemistry'}</p>
                  <p className="text-[10px] text-slate-400">Chapter: {selectedQuestion.chapter?.title}</p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                    <span>Confidence: <strong className="text-slate-300">{selectedQuestion.linkConfidence || 'HIGH'}</strong></span>
                    <span>•</span>
                    <span>Method: <strong className="text-slate-300">{selectedQuestion.linkMethod || 'EXACT_TERM'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Quality Flags / Warnings */}
              {selectedQuestion.qualityFlags && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Validation Flags
                  </span>
                  <p className="text-[11px] text-amber-200/80 font-mono break-words">
                    {selectedQuestion.qualityFlags}
                  </p>
                </div>
              )}

              {/* Review Actions Panel */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Review &amp; Lifecycle Actions
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAction('APPROVE')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve &amp; Publish
                  </button>
                  <button
                    onClick={() => handleAction('REJECT')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition"
                  >
                    <XCircle className="w-4 h-4" /> Reject Question
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowMergeInput(!showMergeInput)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold text-xs transition"
                  >
                    <GitMerge className="w-3.5 h-3.5" /> Merge Duplicate
                  </button>
                  <button
                    onClick={() => setShowFlagInput(!showFlagInput)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs transition"
                  >
                    <Flag className="w-3.5 h-3.5" /> Flag for Review
                  </button>
                </div>

                {/* Merge Input Drawer */}
                {showMergeInput && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2">
                    <label className="text-[11px] text-purple-300 font-semibold">Target Canonical Question ID to Merge Into:</label>
                    <input
                      type="text"
                      placeholder="e.g. Q_PYQ_NEET_2024_001"
                      value={mergeTargetId}
                      onChange={(e) => setMergeTargetId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                    <button
                      onClick={() => handleAction('MERGE')}
                      disabled={!mergeTargetId.trim()}
                      className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50"
                    >
                      Confirm Merge
                    </button>
                  </div>
                )}

                {/* Flag Input Drawer */}
                {showFlagInput && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                    <label className="text-[11px] text-amber-300 font-semibold">Reason for Flagging:</label>
                    <input
                      type="text"
                      placeholder="e.g. Stem missing symbol or option conflict"
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                    <button
                      onClick={() => handleAction('FLAG')}
                      disabled={!flagReason.trim()}
                      className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs disabled:opacity-50"
                    >
                      Confirm Flag
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              No question selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
