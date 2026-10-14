"use client";

import React from 'react';
import { KRA7ReportData } from '../../types/kra';
import { KRA7_SURVEY_QUESTIONS } from '../../services/kra7ReportService';

interface OfficialKRA7ReportPreviewProps {
  reportData: KRA7ReportData;
  scale?: number;
}

export default function OfficialKRA7ReportPreview({
  reportData,
  scale = 1,
}: OfficialKRA7ReportPreviewProps) {
  const {
    academicYear,
    semester,
    department,
    facultyName,
    designation,
    email,
    mobileNumber,
    subject,
    ratings,
    overallSatisfaction,
    suggestions,
    signatureName,
    signatureDate,
  } = reportData;

  // Split questions 1-6 for Page 1, and 7-10 for Page 2
  const page1Questions = KRA7_SURVEY_QUESTIONS.slice(0, 6);
  const page2Questions = KRA7_SURVEY_QUESTIONS.slice(6, 10);

  const renderCheckmark = (questionId: number, ratingCol: number) => {
    const selected = ratings[questionId];
    if (selected === ratingCol) {
      return (
        <span className="font-bold text-[14px] text-black select-none">
          ✔
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
      style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
    >
      {/* ================= PAGE 1 ================= */}
      <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between relative text-[12px] leading-normal print:shadow-none print:border-none print:m-0 print:p-8">
        <div>
          {/* Institutional Header */}
          <div className="text-center pb-2 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/kiet_university_logo.png"
              alt="KIET Deemed to be University Official Crest"
              className="h-16 mx-auto object-contain max-w-[280px]"
            />
            <p className="font-serif font-bold text-[12px] text-black mt-1 mb-0 tracking-tight">
              Krishna Institute of Engineering &amp; Technology (KIET) (Deemed to be university)
            </p>
            <div className="w-full border-b-[2.5px] border-[#622423] mt-2" />
          </div>

          {/* Report Title */}
          <div className="text-center my-3">
            <h1 className="font-serif font-bold text-[15px] underline tracking-tight text-black m-0">
              Curriculum Feedback Survey Form (for Faculty Members)
            </h1>
          </div>

          {/* Greeting & Introductory Purpose */}
          <div className="mb-4">
            <p className="font-serif font-bold text-[12.5px] text-black mb-1">
              Dear Faculty Members!
            </p>
            <p className="font-serif text-[11.5px] text-black text-justify leading-relaxed m-0">
              This feedback form is intended to collect information related to your satisfaction towards the curriculum, syllabus, teaching learning and evaluation. The information provided by you will be kept confidential and will be used as important feedback for quality improvement of the program of the institution. You may also visit the KIET&apos;s website at{' '}
              <a
                href="https://www.kiet.edu/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-800 underline"
              >
                https://www.kiet.edu/
              </a>{' '}
              for more details.
            </p>
          </div>

          {/* Table 0: Details of Faculty Member */}
          <table className="w-full border-collapse border border-black text-[11px] mb-4">
            <thead>
              <tr className="bg-[#f9f9f9]">
                <th
                  colSpan={2}
                  className="border border-black p-1.5 text-center font-bold text-[11.5px] text-black"
                >
                  Details of Faculty Member
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-2.5 py-1 font-bold w-[32%] bg-[#fafafa]">
                  Name &amp; Designation
                </td>
                <td className="border border-black px-2.5 py-1 text-black">
                  {facultyName ? (
                    <span>
                      {facultyName}
                      {designation ? `, ${designation}` : ''}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Not specified</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2.5 py-1 font-bold bg-[#fafafa]">
                  Email ID
                </td>
                <td className="border border-black px-2.5 py-1 text-black font-mono text-[10.5px]">
                  {email || <span className="text-slate-400 italic">Not specified</span>}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2.5 py-1 font-bold bg-[#fafafa]">
                  Mobile No.
                </td>
                <td className="border border-black px-2.5 py-1 text-black">
                  {mobileNumber ? (
                    <span>{mobileNumber}</span>
                  ) : (
                    <span className="text-amber-700 italic font-sans text-[10px]">
                      [Required — Enter Mobile No. in form]
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2.5 py-1 font-bold bg-[#fafafa]">
                  Academic Year/ Semester
                </td>
                <td className="border border-black px-2.5 py-1 text-black">
                  {academicYear}
                  {semester ? ` / ${semester}` : ''}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2.5 py-1 font-bold bg-[#fafafa]">
                  Department
                </td>
                <td className="border border-black px-2.5 py-1 text-black font-semibold">
                  {department || <span className="text-slate-400 italic">Not assigned</span>}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2.5 py-1 font-bold bg-[#fafafa]">
                  Subject
                </td>
                <td className="border border-black px-2.5 py-1 text-black">
                  {subject ? (
                    <span className="font-medium">{subject}</span>
                  ) : (
                    <span className="text-amber-700 italic font-sans text-[10px]">
                      [Required — Enter Subject in form]
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Table 1: Feedback Survey Form for Faculty member (Questions 1 - 6) */}
          <table className="w-full border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-[#f9f9f9]">
                <th
                  colSpan={7}
                  className="border border-black p-1.5 text-center font-bold text-[11.5px] text-black"
                >
                  Feedback Survey Form for Faculty member
                </th>
              </tr>
              <tr className="bg-[#f4f4f4] text-center font-bold text-[10.5px]">
                <th className="border border-black p-1 w-[6%]">S<br />No.</th>
                <th className="border border-black p-1 w-[46%] text-center">
                  Tick Any<br />Grading from 1 to 5
                </th>
                <th className="border border-black p-1 w-[9%]">Poor<br />(1)</th>
                <th className="border border-black p-1 w-[13%]">Satisfactor<br />y (2)</th>
                <th className="border border-black p-1 w-[8%]">Goo<br />d (3)</th>
                <th className="border border-black p-1 w-[9%]">Very<br />Good (4)</th>
                <th className="border border-black p-1 w-[9%]">Excellen<br />t (5 )</th>
              </tr>
            </thead>
            <tbody>
              {page1Questions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50">
                  <td className="border border-black p-1.5 text-center font-bold align-top">
                    {q.id}.
                  </td>
                  <td className="border border-black p-1.5 text-left leading-snug align-top">
                    {q.statement}
                  </td>
                  <td className="border border-black p-1 text-center align-middle">
                    {renderCheckmark(q.id, 1)}
                  </td>
                  <td className="border border-black p-1 text-center align-middle">
                    {renderCheckmark(q.id, 2)}
                  </td>
                  <td className="border border-black p-1 text-center align-middle">
                    {renderCheckmark(q.id, 3)}
                  </td>
                  <td className="border border-black p-1 text-center align-middle">
                    {renderCheckmark(q.id, 4)}
                  </td>
                  <td className="border border-black p-1 text-center align-middle">
                    {renderCheckmark(q.id, 5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-sans print:border-none">
          <span>KRA 7 &bull; Curriculum Feedback Survey Form (for Faculty Members)</span>
          <span>Page 1 of 2</span>
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between relative text-[12px] leading-normal print:shadow-none print:border-none print:m-0 print:p-8">
        <div>
          {/* Institutional Header (Repeated on Page 2 as in official template) */}
          <div className="text-center pb-2 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/kiet_university_logo.png"
              alt="KIET Deemed to be University Official Crest"
              className="h-16 mx-auto object-contain max-w-[280px]"
            />
            <p className="font-serif font-bold text-[12px] text-black mt-1 mb-0 tracking-tight">
              Krishna Institute of Engineering &amp; Technology (KIET) (Deemed to be university)
            </p>
            <div className="w-full border-b-[2.5px] border-[#622423] mt-2 mb-4" />
          </div>

          {/* Table 1 Continuation: Questions 7 - 10 */}
          <table className="w-full border-collapse border border-black text-[11px] mb-6">
            <tbody>
              {page2Questions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50">
                  <td className="border border-black p-1.5 text-center font-bold align-top w-[6%]">
                    {q.id}.
                  </td>
                  <td className="border border-black p-1.5 text-left leading-snug align-top w-[46%]">
                    {q.statement}
                  </td>
                  <td className="border border-black p-1 text-center align-middle w-[9%]">
                    {renderCheckmark(q.id, 1)}
                  </td>
                  <td className="border border-black p-1 text-center align-middle w-[13%]">
                    {renderCheckmark(q.id, 2)}
                  </td>
                  <td className="border border-black p-1 text-center align-middle w-[8%]">
                    {renderCheckmark(q.id, 3)}
                  </td>
                  <td className="border border-black p-1 text-center align-middle w-[9%]">
                    {renderCheckmark(q.id, 4)}
                  </td>
                  <td className="border border-black p-1 text-center align-middle w-[9%]">
                    {renderCheckmark(q.id, 5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table 2: Overall Satisfaction on scale of 1 to 10 */}
          <table className="w-full border-collapse border border-black text-[11px] mb-6">
            <thead>
              <tr className="bg-[#f9f9f9]">
                <th
                  colSpan={10}
                  className="border border-black p-2 text-left font-bold text-[11.5px] text-black leading-snug"
                >
                  On a scale of 1 to 10 how do you rate your overall satisfaction with the prescribed
                  syllabus and the curriculum?
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSelected = overallSatisfaction === num;
                  return (
                    <td
                      key={num}
                      className={`border border-black p-2.5 text-center align-middle transition-colors ${
                        isSelected
                          ? 'bg-[#d5e3fc] font-black text-[#00236f] ring-1 ring-inset ring-[#00236f]'
                          : 'bg-white text-black font-semibold'
                      }`}
                      style={{ width: '10%' }}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[12px]">{num}</span>
                        {isSelected && (
                          <span className="text-[11px] font-bold text-[#00236f] leading-none mt-0.5">
                            ✔
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>

          {/* Table 3: Suggestions if Any */}
          <table className="w-full border-collapse border border-black text-[11px] mb-8">
            <thead>
              <tr className="bg-[#f9f9f9]">
                <th className="border border-black p-1.5 text-left font-bold text-[11.5px] text-black">
                  Suggestions if Any:
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-3 min-h-[90px] h-[90px] align-top text-black text-[11.5px] leading-relaxed">
                  {suggestions ? (
                    <p className="whitespace-pre-wrap m-0">{suggestions}</p>
                  ) : (
                    <span className="text-slate-400 italic font-sans text-[10.5px]">
                      (No additional suggestions recorded)
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signature Block */}
          <div className="mt-8 flex flex-col items-end text-right pr-2">
            <p className="font-serif font-bold text-[12.5px] underline text-black mb-1">
              Signature of Faculty Member
            </p>
            <p className="font-serif font-semibold text-[11px] text-slate-800 m-0">
              {signatureName || facultyName || 'Faculty Member'}
            </p>
            <p className="font-sans text-[10px] text-slate-500 m-0">
              Date: {signatureDate || new Date().toLocaleDateString('en-GB')}
            </p>
            <p className="font-sans text-[9px] text-emerald-700 font-semibold tracking-wider uppercase mt-1">
              [ Digitally Verified via KIET Portal ]
            </p>
          </div>
        </div>

        {/* Page 2 Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-sans print:border-none">
          <span>KRA 7 &bull; Curriculum Feedback Survey Form (for Faculty Members)</span>
          <span>Page 2 of 2</span>
        </div>
      </div>
    </div>
  );
}
