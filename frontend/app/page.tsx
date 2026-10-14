"use client";

import React, { useState } from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { DepartmentCode, KRAMaster, KRASubmission } from '../types/kra';
import {
  buildKraDefinitionHtml,
  buildSubmissionReportHtml,
} from '../services/reportDoc';

import SharedHeader from '../components/SharedHeader';
import SharedSidebar from '../components/SharedSidebar';
import Toast from '../components/Toast';
import DualLoginView from '../components/DualLoginView';
import ReportPreviewModal, {
  ReportPreviewState,
} from '../components/ReportPreviewModal';

import AddKRAModal from '../components/modals/AddKRAModal';
import ReturnKRAModal from '../components/modals/ReturnKRAModal';
import TimelineModal from '../components/modals/TimelineModal';

import VCDashboard from '../components/vc/VCDashboard';
import VCKRAManagement from '../components/vc/VCKRAManagement';
import VCSubmissions from '../components/vc/VCSubmissions';
import VCReports from '../components/vc/VCReports';
import VCAnnouncements from '../components/vc/VCAnnouncements';
import VCKRAPreviewModal from '../components/vc/VCKRAPreviewModal';

import DeanDashboard from '../components/dean/DeanDashboard';
import DeanMyKRAs from '../components/dean/DeanMyKRAs';
import DeanSubmissions from '../components/dean/DeanSubmissions';
import SplitTemplateEditor from '../components/dean/SplitTemplateEditor';

function PortalShell() {
  const {
    role,
    activeNavTab,
    departments,
    kras,
    setCurrentDept,
    setActiveNavTab,
    showToast,
    splitKraCode,
    openSplitEditor,
    closeSplitEditor,
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDualLogin, setShowDualLogin] = useState(false);
  const [addKraOpen, setAddKraOpen] = useState(false);
  const [editKra, setEditKra] = useState<KRAMaster | null>(null);
  const [returnId, setReturnId] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReportPreviewState | null>(null);
  const [vcConsolidated, setVcConsolidated] = useState<KRASubmission | null>(null);

  const handlePreviewSubmission = (sub: KRASubmission) => {
    const kra = kras.find((k) => k.code === sub.kraCode);
    if (!kra) {
      showToast('The KRA definition for this submission is unavailable.', 'error');
      return;
    }
    const dept = departments.find((d) => d.code === sub.dept);
    setPreview({
      title: `${sub.kraCode} · ${sub.dept} · ${sub.cycle}`,
      html: buildSubmissionReportHtml(kra, sub, dept?.name || sub.dept),
      fileName: `${sub.dept}_${sub.kraCode.replace(/\s+/g, '_')}_${sub.cycle.replace(/\s+/g, '')}.html`,
    });
  };

  /** VC review: open the SINGLE consolidated KRA preview instead of a bare report. */
  const handleOpenConsolidatedPreview = (sub: KRASubmission) => {
    setPreview(null);
    setVcConsolidated(sub);
  };

  const handlePreviewKra = (kra: KRAMaster) => {
    setPreview({
      title: `${kra.code} — Definition Proforma`,
      html: buildKraDefinitionHtml(kra),
      fileName: `${kra.code.replace(/\s+/g, '_')}_Definition.html`,
    });
  };

  const handleInspectDept = (dept: DepartmentCode) => {
    setCurrentDept(dept);
    setActiveNavTab('Submissions');
    showToast(`Auditing ${dept} KRA submissions`);
  };

  if (!isAuthenticated) {
    return (
      <>
        <DualLoginView onLoginSuccess={() => setIsAuthenticated(true)} />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SharedHeader />
      <div className="flex flex-1 min-h-0">
        <SharedSidebar onOpenSplitScreen={openSplitEditor} />
        <main className="flex-1 min-w-0 ml-64 p-6 bg-[#f8f9ff] overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {role === 'vc' ? (
              activeNavTab === 'KRA Management' ? (
                <VCKRAManagement
                  onOpenAddKRAModal={() => setAddKraOpen(true)}
                  onPreviewKra={handlePreviewKra}
                  onEditKra={(kra) => setEditKra(kra)}
                />
              ) : activeNavTab === 'Submissions' ? (
                <VCSubmissions
                  onPreviewSubmission={handleOpenConsolidatedPreview}
                  onOpenReturnModal={(id) => setReturnId(id)}
                />
              ) : activeNavTab === 'Reports' ? (
                <VCReports onPreviewSubmission={handleOpenConsolidatedPreview} />
              ) : activeNavTab === 'Announcements' ? (
                <VCAnnouncements />
              ) : (
                <VCDashboard
                  onOpenAddKRAModal={() => setAddKraOpen(true)}
                  onInspectDept={handleInspectDept}
                />
              )
            ) : activeNavTab === 'My KRAs' ? (
              <DeanMyKRAs
                onOpenSplit={openSplitEditor}
                onPreviewSubmission={handlePreviewSubmission}
              />
            ) : activeNavTab === 'Submissions' ? (
              <DeanSubmissions
                onPreviewSubmission={handlePreviewSubmission}
                onOpenSplit={openSplitEditor}
              />
            ) : (
              <DeanDashboard
                onOpenSplit={openSplitEditor}
                onPreviewSubmission={handlePreviewSubmission}
              />
            )}

          </div>
        </main>
      </div>

      <AddKRAModal
        isOpen={addKraOpen || editKra !== null}
        editingKra={editKra}
        onClose={() => {
          setAddKraOpen(false);
          setEditKra(null);
        }}
      />

      <ReturnKRAModal
        submissionId={returnId}
        isOpen={returnId !== null}
        onClose={() => setReturnId(null)}
      />

      <ReportPreviewModal preview={preview} onClose={() => setPreview(null)} />

      <VCKRAPreviewModal
        submission={vcConsolidated}
        onClose={() => setVcConsolidated(null)}
        onOpenReturnModal={(id) => {
          setVcConsolidated(null);
          setReturnId(id);
        }}
      />

      <TimelineModal />

      {splitKraCode && (
        <SplitTemplateEditor
          key={splitKraCode}
          kraCode={splitKraCode}
          onClose={closeSplitEditor}
          onPreviewSubmission={handlePreviewSubmission}
        />
      )}


      {showDualLogin && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/60 backdrop-blur-xs overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto my-6 relative">
            <button
              onClick={() => setShowDualLogin(false)}
              className="absolute -top-2 right-0 z-10 text-white/80 hover:text-white p-1.5"
              title="Close dual login view"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <DualLoginView
                onLoginSuccess={() => {
                  setIsAuthenticated(true);
                  setShowDualLogin(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <Toast />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <PortalShell />
    </AppProvider>
  );
}
