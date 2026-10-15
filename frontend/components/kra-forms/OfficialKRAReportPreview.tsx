"use client";

import React from 'react';

interface OfficialKRAReportPreviewProps {
  reportData: any;
  scale?: number;
}

export default function OfficialKRAReportPreview({
  reportData,
  scale = 1,
}: OfficialKRAReportPreviewProps) {
  const {
    kraNumber,
    kraCode = '',
    reportTitle,
    department = 'Computer Science & Engineering',
    academicYear = '2026-2027',
    cycle = 'July – August',
    reportDate = new Date().toLocaleDateString('en-GB'),
    preparedBy = 'Faculty Coordinator',
    designation = 'Professor & Dean',
    organization = 'Partner Organization',
    email = '',
    mobileNumber = '',
    subject = '',
    columns = [],
    rows = [],
    tableTitle = '',
    surveyQuestions = [],
    ratings = {},
    overallSatisfaction,
    suggestions = '',
    extraSections = [],
    narrative = '',
    customFields = {},
  } = reportData;

  const cleanNum = parseInt(String(kraNumber || kraCode).replace(/[^0-9]/g, ''), 10) || 0;

  // Header component with official KIET logo and maroon divider matching KRA 7
  const KietOfficialHeader = () => (
    <div className="text-center pb-2 mb-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/kiet_university_logo.png"
        alt="KIET Deemed to be University Official Crest"
        className="h-16 mx-auto object-contain max-w-[280px]"
      />
      <p className="font-serif font-bold text-[12.5px] text-black mt-1 mb-0 tracking-tight">
        Krishna Institute of Engineering &amp; Technology (KIET) (Deemed to be university)
      </p>
      <p className="font-serif text-[10px] text-slate-600 mt-0.5">
        Delhi-NCR, Ghaziabad — ISO 9001:2015 Certified
      </p>
      <div className="w-full border-b-[2.5px] border-[#622423] mt-2" />
    </div>
  );

  // Common dual signature block matching official KIET proforma
  const KietSignatureBlock = ({
    leftLabel = 'Prepared By',
    leftName = preparedBy,
    leftDesig = designation,
    rightLabel = 'Approved By',
    rightName = 'HOD / Dean',
    rightDesig = department,
  }: any) => (
    <div className="pt-6 border-t border-slate-300 mt-8">
      <div className="grid grid-cols-2 gap-8 text-[11px]">
        <div>
          <p className="font-bold m-0">{leftLabel}:</p>
          <div className="border-b border-black w-48 mt-8 mb-1" />
          <p className="m-0 font-bold">{leftName || 'Coordinator Name'}</p>
          <p className="text-[10px] text-slate-600 m-0">{leftDesig}</p>
          <p className="text-[10px] text-slate-600 m-0">Date: {reportDate}</p>
        </div>
        <div className="text-right">
          <p className="font-bold m-0">{rightLabel}:</p>
          <div className="border-b border-black w-48 ml-auto mt-8 mb-1" />
          <p className="m-0 font-bold">{rightName || 'HOD / Dean'}</p>
          <p className="text-[10px] text-slate-600 m-0">{rightDesig}</p>
          <p className="text-[10px] text-slate-600 m-0">Signature with Official Seal</p>
        </div>
      </div>
      <div className="flex justify-between items-center text-[9.5px] text-slate-500 mt-6 pt-2 border-t border-slate-200">
        <span>KIET Deemed to be University &bull; Official KRA Report</span>
        <span>Official Prescribed Format &bull; Page 1 of 1</span>
      </div>
    </div>
  );

  // Helper to render checkmarks
  const renderCheckmark = (qId: number, val: number) => {
    return ratings[qId] === val ? (
      <span className="font-bold text-[13px] text-black">✔</span>
    ) : null;
  };

  // Robust cell value resolver supporting objects, 0-based arrays, and 1-based (S.No. prepended) arrays
  const getVal = (item: any, idx1Based: number, key: string, fallback: any = ''): any => {
    if (!item) return fallback;
    if (Array.isArray(item)) {
      if (item.length > 5) {
        const v = item[idx1Based];
        return v !== undefined && v !== null && v !== '' ? v : fallback;
      }
      const v = item[idx1Based - 1];
      return v !== undefined && v !== null && v !== '' ? v : fallback;
    }
    const v = item[key];
    return v !== undefined && v !== null && v !== '' ? v : fallback;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 8: Curriculum Feedback (Employer and Industry)
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 8) {
    const k8Questions = [
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

    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11.5px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[15px] underline tracking-tight text-black m-0">
                Curriculum Feedback Survey Form
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                (for Employer and Industry)
              </p>
            </div>

            <div className="mb-4">
              <p className="font-serif font-bold text-[12.5px] text-black mb-1">Dear Sir!</p>
              <p className="font-serif text-[11px] text-black text-justify leading-relaxed m-0">
                This feedback form is intended to collect information related to your satisfaction towards the curriculum, syllabus, teaching learning and evaluation. The information provided by you will be kept confidential and will be used as important feedback for quality improvement of the program of the institution. You may also visit the KIET&apos;s website at{' '}
                <a href="https://www.kiet.edu/" target="_blank" rel="noreferrer" className="text-blue-800 underline">
                  https://www.kiet.edu/
                </a>{' '}
                for more details.
              </p>
            </div>

            {/* Table 0: Details Required */}
            <table className="w-full border-collapse border border-black text-[11px] mb-4">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th colSpan={2} className="border border-black p-1.5 text-center font-bold">
                    Details Required
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1.5 font-bold w-[35%]">Name of Organization</td>
                  <td className="border border-black p-1.5">{organization || customFields.organization || 'Tata Consultancy Services'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Name Respondent</td>
                  <td className="border border-black p-1.5">{preparedBy || customFields.respondentName || 'Mr. Rajesh Verma'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Designation</td>
                  <td className="border border-black p-1.5">{designation || customFields.designation || 'Technical Director'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Email/Contact Number</td>
                  <td className="border border-black p-1.5 font-mono text-[10.5px]">
                    {customFields.contactNumber || customFields.mobileNumber || email || 'employer@partner.com'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Relationship with the Institution</td>
                  <td className="border border-black p-1.5">{customFields.relationship || 'Employer of Graduates'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Department Evaluated (Auto)</td>
                  <td className="border border-black p-1.5 bg-[#fbfbfb]">{department} &bull; {academicYear}</td>
                </tr>
              </tbody>
            </table>

            {/* Table 1: Feedback Survey Form */}
            <div className="mb-4">
              <table className="w-full border-collapse border border-black text-[10.5px]">
                <thead>
                  <tr className="bg-[#f2f2f2]">
                    <th className="border border-black p-1 text-center w-[6%]">S No.</th>
                    <th className="border border-black p-1.5 text-left w-[58%]">Tick Any Grading from 1 to 5</th>
                    <th className="border border-black p-1 text-center w-[7%]">Poor (1)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Satisfactory (2)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Good (3)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Very Good (4)</th>
                    <th className="border border-black p-1 text-center w-[8%]">Excellent (5)</th>
                  </tr>
                </thead>
                <tbody>
                  {k8Questions.map((q) => (
                    <tr key={q.id}>
                      <td className="border border-black p-1 text-center font-bold">{q.id}.</td>
                      <td className="border border-black p-1 text-justify leading-tight">{q.statement}</td>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <td key={val} className="border border-black p-1 text-center font-bold text-[12px]">
                          {renderCheckmark(q.id, val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table 2: Suggestions if Any */}
            <table className="w-full border-collapse border border-black text-[11px] mb-4">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1.5 text-left font-bold">Suggestions if Any:</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 min-h-[50px] text-justify bg-[#fafafa]">
                    {suggestions || customFields.suggestions || 'Curriculum aligns well with industry expectations. Recommend introducing more cloud-native deployment projects.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-300 mt-6 flex justify-between items-end text-[11px]">
            <div>
              <p className="m-0 font-bold">Verified by Department:</p>
              <p className="m-0 text-slate-700">{department}</p>
              <p className="m-0 text-[10px] text-slate-500">Academic Year: {academicYear} &bull; Cycle: {cycle}</p>
            </div>
            <div className="text-right">
              <div className="border-b border-black w-48 ml-auto mb-1" />
              <p className="m-0 font-bold">Signature of Employer / Industry Representative</p>
              <p className="m-0 text-[10px] text-slate-500">{customFields.organization || organization || 'Industry Partner'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 9: Alumni Survey Form (9a / 9b)
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 9) {
    const isGt4 = customFields.alumniType === 'gt4';
    const qList = isGt4
      ? [
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
        ]
      : [
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

    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[15px] underline tracking-tight text-black m-0">
                Alumni Survey Form
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                {isGt4
                  ? '(For Alumni having more than 4 Years Professional Experience after Passing Degree Course)'
                  : '(For Alumni having less than 4 Years Professional Experience after Passing Degree Course)'}
              </p>
            </div>

            <div className="mb-4">
              <p className="font-serif font-bold text-[12px] text-black mb-1">Dear Alumnus/ Alumna!</p>
              <p className="font-serif text-[10.5px] text-black text-justify leading-relaxed m-0">
                You have spent a remarkable time at KIET Group of Institutions while pursuing your degree course. We shall be thankful if you can spare some of your valuable time to fill up the alumni feedback form and give us valuable suggestions for further improvement of the quality of professional education that we impart at the Institute. You may also visit the KIET&apos;s website at{' '}
                <a href="https://www.kiet.edu/" target="_blank" rel="noreferrer" className="text-blue-800 underline">
                  https://www.kiet.edu/
                </a>{' '}
                for more details.
              </p>
            </div>

            {/* Table 0: ALUMNI PROFILE */}
            <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th colSpan={4} className="border border-black p-1 text-center font-bold">
                    ALUMNI PROFILE
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold w-[25%]">Name of Alumnus/ Alumna</td>
                  <td className="border border-black p-1 w-[35%]">{preparedBy || customFields.respondentName || 'Rohan Mehra'}</td>
                  <td className="border border-black p-1 font-bold w-[20%]">Age / Gender</td>
                  <td className="border border-black p-1 w-[20%]">{customFields.age || '26'} / {customFields.gender || 'Male'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold">Department of Study (Auto)</td>
                  <td className="border border-black p-1 bg-[#fbfbfb]">{department}</td>
                  <td className="border border-black p-1 font-bold">Passing Year</td>
                  <td className="border border-black p-1">{customFields.passingYear || (isGt4 ? '2019' : '2023')}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold">Mobile Number &amp; Email</td>
                  <td className="border border-black p-1 font-mono text-[10px]">
                    {customFields.contactNumber || customFields.mobileNumber || '+91 9876543210'} &bull; {email || customFields.email || 'rohan.m@gmail.com'}
                  </td>
                  <td className="border border-black p-1 font-bold">Current Status</td>
                  <td className="border border-black p-1">{customFields.currentStatus || 'Pvt. sector'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold">Current Position &amp; Company</td>
                  <td colSpan={3} className="border border-black p-1">
                    {customFields.designation || 'Lead Data Scientist'} at {organization || customFields.organization || 'Amazon India'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Detail of Experience */}
            <div className="font-bold text-[11px] mb-1">Detail of Experience (if applicable)</div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-center w-[6%]">S. No.</th>
                  <th className="border border-black p-1 text-left w-[34%]">Name of Organization</th>
                  <th className="border border-black p-1 text-center w-[12%]">From</th>
                  <th className="border border-black p-1 text-center w-[12%]">To</th>
                  <th className="border border-black p-1 text-left w-[22%]">Experience Type</th>
                  <th className="border border-black p-1 text-right w-[14%]">Package (LPA)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1 text-center font-bold">1</td>
                  <td className="border border-black p-1">{organization || customFields.organization || 'Amazon Development Centre'}</td>
                  <td className="border border-black p-1 text-center">{isGt4 ? '2019' : '2023'}</td>
                  <td className="border border-black p-1 text-center">Present</td>
                  <td className="border border-black p-1">Industry / IT Software</td>
                  <td className="border border-black p-1 text-right font-mono">{customFields.package || '16.5'}</td>
                </tr>
              </tbody>
            </table>

            {/* Industry expectations */}
            <div className="border border-black p-2 text-[10px] bg-[#fbfbfb] mb-3">
              <span className="font-bold block mb-1">Industry expectations from student:</span>
              <div className="grid grid-cols-3 gap-2">
                <div><strong>Technology:</strong> {customFields.expectTech || 'Cloud, Docker, LLMs'}</div>
                <div><strong>Platform:</strong> {customFields.expectPlatform || 'AWS, Linux, GitHub'}</div>
                <div><strong>Others:</strong> {customFields.expectOthers || 'Agile, Communication'}</div>
              </div>
            </div>

            {/* Table 2: ALUMNI FEEDBACK FORM */}
            <div className="mb-3">
              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-[#f2f2f2]">
                    <th className="border border-black p-1 text-center w-[6%]">S. No.</th>
                    <th className="border border-black p-1 text-left w-[58%]">Tick Any Grading from 1 to 5</th>
                    <th className="border border-black p-1 text-center w-[7%]">Poor (1)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Satisfactory (2)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Good (3)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Very Good (4)</th>
                    <th className="border border-black p-1 text-center w-[8%]">Excellent (5)</th>
                  </tr>
                </thead>
                <tbody>
                  {qList.map((q) => (
                    <tr key={q.id}>
                      <td className="border border-black p-1 text-center font-bold">{q.id}.</td>
                      <td className="border border-black p-1 text-justify leading-tight">{q.statement}</td>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <td key={val} className="border border-black p-1 text-center font-bold text-[12px]">
                          {renderCheckmark(q.id, val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Suggestions Table */}
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-left font-bold">
                    Suggestions if Any: (Any course/software tool to be added which is related to Industry sector)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 min-h-[45px] text-justify bg-[#fafafa]">
                    {suggestions || customFields.suggestions || 'Include emerging cloud containerization, Kubernetes labs, and generative AI toolchains.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-300 mt-4 flex justify-between items-end text-[11px]">
            <div>
              <p className="m-0 font-bold">Department Record:</p>
              <p className="m-0 text-slate-700">{department}</p>
              <p className="m-0 text-[10px] text-slate-500">Academic Year: {academicYear}</p>
            </div>
            <div className="text-right">
              <div className="border-b border-black w-48 ml-auto mb-1" />
              <p className="m-0 font-bold">Signature of Alumnus / Alumna</p>
              <p className="m-0 text-[10px] text-slate-500">Date: {reportDate}</p>
              <p className="m-0 text-[9px] text-slate-400 italic">KIET wishes you good luck for your future endeavors.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 10: Curriculum Feedback (Academic Expert - Outside)
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 10) {
    const k10Questions = [
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

    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11.5px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[15px] underline tracking-tight text-black m-0">
                Curriculum Feedback Survey Form
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                (for Academic Expert)
              </p>
            </div>

            <div className="mb-4">
              <p className="font-serif font-bold text-[12.5px] text-black mb-1">Dear Sir!</p>
              <p className="font-serif text-[11px] text-black text-justify leading-relaxed m-0">
                This feedback form is intended to collect information related to your satisfaction towards the curriculum, syllabus, teaching learning and evaluation. The information provided by you will be kept confidential and will be used as important feedback for quality improvement of the program of the institution. You may also visit the KIET&apos;s website at{' '}
                <a href="https://www.kiet.edu/" target="_blank" rel="noreferrer" className="text-blue-800 underline">
                  https://www.kiet.edu/
                </a>{' '}
                for more details.
              </p>
            </div>

            {/* Table 0: Details Required */}
            <table className="w-full border-collapse border border-black text-[11px] mb-4">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th colSpan={2} className="border border-black p-1.5 text-center font-bold">
                    Details Required
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1.5 font-bold w-[35%]">Name of Organization / University</td>
                  <td className="border border-black p-1.5">{organization || customFields.organization || 'IIT Delhi / Jamia Millia Islamia'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Name Respondent</td>
                  <td className="border border-black p-1.5">{preparedBy || customFields.respondentName || 'Prof. (Dr.) S. K. Gupta'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Designation</td>
                  <td className="border border-black p-1.5">{designation || customFields.designation || 'Professor & Head'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Email/Contact Number</td>
                  <td className="border border-black p-1.5 font-mono text-[10.5px]">
                    {customFields.contactNumber || customFields.mobileNumber || email || 'expert@iitd.ac.in'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Relationship with the Institution</td>
                  <td className="border border-black p-1.5">{customFields.relationship || 'Academic Expert'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Department Evaluated (Auto)</td>
                  <td className="border border-black p-1.5 bg-[#fbfbfb]">{department} &bull; {academicYear}</td>
                </tr>
              </tbody>
            </table>

            {/* Table 1: Feedback Survey Form */}
            <div className="mb-4">
              <table className="w-full border-collapse border border-black text-[10.5px]">
                <thead>
                  <tr className="bg-[#f2f2f2]">
                    <th className="border border-black p-1 text-center w-[6%]">S No.</th>
                    <th className="border border-black p-1.5 text-left w-[58%]">Tick Any Grading from 1 to 5</th>
                    <th className="border border-black p-1 text-center w-[7%]">Poor (1)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Satisfactory (2)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Good (3)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Very Good (4)</th>
                    <th className="border border-black p-1 text-center w-[8%]">Excellent (5)</th>
                  </tr>
                </thead>
                <tbody>
                  {k10Questions.map((q) => (
                    <tr key={q.id}>
                      <td className="border border-black p-1 text-center font-bold">{q.id}.</td>
                      <td className="border border-black p-1 text-justify leading-tight">{q.statement}</td>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <td key={val} className="border border-black p-1 text-center font-bold text-[12px]">
                          {renderCheckmark(q.id, val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table 2: Suggestions */}
            <table className="w-full border-collapse border border-black text-[11px] mb-4">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1.5 text-left font-bold">Suggestions if Any:</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 min-h-[50px] text-justify bg-[#fafafa]">
                    {suggestions || customFields.suggestions || 'Curriculum structure is well-balanced and adheres to OBE norms. Introduce more open-ended research mini-projects.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-300 mt-6 flex justify-between items-end text-[11px]">
            <div>
              <p className="m-0 font-bold">Received by Department:</p>
              <p className="m-0 text-slate-700">{department}</p>
              <p className="m-0 text-[10px] text-slate-500">Academic Session: {academicYear} &bull; {cycle}</p>
            </div>
            <div className="text-right">
              <div className="border-b border-black w-48 ml-auto mb-1" />
              <p className="m-0 font-bold">Signature of Academic Expert</p>
              <p className="m-0 text-[10px] text-slate-500">Date: {reportDate}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 11: Report on Bridge Courses Conducted
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 11) {
    const bridgeCourses = customFields.courses || (rows.length > 0 ? rows : [
      ['1', 'Bridge Course on Programming Fundamentals', '20', 'Offline', 'Faculty Expert', '60', '58']
    ]);
    const syllabusList = customFields.syllabus || [
      { module: '1', topic: 'Basics of Logic & Problem Solving', hours: '5' },
      { module: '2', topic: 'Data Types, Control Structures & Arrays', hours: '5' },
      { module: '3', topic: 'Functions, Modular Programming & Debugging', hours: '5' },
      { module: '4', topic: 'Mini Hands-on Project Implementation', hours: '5' },
    ];

    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[15px] underline tracking-tight text-black m-0 uppercase">
                Report on Bridge Courses Conducted
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                KIET Deemed to be University, Ghaziabad
              </p>
            </div>

            {/* Table 0: Department Information */}
            <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1.5 font-bold w-[35%] bg-[#f2f2f2]">Name of the Department</td>
                  <td className="border border-black p-1.5">{department}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Academic Session / Year/ Semester</td>
                  <td className="border border-black p-1.5">{academicYear} &bull; {cycle}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Faculty Coordinator(s)</td>
                  <td className="border border-black p-1.5">{preparedBy || customFields.coordinatorName || 'Faculty Coordinator'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Head of the Department</td>
                  <td className="border border-black p-1.5">Dean / HOD, {department}</td>
                </tr>
              </tbody>
            </table>

            {/* Introduction & Objectives */}
            <div className="border border-black p-2.5 text-[10px] text-justify leading-relaxed bg-[#fbfbfb] mb-3">
              <p className="m-0 mb-1">
                <strong>Introduction:</strong> KIET Deemed to be University is committed to providing students with opportunities for holistic development and enhancing their employability, professional competencies, interdisciplinary knowledge and lifelong learning skills. In addition to the prescribed curriculum, the University offers Bridge Courses to provide students with exposure to foundational concepts, prerequisite bridging, and emerging practices.
              </p>
              <p className="m-0">
                <strong>Objectives:</strong> To bridge the gap in students&apos; prerequisite knowledge and skills; strengthen foundational concepts required for the regular curriculum; and facilitate a smooth transition into the academic programme.
              </p>
            </div>

            {/* Detail of Bridge Courses */}
            <div className="font-bold text-[11px] mb-1">Detail of Bridge Courses:</div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-center w-[6%]">S. No.</th>
                  <th className="border border-black p-1 text-left w-[36%]">Course Name</th>
                  <th className="border border-black p-1 text-center w-[12%]">Duration (Hrs)</th>
                  <th className="border border-black p-1 text-center w-[14%]">Mode</th>
                  <th className="border border-black p-1 text-left w-[18%]">Resource Person</th>
                  <th className="border border-black p-1 text-center w-[7%]">Enrolled</th>
                  <th className="border border-black p-1 text-center w-[7%]">Completed</th>
                </tr>
              </thead>
              <tbody>
                {bridgeCourses.map((c: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1 font-semibold">{getVal(c, 1, 'courseName', 'Bridge Course on Programming Fundamentals')}</td>
                    <td className="border border-black p-1 text-center">{getVal(c, 2, 'duration', '20')}</td>
                    <td className="border border-black p-1 text-center">{getVal(c, 3, 'mode', 'Offline')}</td>
                    <td className="border border-black p-1">{getVal(c, 4, 'resourcePerson', 'Faculty Coordinator')}</td>
                    <td className="border border-black p-1 text-center">{getVal(c, 5, 'enrolled', '60')}</td>
                    <td className="border border-black p-1 text-center font-bold">{getVal(c, 6, 'completed', '58')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Course Content / Syllabus */}
            <div className="font-bold text-[11px] mb-1">Course Content / Syllabus:</div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-center w-[12%]">Module</th>
                  <th className="border border-black p-1 text-left w-[70%]">Topic</th>
                  <th className="border border-black p-1 text-center w-[18%]">No. of Hours</th>
                </tr>
              </thead>
              <tbody>
                {syllabusList.map((s: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black p-1 text-center font-bold">{s.module}</td>
                    <td className="border border-black p-1">{s.topic}</td>
                    <td className="border border-black p-1 text-center">{s.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Assessment and Certification */}
            <div className="font-bold text-[11px] mb-1">Assessment and Certification:</div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold w-[35%] bg-[#f9f9f9]">Assessment Method</td>
                  <td className="border border-black p-1">{customFields.assessmentMethod || 'Objective Test & Continuous Hands-on Lab Assessment'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f9f9f9]">Minimum Attendance Requirement</td>
                  <td className="border border-black p-1">{customFields.minAttendance || '75%'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f9f9f9]">Passing/Completion Criteria</td>
                  <td className="border border-black p-1">{customFields.passingCriteria || 'Minimum 50% in assessment and 75% attendance'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f9f9f9]">Certificate Issuing Authority</td>
                  <td className="border border-black p-1">{customFields.certAuthority || 'KIET Deemed to be University'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f9f9f9]">Number of Certificates Issued</td>
                  <td className="border border-black p-1">{customFields.numCertsIssued || '58'}</td>
                </tr>
              </tbody>
            </table>

            {/* Outcome and Impact */}
            <div className="border border-black p-2 text-[10px] bg-[#fbfbfb]">
              <p className="m-0 font-bold mb-1">OUTCOME AND IMPACT</p>
              <p className="m-0">
                <strong>Suggested Impact Indicators:</strong> Improvement in technical skills; smooth transition; enhanced confidence.
              </p>
              <p className="m-0 mt-1">
                <strong>Student Feedback Score:</strong>{' '}
                <span className="font-bold underline">{customFields.feedbackScore || '4.6'} / 5</span>
              </p>
              <p className="m-0 mt-1">
                <strong>Major Suggestions Received:</strong> {suggestions || customFields.suggestions || 'Increase hands-on lab practice hours.'}
              </p>
            </div>
          </div>

          <KietSignatureBlock />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 12: Awards and Recognition for Research / Innovations
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 12) {
    const awardsList = rows.length > 0 ? rows : [
      ['1', '2026-2027', 'AWD-01', 'Young Scientist Research Award', 'Faculty', 'Dr. Research Faculty', 'DST / IEEE']
    ];

    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[14.5px] underline tracking-tight text-black m-0 uppercase">
                Awards and Recognition for Research/Innovations
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                by Faculty/Students/Dept./Institute &bull; KRA 12
              </p>
            </div>

            <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1.5 font-bold w-[30%] bg-[#f2f2f2]">School/Department:</td>
                  <td className="border border-black p-1.5 w-[35%]">{department}</td>
                  <td className="border border-black p-1.5 font-bold w-[18%] bg-[#f2f2f2]">Date:</td>
                  <td className="border border-black p-1.5 w-[17%]">{reportDate}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Academic Session:</td>
                  <td className="border border-black p-1.5">{academicYear}</td>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Reporting Period:</td>
                  <td className="border border-black p-1.5">{cycle}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Coordinator (if any):</td>
                  <td colSpan={3} className="border border-black p-1.5">{preparedBy || customFields.coordinatorName || 'Faculty Coordinator'}</td>
                </tr>
              </tbody>
            </table>

            <div className="font-bold text-[11px] mb-1">Complete Detail of Award/ Recognition:</div>
            <div className="border border-black p-2.5 text-justify text-[10.5px] leading-relaxed bg-[#fbfbfb] mb-4 min-h-[60px]">
              {customFields.awardDetails || narrative || 'The faculty members and students of the department were conferred awards and prestigious recognitions for outstanding research innovations, patent publications, and technological breakthroughs at national/international platforms.'}
            </div>

            <div className="font-bold text-[11px] mb-1">
              Data Template: Number of Awards Received for Research Innovations
            </div>
            <table className="w-full border-collapse border border-black text-[10px] mb-4">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-center w-[6%]">Sl. No.</th>
                  <th className="border border-black p-1 text-center w-[14%]">Academic Year</th>
                  <th className="border border-black p-1 text-center w-[12%]">Award ID</th>
                  <th className="border border-black p-1 text-left w-[24%]">Name of Award</th>
                  <th className="border border-black p-1 text-center w-[12%]">Category</th>
                  <th className="border border-black p-1 text-left w-[18%]">Recipient</th>
                  <th className="border border-black p-1 text-left w-[14%]">Awarding Body</th>
                </tr>
              </thead>
              <tbody>
                {awardsList.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1 text-center">{getVal(row, 1, 'academicYear', academicYear)}</td>
                    <td className="border border-black p-1 text-center">{getVal(row, 2, 'awardId', `AWD-0${idx + 1}`)}</td>
                    <td className="border border-black p-1 font-medium">{getVal(row, 3, 'awardName', 'National Innovation Award')}</td>
                    <td className="border border-black p-1 text-center">{getVal(row, 4, 'category', 'Faculty')}</td>
                    <td className="border border-black p-1">{getVal(row, 5, 'recipient', 'Recipient Name')}</td>
                    <td className="border border-black p-1">{getVal(row, 6, 'awardingBody', 'Awarding Body')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border border-black p-2 text-[10px] bg-[#fbfbfb]">
              <p className="m-0 font-bold mb-1">Documentary Evidence to Maintain:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9.5px]">
                <span>1. Award certificate</span>
                <span>2. Award notification/letter</span>
                <span>3. Official webpage link of award</span>
                <span>4. Event brochure/announcement</span>
                <span>5. Photograph of award ceremony</span>
                <span>6. Research paper/patent forming basis</span>
                <span>7. Details of awarding body</span>
                <span>8. Department verification record</span>
              </div>
            </div>
          </div>

          <KietSignatureBlock />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 13: Faculty Membership in Industry Advisory Board / Other Committees
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 13) {
    const meetingsList = customFields.rows || (rows.length > 0 ? rows : [
      { meetingDate: '12/09/2026', meetingRef: 'IAB-MTG-01', agenda: 'Curriculum alignment with Cloud & AI', contribution: 'Advised practical lab syllabus', evidence: 'Signed Minutes' }
    ]);

    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[14.5px] underline tracking-tight text-black m-0 uppercase">
                Report on Faculty Membership In Industry Advisory Board / Other Committees
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                KRA 13 &bull; KIET Deemed to be University, Ghaziabad
              </p>
            </div>

            {/* 1. Basic Details */}
            <div className="font-bold text-[11.5px] bg-[#f2f2f2] border border-black px-2 py-1 mb-1">
              1. Basic Details
            </div>
            <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1.5 font-bold w-[35%]">Name of Faculty Member</td>
                  <td className="border border-black p-1.5">{preparedBy || customFields.coordinatorName || 'Faculty Member'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Designation &amp; Department</td>
                  <td className="border border-black p-1.5">{designation || 'Professor'}, {department}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Academic Session / Cycle</td>
                  <td className="border border-black p-1.5">{academicYear} &bull; {cycle}</td>
                </tr>
              </tbody>
            </table>

            {/* 2. Details of Committee / Board */}
            <div className="font-bold text-[11.5px] bg-[#f2f2f2] border border-black px-2 py-1 mb-1">
              2. Details of Committee / Board
            </div>
            <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1.5 font-bold w-[35%]">Name of Industry / Organization / Committee</td>
                  <td className="border border-black p-1.5">{customFields.committeeName || organization || 'Tech Mahindra Industry Advisory Board'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Chairperson / Head Name &amp; Designation</td>
                  <td className="border border-black p-1.5">{customFields.chairpersonName || 'Dr. Amit Saxena, VP Engineering'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Nature and Purpose of Committee / Board</td>
                  <td className="border border-black p-1.5">{customFields.naturePurpose || 'Academic-Industry Curriculum & Emerging Technologies Advisory'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Area / Domain of Expertise</td>
                  <td className="border border-black p-1.5">{customFields.domainExpertise || 'Cloud Computing, AI & Cyber Security'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Official Website / Reference</td>
                  <td className="border border-black p-1.5 font-mono text-[10px] text-blue-800">{customFields.orgWebsite || 'https://www.techmahindra.com'}</td>
                </tr>
              </tbody>
            </table>

            {/* 3. Objectives of Membership */}
            <div className="border border-black p-2 text-[10px] leading-relaxed bg-[#fbfbfb] mb-3 text-justify">
              <span className="font-bold block mb-1">3. Objectives of Membership:</span>
              <ul className="list-disc pl-4 space-y-0.5 m-0">
                <li>To establish and strengthen interaction between academia and industry/professional organizations.</li>
                <li>To obtain industry/professional inputs for curriculum development and academic improvement.</li>
                <li>To facilitate industry-relevant teaching, training, research, consultancy and innovation.</li>
                <li>To enhance student employability through internships, projects and expert mentoring.</li>
              </ul>
            </div>

            {/* Table 2: Details of Meetings Attended */}
            <div className="font-bold text-[11px] mb-1">Details of Meetings Attended / Contributed:</div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-center w-[6%]">S. No.</th>
                  <th className="border border-black p-1 text-center w-[16%]">Date of Meeting</th>
                  <th className="border border-black p-1 text-center w-[18%]">Meeting No. / Ref</th>
                  <th className="border border-black p-1 text-left w-[28%]">Major Agenda</th>
                  <th className="border border-black p-1 text-left w-[20%]">Faculty Contribution</th>
                  <th className="border border-black p-1 text-center w-[12%]">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {meetingsList.map((m: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1 text-center">{getVal(m, 1, 'meetingDate', '12/09/2026')}</td>
                    <td className="border border-black p-1 text-center">{getVal(m, 2, 'meetingRef', `IAB-0${idx + 1}`)}</td>
                    <td className="border border-black p-1">{getVal(m, 3, 'agenda', 'Curriculum review & AI integration')}</td>
                    <td className="border border-black p-1">{getVal(m, 4, 'contribution', 'Advised elective syllabus')}</td>
                    <td className="border border-black p-1 text-center">{getVal(m, 5, 'evidence', 'Minutes of Meeting')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold w-[35%] bg-[#f9f9f9]">Total Period of Membership</td>
                  <td className="border border-black p-1">{customFields.periodMembership || '2 Years (2026–2028)'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f9f9f9]">Number of Meetings Attended</td>
                  <td className="border border-black p-1">{customFields.meetingsCount || meetingsList.length}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f9f9f9]">Major Activities Undertaken</td>
                  <td className="border border-black p-1">{customFields.majorActivities || 'Curriculum revision, expert inputs, industry linkage'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <KietSignatureBlock
            leftLabel="Signature of Faculty Member"
            leftName={preparedBy || customFields.coordinatorName || 'Faculty Member'}
            rightLabel="Head of Department / Dean"
            rightName={`Dean, ${department}`}
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 18: Signed Functional MoU with Industry / Research Organization
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 18) {
    const actRows = customFields.rows || (rows.length > 0 ? rows : [
      { activityTitle: 'Industrial IoT Workshop', date: '15/10/2026', targetGroup: 'B.Tech 3rd Year', beneficiaries: '85', outcome: '12 Mini-projects developed' }
    ]);

    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[14.5px] underline tracking-tight text-black m-0 uppercase">
                REPORT ON Signed Functional MoU with Industry / Research Organization
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                KIET Deemed to be University, Ghaziabad &bull; KRA 18
              </p>
            </div>

            {/* Table 0: Basic Details */}
            <div className="font-bold text-[11.5px] bg-[#f2f2f2] border border-black px-2 py-1 mb-1">
              1. Basic Details
            </div>
            <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1.5 font-bold w-[35%]">Name of Institution</td>
                  <td className="border border-black p-1.5">Krishna Institute of Engineering &amp; Technology (KIET), Ghaziabad</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Department / School</td>
                  <td className="border border-black p-1.5">{department}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Name of Industry / Research Organization</td>
                  <td className="border border-black p-1.5">{customFields.industryName || organization || 'Cisco Systems India / Bosch'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Date of MoU Signing &amp; Validity Period</td>
                  <td className="border border-black p-1.5">{customFields.mouDate || '15/08/2026'} &bull; {customFields.mouValidity || '3 Years (2026–2029)'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Faculty Coordinator</td>
                  <td className="border border-black p-1.5">{preparedBy || customFields.coordinatorName || 'Faculty Coordinator'}</td>
                </tr>
              </tbody>
            </table>

            {/* 2. Objective of the MoU Activity */}
            <div className="border border-black p-2 text-[10px] leading-relaxed bg-[#fbfbfb] mb-3 text-justify">
              <span className="font-bold block mb-1">2. Objective of the MoU Activity:</span>
              <p className="m-0">
                {customFields.objectives || `The activity was organized under the MoU signed between KIET and ${customFields.industryName || 'Industry Partner'} with the objective of strengthening industry/research collaboration, providing experiential learning opportunities to students, facilitating knowledge exchange, promoting joint research and innovation, and enhancing the employability and professional competencies of students.`}
              </p>
            </div>

            {/* Table 1: Activities Conducted */}
            <div className="font-bold text-[11px] mb-1">3. Details of Activity Conducted Under MoU:</div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-center w-[6%]">S. No.</th>
                  <th className="border border-black p-1 text-left w-[36%]">Activity Title</th>
                  <th className="border border-black p-1 text-center w-[16%]">Date &amp; Duration</th>
                  <th className="border border-black p-1 text-left w-[20%]">Target Participants</th>
                  <th className="border border-black p-1 text-center w-[10%]">Benefited</th>
                  <th className="border border-black p-1 text-left w-[12%]">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {actRows.map((a: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1 font-semibold">{getVal(a, 1, 'activityTitle', 'Industry Workshop')}</td>
                    <td className="border border-black p-1 text-center">{getVal(a, 2, 'date', '15/10/2026')}</td>
                    <td className="border border-black p-1">{getVal(a, 3, 'targetGroup', 'B.Tech 3rd Year')}</td>
                    <td className="border border-black p-1 text-center font-bold">{getVal(a, 4, 'beneficiaries', '85')}</td>
                    <td className="border border-black p-1">{getVal(a, 5, 'outcome', 'Certified')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 4. Brief Description */}
            <div className="border border-black p-2 text-[10px] leading-relaxed bg-[#fbfbfb] mb-3 text-justify">
              <span className="font-bold block mb-1">4. Brief Description of the Activity:</span>
              <p className="m-0">
                {customFields.briefDescription || narrative || 'The department conducted dedicated technical sessions with senior architects from the partner organization. Students received hands-on exposure to live industrial architectures, followed by interactive mentoring and career pathway discussions.'}
              </p>
            </div>

            {/* Table 2: Documentary Evidence Checklist */}
            <div className="font-bold text-[11px] mb-1">5. Documentary Evidence Checklist:</div>
            <table className="w-full border-collapse border border-black text-[9.5px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-center w-[8%]">Sl. No.</th>
                  <th className="border border-black p-1 text-left w-[62%]">Evidence / Document</th>
                  <th className="border border-black p-1 text-center w-[30%]">Availability Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  'Signed MoU Document',
                  'Activity Notice / Circular',
                  'Programme Schedule & Brochure',
                  'Participant Registration & Attendance Sheet',
                  'Geo-tagged Photographs with Date & Caption',
                  'Summary Feedback & Outcomes Report',
                ].map((item, i) => (
                  <tr key={i}>
                    <td className="border border-black p-1 text-center font-bold">{i + 1}</td>
                    <td className="border border-black p-1">{item}</td>
                    <td className="border border-black p-1 text-center font-bold text-emerald-700">Available (Yes)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <KietSignatureBlock />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 19: Industrial Visit Report (19a / 19b)
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 19) {
    const is19b = customFields.subType === '19b';

    if (is19b) {
      // 19b: Industrial Visit Feedback Form (Student)
      const k19bQuestions = [
        "Organization & Planning of Visit",
        "Relevance to Academic Curriculum",
        "Industrial visit aligned with the course objectives and content.",
        "Knowledge Gained",
        "Industry Interaction Quality",
        "Exposure to Practical Applications",
        "Clarity of Explanation by Industry Experts",
        "Improvement in Technical Understanding",
        "Usefulness for Career",
        "Overall Learning Experience",
      ];

      return (
        <div
          className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
          style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
        >
          <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
            <div>
              <KietOfficialHeader />
              <div className="text-center my-3">
                <h1 className="font-serif font-bold text-[15px] underline tracking-tight text-black m-0">
                  Industrial Visit Feedback Form
                </h1>
                <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                  KIET Deemed to be University, Ghaziabad &bull; Form 19b
                </p>
              </div>

              {/* Table 0: Student Profile */}
              <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
                <tbody>
                  <tr>
                    <td className="border border-black p-1.5 font-bold w-[35%] bg-[#f2f2f2]">Name of Student</td>
                    <td className="border border-black p-1.5">{customFields.studentName || preparedBy || 'Aarav Gupta'}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Roll Number</td>
                    <td className="border border-black p-1.5 font-mono">{customFields.rollNo || '230029010001'}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Academic Session / Year/ Semester</td>
                    <td className="border border-black p-1.5">{academicYear} &bull; 3rd Year / 5th Sem</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Name of the Department</td>
                    <td className="border border-black p-1.5">{department}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Date of Visit</td>
                    <td className="border border-black p-1.5">{customFields.visitDate || reportDate}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Name of Industry Visited</td>
                    <td className="border border-black p-1.5">{customFields.industryName || organization || 'Mother Dairy Plant / BHEL'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Table 1: 10 Questions */}
              <table className="w-full border-collapse border border-black text-[10.5px] mb-4">
                <thead>
                  <tr className="bg-[#f2f2f2]">
                    <th className="border border-black p-1 text-center w-[6%]">S No.</th>
                    <th className="border border-black p-1 text-left w-[58%]">Tick Any Grading from 1 to 5</th>
                    <th className="border border-black p-1 text-center w-[7%]">Poor (1)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Satisfactory (2)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Good (3)</th>
                    <th className="border border-black p-1 text-center w-[7%]">Very Good (4)</th>
                    <th className="border border-black p-1 text-center w-[8%]">Excellent (5)</th>
                  </tr>
                </thead>
                <tbody>
                  {k19bQuestions.map((stmt, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1 text-center font-bold">{idx + 1}.</td>
                      <td className="border border-black p-1">{stmt}</td>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <td key={val} className="border border-black p-1 text-center font-bold text-[12px]">
                          {renderCheckmark(idx + 1, val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Suggestions */}
              <table className="w-full border-collapse border border-black text-[10.5px] mb-4">
                <thead>
                  <tr className="bg-[#f2f2f2]">
                    <th className="border border-black p-1 text-left font-bold">Suggestions if Any:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-2 min-h-[50px] bg-[#fafafa]">
                      {suggestions || customFields.suggestions || 'The industrial visit was highly informative. Recommend arranging longer interaction with shop-floor control engineers.'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-300 mt-6 flex justify-between items-end text-[11px]">
              <div>
                <p className="m-0 font-bold">Department Record:</p>
                <p className="m-0 text-slate-700">{department}</p>
                <p className="m-0 text-[10px] text-slate-500">Academic Session: {academicYear}</p>
              </div>
              <div className="text-right">
                <div className="border-b border-black w-48 ml-auto mb-1" />
                <p className="m-0 font-bold">Signature of Student</p>
                <p className="m-0 text-[10px] text-slate-500">Date: {reportDate}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 19a: Industrial Visit Report Format
    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[15px] underline tracking-tight text-black m-0 uppercase">
                Industrial Visit Report
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                KRA 19 &bull; KIET Deemed to be University, Ghaziabad
              </p>
            </div>

            {/* Table 0: Department and Visit Details */}
            <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold w-[35%] bg-[#f2f2f2]">Name of the Department</td>
                  <td className="border border-black p-1">{department}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Date of Visit</td>
                  <td className="border border-black p-1">{customFields.visitDate || reportDate}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Academic Session / Year/ Semester</td>
                  <td className="border border-black p-1">{academicYear} &bull; {cycle}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Faculty Coordinator(s)</td>
                  <td className="border border-black p-1">{preparedBy || customFields.coordinatorName || 'Faculty Coordinator'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Head of the Department</td>
                  <td className="border border-black p-1">Dean / HOD, {department}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Name of Industry Visited</td>
                  <td className="border border-black p-1 font-bold">{customFields.industryName || organization || 'Mother Dairy Automated Plant'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Profile of the Industry Visited</td>
                  <td className="border border-black p-1 text-justify">
                    {customFields.industryProfile || 'Automated production facility with SCADA controls, robotic packaging lines, and industrial telemetry.'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Industry Experts Interacted With</td>
                  <td className="border border-black p-1">{customFields.industryExperts || 'Mr. R. K. Sharma, Plant General Manager'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Key Learning Outcomes</td>
                  <td className="border border-black p-1 text-justify">
                    {customFields.learningOutcomes || 'Students observed industrial automation, SCADA networks, quality control procedures, and preventive maintenance.'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Subject / Course Mapped</td>
                  <td className="border border-black p-1 font-semibold">{customFields.courseMapped || 'Industrial Automation (KCS-504) - 5th Sem'}</td>
                </tr>
              </tbody>
            </table>

            {/* Table 1: PO Mapping */}
            <div className="font-bold text-[11px] mb-1">Learning Outcomes Mapped to Program Outcomes (POs):</div>
            <table className="w-full border-collapse border border-black text-[9.5px] text-center mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 w-[20%] text-left">Learning Outcome</th>
                  <th>PO1</th><th>PO2</th><th>PO3</th><th>PO4</th><th>PO5</th><th>PO6</th><th>PO7</th><th>PO8</th><th>PO9</th><th>PO10</th><th>PO11</th><th>PO12</th><th>PSO1</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1 text-left">1. Understand SCADA Systems</td>
                  <td>3</td><td>2</td><td>2</td><td>1</td><td>3</td><td>-</td><td>-</td><td>-</td><td>2</td><td>-</td><td>-</td><td>2</td><td>3</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-left">2. Industrial Safety &amp; Ethics</td>
                  <td>1</td><td>-</td><td>-</td><td>-</td><td>-</td><td>3</td><td>2</td><td>3</td><td>2</td><td>1</td><td>-</td><td>2</td><td>1</td>
                </tr>
              </tbody>
            </table>

            {/* Table 2: Gap Fulfilment */}
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-left w-[50%]">Academic Gap Identified</th>
                  <th className="border border-black p-1 text-left w-[50%]">Industrial Visit Solution</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1">Lack of live exposure to PLC/SCADA industrial controllers</td>
                  <td className="border border-black p-1">Live demonstration and walkthrough of operational assembly plant</td>
                </tr>
              </tbody>
            </table>
          </div>

          <KietSignatureBlock />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 23: Report on Skill Development & Employability Training
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 23) {
    const progRows = customFields.rows || (rows.length > 0 ? rows : [
      { programName: 'Campus to Corporate: Skill Development Bootcamp', duration: '30', mode: 'Offline', resourcePerson: 'Corporate Trainers', enrolled: '120', completed: '118' }
    ]);

    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[14.5px] underline tracking-tight text-black m-0 uppercase">
                Report on Skill Development &amp; Employability Training
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                KRA 23 &bull; KIET Deemed to be University, Ghaziabad
              </p>
            </div>

            {/* Table 0: Department Information */}
            <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1.5 font-bold w-[35%] bg-[#f2f2f2]">Name of the Department</td>
                  <td className="border border-black p-1.5">{department}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Title of the Programme</td>
                  <td className="border border-black p-1.5 font-bold">{customFields.programTitle || 'Campus to Corporate: Employability Training'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Academic Session / Year/ Semester</td>
                  <td className="border border-black p-1.5">{academicYear} &bull; {cycle}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Faculty Coordinator(s)</td>
                  <td className="border border-black p-1.5">{preparedBy || customFields.coordinatorName || 'Faculty Coordinator'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Head of the Department</td>
                  <td className="border border-black p-1.5">Dean / HOD, {department}</td>
                </tr>
              </tbody>
            </table>

            {/* Table 1: Detail of Program */}
            <div className="font-bold text-[11px] mb-1">Detail of Program:</div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-center w-[6%]">S. No.</th>
                  <th className="border border-black p-1 text-left w-[36%]">Program Name</th>
                  <th className="border border-black p-1 text-center w-[12%]">Duration (Hrs)</th>
                  <th className="border border-black p-1 text-center w-[14%]">Mode</th>
                  <th className="border border-black p-1 text-left w-[18%]">Resource Person / Agency</th>
                  <th className="border border-black p-1 text-center w-[7%]">Enrolled</th>
                  <th className="border border-black p-1 text-center w-[7%]">Completed</th>
                </tr>
              </thead>
              <tbody>
                {progRows.map((p: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1 font-semibold">{getVal(p, 1, 'programName', 'Employability Training Bootcamp')}</td>
                    <td className="border border-black p-1 text-center">{getVal(p, 2, 'duration', '30')}</td>
                    <td className="border border-black p-1 text-center">{getVal(p, 3, 'mode', 'Offline')}</td>
                    <td className="border border-black p-1">{getVal(p, 4, 'resourcePerson', 'Industry Trainers')}</td>
                    <td className="border border-black p-1 text-center">{getVal(p, 5, 'enrolled', '120')}</td>
                    <td className="border border-black p-1 text-center font-bold">{getVal(p, 6, 'completed', '118')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Assessment and Certification */}
            <div className="font-bold text-[11px] mb-1">Assessment and Certification:</div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold w-[35%] bg-[#f9f9f9]">Assessment Method</td>
                  <td className="border border-black p-1">{customFields.assessmentMethod || 'Objective Technical Test & Mock Technical Interviews'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f9f9f9]">Minimum Attendance Requirement</td>
                  <td className="border border-black p-1">{customFields.minAttendance || '75%'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f9f9f9]">Passing/Completion Criteria</td>
                  <td className="border border-black p-1">{customFields.passingCriteria || 'Minimum 50% in assessment and 75% attendance'}</td>
                </tr>
              </tbody>
            </table>

            {/* Outcome and Impact */}
            <div className="border border-black p-2 text-[10px] bg-[#fbfbfb]">
              <p className="m-0 font-bold mb-1">OUTCOME AND IMPACT</p>
              <p className="m-0">
                <strong>Suggested Impact Indicators:</strong> Improvement in technical aptitude; higher interview clearance rates; industry certification acquired.
              </p>
              <p className="m-0 mt-1">
                <strong>Student Feedback Score:</strong>{' '}
                <span className="font-bold underline">{customFields.feedbackScore || '4.7'} / 5</span>
              </p>
              <p className="m-0 mt-1">
                <strong>Major Suggestions Received:</strong> {suggestions || customFields.suggestions || 'Conduct more company-specific mock coding assessments.'}
              </p>
            </div>
          </div>

          <KietSignatureBlock />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 33: Alumni Events organized
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 33) {
    const alumniList = customFields.rows || (rows.length > 0 ? rows : [
      { alumniName: 'Rohan Mehra', batch: '2019 / CSE', organization: 'Amazon / Lead Data Scientist', natureEngagement: 'Mentoring', dateActivity: '14/10/2026', studentsBenefited: '65' }
    ]);

    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[14px] underline tracking-tight text-black m-0 uppercase">
                ACTIVITY REPORT Alumni Chapter / Alumni Meet and Alumni Engagement in University Activities/Events
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                KRA 33 &bull; KIET Deemed to be University, Ghaziabad
              </p>
            </div>

            {/* 1. Basic Details */}
            <div className="font-bold text-[11.5px] bg-[#f2f2f2] border border-black px-2 py-1 mb-1">
              1. Basic Details
            </div>
            <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1.5 font-bold w-[35%]">Name of Institution</td>
                  <td className="border border-black p-1.5">Krishna Institute of Engineering &amp; Technology (KIET), Ghaziabad</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Department / School</td>
                  <td className="border border-black p-1.5">{department}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Name of Alumni Chapter / Association</td>
                  <td className="border border-black p-1.5">{customFields.chapterName || 'KIET CSE Alumni Chapter'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold">Name of Event &amp; Date / Venue</td>
                  <td className="border border-black p-1.5">{customFields.eventName || 'Annual Alumni Chapter Meet'} &bull; {customFields.eventDate || reportDate} ({customFields.venue || 'Auditorium'})</td>
                </tr>
              </tbody>
            </table>

            {/* 2. Objective */}
            <div className="border border-black p-2 text-[10px] leading-relaxed bg-[#fbfbfb] mb-3 text-justify">
              <span className="font-bold block mb-1">2. Objective of the Activity:</span>
              <p className="m-0">
                The activity was organized to strengthen the relationship between the University and its alumni and to provide a platform for meaningful interaction, networking and engagement. The programme aimed to facilitate alumni participation in academic, professional, mentoring, career development, innovation, entrepreneurship and other institutional activities.
              </p>
            </div>

            {/* Table 1: Participating Alumni */}
            <div className="font-bold text-[11px] mb-1">3. Details of Participating Alumni:</div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-center w-[6%]">Sl. No.</th>
                  <th className="border border-black p-1 text-left w-[24%]">Alumni Name</th>
                  <th className="border border-black p-1 text-center w-[16%]">Batch/Programme</th>
                  <th className="border border-black p-1 text-left w-[24%]">Organization/Designation</th>
                  <th className="border border-black p-1 text-left w-[18%]">Nature of Engagement</th>
                  <th className="border border-black p-1 text-center w-[12%]">Benefited</th>
                </tr>
              </thead>
              <tbody>
                {alumniList.map((al: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1 font-semibold">{getVal(al, 1, 'alumniName', 'Alumnus Name')}</td>
                    <td className="border border-black p-1 text-center">{getVal(al, 2, 'batch', '2019 / B.Tech CSE')}</td>
                    <td className="border border-black p-1">{getVal(al, 3, 'organization', 'Amazon / Lead Data Scientist')}</td>
                    <td className="border border-black p-1">{getVal(al, 4, 'natureEngagement', 'Mentoring / Expert Session')}</td>
                    <td className="border border-black p-1 text-center font-bold">{getVal(al, 5, 'studentsBenefited', '65')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Participation numbers */}
            <div className="grid grid-cols-3 gap-2 text-[10.5px] mb-3">
              <div className="border border-black p-1.5 text-center bg-[#fafafa]">
                <span className="text-slate-500 block">Alumni Participants</span>
                <strong className="text-base text-[#00236f]">{customFields.alumniParticipants || '35'}</strong>
              </div>
              <div className="border border-black p-1.5 text-center bg-[#fafafa]">
                <span className="text-slate-500 block">Student Participants</span>
                <strong className="text-base text-[#00236f]">{customFields.studentParticipants || '180'}</strong>
              </div>
              <div className="border border-black p-1.5 text-center bg-[#fafafa]">
                <span className="text-slate-500 block">Faculty Participants</span>
                <strong className="text-base text-[#00236f]">{customFields.facultyParticipants || '15'}</strong>
              </div>
            </div>
          </div>

          <KietSignatureBlock />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 36 & 37: Report on FDP and STP
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 36 || cleanNum === 37) {
    const isSTP = cleanNum === 37;
    const fdpRows = customFields.rows || (rows.length > 0 ? rows : [
      { facultyName: 'Dr. Suresh Kumar', department: department, designation: 'Associate Professor', attendance: '100%', certificate: 'Yes' }
    ]);

    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[14.5px] underline tracking-tight text-black m-0 uppercase">
                {isSTP
                  ? 'REPORT ON STAFF TRAINING PROGRAMME (STP)'
                  : 'REPORT ON FACULTY DEVELOPMENT PROGRAMME (FDP)'}
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                KIET Deemed to be University, Ghaziabad &bull; KRA {cleanNum}
              </p>
            </div>

            {/* Table 0 */}
            <table className="w-full border-collapse border border-black text-[10.5px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1.5 font-bold w-[35%] bg-[#f2f2f2]">Title of the FDP / Training</td>
                  <td className="border border-black p-1.5 font-bold">{customFields.fdpTitle || 'National FDP on AI-Assisted Pedagogy and OBE Standards'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Duration &amp; Organized by</td>
                  <td className="border border-black p-1.5">{customFields.duration || '5 Days (35 Hours)'} &bull; {customFields.organizedBy || `Department of ${department}, KIET`}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Mode of Delivery</td>
                  <td className="border border-black p-1.5">{customFields.mode || 'Hybrid (Online & Hands-on Labs)'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Academic Session / Year/ Semester</td>
                  <td className="border border-black p-1.5">{academicYear} &bull; {cycle}</td>
                </tr>
              </tbody>
            </table>

            {/* Table 1: Faculty Participation */}
            <div className="font-bold text-[11px] mb-1">Faculty / Staff Participation:</div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <thead>
                <tr className="bg-[#f2f2f2]">
                  <th className="border border-black p-1 text-center w-[6%]">S. No.</th>
                  <th className="border border-black p-1 text-left w-[34%]">Name of Participant</th>
                  <th className="border border-black p-1 text-left w-[24%]">Department</th>
                  <th className="border border-black p-1 text-left w-[20%]">Designation</th>
                  <th className="border border-black p-1 text-center w-[8%]">Attendance</th>
                  <th className="border border-black p-1 text-center w-[8%]">Certificate</th>
                </tr>
              </thead>
              <tbody>
                {fdpRows.map((f: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1 font-semibold">{getVal(f, 1, 'facultyName', 'Dr. Faculty Member')}</td>
                    <td className="border border-black p-1">{getVal(f, 2, 'department', department)}</td>
                    <td className="border border-black p-1">{getVal(f, 3, 'designation', 'Associate Professor')}</td>
                    <td className="border border-black p-1 text-center">{getVal(f, 4, 'attendance', '100%')}</td>
                    <td className="border border-black p-1 text-center font-bold text-emerald-700">{getVal(f, 5, 'certificate', 'Yes')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Outcomes */}
            <div className="border border-black p-2 text-[10px] leading-relaxed bg-[#fbfbfb] mb-3">
              <span className="font-bold block mb-1">Learning Outcomes:</span>
              <p className="m-0">
                After completion of the programme, participants were able to apply innovative teaching methodologies, deploy hands-on toolchains, and integrate research tools into student capstone guidance.
              </p>
            </div>
          </div>

          <KietSignatureBlock />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 44: EVENT REPORT - BOOT Camp & Peer Learning Activity
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 44) {
    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[14.5px] underline tracking-tight text-black m-0 uppercase">
                EVENT REPORT – BOOT Camp &amp; Peer Learning Activity
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                KIET Deemed to be University, Ghaziabad &bull; KRA 44
              </p>
            </div>

            {/* 1. General Information */}
            <div className="font-bold text-[11.5px] bg-[#f2f2f2] border border-black px-2 py-1 mb-1">
              1. General Information
            </div>
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold w-[35%]">Name of Activity &amp; ID</td>
                  <td className="border border-black p-1">{customFields.activityName || 'Peer Coding & Hackathon Bootcamp'} &bull; {customFields.activityId || 'BOOT-2026-01'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold">Type of Activity</td>
                  <td className="border border-black p-1">{customFields.activityType || 'BOOT Camp / Peer Learning'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold">Theme / Title &amp; Dates</td>
                  <td className="border border-black p-1">{customFields.theme || 'Agile Coding & Problem Solving'} &bull; {customFields.dates || reportDate}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold">Organizing Department &amp; Venue</td>
                  <td className="border border-black p-1">{department} &bull; {customFields.venueMode || 'Auditorium'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold">Faculty Coordinator</td>
                  <td className="border border-black p-1">{preparedBy || customFields.coordinatorName || 'Faculty Coordinator'}</td>
                </tr>
              </tbody>
            </table>

            {/* 2. Introduction & 3. Objectives */}
            <div className="border border-black p-2 text-[10px] leading-relaxed bg-[#fbfbfb] mb-3 text-justify">
              <span className="font-bold block mb-1">2. Introduction &amp; Objectives:</span>
              <p className="m-0 mb-1">
                The BOOT Camp/Peer Learning Activity was organized to provide students with an experiential, collaborative and skill-oriented learning environment. The activity encouraged students to learn through hands-on practice, peer interaction, teamwork, mentoring and problem-solving.
              </p>
              <p className="m-0">
                <strong>Objectives:</strong> To promote hands-on learning, encourage peer knowledge sharing, develop teamwork and collaborative problem solving.
              </p>
            </div>

            {/* 4. Activity Details */}
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold w-[35%] bg-[#f9f9f9]">Students Registered / Participated</td>
                  <td className="border border-black p-1">{customFields.studentsRegistered || '75'} Registered &bull; {customFields.studentsParticipated || '72'} Participated</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f9f9f9]">Student Mentors &amp; Faculty Mentors</td>
                  <td className="border border-black p-1">8 Student Mentors &bull; 4 Faculty Mentors</td>
                </tr>
              </tbody>
            </table>

            {/* Table: Session / Bootcamp Schedule */}
            {customFields.rows && customFields.rows.length > 0 && (
              <div className="mb-3">
                <div className="font-bold text-[11px] mb-1">Session / Peer Mentoring Schedule:</div>
                <table className="w-full border-collapse border border-black text-[10px]">
                  <thead>
                    <tr className="bg-[#f2f2f2]">
                      <th className="border border-black p-1 text-center w-[6%]">S. No.</th>
                      <th className="border border-black p-1 text-left w-[36%]">Topic / Sprint</th>
                      <th className="border border-black p-1 text-center w-[16%]">Date</th>
                      <th className="border border-black p-1 text-left w-[22%]">Time &amp; Venue</th>
                      <th className="border border-black p-1 text-center w-[10%]">Count</th>
                      <th className="border border-black p-1 text-left w-[16%]">Mentors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customFields.rows.map((r: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                        <td className="border border-black p-1 font-semibold">{getVal(r, 1, 'sessionTitle', 'Bootcamp Sprint')}</td>
                        <td className="border border-black p-1 text-center">{getVal(r, 2, 'date', reportDate)}</td>
                        <td className="border border-black p-1">{getVal(r, 3, 'time', '10:00 AM, Lab')}</td>
                        <td className="border border-black p-1 text-center">{getVal(r, 4, 'participants', '60')}</td>
                        <td className="border border-black p-1">{getVal(r, 5, 'mentors', 'Student Mentors')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Evidence Checklist */}
            <div className="font-bold text-[11px] mb-1">Documentary Evidence Maintained:</div>
            <div className="border border-black p-2 text-[9.5px] bg-[#fbfbfb]">
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span>✔ 1. Activity Approval</span>
                <span>✔ 2. Activity Notice</span>
                <span>✔ 3. Programme Schedule</span>
                <span>✔ 4. Participant Registration</span>
                <span>✔ 5. Attendance Sheet</span>
                <span>✔ 6. Student Mentor List</span>
                <span>✔ 7. Photographs with Timemark</span>
                <span>✔ 8. Learning Material &amp; Outputs</span>
              </div>
            </div>
          </div>

          <KietSignatureBlock />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KRA 45: National & International Flagship Event
  // ─────────────────────────────────────────────────────────────────────────
  if (cleanNum === 45) {
    return (
      <div
        className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
        style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
      >
        <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
          <div>
            <KietOfficialHeader />
            <div className="text-center my-3">
              <h1 className="font-serif font-bold text-[14.5px] underline tracking-tight text-black m-0 uppercase">
                Report for (National &amp; International Flagship Event) organized / participated
              </h1>
              <p className="font-serif font-bold text-[11px] text-[#00236f] mt-0.5">
                KIET Deemed to be University, Ghaziabad &bull; KRA 45
              </p>
            </div>

            {/* Table 0: Event Profile */}
            <table className="w-full border-collapse border border-black text-[10px] mb-3">
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold w-[35%] bg-[#f2f2f2]">Name of Faculty &amp; Dept.</td>
                  <td className="border border-black p-1">{preparedBy || customFields.coordinatorName || 'Faculty Member'} &bull; {department}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Name of the Event</td>
                  <td className="border border-black p-1 font-bold">{customFields.eventName || 'INNOVENT 2026: International Tech Summit'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Level &amp; Mode</td>
                  <td className="border border-black p-1">{customFields.eventLevel || 'International'} &bull; {customFields.mode || 'Hybrid'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">UN SDGs Mapped</td>
                  <td className="border border-black p-1">{customFields.sdgMapping || 'Quality education (SDG 4), Industry, innovation and infrastructure (SDG 9)'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Venue &amp; Dates</td>
                  <td className="border border-black p-1">{customFields.venue || 'KIET Convention Centre'} &bull; {customFields.dates || reportDate}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Funded by &amp; Collaborations</td>
                  <td className="border border-black p-1">{customFields.fundedBy || 'Management & IEEE'} &bull; {customFields.collaborations || 'IEEE UP Section'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold bg-[#f2f2f2]">Total Number of Participants</td>
                  <td className="border border-black p-1 font-bold">{customFields.totalParticipants || '450'}</td>
                </tr>
              </tbody>
            </table>

            {/* Table: Technical Sessions / Track Details */}
            {customFields.rows && customFields.rows.length > 0 && (
              <div className="mb-3">
                <div className="font-bold text-[11px] mb-1">Technical Sessions / Track Details:</div>
                <table className="w-full border-collapse border border-black text-[10px]">
                  <thead>
                    <tr className="bg-[#f2f2f2]">
                      <th className="border border-black p-1 text-center w-[6%]">S. No.</th>
                      <th className="border border-black p-1 text-left w-[44%]">Track / Session Name</th>
                      <th className="border border-black p-1 text-center w-[16%]">Date</th>
                      <th className="border border-black p-1 text-center w-[12%]">Participants</th>
                      <th className="border border-black p-1 text-left w-[22%]">Keynote / Jury</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customFields.rows.map((r: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                        <td className="border border-black p-1 font-semibold">{getVal(r, 1, 'trackTitle', 'Technical Session')}</td>
                        <td className="border border-black p-1 text-center">{getVal(r, 2, 'date', reportDate)}</td>
                        <td className="border border-black p-1 text-center font-bold">{getVal(r, 3, 'participants', '150')}</td>
                        <td className="border border-black p-1">{getVal(r, 4, 'keynoteSpeaker', 'Session Chair')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table 1: Brief Report */}
            <div className="font-bold text-[11px] mb-1">Brief Report &amp; Outcomes:</div>
            <div className="border border-black p-2.5 text-justify text-[10px] leading-relaxed bg-[#fbfbfb] mb-3">
              {customFields.briefReport || narrative || 'The International Flagship Event brought together eminent academicians, industry leaders, and research scholars from across the globe. Key outcomes included 45 peer-reviewed papers presented, 12 technological innovation prizes awarded, and MoU discussions initiated with leading industry participants.'}
            </div>

            {/* Enclosures Checklist */}
            <div className="border border-black p-2 text-[9.5px] bg-[#fafafa]">
              <span className="font-bold block mb-1">Submission Checklist &amp; Enclosures:</span>
              <p className="m-0">
                1. Approval Letter &bull; 2. Budget &amp; Statement of Expenditure &bull; 3. List of Participants and Signed Attendance Copy &bull; 4. Feedback Summary (Resource Person, Participants, Organizer) &bull; 5. Geo-Tagged Photographs (Inauguration, Event, Valedictory)
              </p>
            </div>
          </div>

          <KietSignatureBlock />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Official Institutional Data Template (for KRAs 4-6, 14-17, 20-22, 24-32, 34-35, 38-43)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="space-y-8 select-text font-serif text-black mx-auto transition-transform origin-top"
      style={{ transform: `scale(${scale})`, maxWidth: '820px' }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-[#c5c5d3] p-8 md:p-12 min-h-[1050px] flex flex-col justify-between text-[11px] leading-normal">
        <div>
          <KietOfficialHeader />
          <div className="text-center my-3">
            <h1 className="font-serif font-bold text-[15px] underline tracking-tight text-black m-0 uppercase">
              {reportTitle || `${kraCode} Official Data Template`}
            </h1>
            <p className="font-serif font-bold text-[11.5px] text-[#00236f] mt-0.5">
              {kraCode.toUpperCase()} &bull; KIET Deemed to be University, Ghaziabad
            </p>
          </div>

          {/* Institutional Metadata Box */}
          <table className="w-full border-collapse border border-black text-[10.5px] mb-4">
            <tbody>
              <tr>
                <td className="border border-black p-1.5 font-bold w-[30%] bg-[#f2f2f2]">Name of School / Dept.</td>
                <td className="border border-black p-1.5 w-[35%]">{department}</td>
                <td className="border border-black p-1.5 font-bold w-[18%] bg-[#f2f2f2]">Academic Session</td>
                <td className="border border-black p-1.5 w-[17%]">{academicYear}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Reporting Period (Cycle)</td>
                <td className="border border-black p-1.5">{cycle}</td>
                <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Date of Report</td>
                <td className="border border-black p-1.5">{reportDate}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Report Prepared By</td>
                <td className="border border-black p-1.5">{preparedBy || customFields.preparedBy || 'Faculty Coordinator'}</td>
                <td className="border border-black p-1.5 font-bold bg-[#f2f2f2]">Designation</td>
                <td className="border border-black p-1.5">{designation}</td>
              </tr>
            </tbody>
          </table>

          {/* Dynamic Extra Parameter Sections if any */}
          {extraSections && extraSections.length > 0 && (
            <div className="mb-4 space-y-2">
              {extraSections.map((sec: any, sIdx: number) => (
                <div key={sIdx}>
                  <div className="font-bold text-[11px] bg-[#f2f2f2] border border-black px-2 py-1 mb-1">
                    {sec.title}
                  </div>
                  <table className="w-full border-collapse border border-black text-[10px]">
                    <tbody>
                      {sec.items?.map((item: any, iIdx: number) => (
                        <tr key={iIdx}>
                          <td className="border border-black p-1 font-bold w-[35%] bg-[#fafafa]">
                            {item.label}
                          </td>
                          <td className="border border-black p-1">{item.value || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Tabular Records */}
          {columns && columns.length > 0 && (
            <div className="mb-4">
              <div className="font-bold text-[11px] bg-[#f2f2f2] border border-black px-2 py-1 mb-1 flex justify-between items-center">
                <span>{tableTitle || 'Official Prescribed Template Data'}</span>
                <span className="text-[10px] text-slate-700">({rows.length} Verified Entries)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black text-[10px]">
                  <thead>
                    <tr className="bg-[#f9f9f9]">
                      {columns.map((col: string, idx: number) => (
                        <th key={idx} className="border border-black p-1 text-center font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length > 0 ? (
                      rows.map((row: any[], rIdx: number) => (
                        <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-[#fafafa]' : ''}>
                          {row.map((cell: any, cIdx: number) => (
                            <td
                              key={cIdx}
                              className={`border border-black p-1 ${
                                cIdx === 0 ? 'text-center font-bold' : ''
                              }`}
                            >
                              {cell !== undefined && cell !== null && cell !== '' ? String(cell) : '—'}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="border border-black p-3 text-center text-slate-500 italic"
                        >
                          No records added yet. Enter records in the left panel.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Outcome & Impact Narrative */}
          <div className="mb-4">
            <div className="font-bold text-[11px] bg-[#f2f2f2] border border-black px-2 py-1 mb-1">
              Executive Summary &amp; Verification Observations
            </div>
            <div className="border border-black p-2.5 text-justify text-[10.5px] leading-relaxed bg-[#fafafa] min-h-[50px]">
              {narrative || customFields.narrative || 'All target activities and academic requirements specified under this KRA have been executed in compliance with institutional quality standards and Accreditation criteria.'}
            </div>
          </div>
        </div>

        <KietSignatureBlock />
      </div>
    </div>
  );
}
