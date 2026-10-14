"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DepartmentCode } from '../types/kra';

import { api } from '../services/api';

export default function TopRoleSwitcher({
  onSelectDualLogin,
}: {
  onSelectDualLogin?: () => void;
}) {
  const { role, setRole, currentDept, setCurrentDept, departments, openSplitEditor, openTimelineModal, showToast } = useApp();
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const handleRoleChange = async (newRole: 'vc' | 'dean') => {
    setRole(newRole);
    if (newRole === 'vc') {
      showToast('Switched to VC / Super Admin Workspace');
      try {
        await api.post('/api/accounts/login/', { username: 'vc', password: 'admin123' });
      } catch (e) {}
    } else {
      showToast(`Switched to ${currentDept} Dean Workspace`);
      try {
        const cleanDept = currentDept.toLowerCase().replace(/[^a-z]/g, '');
        await api.post('/api/accounts/login/', { username: `dean_${cleanDept}`, password: 'admin123' });
      } catch (e) {}
    }
  };

  const handleDeptSelect = async (deptCode: DepartmentCode) => {
    setCurrentDept(deptCode);
    setShowDeptDropdown(false);
    showToast(`Switched active department to ${deptCode}`);
    if (role === 'dean') {
      try {
        const cleanDept = deptCode.toLowerCase().replace(/[^a-z]/g, '');
        await api.post('/api/accounts/login/', { username: `dean_${cleanDept}`, password: 'admin123' });
      } catch (e) {}
    }
  };

  return (
    <div className="bg-[#1e3a8a] text-white px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-medium z-50 select-none border-b border-[#757682]/40">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-mono text-[12px] font-bold text-white tracking-wide">
          KIET KRA PORTAL SYSTEM (PRODUCTION v3.4)
        </span>
        <span className="bg-[#00236f] px-2 py-0.5 rounded text-[11px] text-white font-medium border border-blue-400/30">
          Academic Cycle: 2025-2026
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setRole('dean');
            openSplitEditor('KRA 01');
          }}
          className="bg-amber-400 hover:bg-amber-300 text-[#00236f] font-extrabold px-3 py-1 rounded text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
          title="Open official KRA 1 Report Builder: Value Added Courses, Add-on Courses and MOOCs"
        >
          <span className="material-symbols-outlined text-[15px]">edit_document</span>
          <span>Fill KRA 1 Report (VAC)</span>
        </button>
        <span className="text-white/80 hidden sm:inline text-[11px]">Quick Role Switch:</span>
        <div className="inline-flex rounded-lg bg-[#00236f] p-0.5 shadow-inner border border-blue-900/50">
          <button
            onClick={() => handleRoleChange('vc')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all duration-150 ${
              role === 'vc'
                ? 'bg-white text-[#00236f] shadow-sm font-bold'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}
          >
            VC / Super Admin
          </button>

          <div className="relative inline-block">
            <button
              onClick={() => {
                if (role !== 'dean') {
                  handleRoleChange('dean');
                } else {
                  setShowDeptDropdown(!showDeptDropdown);
                }
              }}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all duration-150 ${
                role === 'dean'
                  ? 'bg-white text-[#00236f] shadow-sm font-bold'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Dean ({currentDept})</span>
              <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
            </button>

            {showDeptDropdown && (
              <div className="absolute left-0 mt-1 w-56 bg-white text-[#0b1c30] rounded-md shadow-xl border border-slate-200 py-1 z-50 max-h-64 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                  Select Department Dean Desk
                </div>
                {departments.map((dept) => (
                  <button
                    key={dept.code}
                    onClick={() => handleDeptSelect(dept.code)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 flex items-center justify-between ${
                      currentDept === dept.code ? 'bg-blue-50/80 font-bold text-[#00236f]' : ''
                    }`}
                  >
                    <span>{dept.code}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{dept.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {onSelectDualLogin && (
            <button
              onClick={onSelectDualLogin}
              className="px-2.5 py-1 rounded text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              Dual Login View
            </button>
          )}
        </div>

        <button
          onClick={() => openTimelineModal()}
          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-xs transition border border-white/20"
        >
          <span className="material-symbols-outlined text-[15px]">timeline</span>
          <span>Audit Timeline</span>
        </button>
      </div>
    </div>
  );
}
