"use client";

import React, { createContext, useContext, useState } from 'react';
import {
  AppNotification,
  DepartmentCode,
  DepartmentInfo,
  KRAMaster,
  KRASubmission,
  Announcement,
  BimonthlyCycle,
  BIMONTHLY_CYCLES,
  SubmissionFormData,
  SubmissionStatus,
} from '../types/kra';
import {
  ALL_DEPARTMENTS,
  INITIAL_KRAS,
  INITIAL_SUBMISSIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
} from '../services/seedData';
import { claimDisplay, computeProgress, contributionProgress } from '../services/kraUtils';
import { api, isMockMode, fetchCsrfToken } from '../services/api';

interface ToastState {
  show: boolean;
  message: string;
  type?: 'success' | 'info' | 'error';
}

export interface DepartmentStats {
  progress: number;
  assignedCount: number;
  approvedCount: number;
  draftCount: number;
  submittedCount: number;
  pendingCount: number;
  returnedCount: number;
  exceededCount: number;
}

export interface GlobalStats {
  totalDepts: number;
  totalKRAs: number;
  activeKRAs: number;
  pendingReview: number;
  approvedTotal: number;
  returnedTotal: number;
}

interface AppContextType {
  role: 'vc' | 'dean';
  currentDept: DepartmentCode;
  selectedCycle: BimonthlyCycle;
  activeNavTab: string;
  departments: DepartmentInfo[];
  kras: KRAMaster[];
  submissions: KRASubmission[];
  announcements: Announcement[];
  notifications: AppNotification[];
  toast: ToastState;
  timelineModalSubmission: KRASubmission | null;
  /** KRA code currently open in the Dean KRA workspace (tabs). */
  splitKraCode: string | null;

  setRole: (role: 'vc' | 'dean') => void;
  setCurrentDept: (dept: DepartmentCode) => void;
  setSelectedCycle: (cycle: BimonthlyCycle) => void;
  setActiveNavTab: (tab: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;
  openTimelineModal: (submission?: KRASubmission | null) => void;
  closeTimelineModal: () => void;

  /** Dean notification panel actions. Reading an unread notification marks it read. */
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  /** Opens / closes the tabbed Dean KRA workspace. */
  openSplitEditor: (kraCode: string) => void;
  closeSplitEditor: () => void;

  addKRA: (kra: KRAMaster) => void;
  updateKRA: (code: string, updates: Partial<KRAMaster>) => void;
  deleteKRA: (code: string) => void;

  saveDraftSubmission: (
    kraCode: string,
    dept: DepartmentCode,
    cycle: BimonthlyCycle,
    formData: SubmissionFormData
  ) => void;
  submitKRAtoVC: (
    kraCode: string,
    dept: DepartmentCode,
    cycle: BimonthlyCycle,
    formData: SubmissionFormData
  ) => void;
  approveSubmission: (submissionId: string) => void;
  returnSubmission: (submissionId: string, reason: string) => void;
  resubmitKRA: (submissionId: string, formData: SubmissionFormData) => void;
  approveAllPending: () => void;

  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'author'>) => void;

  getSubmission: (
    kraCode: string,
    dept: DepartmentCode,
    cycle: BimonthlyCycle
  ) => KRASubmission | undefined;
  getDepartmentStats: (deptCode: DepartmentCode) => DepartmentStats;
  getGlobalStats: () => GlobalStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function nowStamp(): { date: string; time: string } {
  const d = new Date();
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'vc' | 'dean'>('vc');
  const [currentDept, setCurrentDept] = useState<DepartmentCode>('CSE');
  const [selectedCycle, setSelectedCycle] = useState<BimonthlyCycle>('July – August');
  const [activeNavTab, setActiveNavTab] = useState<string>('Dashboard');
  const [departments] = useState<DepartmentInfo[]>(ALL_DEPARTMENTS);
  // Default to INITIAL seed data, then live backend data merges/overlays when online
  const [kras, setKras] = useState<KRAMaster[]>(INITIAL_KRAS);
  const [submissions, setSubmissions] = useState<KRASubmission[]>(INITIAL_SUBMISSIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [splitKraCode, setSplitKraCode] = useState<string | null>(null);
  const [timelineModalSubmission, setTimelineModalSubmission] = useState<KRASubmission | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  // ---------------- Local Storage Persistence (for Drafts) ----------------
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kra_mock_submissions');
      if (stored) {
        try {
          setSubmissions(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored submissions', e);
        }
      }
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && submissions.length > 0) {
      localStorage.setItem('kra_mock_submissions', JSON.stringify(submissions));
    }
  }, [submissions]);

  // ---------------- Live Data Fetching ----------------
  React.useEffect(() => {
    if (isMockMode()) return;
    
    const loadLiveBackendData = async () => {
      try {
        await fetchCsrfToken();
        
        // Fetch User Role
        try {
          const userRes = await api.get('/api/accounts/me/');
          setRole(userRes.data.role === 'SUPER_ADMIN' ? 'vc' : 'dean');
        } catch (e) {
          console.log("Not logged in natively yet, skipping me endpoint.");
        }

        const kraRes = await api.get('/api/core/kra-metrics/');
        const mappedKras = kraRes.data.map((k: any) => ({
          code: k.serial_number,
          title: k.activity_description,
          nbaRef: k.nba_code || '',
          naacRef: k.naac_code || '',
          metricType: k.target_type === 'Boolean' ? 'Yes/No' : (k.target_type === 'Percentage' ? 'Percentage' : 'Direct Numeric'),
          annualTarget: k.annual_target,
          annualTargetDisplay: k.annual_target,
          targetDescription: k.activity_description,
          prescribedReportFormats: [],
          summaryTemplates: [],
          assignedDepts: ALL_DEPARTMENTS.map(d => d.code),
          status: 'Active',
        }));
        setKras(mappedKras);

        // Fetch Live Achievements / Submissions from Django Postgres
        try {
          const achRes = await api.get('/api/tracker/achievements/');
          if (Array.isArray(achRes.data) && achRes.data.length > 0) {
            const statusMap: Record<string, SubmissionStatus> = {
              'DRAFT': 'Draft',
              'SUBMITTED': 'Submitted',
              'APPROVED': 'Approved',
              'REJECTED': 'Returned'
            };

            const backendSubmissions: KRASubmission[] = achRes.data.map((a: any) => {
              const kra = mappedKras.find((k: any) => k.code === a.kra_code) || {
                title: a.kra_metric_details || a.kra_code,
                metricType: 'Direct Numeric',
                annualTarget: '1'
              };

              const cycleNameFormatted = (BIMONTHLY_CYCLES.find(
                (c: BimonthlyCycle) => c.toLowerCase().replace(/[\u2013-]/g, '') === (a.cycle_display || a.cycle_name || '').toLowerCase().replace(/[\u2013-]/g, '')
              ) || a.cycle_display || 'July – August') as BimonthlyCycle;

              return {
                id: `SUB-${a.id}`,
                kraCode: a.kra_code,
                kraTitle: kra.title,
                dept: (a.department_code || 'CSE') as DepartmentCode,
                deanName: 'Department Dean',
                cycle: cycleNameFormatted,
                metricType: kra.metricType,
                annualTarget: kra.annualTarget,
                claim: a.numeric_value ? String(a.numeric_value) : '1',
                numericClaim: a.numeric_value ? Number(a.numeric_value) : 1,
                progress: a.status === 'APPROVED' ? 100 : 50,
                isTargetExceeded: false,
                submittedDate: a.updated_at ? a.updated_at.split('T')[0] : 'Today',
                status: statusMap[a.status] || 'Draft',
                formData: a.custom_data || {},
                timeline: [
                  { id: 't1', stage: 'Assigned', date: 'Session Inception', actor: 'IQAC Directorate' },
                  { id: `t-${a.id}`, stage: a.status, date: a.updated_at ? a.updated_at.split('T')[0] : 'Recent', actor: 'Dean' }
                ]
              };
            });

            setSubmissions((prev) => {
              const backendKeys = new Set(backendSubmissions.map((s) => `${s.kraCode}-${s.dept}-${s.cycle}`));
              const remaining = prev.filter((p) => !backendKeys.has(`${p.kraCode}-${p.dept}-${p.cycle}`));
              return [...backendSubmissions, ...remaining];
            });
          }
        } catch (fetchErr) {
          console.warn("Could not fetch achievements from backend", fetchErr);
        }
        
      } catch (err) {
        console.warn("Django backend data sync paused or offline:", err);
      }
    };
    loadLiveBackendData();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    window.setTimeout(() => {
      setToast((t) => (t.message === message ? { ...t, show: false } : t));
    }, 4200);
  };
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  const openTimelineModal = (submission: KRASubmission | null = null) => {
    setTimelineModalSubmission(submission ?? submissions[0] ?? null);
  };
  const closeTimelineModal = () => setTimelineModalSubmission(null);

  // ---------------- Dean notifications ----------------
  /** Creates a fresh unread notification for one or more departments. */
  const addNotification = (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    const { date, time } = nowStamp();
    const created: AppNotification = {
      ...n,
      id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: `${date}, ${time}`,
      read: false,
    };
    setNotifications((prev) => [created, ...prev]);
  };

  /**
   * Marks ONE notification as read. An already-read notification is left
   * untouched so the unread count never decreases twice for the same item.
   */
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
  };

  // ---------------- Dean KRA workspace (tabbed editor) ----------------
  const openSplitEditor = (kraCode: string) => setSplitKraCode(kraCode);
  const closeSplitEditor = () => setSplitKraCode(null);

  // ---------------- KRA master (defined by the VC / Super Admin) ----------------
  const addKRA = (kra: KRAMaster) => {
    setKras((prev) => {
      const exists = prev.some((k) => k.code === kra.code);
      return exists ? prev.map((k) => (k.code === kra.code ? kra : k)) : [kra, ...prev];
    });
    if (kra.assignedDepts.length > 0) {
      addNotification({
        title: `${kra.code} assigned to ${kra.assignedDepts.length} department(s)`,
        message: `"${kra.title}" has been created by the VC Office and assigned to ${
          kra.assignedDepts.length > 5 ? 'your department' : kra.assignedDepts.join(', ')
        }. Complete the Performa, Report Format and Summary Template for the active cycle.`,
        kind: 'kra-assigned',
        targetDepts: [...kra.assignedDepts],
        kraCode: kra.code,
      });
    }
    showToast(`${kra.code} saved and assigned to ${kra.assignedDepts.length} department(s).`);
  };

  const updateKRA = (code: string, updates: Partial<KRAMaster>) => {
    setKras((prev) => prev.map((k) => (k.code === code ? { ...k, ...updates } : k)));
    showToast(`${code} updated.`);
  };

  const deleteKRA = (code: string) => {
    setKras((prev) => prev.filter((k) => k.code !== code));
    showToast(`${code} removed from the KRA repository.`, 'info');
  };

  const getSubmission = (kraCode: string, dept: DepartmentCode, cycle: BimonthlyCycle) =>
    submissions.find((s) => s.kraCode === kraCode && s.dept === dept && s.cycle === cycle);

  // ---------------- Submissions (Dean entry + VC verification) ----------------
  const upsertSubmission = (
    kraCode: string,
    dept: DepartmentCode,
    cycle: BimonthlyCycle,
    formData: SubmissionFormData,
    status: SubmissionStatus,
    stage: string,
    actor: string,
    remarks: string
  ) => {
    setSubmissions((prev) => {
      const kra = kras.find((k) => k.code === kraCode);
      if (!kra) return prev;
      const { numericClaim, progress, isTargetExceeded } = computeProgress(kra, formData);
      const claim = claimDisplay(kra, formData);
      const deanName = ALL_DEPARTMENTS.find((d) => d.code === dept)?.deanName ?? 'Department Dean';
      const { date, time } = nowStamp();
      const event = { id: `ev-${Date.now()}`, stage, date: `${date}, ${time}`, actor, remarks };
      const idx = prev.findIndex(
        (s) => s.kraCode === kraCode && s.dept === dept && s.cycle === cycle
      );

      if (idx >= 0) {
        const existing = prev[idx];
        const updated: KRASubmission = {
          ...existing,
          kraTitle: kra.title,
          metricType: kra.metricType,
          annualTarget: kra.annualTarget,
          claim,
          numericClaim,
          progress,
          isTargetExceeded,
          submittedDate: date,
          status,
          returnReason: status === 'Returned' ? existing.returnReason : undefined,
          formData,
          timeline: [...existing.timeline, event],
        };
        const next = [...prev];
        next[idx] = updated;
        return next;
      }

      const created: KRASubmission = {
        id: `SUB-${String(Date.now()).slice(-5)}`,
        kraCode,
        kraTitle: kra.title,
        dept,
        deanName,
        cycle,
        metricType: kra.metricType,
        annualTarget: kra.annualTarget,
        claim,
        numericClaim,
        progress,
        isTargetExceeded,
        submittedDate: date,
        status,
        formData,
        timeline: [
          { id: 't1', stage: 'Assigned', date: 'Session Inception', actor: 'IQAC Directorate' },
          event,
        ],
      };
      return [created, ...prev];
    });

    // Sync to Django PostgreSQL backend
    if (!isMockMode()) {
      api.post('/api/tracker/achievements/upsert/', {
        kra_code: kraCode,
        cycle: cycle.replace(/\u2013/g, '-'),
        status: status.toUpperCase(),
        custom_data: formData,
        remarks: formData.remarks || '',
        numeric_value: formData.achievementClaim && !isNaN(Number(formData.achievementClaim)) ? Number(formData.achievementClaim) : null
      }).then((res) => {
        console.log("Successfully saved submission to Django database:", res.data);
      }).catch((err) => {
        console.error("Error saving submission to Django database:", err?.response?.data || err);
      });
    }
  };

  const saveDraftSubmission = (
    kraCode: string,
    dept: DepartmentCode,
    cycle: BimonthlyCycle,
    formData: SubmissionFormData
  ) => {
    upsertSubmission(kraCode, dept, cycle, formData, 'Draft', 'Draft', `${dept} Dean Office`, 'Draft saved to the institutional repository.');
    showToast('Draft saved. You can continue editing or submit to the VC.');
  };

  const submitKRAtoVC = (
    kraCode: string,
    dept: DepartmentCode,
    cycle: BimonthlyCycle,
    formData: SubmissionFormData
  ) => {
    upsertSubmission(kraCode, dept, cycle, formData, 'Submitted', 'Submitted', `${dept} Dean`, 'Submitted to the VC Office for verification.');
    showToast('Submission sent to the VC Office for verification.');
  };

  const approveSubmission = (submissionId: string) => {
    const target = submissions.find((s) => s.id === submissionId);
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== submissionId) return s;
        const { date, time } = nowStamp();
        return {
          ...s,
          status: 'Approved',
          returnReason: undefined,
          timeline: [
            ...s.timeline,
            {
              id: `ev-${Date.now()}`,
              stage: 'Approved',
              date: `${date}, ${time}`,
              actor: 'Prof. (Dr.) Preetvanti Singh',
              remarks: 'Verified and ratified by the VC Office.',
            },
          ],
        };
      })
    );
    if (target) {
      addNotification({
        title: `${target.kraCode} submission approved`,
        message: `Your ${target.cycle} submission for "${target.kraTitle}" has been verified and ratified by the VC Office.`,
        kind: 'submission-approved',
        targetDepts: [target.dept],
        kraCode: target.kraCode,
        submissionId: target.id,
      });
    }
    showToast('Submission approved and ratified.');
  };

  const returnSubmission = (submissionId: string, reason: string) => {
    const target = submissions.find((s) => s.id === submissionId);
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== submissionId) return s;
        const { date, time } = nowStamp();
        return {
          ...s,
          status: 'Returned',
          returnReason: reason,
          timeline: [
            ...s.timeline,
            {
              id: `ev-${Date.now()}`,
              stage: 'Returned',
              date: `${date}, ${time}`,
              actor: 'Prof. (Dr.) Preetvanti Singh',
              remarks: reason,
            },
          ],
        };
      })
    );
    if (target) {
      addNotification({
        title: `${target.kraCode} submission returned by the VC`,
        message: `Observation: ${reason}`,
        kind: 'submission-returned',
        targetDepts: [target.dept],
        kraCode: target.kraCode,
        submissionId: target.id,
      });
    }
    showToast('Submission returned to the Dean with observations.', 'info');
  };

  const resubmitKRA = (submissionId: string, formData: SubmissionFormData) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== submissionId) return s;
        const kra = kras.find((k) => k.code === s.kraCode);
        if (!kra) return s;
        const { numericClaim, progress, isTargetExceeded } = computeProgress(kra, formData);
        const { date, time } = nowStamp();
        return {
          ...s,
          claim: claimDisplay(kra, formData),
          numericClaim,
          progress,
          isTargetExceeded,
          submittedDate: date,
          status: 'Submitted',
          returnReason: undefined,
          formData,
          timeline: [
            ...s.timeline,
            {
              id: `ev-${Date.now()}`,
              stage: 'Submitted',
              date: `${date}, ${time}`,
              actor: s.deanName,
              remarks: 'Resubmitted after VC observations.',
            },
          ],
        };
      })
    );
    showToast('Submission resubmitted to the VC Office.');
  };

  const approveAllPending = () => {
    const pending = submissions.filter((s) => s.status === 'Submitted');
    if (pending.length === 0) {
      showToast('No pending submissions to approve.', 'info');
      return;
    }
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.status !== 'Submitted') return s;
        const { date, time } = nowStamp();
        return {
          ...s,
          status: 'Approved',
          timeline: [
            ...s.timeline,
            {
              id: `ev-${Date.now()}-${s.id}`,
              stage: 'Approved',
              date: `${date}, ${time}`,
              actor: 'Prof. (Dr.) Preetvanti Singh',
              remarks: 'Batch ratified by the VC Office.',
            },
          ],
        };
      })
    );
    const depts = Array.from(new Set(pending.map((s) => s.dept)));
    if (depts.length > 0) {
      addNotification({
        title: `${pending.length} submission(s) approved by the VC Office`,
        message: 'Your pending submissions have been verified and ratified in a batch approval.',
        kind: 'submission-approved',
        targetDepts: depts,
      });
    }
    showToast(`${pending.length} submission(s) approved.`);
  };

  const createAnnouncement = (
    announcement: Omit<Announcement, 'id' | 'createdAt' | 'author'>
  ) => {
    const created: Announcement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      createdAt: nowStamp().date,
      author: 'Vice Chancellor Office',
    };
    setAnnouncements((prev) => [created, ...prev]);
    addNotification({
      title: created.title,
      message: created.message,
      kind: 'announcement',
      targetDepts: [...created.targetDepts],
      announcementId: created.id,
    });
    showToast(`Reminder sent to ${announcement.targetDepts.length} department(s).`);
  };

  // ---------------- Aggregate statistics ----------------
  const getDepartmentStats = (deptCode: DepartmentCode): DepartmentStats => {
    const assigned = kras.filter((k) => k.assignedDepts.includes(deptCode));
    const deptSubs = submissions.filter((s) => s.dept === deptCode);
    let sum = 0;
    let approvedCount = 0;
    let draftCount = 0;
    let submittedCount = 0;
    let pendingCount = 0;
    let returnedCount = 0;
    let exceededCount = 0;

    assigned.forEach((kra) => {
      const sub =
        deptSubs.find((s) => s.kraCode === kra.code && s.cycle === selectedCycle) ??
        deptSubs.find((s) => s.kraCode === kra.code);
      if (!sub) {
        pendingCount++;
        return;
      }
      sum += contributionProgress(kra, sub.status, sub.progress);
      if (sub.isTargetExceeded) exceededCount++;
      switch (sub.status) {
        case 'Approved':
          approvedCount++;
          break;
        case 'Draft':
          draftCount++;
          break;
        case 'Submitted':
          submittedCount++;
          break;
        case 'Returned':
          returnedCount++;
          break;
      }
    });

    const progress = assigned.length
      ? Math.min(Math.round((sum / assigned.length) * 100) / 100, 100)
      : 0;

    return {
      progress,
      assignedCount: assigned.length,
      approvedCount,
      draftCount,
      submittedCount,
      pendingCount,
      returnedCount,
      exceededCount,
    };
  };

  const getGlobalStats = (): GlobalStats => ({
    totalDepts: departments.length,
    totalKRAs: kras.length,
    activeKRAs: kras.filter((k) => k.status === 'Active').length,
    pendingReview: submissions.filter((s) => s.status === 'Submitted').length,
    approvedTotal: submissions.filter((s) => s.status === 'Approved').length,
    returnedTotal: submissions.filter((s) => s.status === 'Returned').length,
  });

  return (
    <AppContext.Provider
      value={{
        role,
        currentDept,
        selectedCycle,
        activeNavTab,
        departments,
        kras,
        submissions,
        announcements,
        notifications,
        toast,
        timelineModalSubmission,
        splitKraCode,
        setRole,
        setCurrentDept,
        setSelectedCycle,
        setActiveNavTab,
        showToast,
        hideToast,
        openTimelineModal,
        closeTimelineModal,
        markNotificationRead,
        markAllNotificationsRead,
        openSplitEditor,
        closeSplitEditor,
        addKRA,
        updateKRA,
        deleteKRA,
        saveDraftSubmission,
        submitKRAtoVC,
        approveSubmission,
        returnSubmission,
        resubmitKRA,
        approveAllPending,
        createAnnouncement,
        getSubmission,
        getDepartmentStats,
        getGlobalStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}



