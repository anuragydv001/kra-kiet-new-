"use client";

import React, { useState } from 'react';
import { KRAFormProps } from './types';
import { VACReportData, VACCourseRow, VACSyllabusRow } from '../../types/kra';
import { getInitialVACReportData } from '../../services/vacReportService';

export default function KRA1Form({
  departmentName,
  cycle,
  hodName,
  formData,
  patchFormData,
}: KRAFormProps) {
  // Ensure we have a valid VACReportData structure initialized
  const reportData: VACReportData =
    formData.vacReport ||
    getInitialVACReportData(departmentName, hodName || '', '2026-2027', undefined);

  const [activeTab, setActiveTab] = useState<'courses' | 'syllabus' | 'outcomes' | 'assessment' | 'impact' | 'feedback'>('courses');

  const updateVAC = (updater: (prev: VACReportData) => VACReportData) => {
    const next = updater(reportData);
    patchFormData({
      vacReport: next,
      achievementClaim: `${next.courses.length} Courses`,
      remarks: `${next.courses.length} Value Added Courses conducted.`,
    });
  };

  const handleAddCourse = () => {
    const newCourse: VACCourseRow = {
      id: `c-${Date.now()}`,
      courseName: '',
      durationHours: 30,
      mode: 'Offline',
      resourcePerson: '',
      enrolled: '',
      completed: '',
    };
    updateVAC((prev) => ({ ...prev, courses: [...prev.courses, newCourse] }));
  };

  const handleUpdateCourse = (idx: number, patch: Partial<VACCourseRow>) => {
    updateVAC((prev) => {
      const nextCourses = [...prev.courses];
      nextCourses[idx] = { ...nextCourses[idx], ...patch };
      return { ...prev, courses: nextCourses };
    });
  };

  const handleRemoveCourse = (idx: number) => {
    if (reportData.courses.length <= 1) return;
    updateVAC((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== idx),
    }));
  };

  const handleAddSyllabus = () => {
    const newRow: VACSyllabusRow = {
      id: `s-${Date.now()}`,
      module: String(reportData.syllabus.length + 1),
      topic: '',
      hours: 8,
    };
    updateVAC((prev) => ({ ...prev, syllabus: [...prev.syllabus, newRow] }));
  };

  const handleUpdateSyllabus = (idx: number, patch: Partial<VACSyllabusRow>) => {
    updateVAC((prev) => {
      const next = [...prev.syllabus];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, syllabus: next };
    });
  };

  const handleRemoveSyllabus = (idx: number) => {
    if (reportData.syllabus.length <= 1) return;
    updateVAC((prev) => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Auto-filled Institutional Context */}
      <div className="bg-[#eff4ff] border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-bold text-[11px] uppercase tracking-wide text-[#00236f]">
            Section A: Institutional Details (Auto-Populated)
          </span>
          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
            System Verified
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#0b1c30]">
          <div>
            <span className="text-[10px] text-[#515f74] block">Department</span>
            <strong>{departmentName}</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#515f74] block">Academic Session</span>
            <strong>{reportData.academicSession}</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#515f74] block">Semester</span>
            <strong>{reportData.semester}</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#515f74] block">HOD / Coordinator</span>
            <strong>{reportData.hodName || hodName || 'Prof. In-Charge'}</strong>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#c5c5d3] gap-1 overflow-x-auto pb-0.5">
        {[
          { id: 'courses', label: '1. VAC Courses', count: reportData.courses.length },
          { id: 'syllabus', label: '2. Syllabus', count: reportData.syllabus.length },
          { id: 'outcomes', label: '3. Learning Outcomes' },
          { id: 'assessment', label: '4. Assessment & Cert' },
          { id: 'impact', label: '5. Outcomes & Impact' },
          { id: 'feedback', label: '6. Student Feedback' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 rounded-t font-semibold text-[11px] whitespace-nowrap transition ${
              activeTab === t.id
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'bg-white text-[#515f74] hover:bg-[#eff4ff]'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 font-mono">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Section C: Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-3 bg-white p-3 rounded-lg border border-[#c5c5d3]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-[12px] text-[#00236f]">Detail of Value Added Courses</h4>
              <p className="text-[10px] text-[#515f74]">
                Enter course title, hours, mode, resource agency, enrolled and completed students.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCourse}
              className="bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add Course
            </button>
          </div>

          <div className="space-y-3">
            {reportData.courses.map((course, idx) => (
              <div
                key={course.id || idx}
                className="bg-[#f8f9ff] border border-[#c5c5d3] rounded-lg p-3 space-y-2 relative"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-[#00236f]">
                  <span>Course #{idx + 1}</span>
                  {reportData.courses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(idx)}
                      className="text-rose-600 hover:text-rose-800 text-[10px] flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[13px]">delete</span>
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      value={course.courseName}
                      onChange={(e) => handleUpdateCourse(idx, { courseName: e.target.value })}
                      placeholder="e.g., Full Stack Cloud Development with Microservices"
                      className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs text-[#0b1c30] focus:ring-1 focus:ring-[#00236f]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                      Duration (Hours) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={course.durationHours}
                      onChange={(e) =>
                        handleUpdateCourse(idx, {
                          durationHours: e.target.value === '' ? '' : Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs text-[#0b1c30]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                      Mode *
                    </label>
                    <select
                      value={course.mode}
                      onChange={(e) =>
                        handleUpdateCourse(idx, { mode: e.target.value as 'Offline' | 'Online' | 'Hybrid' })
                      }
                      className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs text-[#0b1c30]"
                    >
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                      Resource Person / Agency *
                    </label>
                    <input
                      type="text"
                      value={course.resourcePerson}
                      onChange={(e) => handleUpdateCourse(idx, { resourcePerson: e.target.value })}
                      placeholder="e.g., Tech Corp Industry Expert / Dr. Expert Name"
                      className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs text-[#0b1c30]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                      No. of Students Enrolled *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={course.enrolled}
                      onChange={(e) =>
                        handleUpdateCourse(idx, {
                          enrolled: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs text-[#0b1c30]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                      No. of Students Completed *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={course.completed}
                      onChange={(e) =>
                        handleUpdateCourse(idx, {
                          completed: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs text-[#0b1c30]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section D: Syllabus */}
      {activeTab === 'syllabus' && (
        <div className="space-y-3 bg-white p-3 rounded-lg border border-[#c5c5d3]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-[12px] text-[#00236f]">Course Content / Syllabus</h4>
              <p className="text-[10px] text-[#515f74]">
                Add module topics and hours taught in the official course.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSyllabus}
              className="bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add Module
            </button>
          </div>

          <div className="space-y-2">
            {reportData.syllabus.map((s, idx) => (
              <div
                key={s.id || idx}
                className="grid grid-cols-12 gap-2 bg-[#f8f9ff] border border-[#c5c5d3] rounded p-2 items-center"
              >
                <div className="col-span-2">
                  <span className="text-[9px] text-[#515f74] block font-bold">MODULE</span>
                  <input
                    type="text"
                    value={s.module}
                    onChange={(e) => handleUpdateSyllabus(idx, { module: e.target.value })}
                    className="w-full bg-white border border-[#c5c5d3] rounded px-2 py-1 text-xs"
                  />
                </div>
                <div className="col-span-7">
                  <span className="text-[9px] text-[#515f74] block font-bold">TOPIC *</span>
                  <input
                    type="text"
                    value={s.topic}
                    onChange={(e) => handleUpdateSyllabus(idx, { topic: e.target.value })}
                    placeholder="e.g. Microservices & API Gateway"
                    className="w-full bg-white border border-[#c5c5d3] rounded px-2 py-1 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-[#515f74] block font-bold">HOURS</span>
                  <input
                    type="number"
                    min="1"
                    value={s.hours}
                    onChange={(e) =>
                      handleUpdateSyllabus(idx, {
                        hours: e.target.value === '' ? '' : Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full bg-white border border-[#c5c5d3] rounded px-2 py-1 text-xs"
                  />
                </div>
                <div className="col-span-1 text-right">
                  {reportData.syllabus.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSyllabus(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="Remove module"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section E: Learning Outcomes */}
      {activeTab === 'outcomes' && (
        <div className="space-y-3 bg-white p-3 rounded-lg border border-[#c5c5d3]">
          <h4 className="font-bold text-[12px] text-[#00236f]">
            Learning Outcomes (After successful completion, students will be able to:)
          </h4>
          <p className="text-[10px] text-[#515f74]">
            Enter one learning outcome per line. These will be formatted as numbered statements in the official report.
          </p>
          <textarea
            rows={5}
            value={
              Array.isArray(reportData.learningOutcomes)
                ? reportData.learningOutcomes.join('\n')
                : String(reportData.learningOutcomes || '')
            }
            onChange={(e) => {
              const lines = e.target.value
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean);
              updateVAC((prev) => ({ ...prev, learningOutcomes: lines }));
            }}
            placeholder="1. Design microservice architecture&#10;2. Deploy scalable apps on Kubernetes&#10;3. Implement CI/CD pipelines"
            className="w-full bg-white border border-[#c5c5d3] rounded p-2.5 text-xs text-[#0b1c30] leading-relaxed"
          />
        </div>
      )}

      {/* Section F: Assessment and Certification */}
      {activeTab === 'assessment' && (
        <div className="space-y-3 bg-white p-3 rounded-lg border border-[#c5c5d3]">
          <h4 className="font-bold text-[12px] text-[#00236f]">Assessment and Certification Matrix</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                Assessment Method *
              </label>
              <input
                type="text"
                value={reportData.assessment?.method || ''}
                onChange={(e) =>
                  updateVAC((prev) => ({
                    ...prev,
                    assessment: { ...prev.assessment, method: e.target.value },
                  }))
                }
                placeholder="e.g. Continuous Practical Evaluations, Quizzes & Capstone Mini-Project"
                className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                Minimum Attendance Requirement *
              </label>
              <input
                type="text"
                value={reportData.assessment?.minAttendance || ''}
                onChange={(e) =>
                  updateVAC((prev) => ({
                    ...prev,
                    assessment: { ...prev.assessment, minAttendance: e.target.value },
                  }))
                }
                placeholder="e.g. 75%"
                className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                Passing / Completion Criteria *
              </label>
              <input
                type="text"
                value={reportData.assessment?.passingCriteria || ''}
                onChange={(e) =>
                  updateVAC((prev) => ({
                    ...prev,
                    assessment: { ...prev.assessment, passingCriteria: e.target.value },
                  }))
                }
                placeholder="e.g. Minimum 50% cumulative score"
                className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                Certificate Issuing Authority *
              </label>
              <input
                type="text"
                value={reportData.assessment?.issuingAuthority || ''}
                onChange={(e) =>
                  updateVAC((prev) => ({
                    ...prev,
                    assessment: { ...prev.assessment, issuingAuthority: e.target.value },
                  }))
                }
                placeholder="e.g. KIET Deemed to be University, Ghaziabad"
                className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                Number of Certificates Issued *
              </label>
              <input
                type="number"
                min="0"
                value={reportData.assessment?.certificatesIssued ?? ''}
                onChange={(e) =>
                  updateVAC((prev) => ({
                    ...prev,
                    assessment: {
                      ...prev.assessment,
                      certificatesIssued: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)),
                    },
                  }))
                }
                placeholder="e.g. 108"
                className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section G: Outcome and Impact */}
      {activeTab === 'impact' && (
        <div className="space-y-3 bg-white p-3 rounded-lg border border-[#c5c5d3]">
          <h4 className="font-bold text-[12px] text-[#00236f]">Suggested Impact Indicators</h4>
          <p className="text-[10px] text-[#515f74]">
            Provide descriptive outcomes and verified metrics for the official report indicators.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { key: 'technicalSkills', label: 'Improvement in technical/professional skills' },
              { key: 'employability', label: 'Improvement in employability skills' },
              { key: 'industryCert', label: 'Industry certification obtained' },
              { key: 'completionRate', label: 'Successful completion/certification rate' },
              { key: 'internships', label: 'Internship opportunities' },
              { key: 'placementSupport', label: 'Placement support/outcomes' },
              { key: 'studentProjects', label: 'Student projects developed' },
              { key: 'hackathons', label: 'Participation in competitions/hackathons' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-[10px] font-bold text-[#515f74] block mb-0.5">
                  ● {label}
                </label>
                <input
                  type="text"
                  value={(reportData.outcomeAndImpact as any)?.[key] || ''}
                  onChange={(e) =>
                    updateVAC((prev) => ({
                      ...prev,
                      outcomeAndImpact: {
                        ...prev.outcomeAndImpact,
                        [key]: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter details or leave blank if N/A"
                  className="w-full bg-white border border-[#c5c5d3] rounded px-2 py-1 text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section H: Student Feedback */}
      {activeTab === 'feedback' && (
        <div className="space-y-3 bg-white p-3 rounded-lg border border-[#c5c5d3]">
          <h4 className="font-bold text-[12px] text-[#00236f]">Student Feedback Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                Overall Feedback Score (0.0 – 5.0) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={reportData.feedback?.score ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.min(5, Math.max(0, Number(e.target.value)));
                  updateVAC((prev) => ({
                    ...prev,
                    feedback: { ...prev.feedback, score: val },
                  }));
                }}
                className="w-full bg-white border border-[#c5c5d3] rounded px-2.5 py-1.5 text-xs font-bold text-[#00236f]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-0.5">
                Major Suggestions Received (One per line)
              </label>
              <textarea
                rows={3}
                value={
                  Array.isArray(reportData.feedback?.suggestions)
                    ? reportData.feedback.suggestions.join('\n')
                    : String(reportData.feedback?.suggestions || '')
                }
                onChange={(e) => {
                  const list = e.target.value.split('\n').filter(Boolean);
                  updateVAC((prev) => ({
                    ...prev,
                    feedback: { ...prev.feedback, suggestions: list },
                  }));
                }}
                placeholder="1. Increase live hands-on console labs&#10;2. Conduct mock technical interviews"
                className="w-full bg-white border border-[#c5c5d3] rounded p-2 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
