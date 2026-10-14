"use client";

import React from 'react';
import { VACReportData } from '../../types/kra';

export default function OfficialVACReportPreview({
  reportData,
  departmentName,
}: {
  reportData: VACReportData;
  departmentName: string;
}) {
  const {
    academicSession,
    semester,
    facultyCoordinator,
    hodName,
    courses,
    syllabus,
    learningOutcomes,
    assessment,
    outcomeAndImpact,
    feedback,
    preparedBy,
    approvedBy,
    supportingDocuments,
  } = reportData;

  const impactIndicators = [
    { label: "Improvement in technical/professional skills", val: outcomeAndImpact?.technicalSkills },
    { label: "Improvement in employability skills", val: outcomeAndImpact?.employability },
    { label: "Industry certification obtained", val: outcomeAndImpact?.industryCert },
    { label: "Successful completion/certification rate", val: outcomeAndImpact?.completionRate },
    { label: "Internship opportunities", val: outcomeAndImpact?.internships },
    { label: "Placement support/outcomes", val: outcomeAndImpact?.placementSupport },
    { label: "Student projects developed", val: outcomeAndImpact?.studentProjects },
    { label: "Participation in competitions/hackathons", val: outcomeAndImpact?.hackathons },
  ];

  return (
    <div className="space-y-8 select-text font-serif text-[#111]">
      {/* ================= PAGE 1 ================= */}
      <div className="bg-white rounded-lg shadow-md border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between relative text-[12px] leading-relaxed">
        <div>
          {/* Official KIET Header */}
          <div className="flex items-center justify-between border-b-2 border-[#00236f] pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-[#00236f] flex items-center justify-center p-1 bg-white">
                <span className="font-serif font-black text-[#00236f] text-sm tracking-tighter">KIET</span>
              </div>
              <div>
                <span className="text-[10px] tracking-widest text-[#515f74] font-sans font-bold uppercase block">
                  Accreditation &amp; KRA Directorate
                </span>
                <span className="text-xs font-serif italic text-[#333]">ज्ञानम् सर्वार्थसाधनम्</span>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-sans font-extrabold text-[#00236f] tracking-tight m-0">
                KIET UNIVERSITY
              </h1>
              <p className="text-[9px] font-sans text-[#515f74] uppercase tracking-wider m-0">
                DELHI-NCR, INDIA &bull; (Under Section 3 of the UGC Act, 1956)
              </p>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center my-4">
            <h2 className="text-[14px] font-bold uppercase underline tracking-wide text-[#0b1c30]">
              REPORT ON VALUE ADDED COURSES, ADD-ON COURSES AND MOOCs
            </h2>
            <h3 className="text-[12px] font-semibold text-[#00236f] mt-0.5">
              KIET Deemed to be University, Ghaziabad
            </h3>
          </div>

          {/* Section A: Department & Session Table */}
          <table className="w-full border-collapse border border-black text-[11px] mb-4">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold bg-[#f8f9ff] w-[35%]">Name of the Department</td>
                <td className="border border-black p-2 font-semibold text-[#0b1c30]">
                  {departmentName || <span className="text-slate-400 italic">[Department Name]</span>}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-[#f8f9ff]">Academic Session / Year/ Semester</td>
                <td className="border border-black p-2">
                  {academicSession || <span className="text-slate-400 italic">[Academic Session]</span>}
                  {semester && <span className="ml-2 font-medium text-slate-700">&bull; {semester}</span>}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-[#f8f9ff]">Faculty Coordinator(s)</td>
                <td className="border border-black p-2">
                  {facultyCoordinator || <span className="text-slate-400 italic">[Faculty Coordinator(s)]</span>}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-[#f8f9ff]">Head of the Department</td>
                <td className="border border-black p-2">
                  {hodName || <span className="text-slate-400 italic">[Head of the Department]</span>}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Section B: Introduction */}
          <div className="border border-black p-2.5 text-[10.5px] leading-normal mb-3">
            <p className="mb-2">
              <strong>Introduction - </strong>KIET Deemed to be University is committed to providing students with opportunities for holistic development and enhancing their employability, professional competencies, interdisciplinary knowledge and lifelong learning skills.
            </p>
            <p className="mb-2">
              In addition to the prescribed curriculum, the University offers <strong>Value Added Courses (VACs), Add-on Courses and Massive Open Online Courses (MOOCs)</strong> to provide students with exposure to emerging technologies, industry practices, professional skills, interdisciplinary learning and global learning resources.
            </p>
            <p className="ml-2">
              &bull; These courses are designed to complement the regular curriculum and contribute to the development of graduate attributes, employability skills and overall student development.
            </p>
          </div>

          {/* Section B: Objectives */}
          <div className="border border-black p-2.5 text-[10.5px] leading-normal mb-4">
            <p className="font-bold mb-1.5">Objectives of Value Added Courses - The major objectives of the Value Added Courses are:</p>
            <ol className="list-decimal ml-6 space-y-0.5">
              <li>To supplement the knowledge acquired through the regular curriculum.</li>
              <li>To provide exposure to emerging technologies and industry practices.</li>
              <li>To develop employability and professional skills.</li>
              <li>To promote interdisciplinary and experiential learning.</li>
            </ol>
          </div>

          {/* Section C: Detail of Value Added Courses Table */}
          <div className="font-bold text-[11.5px] text-[#0b1c30] mb-1.5">
            Detail of Value Added Courses
          </div>
          <table className="w-full border-collapse border border-black text-[10px] mb-4">
            <thead>
              <tr className="bg-[#f0f4fa] text-center font-bold">
                <th className="border border-black p-1.5 w-[6%]">S. No.</th>
                <th className="border border-black p-1.5 w-[26%] text-left">Course Name</th>
                <th className="border border-black p-1.5 w-[11%]">Duration (Hours)</th>
                <th className="border border-black p-1.5 w-[13%]">Mode Offline/Online/Hybrid</th>
                <th className="border border-black p-1.5 w-[20%] text-left">Resource Person/Agency</th>
                <th className="border border-black p-1.5 w-[12%]">No. of Students Enrolled</th>
                <th className="border border-black p-1.5 w-[12%]">No. of Students Completed</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? (
                courses.map((c, idx) => (
                  <tr key={c.id || idx}>
                    <td className="border border-black p-1.5 text-center font-semibold">{idx + 1}</td>
                    <td className="border border-black p-1.5 font-medium">{c.courseName || <span className="text-slate-400 italic">[Enter Course]</span>}</td>
                    <td className="border border-black p-1.5 text-center">{c.durationHours || '—'}</td>
                    <td className="border border-black p-1.5 text-center">{c.mode}</td>
                    <td className="border border-black p-1.5">{c.resourcePerson || '—'}</td>
                    <td className="border border-black p-1.5 text-center font-mono">{c.enrolled || '—'}</td>
                    <td className="border border-black p-1.5 text-center font-mono font-bold text-[#00236f]">{c.completed || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-black p-2 text-center">1</td>
                  <td className="border border-black p-2 text-slate-400 italic" colSpan={6}>No courses entered yet.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Section D: Course Content/Syllabus Table */}
          <div className="font-bold text-[11.5px] text-[#0b1c30] mb-1.5">
            Course Content/Syllabus
          </div>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="bg-[#f0f4fa] text-center font-bold">
                <th className="border border-black p-1.5 w-[15%]">Module</th>
                <th className="border border-black p-1.5 w-[65%] text-left">Topic</th>
                <th className="border border-black p-1.5 w-[20%]">No. of Hours</th>
              </tr>
            </thead>
            <tbody>
              {syllabus.length > 0 ? (
                syllabus.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td className="border border-black p-1.5 text-center font-semibold">{s.module || `Module ${idx + 1}`}</td>
                    <td className="border border-black p-1.5">{s.topic || <span className="text-slate-400 italic">[Enter Topic details]</span>}</td>
                    <td className="border border-black p-1.5 text-center font-mono">{s.hours || '—'}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr><td className="border border-black p-1.5 text-center">1</td><td className="border border-black p-1.5"></td><td className="border border-black p-1.5"></td></tr>
                  <tr><td className="border border-black p-1.5 text-center">2</td><td className="border border-black p-1.5"></td><td className="border border-black p-1.5"></td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-end text-[10px] text-slate-500 font-sans font-medium">
          Page 1 | 3
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="bg-white rounded-lg shadow-md border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between relative text-[12px] leading-relaxed">
        <div>
          {/* Header Repeat for Page 2 */}
          <div className="flex items-center justify-between border-b-2 border-[#00236f] pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-[#00236f] flex items-center justify-center p-1 bg-white">
                <span className="font-serif font-black text-[#00236f] text-sm tracking-tighter">KIET</span>
              </div>
              <span className="text-[10px] tracking-widest text-[#515f74] font-sans font-bold uppercase">
                REPORT ON VALUE ADDED COURSES
              </span>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-sans font-bold text-[#00236f] m-0">KIET UNIVERSITY</h2>
              <p className="text-[8.5px] font-sans text-[#515f74] m-0">DELHI-NCR, INDIA</p>
            </div>
          </div>

          {/* Section E: Learning Outcomes */}
          <div className="font-bold text-[11.5px] text-[#0b1c30] mb-2">
            Learning Outcomes: - After successful completion of the course, students will be able to:
          </div>
          <ul className="list-disc ml-6 space-y-1.5 text-[11px] mb-5">
            {learningOutcomes.length > 0 ? (
              learningOutcomes.map((lo, idx) => (
                <li key={idx} className="leading-relaxed">
                  {lo || <span className="text-slate-400 italic">[Learning outcome statement]</span>}
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">No learning outcomes added yet.</li>
            )}
          </ul>

          {/* Section F: Assessment and Certification Table */}
          <div className="font-bold text-[11.5px] text-[#0b1c30] mb-1.5">
            Assessment and Certification
          </div>
          <table className="w-full border-collapse border border-black text-[11px] mb-5">
            <thead>
              <tr className="bg-[#f0f4fa] font-bold">
                <th className="border border-black p-2 w-[45%] text-left">Particular</th>
                <th className="border border-black p-2 w-[55%] text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold">Assessment Method</td>
                <td className="border border-black p-2">{assessment?.method || <span className="text-slate-400 italic">[Assessment Method]</span>}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">Minimum Attendance Requirement</td>
                <td className="border border-black p-2">{assessment?.minAttendance || <span className="text-slate-400 italic">[e.g. 75%]</span>}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">Passing/Completion Criteria</td>
                <td className="border border-black p-2">{assessment?.passingCriteria || <span className="text-slate-400 italic">[Passing criteria]</span>}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">Certificate Issuing Authority</td>
                <td className="border border-black p-2">{assessment?.issuingAuthority || <span className="text-slate-400 italic">[Certificate Issuing Authority]</span>}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">Number of Certificates Issued</td>
                <td className="border border-black p-2 font-mono font-bold text-[#00236f]">{assessment?.certificatesIssued !== '' ? assessment?.certificatesIssued : '—'}</td>
              </tr>
            </tbody>
          </table>

          {/* Section G: OUTCOME AND IMPACT */}
          <div className="font-bold text-[12px] uppercase text-[#0b1c30] mb-1">
            OUTCOME AND IMPACT
          </div>
          <div className="font-bold text-[11px] text-[#515f74] mb-2">
            Suggested Impact Indicators
          </div>
          <ul className="list-disc ml-6 space-y-1 text-[11px] mb-5">
            {impactIndicators.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                <span>{item.label}</span>
                {item.val && <strong className="ml-1 text-[#00236f]">: {item.val}</strong>}
              </li>
            ))}
          </ul>

          {/* Section H: Student Feedback Summary */}
          <div className="mb-5 bg-[#fbfcfe] p-3 border border-slate-300 rounded text-[11px]">
            <div className="font-bold text-[11.5px] text-[#0b1c30] mb-2">
              Student Feedback Summary: - Overall Feedback Score: &nbsp;
              <span className="font-mono font-extrabold text-[#00236f] underline text-sm">
                {feedback?.score !== '' ? `${feedback?.score}` : '____'}
              </span>
              &nbsp;/ 5
            </div>
            <div className="font-bold text-slate-800 mb-1.5">Major Suggestions Received:</div>
            <ol className="list-decimal ml-6 space-y-1 text-slate-700">
              {feedback?.suggestions && feedback.suggestions.length > 0 ? (
                feedback.suggestions.map((sug, idx) => (
                  <li key={idx}>{sug || '____________________________________________________________________'}</li>
                ))
              ) : (
                <>
                  <li>____________________________________________________________________</li>
                  <li>____________________________________________________________________</li>
                  <li>____________________________________________________________________</li>
                </>
              )}
            </ol>
          </div>

          {/* Section I: Signatures Table */}
          <table className="w-full border-collapse border border-black text-[11px] mt-4">
            <tbody>
              <tr>
                <td className="border border-black p-3.5 w-1/2 align-top">
                  <div className="font-bold text-sm text-[#00236f] mb-2">Prepared By:</div>
                  <div className="space-y-1">
                    <div><strong>Name:</strong> {preparedBy?.name || '______________________________'}</div>
                    <div><strong>Designation:</strong> {preparedBy?.designation || '________________________'}</div>
                    <div><strong>Signature:</strong> {preparedBy?.signature || '___________________________'}</div>
                    <div><strong>Date:</strong> {preparedBy?.date || '_______________________________'}</div>
                  </div>
                </td>
                <td className="border border-black p-3.5 w-1/2 align-top">
                  <div className="font-bold text-sm text-[#00236f] mb-2">Approved By:</div>
                  <div className="space-y-1">
                    <div><strong>Name:</strong> {approvedBy?.name || '______________________________'}</div>
                    <div><strong>Designation:</strong> {approvedBy?.designation || '________________________'}</div>
                    <div><strong>Signature:</strong> {approvedBy?.signature || '___________________________'}</div>
                    <div><strong>Date:</strong> {approvedBy?.date || '_______________________________'}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Page 2 Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-end text-[10px] text-slate-500 font-sans font-medium">
          Page 2 | 3
        </div>
      </div>

      {/* ================= PAGE 3 ================= */}
      <div className="bg-white rounded-lg shadow-md border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between relative text-[12px] leading-relaxed">
        <div>
          {/* Header Repeat for Page 3 */}
          <div className="flex items-center justify-between border-b-2 border-[#00236f] pb-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-[#00236f] flex items-center justify-center p-1 bg-white">
                <span className="font-serif font-black text-[#00236f] text-sm tracking-tighter">KIET</span>
              </div>
              <span className="text-[10px] tracking-widest text-[#515f74] font-sans font-bold uppercase">
                SUPPORTING DOCUMENTS REPOSITORY
              </span>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-sans font-bold text-[#00236f] m-0">KIET UNIVERSITY</h2>
              <p className="text-[8.5px] font-sans text-[#515f74] m-0">DELHI-NCR, INDIA</p>
            </div>
          </div>

          {/* Section J: List of Supporting Documents */}
          <div className="font-bold text-[13px] text-[#0b1c30] mb-2">
            List of Supporting Documents: - The following documents shall be maintained for each VAC/Add-on Course:
          </div>
          <p className="text-[11px] text-slate-600 mb-4 italic">
            Official institutional audit checklist for NBA / NAAC compliance verification.
          </p>

          <ul className="space-y-2.5 text-[11px] ml-2">
            {supportingDocuments.map((doc, idx) => (
              <li key={doc.id || idx} className="flex items-start gap-2.5">
                <span className="text-base leading-none text-[#00236f]">&bull;</span>
                <div className="flex-1">
                  <span className="font-medium text-[#111]">{doc.title}</span>
                  {doc.attached && (
                    <span className="ml-2 inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded font-sans">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      Attached: {doc.fileName || 'Verified Document'}
                      {doc.fileSize && <span className="text-emerald-600 font-normal">({doc.fileSize})</span>}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Page 3 Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-end text-[10px] text-slate-500 font-sans font-medium">
          Page 3 | 3
        </div>
      </div>
    </div>
  );
}
