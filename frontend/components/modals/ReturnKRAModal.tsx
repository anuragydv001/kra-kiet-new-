"use client";

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ReturnKRAModal({
  submissionId,
  isOpen,
  onClose,
}: {
  submissionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { returnSubmission, submissions, showToast } = useApp();

  const [reason, setReason] = useState(
    'Annexure 4B missing Scopus author affiliation verification for 3 journal articles. Please re-upload certified department spreadsheet.'
  );

  if (!isOpen || !submissionId) return null;

  const sub = submissions.find((s) => s.id === submissionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please state a valid reason or observation for return.', 'error');
      return;
    }

    returnSubmission(submissionId, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-rose-200 max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-700">
          <span className="material-symbols-outlined text-2xl">assignment_return</span>
          <h3 className="text-[18px] font-bold">Return KRA Submission to Dean</h3>
        </div>

        <p className="text-xs text-[#515f74]">
          Submission: <strong>{sub?.id}</strong> • Department: <strong>{sub?.dept}</strong> ({sub?.kraCode})
        </p>
        <p className="text-xs text-[#515f74]">
          Please state administrative observations or missing accreditation artifacts required from the department before re-evaluation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0b1c30] mb-1">
              Reason for Return / Action Items *
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs rounded border-[#c5c5d3] focus:border-rose-600 focus:ring-1 focus:ring-rose-600 px-3 py-2 bg-[#f8f9ff] border"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-[#c5c5d3] text-[#515f74] px-4 py-2 rounded text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded text-xs font-bold shadow-xs transition"
            >
              Dispatch Return Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
