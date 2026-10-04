'use client';

import React from 'react';
import { StitchIcon } from '@/components/stitch/StitchIcon';

interface NCERTTableCardProps {
  tables: Array<{
    id: string;
    tableNumber: string;
    caption: string;
    htmlContent: string;
    pageNumber?: number;
  }>;
}

export const NCERTTableCard: React.FC<NCERTTableCardProps> = ({ tables }) => {
  if (!tables || tables.length === 0) return null;

  return (
    <div className="space-y-4">
      {tables.map((table) => (
        <div
          key={table.id}
          className="bg-white rounded-2xl border border-[#e2e7f8] shadow-xs overflow-hidden transition-all hover:border-[#c3c0ff]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#f8f9ff] border-b border-[#e2e7f8]">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#eeedfe] text-[#3525cd] flex items-center justify-center">
                <StitchIcon name="table_chart" size={16} />
              </span>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#141b2b]">
                  NCERT Table {table.tableNumber}
                </h4>
                {table.caption && (
                  <p className="text-[11px] text-[#464555] line-clamp-1">{table.caption}</p>
                )}
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0fbf5] text-[#006c49] border border-[#c0efd9]">
              Canonical Table
            </span>
          </div>

          {/* Table Content */}
          <div className="p-4 overflow-x-auto text-xs text-[#141b2b]">
            <div
              className="ncert-table-wrapper prose prose-sm max-w-none [&>table]:w-full [&>table]:border-collapse [&>table]:text-left [&>table_th]:bg-[#f1f3ff] [&>table_th]:p-2.5 [&>table_th]:font-bold [&>table_th]:text-[#3525cd] [&>table_th]:border [&>table_th]:border-[#d8e0ff] [&>table_td]:p-2.5 [&>table_td]:border [&>table_td]:border-[#e2e7f8] [&>table_tr:nth-child(even)]:bg-[#fafbff]"
              dangerouslySetInnerHTML={{ __html: table.htmlContent }}
            />
          </div>

          {table.pageNumber && (
            <div className="px-4 py-2 bg-[#fdfdff] border-t border-[#f1f3ff] text-right">
              <span className="text-[10px] font-medium text-[#777587]">
                NCERT Textbook Page {table.pageNumber}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
