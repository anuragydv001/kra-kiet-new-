"use client";

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentCode } from '../../types/kra';

export default function VCAnnouncements() {
  const { departments, announcements, createAnnouncement, showToast } = useApp();

  const [title, setTitle] = useState(
    'Urgent: KRA evidence documentation submission deadline for July-August cycle'
  );
  const [priority, setPriority] = useState<'High / Urgent' | 'Normal' | 'Informational'>(
    'High / Urgent'
  );
  const [deadline, setDeadline] = useState('2026-10-10');
  const [message, setMessage] = useState(
    'All Deans and HODs must finalize the documentation verification along with Scopus publication IDs and industry internship completion certificates for the respective KRA thresholds by 10th October 2026.'
  );
  const [selectedDepts, setSelectedDepts] = useState<DepartmentCode[]>([
    'CSE',
    'IT',
    'ECE',
    'EEE',
    'ME',
    'CSE (AI)',
    'CSE (AIML)',
    'KSOM',
  ]);

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedDepts(departments.map((d) => d.code));
    } else {
      setSelectedDepts([]);
    }
  };

  const handleToggleDept = (code: DepartmentCode) => {
    setSelectedDepts((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Please provide both circular title and message directive.', 'error');
      return;
    }
    if (selectedDepts.length === 0) {
      showToast('Please select at least one department to receive the directive.', 'error');
      return;
    }

    createAnnouncement({
      title,
      priority,
      deadline,
      message,
      targetDepts: selectedDepts,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcement Form */}
        <form
          onSubmit={handleDispatch}
          className="lg:col-span-2 bg-white p-6 rounded-lg border border-[#c5c5d3]/70 shadow-xs space-y-4"
        >
          <div>
            <h2 className="text-[18px] font-bold text-[#0b1c30]">
              Compose VC Institutional Directive & Reminders
            </h2>
            <p className="text-[13px] text-[#515f74]">
              Dispatch compliance circulars, timeline deadlines, and IQAC notifications directly to selected Deans.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0b1c30] mb-1">
              Subject / Circular Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border-[#c5c5d3] text-[13px] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded border-[#c5c5d3] text-[13px] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden"
              >
                <option value="High / Urgent">High / Urgent (Red Banner)</option>
                <option value="Normal">Normal Advisory</option>
                <option value="Informational">Informational Circular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                Submission Strict Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded border-[#c5c5d3] text-[13px] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0b1c30] mb-1">
              Detailed Circular Directive & Action Instructions *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded border-[#c5c5d3] text-[13px] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
              required
            />
          </div>

          {/* Department Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#0b1c30]">
                Target Departments ({selectedDepts.length} selected):
              </label>
              <div className="space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="text-[#00236f] hover:underline font-semibold"
                >
                  Select All (13)
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="text-[#515f74] hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f8f9ff] p-3 rounded border border-[#c5c5d3]/70">
              {departments.map((d) => (
                <label key={d.code} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDepts.includes(d.code)}
                    onChange={() => handleToggleDept(d.code)}
                    className="rounded text-[#00236f] focus:ring-0"
                  />
                  <span>{d.code}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#00236f] hover:bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-xs font-bold flex items-center gap-2 shadow-xs transition"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Send Institutional Reminder to Deans</span>
          </button>
        </form>

        {/* Active Published Circulars Stream */}
        <div className="bg-white p-6 rounded-lg border border-[#c5c5d3]/70 shadow-xs space-y-4">
          <h3 className="text-[16px] font-bold text-[#0b1c30]">Active Published Circulars</h3>

          <div className="space-y-3">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-[#c5c5d3]/60 bg-[#f8f9ff] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.priority.includes('Urgent')
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-blue-100 text-[#00236f] border border-blue-200'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[11px] font-mono text-[#515f74]">Due: {item.deadline}</span>
                </div>
                <h4 className="text-xs font-bold text-[#0b1c30] leading-snug">{item.title}</h4>
                <p className="text-[11px] text-[#515f74] line-clamp-2">{item.message}</p>
                <div className="text-[10px] text-[#515f74] pt-1 border-t border-slate-200 flex justify-between">
                  <span>
                    To:{' '}
                    <strong>
                      {item.targetDepts.length === 13 ? 'All 13 Departments' : item.targetDepts.join(', ')}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
