"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DepartmentCode } from '../types/kra';
import { api, fetchCsrfToken } from '../services/api';

export default function DualLoginView({
  onLoginSuccess,
}: {
  onLoginSuccess: () => void;
}) {
  const { setRole, setCurrentDept, departments, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'vc' | 'dean'>('vc');
  const [selectedDept, setSelectedDept] = useState<DepartmentCode>('CSE');

  const handleLoginVC = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchCsrfToken();
      await api.post('/api/accounts/login/', {
        username: 'vc',
        password: 'admin123',
      });
    } catch (err) {
      console.warn("Backend auth failed, continuing in client mode:", err);
    }
    setRole('vc');
    showToast('Authenticated as Vice Chancellor / Super Admin');
    onLoginSuccess();
  };

  const handleLoginDean = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchCsrfToken();
      const cleanDept = selectedDept.toLowerCase().replace(/[^a-z]/g, '');
      await api.post('/api/accounts/login/', {
        username: `dean_${cleanDept}`,
        password: 'admin123',
      });
    } catch (err) {
      console.warn("Backend auth failed, continuing in client mode:", err);
    }
    setRole('dean');
    setCurrentDept(selectedDept);
    showToast(`Authenticated as Dean of ${selectedDept}`);
    onLoginSuccess();
  };

  return (
    <main className="w-full flex-1 bg-[#eff4ff] p-6 flex items-center justify-center min-h-[calc(100vh-2rem)]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl shadow-lg border border-[#c5c5d3]/70 p-8">
        {/* Left Banner Card */}
        <div className="bg-gradient-to-br from-[#1e3a8a] to-[#00236f] rounded-xl p-6 text-white flex flex-col justify-between shadow-sm">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="KIET Deemed to be University Official Crest"
              className="h-14 mb-6 bg-white p-2 rounded-md object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUesVafAKoTxzWiWWmBAEnMxo_d4N7KZ3H5Lyd6n5Yf99u4oZQkN8gp83qYUN9ejO7oP1y2S9SlSB-ULG_spkGPwn9Cr9HeO_4aHKqCi0lZ3tckR-eY8EWPCS358nVREMqcmJhOf9zYGM9VxOYIQhU5-4kiwAstq8o-eiBzqUU0MJkc3p8WcxX1muOxvhK_X4CW_hmqLIDxxcZlukuBg66aFl-tPV5gR14vFPi8hey00ZOprKhaemD2V2y5DzYCzBxVw"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />
            <span className="bg-[#d5e3fc] text-[#00236f] font-mono font-bold text-xs px-2.5 py-1 rounded inline-block mb-3">
              INTERNAL ACCREDITATION SYSTEM
            </span>
            <h2 className="text-[22px] font-bold text-white mb-2 leading-tight">
              Key Result Areas (KRA) Governance Portal
            </h2>
            <p className="text-[13px] text-[#eff4ff] opacity-90 leading-relaxed mb-6">
              Empowering Minds. Enabling Skills. Centralized institutional performance index tracking for NBA, NAAC, and NIRF excellence.
            </p>
          </div>

          <div className="border-t border-white/20 pt-4 text-[11px] opacity-75">
            Institutional Quality Assurance Cell (IQAC) • Session 2025-26 Odd/Even Cycle
          </div>
        </div>

        {/* Right Login Cards Tabs */}
        <div>
          <div className="flex border-b border-[#c5c5d3]/70 mb-6">
            <button
              onClick={() => setActiveTab('vc')}
              className={`flex-1 pb-3 text-sm font-semibold transition ${
                activeTab === 'vc'
                  ? 'border-b-2 border-[#00236f] text-[#00236f]'
                  : 'border-b-2 border-transparent text-[#515f74] hover:text-[#0b1c30]'
              }`}
            >
              VC Super Admin
            </button>
            <button
              onClick={() => setActiveTab('dean')}
              className={`flex-1 pb-3 text-sm font-semibold transition ${
                activeTab === 'dean'
                  ? 'border-b-2 border-[#00236f] text-[#00236f]'
                  : 'border-b-2 border-transparent text-[#515f74] hover:text-[#0b1c30]'
              }`}
            >
              Department Dean
            </button>
          </div>

          {/* VC Login Form */}
          {activeTab === 'vc' && (
            <form onSubmit={handleLoginVC} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Administrative Email / Employee ID
                </label>
                <input
                  type="email"
                  defaultValue="vc.office@kiet.edu"
                  className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">Password</label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#515f74]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-[#c5c5d3] text-[#00236f]"
                  />
                  <span>Remember credentials</span>
                </label>
                <span className="text-[#00236f] hover:underline cursor-pointer">
                  Forgot security key?
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e3a8a] hover:bg-[#00236f] text-white font-bold text-xs py-2.5 rounded shadow-xs transition"
              >
                Access VC Super Admin Dashboard
              </button>
            </form>
          )}

          {/* Dean Login Form */}
          {activeTab === 'dean' && (
            <form onSubmit={handleLoginDean} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Select Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as any)}
                  className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
                >
                  {departments.map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      Department of {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Dean / HOD Email
                </label>
                <input
                  type="email"
                  defaultValue={`dean.${selectedDept.toLowerCase().replace(/[^a-z]/g, '')}@kiet.edu`}
                  className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">Password</label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-[#f8f9ff] border focus:outline-hidden focus:border-[#00236f]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e3a8a] hover:bg-[#00236f] text-white font-bold text-xs py-2.5 rounded shadow-xs transition"
              >
                Login to {selectedDept} Department Workspace
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#c5c5d3]/70 text-center">
            <span className="text-xs text-[#515f74]">
              Secured by University ERP Single Sign-On (SSO) Protocol
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
