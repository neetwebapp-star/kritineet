'use client';

import React, { useState } from 'react';
import { StitchIcon } from './StitchIcon';

export interface NumericalScaffoldProps {
  questionText: string;
  subjectCode?: string;
  formula?: string | null;
  explanation?: string | null;
  defaultOpen?: boolean;
}

export function NumericalScaffold({
  questionText,
  subjectCode = 'PHYSICS',
  formula,
  explanation,
  defaultOpen = false,
}: NumericalScaffoldProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'given' | 'formula' | 'subst' | 'sanity'>('given');

  const isCalculationSubject = subjectCode === 'PHYSICS' || subjectCode === 'CHEMISTRY';
  if (!isCalculationSubject) return null;

  // Derive initial values from explanation / question if available
  const detectedFormula = formula || 'Applicable standard NEET physics equation';

  return (
    <div className="mt-3 border border-[#d2e4ff] bg-[#f8fbff] rounded-2xl p-4 transition shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#004a77] text-white flex items-center justify-center">
            <StitchIcon name="calculate" size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00629d]">
              Calculation Scaffold (Anti-Guessing Framework)
            </span>
            <h4 className="text-xs font-headline font-bold text-[#141b2b]">
              4-Step Numerical Problem Solving Framework
            </h4>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-[#c2e7ff] text-[#004a77] hover:bg-[#eaf5ff] transition flex items-center gap-1"
        >
          <span>{isOpen ? 'Collapse Scaffold' : 'Open 4-Step Scaffold'}</span>
          <StitchIcon name={isOpen ? 'expand_less' : 'expand_more'} size={14} />
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-[#d2e4ff]/60 space-y-4">
          {/* Step indicator tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#eaf2fc] rounded-xl text-xs font-headline font-semibold">
            <button
              onClick={() => setActiveTab('given')}
              className={`py-1.5 px-2 rounded-lg text-center transition ${
                activeTab === 'given' ? 'bg-white text-[#004a77] shadow-xs font-bold' : 'text-[#464555]'
              }`}
            >
              1. Given Data
            </button>
            <button
              onClick={() => setActiveTab('formula')}
              className={`py-1.5 px-2 rounded-lg text-center transition ${
                activeTab === 'formula' ? 'bg-white text-[#004a77] shadow-xs font-bold' : 'text-[#464555]'
              }`}
            >
              2. Governing Formula
            </button>
            <button
              onClick={() => setActiveTab('subst')}
              className={`py-1.5 px-2 rounded-lg text-center transition ${
                activeTab === 'subst' ? 'bg-white text-[#004a77] shadow-xs font-bold' : 'text-[#464555]'
              }`}
            >
              3. Substitution Steps
            </button>
            <button
              onClick={() => setActiveTab('sanity')}
              className={`py-1.5 px-2 rounded-lg text-center transition ${
                activeTab === 'sanity' ? 'bg-white text-[#004a77] shadow-xs font-bold' : 'text-[#464555]'
              }`}
            >
              4. Sanity & Units
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="bg-white rounded-xl p-4 border border-[#e1ecf8] text-xs space-y-2">
            {activeTab === 'given' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[#004a77] font-bold">
                  <StitchIcon name="inventory_2" size={16} />
                  <span>Step 1: Identify Given Physical Quantities & Target Unknown</span>
                </div>
                <p className="text-[#464555] leading-relaxed">
                  Before jumping into calculations, extract numerical values and convert all quantities into standard SI units:
                </p>
                <div className="p-2.5 rounded-lg bg-[#f0f7ff] border border-[#d6eaff] font-mono text-[11px] text-[#003355]">
                  &bull; Check for non-SI units (e.g. cm &rarr; m, km/h &rarr; m/s, g &rarr; kg, mL &rarr; L)<br />
                  &bull; Extract knowns and state the exact target variable to isolate.
                </div>
              </div>
            )}

            {activeTab === 'formula' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[#004a77] font-bold">
                  <StitchIcon name="functions" size={16} />
                  <span>Step 2: State Applicable Formula</span>
                </div>
                <p className="text-[#464555] leading-relaxed">
                  Direct formula linkage connecting the given quantities to the target:
                </p>
                <div className="p-3 rounded-lg bg-[#f0f7ff] border border-[#d6eaff] font-mono text-xs text-[#002a45] font-bold">
                  {detectedFormula}
                </div>
              </div>
            )}

            {activeTab === 'subst' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[#004a77] font-bold">
                  <StitchIcon name="reorder" size={16} />
                  <span>Step 3: Systematic Algebraic Substitution</span>
                </div>
                <p className="text-[#464555] leading-relaxed">
                  Isolate the unknown algebraically FIRST, then substitute numerical values to minimize arithmetic mistakes:
                </p>
                <div className="p-2.5 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[#333] leading-relaxed">
                  {explanation ? (
                    <div className="whitespace-pre-line">{explanation}</div>
                  ) : (
                    <span className="italic text-[#777]">
                      Substitute the extracted values with powers of 10 kept separate for clean simplification.
                    </span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'sanity' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[#004a77] font-bold">
                  <StitchIcon name="fact_check" size={16} />
                  <span>Step 4: Unit & Magnitude Sanity Check (NEET Trap Prevention)</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[#464555] leading-relaxed">
                  <li><strong>Dimensional Consistency:</strong> Does the final answer carry the expected unit ($J, W, m/s^2, mol/L$)?</li>
                  <li><strong>Magnitude Bounds:</strong> Is the magnitude physically possible? (e.g., speed of particle cannot exceed $3 \times 10^8$ m/s, mass &gt; 0).</li>
                  <li><strong>Order of Magnitude:</strong> Check exponent power (did you multiply by $10^{-3}$ instead of $10^3$?).</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
