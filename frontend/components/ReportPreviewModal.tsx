"use client";

import React from 'react';
import { downloadHtmlFile } from '../services/reportDoc';

export interface ReportPreviewState {
  title: string;
  html: string;
  fileName: string;
}

export default function ReportPreviewModal({
  preview,
  onClose,
}: {
  preview: ReportPreviewState | null;
  onClose: () => void;
}) {
  if (!preview) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#c5c5d3]/70 w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#c5c5d3]/70 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[#00236f] text-[26px]">description</span>
            <h3 className="text-[16px] font-bold text-[#0b1c30] truncate">{preview.title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => downloadHtmlFile(preview.html, preview.fileName)}
              className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#515f74] hover:text-[#0b1c30] p-1.5 rounded transition"
              title="Close preview"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-[#eff4ff] p-3">
          <iframe
            title={preview.title}
            srcDoc={preview.html}
            className="w-full h-[72vh] bg-white rounded border border-[#c5c5d3]/70"
          />
        </div>
      </div>
    </div>
  );
}
