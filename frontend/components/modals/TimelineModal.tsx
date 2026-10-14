"use client";

import React from 'react';
import { useApp } from '../../context/AppContext';

export default function TimelineModal() {
  const { timelineModalSubmission, closeTimelineModal, submissions } = useApp();

  if (!timelineModalSubmission) return null;

  const currentSub =
    submissions.find((s) => s.id === timelineModalSubmission.id) || timelineModalSubmission;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-[#c5c5d3]/70 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          <div className="flex items-center justify-between border-b border-[#c5c5d3]/70 pb-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00236f] text-2xl">history</span>
              <div>
                <h3 className="text-[17px] font-bold text-[#0b1c30]">Institutional Audit Trail</h3>
                <p className="text-[11px] text-[#515f74]">
                  {currentSub.kraCode} • {currentSub.dept} ({currentSub.cycle})
                </p>
              </div>
            </div>
            <button
              onClick={closeTimelineModal}
              className="text-[#515f74] hover:text-[#0b1c30] p-1 rounded"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#c5c5d3]">
            {currentSub.timeline.map((event, index) => {
              const isLast = index === currentSub.timeline.length - 1;
              const isApproved = event.stage === 'Approved';
              const isReturned = event.stage === 'Returned';
              const isReview = event.stage === 'Under Review';

              let dotClass = 'bg-[#515f74] ring-slate-100';
              if (isApproved) dotClass = 'bg-emerald-600 ring-emerald-100 text-white font-bold';
              else if (isReturned) dotClass = 'bg-rose-600 ring-rose-100 text-white font-bold';
              else if (isReview) dotClass = 'bg-[#00236f] ring-blue-100';

              return (
                <div key={event.id} className="relative">
                  <span
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full ring-4 flex items-center justify-center text-[9px] ${dotClass}`}
                  >
                    {isApproved ? '✓' : isReturned ? '!' : ''}
                  </span>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#0b1c30]">{event.stage}</p>
                      {isLast && (
                        <span className="text-[10px] bg-blue-50 text-[#00236f] px-1.5 py-0.2 rounded font-semibold border border-blue-200">
                          Current State
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#515f74]">
                      {event.date} • {event.actor}
                    </p>

                    {event.remarks && (
                      <p
                        className={`text-xs mt-1 p-2 rounded border ${
                          isApproved
                            ? 'text-emerald-900 bg-emerald-50 border-emerald-200'
                            : isReturned
                            ? 'text-rose-900 bg-rose-50 border-rose-200'
                            : 'text-[#0b1c30] bg-slate-50 border-slate-200'
                        }`}
                      >
                        {event.remarks}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-[#c5c5d3]/70">
          <button
            onClick={closeTimelineModal}
            className="w-full py-2 bg-[#e5eeff] hover:bg-[#d5e3fc] text-[#0b1c30] font-semibold text-xs rounded transition"
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
