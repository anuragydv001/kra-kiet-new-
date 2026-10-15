"use client";

import React, { useState } from 'react';
import { KRAFormProps } from './types';
import MultiEvidenceUploader from './MultiEvidenceUploader';

// Exact Questions for KRA 8: Employer and Industry
export const KRA8_QUESTIONS = [
  { id: 1, statement: "The curriculum is relevant to current industry requirements." },
  { id: 2, statement: "The curriculum adequately covers emerging technologies and industry trends." },
  { id: 3, statement: "The curriculum provides adequate opportunities for developing technical/professional skills." },
  { id: 4, statement: "The curriculum promotes problem-solving and analytical thinking abilities." },
  { id: 5, statement: "The curriculum effectively develops communication and interpersonal skills." },
  { id: 6, statement: "The curriculum provides adequate practical, laboratory, and experiential learning." },
  { id: 7, statement: "The curriculum adequately integrates industry-oriented projects, internships, and real-world applications." },
  { id: 8, statement: "The curriculum incorporates multidisciplinary/interdisciplinary learning." },
  { id: 9, statement: "The curriculum adequately addresses employability and workplace readiness." },
  { id: 10, statement: "The curriculum encourages innovation, creativity, entrepreneurship, and professional competence." },
  { id: 11, statement: "The knowledge and skills acquired through the curriculum meet the expectations of employers." },
  { id: 12, statement: "Overall, the curriculum is effective in preparing students for professional careers." },
];

// Exact Questions for KRA 9a: Alumni > 4 Years Experience
export const KRA9A_QUESTIONS = [
  { id: 1, statement: "The extent to which the curriculum is meeting the industrial/professional needs" },
  { id: 2, statement: "How do you rate your acquired knowledge is useful in your domain and is interrelated with the other domains" },
  { id: 3, statement: "How good are the opportunities you got to pursue research renowned national/international institutes (like IITs/NITs/etc.)" },
  { id: 4, statement: "Rate your ability in designing a product or give services with the acquired knowledge during your course" },
  { id: 5, statement: "To what extent you are updated with the evolving trends, tools and technology in your area of specialization" },
  { id: 6, statement: "Your involvement and participation in the outreach activities for serving the needy and society at large" },
  { id: 7, statement: "How far you could explore the entrepreneurship opportunities in the area of your specialization" },
  { id: 8, statement: "How far your experience in different teams during study in the institute is useful in the current profession." },
  { id: 9, statement: "How do you rate the acquired managerial and communication skills help your professional growth" },
  { id: 10, statement: "Willingness to contribute towards development of the Institute" },
];

// Exact Questions for KRA 9b: Alumni < 4 Years Experience
export const KRA9B_QUESTIONS = [
  { id: 1, statement: "Curriculum and syllabus content were appropriate for placement, competitive exams and higher education." },
  { id: 2, statement: "Curriculum accommodates courses with experiential learning." },
  { id: 3, statement: "Encouragement for usage of current technology and modern tools during degree course in the department." },
  { id: 4, statement: "Infrastructure facilities namely library, labs, other campus facilities and overall teaching learning ambience." },
  { id: 5, statement: "All the academic processes of the institute are transparent." },
  { id: 6, statement: "Training and Placement cell provides ample campus placement opportunities." },
  { id: 7, statement: "Role of Internship/training/skill development opportunities provided at the institute towards placement and professional growth." },
  { id: 8, statement: "Impact of academic and other professional activities in developing leadership, teamwork and managerial skills." },
  { id: 9, statement: "Institute offers sufficient scholarships to meritorious and deserving students." },
  { id: 10, statement: "Your willingness to contribute towards development of the Institute" },
];

// Exact Questions for KRA 10: Academic Expert
export const KRA10_QUESTIONS = [
  { id: 1, statement: "The curriculum is relevant to current industry requirements." },
  { id: 2, statement: "The curriculum adequately covers emerging technologies and industry trends." },
  { id: 3, statement: "The curriculum provides adequate opportunities for developing technical/professional skills." },
  { id: 4, statement: "The curriculum promotes problem-solving and analytical thinking abilities." },
  { id: 5, statement: "The curriculum effectively develops communication and interpersonal skills." },
  { id: 6, statement: "The curriculum provides adequate practical, laboratory, and experiential learning." },
  { id: 7, statement: "The curriculum adequately integrates industry-oriented projects, internships, and real-world applications." },
  { id: 8, statement: "The curriculum incorporates multidisciplinary/interdisciplinary learning." },
  { id: 9, statement: "The curriculum adequately addresses employability and workplace readiness." },
  { id: 10, statement: "The curriculum encourages innovation, creativity, entrepreneurship, and professional competence." },
  { id: 11, statement: "The knowledge and skills acquired through the curriculum meet the expectations of employers." },
  { id: 12, statement: "Overall, the curriculum is effective in preparing students for professional careers." },
];

const RATING_OPTIONS = [
  { value: 1, label: 'Poor (1)', short: 'Poor' },
  { value: 2, label: 'Satisfactory (2)', short: 'Satisfactory' },
  { value: 3, label: 'Good (3)', short: 'Good' },
  { value: 4, label: 'Very Good (4)', short: 'Very Good' },
  { value: 5, label: 'Excellent (5)', short: 'Excellent' },
];

export default function KRAFeedbackSurveyForm({
  kraCode,
  departmentName,
  cycle,
  hodName,
  formData,
  patchFormData,
}: KRAFormProps) {
  const cleanNum = kraCode.replace(/[^0-9]/g, '');
  const isKRA8 = cleanNum === '8';
  const isKRA9 = cleanNum === '9';
  const isKRA10 = cleanNum === '10';

  const [activeTab, setActiveTab] = useState<'profile' | 'survey' | 'suggestions' | 'evidence'>('profile');

  const custom = formData.customFields || {};
  const ratings: Record<number, number> = custom.ratings || {};
  const alumniType: 'gt4' | 'lt4' = custom.alumniType || 'lt4';

  const questions = isKRA8
    ? KRA8_QUESTIONS
    : isKRA9
    ? alumniType === 'gt4'
      ? KRA9A_QUESTIONS
      : KRA9B_QUESTIONS
    : KRA10_QUESTIONS;

  const updateField = (field: string, val: any) => {
    const updated = { ...custom, [field]: val };
    patchFormData({
      customFields: updated,
    });
  };

  const handleRating = (qId: number, val: number) => {
    const nextRatings = { ...ratings, [qId]: val };
    const answeredCount = Object.keys(nextRatings).length;
    patchFormData({
      customFields: { ...custom, ratings: nextRatings },
      achievementClaim: `${answeredCount} / ${questions.length} Evaluated`,
    });
  };

  const ratedCount = Object.keys(ratings).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-Header Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 pt-2 flex items-center gap-1 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#00236f] text-[#00236f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">badge</span>
          <span>{isKRA9 ? 'Alumni Profile' : isKRA8 ? 'Employer Details' : 'Expert Details'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('survey')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'survey'
              ? 'border-[#00236f] text-[#00236f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">quiz</span>
          <span>Survey Evaluation ({questions.length} Qs)</span>
          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
            {ratedCount}/{questions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('suggestions')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'suggestions'
              ? 'border-[#00236f] text-[#00236f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">comment</span>
          <span>Suggestions &amp; Verification</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evidence')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'evidence'
              ? 'border-[#00236f] text-[#00236f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">attach_file</span>
          <span>Supporting Evidence</span>
        </button>
      </div>

      {/* Main Form Scroll Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Auto-populated Institutional Information (Exactly matching KRA 7) */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#00236f] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Automatically Populated Institutional Information
            </span>
            <span className="text-[10px] text-slate-500 italic">System Profile</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/90 p-2 rounded border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Department:</span>
              <span className="font-semibold text-slate-800 truncate block">{departmentName}</span>
            </div>
            <div className="bg-white/90 p-2 rounded border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Academic Session / Cycle:</span>
              <span className="font-semibold text-slate-800 block">2026-2027 &bull; {cycle}</span>
            </div>
            <div className="bg-white/90 p-2 rounded border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Head of Department / Dean:</span>
              <span className="font-semibold text-slate-800 truncate block">{hodName || 'Dean'}</span>
            </div>
            <div className="bg-white/90 p-2 rounded border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Institution:</span>
              <span className="font-semibold text-slate-800 truncate block">KIET Deemed to be University</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic m-0">
            * Note: These institutional details are auto-filled and appear on the official report without requiring repetitive manual input.
          </p>
        </div>

        {/* TAB 1: PROFILE DETAILS */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
            <div className="border-b pb-2 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                  {isKRA9 ? 'Alumni Profile Details' : isKRA8 ? 'Employer & Industry Details Required' : 'Academic Expert Details Required'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Only enter the necessary respondent information.
                </p>
              </div>
            </div>

            {/* KRA 9: Experience Category Selector */}
            {isKRA9 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-xs font-bold text-slate-800 block mb-1.5">
                  Alumni Experience Category:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded border cursor-pointer transition ${
                      alumniType === 'lt4'
                        ? 'bg-blue-50 border-[#00236f] text-[#00236f] font-bold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="alumniType"
                      checked={alumniType === 'lt4'}
                      onChange={() => updateField('alumniType', 'lt4')}
                      className="text-[#00236f]"
                    />
                    <span>Less than 4 Years (Form 9b)</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded border cursor-pointer transition ${
                      alumniType === 'gt4'
                        ? 'bg-blue-50 border-[#00236f] text-[#00236f] font-bold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="alumniType"
                      checked={alumniType === 'gt4'}
                      onChange={() => updateField('alumniType', 'gt4')}
                      className="text-[#00236f]"
                    />
                    <span>More than 4 Years (Form 9a)</span>
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organization */}
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isKRA10 ? 'Academic Institution / University Name' : 'Name of Organization'} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={custom.organization || ''}
                  onChange={(e) => updateField('organization', e.target.value)}
                  placeholder={isKRA10 ? 'e.g., IIT Delhi / Jamia Millia Islamia' : 'e.g., Tata Consultancy Services / Google India'}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Respondent Name */}
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isKRA9 ? 'Name of Alumnus / Alumna' : isKRA10 ? 'Name of Academic Expert' : 'Name Respondent'} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={custom.respondentName || ''}
                  onChange={(e) => updateField('respondentName', e.target.value)}
                  placeholder="e.g., Mr. Amit Verma / Dr. R. K. Singhal"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Designation */}
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={custom.designation || ''}
                  onChange={(e) => updateField('designation', e.target.value)}
                  placeholder={isKRA10 ? 'e.g., Professor & Head' : 'e.g., Senior Technical Director / Lead Architect'}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Email / Contact Number */}
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email / Contact Number <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={custom.contactNumber || custom.mobileNumber || ''}
                  onChange={(e) => {
                    updateField('contactNumber', e.target.value);
                    updateField('mobileNumber', e.target.value);
                  }}
                  placeholder="e.g., expert@domain.com / +91 9876543210"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Relationship with Institution (for KRA 8 & 10) */}
              {!isKRA9 && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Relationship with the Institution
                  </label>
                  <select
                    value={custom.relationship || (isKRA10 ? 'Academic Expert' : 'Employer of Graduates')}
                    onChange={(e) => updateField('relationship', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:border-[#00236f]"
                  >
                    {isKRA10 ? (
                      <>
                        <option value="Academic Expert">Academic Expert</option>
                        <option value="Board of Studies Member">Board of Studies Member</option>
                        <option value="External Examiner / Reviewer">External Examiner / Reviewer</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Employer of Graduates">Employer of Graduates</option>
                        <option value="Industry Partner">Industry Partner</option>
                        <option value="Recruiter">Recruiter</option>
                        <option value="Industry Expert">Industry Expert</option>
                        <option value="Alumni Employer">Alumni Employer</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* Extra KRA 9 fields */}
              {isKRA9 && (
                <>
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age / Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={custom.age || ''}
                        onChange={(e) => updateField('age', e.target.value)}
                        placeholder="Age (e.g. 26)"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                      />
                      <select
                        value={custom.gender || 'Male'}
                        onChange={(e) => updateField('gender', e.target.value)}
                        className="w-full px-2 py-2 text-xs border border-slate-300 rounded-md bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Year</label>
                    <input
                      type="text"
                      value={custom.passingYear || (alumniType === 'gt4' ? '2019' : '2023')}
                      onChange={(e) => updateField('passingYear', e.target.value)}
                      placeholder="e.g., 2019"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Status</label>
                    <select
                      value={custom.currentStatus || 'Pvt. sector'}
                      onChange={(e) => updateField('currentStatus', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white"
                    >
                      <option value="Pvt. sector">Pvt. sector</option>
                      <option value="Govt. Sector">Govt. Sector</option>
                      <option value="Higher Education">Higher Education</option>
                      <option value="Independent/Self venture">Independent / Self venture</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Package Per Annum (Lakhs)</label>
                    <input
                      type="text"
                      value={custom.package || '12.5'}
                      onChange={(e) => updateField('package', e.target.value)}
                      placeholder="e.g. 14.5"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2 bg-slate-50 border border-slate-200 rounded p-3">
                    <span className="text-xs font-bold text-slate-700 block mb-1">Industry Expectations from Students:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Technology:</label>
                        <input
                          type="text"
                          value={custom.expectTech || 'Cloud, Docker, LLMs'}
                          onChange={(e) => updateField('expectTech', e.target.value)}
                          className="w-full px-2 py-1 text-xs border rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Platform:</label>
                        <input
                          type="text"
                          value={custom.expectPlatform || 'AWS, Linux, GitHub'}
                          onChange={(e) => updateField('expectPlatform', e.target.value)}
                          className="w-full px-2 py-1 text-xs border rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Others:</label>
                        <input
                          type="text"
                          value={custom.expectOthers || 'Agile, Communication'}
                          onChange={(e) => updateField('expectOthers', e.target.value)}
                          className="w-full px-2 py-1 text-xs border rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('survey')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>Proceed to Evaluation Questions</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SURVEY QUESTIONS */}
        {activeTab === 'survey' && (
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
            <div className="border-b pb-2 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                  Feedback Survey Evaluation ({questions.length} Statements)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select rating from 1 (Poor) to 5 (Excellent) for each item.
                </p>
              </div>
              <span className="text-xs font-bold text-[#00236f]">
                {ratedCount} / {questions.length} Rated
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {questions.map((q) => {
                const currentRating = ratings[q.id];
                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border transition ${
                      currentRating
                        ? 'border-blue-200 bg-blue-50/15'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-[#00236f] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {q.id}
                      </span>
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        {q.statement}
                      </p>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 pl-7">
                      {RATING_OPTIONS.map((opt) => {
                        const isSelected = currentRating === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleRating(q.id, opt.value)}
                            className={`py-1.5 px-2 rounded text-center text-xs font-semibold transition cursor-pointer border flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-[#00236f] text-white border-[#00236f] shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className="text-[12px] font-bold">{opt.value}</span>
                            <span className={`text-[9.5px] truncate max-w-full ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                              {opt.short}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition cursor-pointer"
              >
                Back to Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('suggestions')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>Proceed to Suggestions</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SUGGESTIONS */}
        {activeTab === 'suggestions' && (
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                Constructive Suggestions &amp; Digital Signature
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Enter suggestions for curriculum revision, new courses, or industry tools.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suggestions if Any:
              </label>
              <textarea
                rows={5}
                value={custom.suggestions || ''}
                onChange={(e) => updateField('suggestions', e.target.value)}
                placeholder="Please enter suggestions to strengthen the curriculum, recommended new software tools, industry certifications, or laboratory improvements..."
                className="w-full p-3 text-xs border border-slate-300 rounded-md focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs">
              <span className="font-bold text-slate-700 block mb-1">
                Signatory Record (Appears on Official Proforma)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Signatory: </span>
                  <strong className="text-slate-800">{custom.respondentName || 'Representative'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Date: </span>
                  <strong className="text-slate-800">{new Date().toLocaleDateString('en-GB')}</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('survey')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition cursor-pointer"
              >
                Back to Survey
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('evidence')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>Proceed to Evidence</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                Documentary Evidence &amp; Verification
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Attach signed feedback forms, minutes, or survey analysis exports.
              </p>
            </div>

            <MultiEvidenceUploader
              formData={formData}
              patchFormData={patchFormData}
            />

            <div className="pt-3 border-t flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('suggestions')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition cursor-pointer"
              >
                Back to Suggestions
              </button>
              <span className="text-xs text-slate-500 italic">
                Ready to submit — Click &quot;Submit to VC&quot; on the top bar
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
