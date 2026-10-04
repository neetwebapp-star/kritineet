'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AssessmentIntelligenceOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/assessment-intelligence')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white p-8">Loading assessment cohort intelligence...</div>;
  }

  const {
    summary,
    statusDistribution,
    confidenceDistribution,
    discriminationDistribution,
    difficultyMigration,
    distractorDistribution,
    anomalies,
    testQualityDistribution,
  } = data || {};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Title */}
        <div>
          <Link
            href="/admin/question-intelligence"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mb-3"
          >
            ← Back to Item Intelligence
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                📊 Assessment Psychometrics & Cohort Analytics
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Macro-level item bank reliability, discrimination distribution, and difficulty drift analytics
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/question-intelligence"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition"
              >
                Item Bank Search
              </Link>
            </div>
          </div>
        </div>

        {/* Global Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Item Bank</span>
            <div className="text-3xl font-bold text-white mt-1">{summary?.totalQuestions ?? 0}</div>
            <div className="text-xs text-slate-400 mt-1">
              Active: {statusDistribution?.ACTIVE ?? 0}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Calibrated Items</span>
            <div className="text-3xl font-bold text-emerald-400 mt-1">
              {(confidenceDistribution?.HIGH ?? 0) + (confidenceDistribution?.MEDIUM ?? 0)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Medium / High sample confidence
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Responses Evaluated</span>
            <div className="text-3xl font-bold text-indigo-400 mt-1">{summary?.totalResponses ?? 0}</div>
            <div className="text-xs text-slate-400 mt-1">
              {summary?.studentBaselinesCount ?? 0} student baselines
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Average Test Quality</span>
            <div className="text-3xl font-bold text-white mt-1">
              {summary?.avgAssessmentQuality ? `${Math.round(summary.avgAssessmentQuality * 100)}%` : 'N/A'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Across blueprint evaluations
            </div>
          </div>
        </div>

        {/* 2x2 Grid of Psychometric Distributions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discrimination Distribution */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Discrimination Index (D) Distribution</span>
              <span className="text-xs text-slate-400 font-normal">Upper vs Lower Group</span>
            </h3>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-medium">Excellent (D &ge; 0.40)</span>
                  <span className="text-slate-300 font-bold">{discriminationDistribution?.excellent ?? 0}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, ((discriminationDistribution?.excellent ?? 0) / (summary?.totalQuestions || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-400 font-medium">Good (0.30 - 0.39)</span>
                  <span className="text-slate-300 font-bold">{discriminationDistribution?.good ?? 0}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, ((discriminationDistribution?.good ?? 0) / (summary?.totalQuestions || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-400 font-medium">Marginal (0.20 - 0.29)</span>
                  <span className="text-slate-300 font-bold">{discriminationDistribution?.marginal ?? 0}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, ((discriminationDistribution?.marginal ?? 0) / (summary?.totalQuestions || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-400 font-medium">Poor / Negative (&lt; 0.20)</span>
                  <span className="text-slate-300 font-bold">
                    {(discriminationDistribution?.poor ?? 0) + (discriminationDistribution?.negative ?? 0)}
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-rose-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (((discriminationDistribution?.poor ?? 0) + (discriminationDistribution?.negative ?? 0)) / (summary?.totalQuestions || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Uncalibrated (&lt; 10 attempts)</span>
                  <span className="text-slate-400">{discriminationDistribution?.uncalibrated ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Migration: Authored vs Observed */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Difficulty Calibration Drift</span>
              <span className="text-xs text-slate-400 font-normal">Authored vs Empirical</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-emerald-400 font-medium block">Easier than Authored</span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {difficultyMigration?.easierThanAuthored ?? 0}
                </span>
                <span className="text-[10px] text-slate-500">Empirical accuracy higher</span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-indigo-400 font-medium block">As Authored</span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {difficultyMigration?.asAuthored ?? 0}
                </span>
                <span className="text-[10px] text-slate-500">Perfect alignment</span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-rose-400 font-medium block">Harder than Authored</span>
                <span className="text-2xl font-bold text-white mt-1 block">
                  {difficultyMigration?.harderThanAuthored ?? 0}
                </span>
                <span className="text-[10px] text-slate-500">Empirical accuracy lower</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/40 rounded-lg text-xs text-slate-400 border border-slate-800/80">
              💡 Adaptive Selection 2.0 uses observed difficulty when sample confidence reaches MEDIUM or HIGH, falling back strictly to authored difficulty for uncalibrated questions.
            </div>
          </div>

          {/* Distractor Effectiveness */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Distractor Performance Categorization
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-semibold block">Key (Correct Options)</span>
                <span className="text-xl font-bold text-white mt-1 block">{distractorDistribution?.KEY ?? 0}</span>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-indigo-400 font-semibold block">Strong Distractors</span>
                <span className="text-xl font-bold text-white mt-1 block">{distractorDistribution?.STRONG ?? 0}</span>
                <span className="text-[10px] text-slate-500">Pulls 10-30% incorrect volume</span>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-semibold block">Weak Distractors</span>
                <span className="text-xl font-bold text-white mt-1 block">{distractorDistribution?.WEAK ?? 0}</span>
                <span className="text-[10px] text-slate-500">&lt; 5% chosen</span>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-rose-400 font-semibold block">Ambiguous / Suspicious</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {(distractorDistribution?.AMBIGUOUS ?? 0) + (distractorDistribution?.SUSPICIOUS ?? 0)}
                </span>
                <span className="text-[10px] text-slate-500">Requires editorial review</span>
              </div>
            </div>
          </div>

          {/* Anomaly Overview */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Item Anomaly Breakdown
            </h3>

            {anomalies?.length === 0 ? (
              <p className="text-xs text-slate-400">No anomalies flagged in system.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {anomalies?.map((a: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-900/60 rounded-lg text-xs border border-slate-800">
                    <span className="font-medium text-slate-300">{a.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{a.status}</span>
                      <span className="font-bold text-rose-400">{a.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
