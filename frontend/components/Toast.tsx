"use client";

import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  if (!toast.show) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300 pointer-events-auto bg-[#0b1c30] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-medium max-w-md">
      <span
        className={`material-symbols-outlined text-lg ${
          isError ? 'text-rose-400' : isInfo ? 'text-blue-400' : 'text-emerald-400'
        }`}
      >
        {isError ? 'error' : isInfo ? 'info' : 'check_circle'}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}
