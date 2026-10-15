"use client";

import React, { useState } from 'react';
import { KRAFormProps } from './types';
import MultiEvidenceUploader from './MultiEvidenceUploader';

interface ActivityColumn {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
}

interface ActivityConfig {
  title: string;
  tableTitle: string;
  columns: ActivityColumn[];
  defaultRows: Record<string, any>[];
  extraFields: { key: string; label: string; placeholder?: string; type?: string; isTextarea?: boolean }[];
  impactLabel?: string;
}

export const KRA_ACTIVITY_CONFIGS: Record<string, ActivityConfig> = {
  '11': {
    title: 'Report on Bridge Courses Conducted',
    tableTitle: 'Detail of Bridge Courses',
    columns: [
      { key: 'courseName', label: 'Course Name', placeholder: 'e.g., Bridge Course on Programming' },
      { key: 'duration', label: 'Duration (Hours)', placeholder: '20', type: 'number' },
      { key: 'mode', label: 'Mode (Offline/Online/Hybrid)', placeholder: 'Offline' },
      { key: 'resourcePerson', label: 'Resource Person', placeholder: 'Faculty Expert / Name' },
      { key: 'enrolled', label: 'Enrolled', placeholder: '60', type: 'number' },
      { key: 'completed', label: 'Completed', placeholder: '58', type: 'number' },
    ],
    defaultRows: [
      { courseName: 'Bridge Course on Programming Fundamentals', duration: '20', mode: 'Offline', resourcePerson: 'Faculty Coordinator', enrolled: '60', completed: '58' }
    ],
    extraFields: [
      { key: 'assessmentMethod', label: 'Assessment Method', placeholder: 'Objective test, Hands-on project, Viva' },
      { key: 'minAttendance', label: 'Minimum Attendance Requirement', placeholder: '75%' },
      { key: 'passingCriteria', label: 'Passing / Completion Criteria', placeholder: 'Minimum 50% in assessment' },
      { key: 'certAuthority', label: 'Certificate Issuing Authority', placeholder: 'KIET Deemed to be University' },
      { key: 'numCertsIssued', label: 'Number of Certificates Issued', placeholder: '58', type: 'number' },
      { key: 'feedbackScore', label: 'Student Feedback Score (out of 5)', placeholder: '4.6' },
      { key: 'suggestions', label: 'Major Suggestions Received', isTextarea: true, placeholder: 'Include more hands-on coding labs...' },
    ],
    impactLabel: 'Outcome & Impact on Students',
  },
  '12': {
    title: 'Awards and Recognition for Research / Innovations',
    tableTitle: 'Awards Received by Faculty / Students / Dept',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'awardId', label: 'Award ID', placeholder: 'AWD-01' },
      { key: 'awardName', label: 'Name of Award', placeholder: 'Young Scientist Research Award' },
      { key: 'category', label: 'Category (Faculty/Student)', placeholder: 'Faculty' },
      { key: 'recipient', label: 'Recipient Name', placeholder: 'Dr. Research Faculty' },
      { key: 'awardingBody', label: 'Awarding Body / Organization', placeholder: 'DST / IEEE' },
    ],
    defaultRows: [
      { academicYear: '2026-2027', awardId: 'AWD-01', awardName: 'National Innovation Excellence Award', category: 'Faculty', recipient: 'Dr. Faculty Member', awardingBody: 'IEEE Computational Society' }
    ],
    extraFields: [
      { key: 'awardDetails', label: 'Complete Detail of Award / Recognition', isTextarea: true, placeholder: 'Describe the research breakthrough, innovation, or competition details...' },
      { key: 'cashPrize', label: 'Cash Prize / Trophy / Fellowship (if any)', placeholder: 'Trophy & Rs. 25,000/-' },
    ],
    impactLabel: 'Research Innovation & Recognition Impact',
  },
  '13': {
    title: 'Faculty Membership in Industry Advisory Board / Other Committees',
    tableTitle: 'Meetings Attended / Contributed',
    columns: [
      { key: 'meetingDate', label: 'Date of Meeting', placeholder: 'DD/MM/YYYY' },
      { key: 'meetingRef', label: 'Meeting No. / Ref', placeholder: 'IAB-2026-01' },
      { key: 'agenda', label: 'Major Agenda', placeholder: 'Curriculum & Industry 4.0 review' },
      { key: 'contribution', label: 'Faculty Contribution', placeholder: 'Proposed AI elective basket' },
      { key: 'evidence', label: 'Evidence (Minutes/Letter)', placeholder: 'Minutes of Meeting' },
    ],
    defaultRows: [
      { meetingDate: '12/09/2026', meetingRef: 'IAB-MTG-01', agenda: 'Curriculum alignment with Cloud & AI', contribution: 'Advised practical lab syllabus', evidence: 'Signed Minutes' }
    ],
    extraFields: [
      { key: 'committeeName', label: 'Name of Industry / Organization / Committee', placeholder: 'e.g., Tech Mahindra Industry Advisory Board' },
      { key: 'chairpersonName', label: 'Chairperson / Head Name & Designation', placeholder: 'Dr. Amit Saxena, VP Engineering' },
      { key: 'naturePurpose', label: 'Nature & Purpose of Board', placeholder: 'Academic-Industry Curriculum Advisory' },
      { key: 'domainExpertise', label: 'Area / Domain of Expertise', placeholder: 'Cloud Computing, AI & Cyber Security' },
      { key: 'orgWebsite', label: 'Official Website / Reference', placeholder: 'https://www.company.com' },
      { key: 'periodMembership', label: 'Total Period of Membership', placeholder: '2026–2028 (2 Years)' },
      { key: 'meetingsCount', label: 'Number of Meetings Attended', placeholder: '3', type: 'number' },
      { key: 'majorActivities', label: 'Major Activities Undertaken', isTextarea: true, placeholder: 'Syllabus review, guest lecture coordination, capstone evaluation...' },
    ],
    impactLabel: 'Industry-Academia Linkage & Curriculum Impact',
  },
  '18': {
    title: 'Signed Functional MoU with Industry / Research Organization',
    tableTitle: 'Activities Conducted Under Functional MoU',
    columns: [
      { key: 'activityTitle', label: 'Activity Title', placeholder: 'Hands-on IoT Workshop' },
      { key: 'date', label: 'Date & Duration', placeholder: '15/10/2026 (1 Day)' },
      { key: 'targetGroup', label: 'Target Participants', placeholder: 'Students & Faculty' },
      { key: 'beneficiaries', label: 'No. of Beneficiaries', placeholder: '85', type: 'number' },
      { key: 'outcome', label: 'Measurable Outcome', placeholder: '12 Live Projects Mentored' },
    ],
    defaultRows: [
      { activityTitle: 'Industrial IoT Workshop', date: '15/10/2026', targetGroup: 'B.Tech 3rd Year', beneficiaries: '85', outcome: '12 Mini-projects developed' }
    ],
    extraFields: [
      { key: 'industryName', label: 'Name of Industry / Research Organization', placeholder: 'e.g., Cisco Systems India / Bosch' },
      { key: 'mouDate', label: 'Date of MoU Signing', placeholder: 'DD/MM/YYYY' },
      { key: 'mouValidity', label: 'Validity Period of MoU', placeholder: '3 Years (2026–2029)' },
      { key: 'objectives', label: 'Key Objectives of the MoU Activity', isTextarea: true, placeholder: 'Joint workshops, student internships, research collaboration...' },
      { key: 'briefDescription', label: 'Brief Description of the Activity', isTextarea: true, placeholder: 'Comprehensive session conducted by industry architects...' },
    ],
    impactLabel: 'Benefits to Students and Faculty',
  },
  '19': {
    title: 'Industrial Visit Report (19a / 19b)',
    tableTitle: 'Student Participants / Observations',
    columns: [
      { key: 'name', label: 'Student / Participant Name', placeholder: 'Student Name' },
      { key: 'rollNo', label: 'Roll Number', placeholder: '230029010001' },
      { key: 'yearSem', label: 'Year / Semester', placeholder: '3rd Year / 5th Sem' },
      { key: 'feedbackScore', label: 'Rating (1-5)', placeholder: '5', type: 'number' },
    ],
    defaultRows: [
      { name: 'Aarav Gupta', rollNo: '230029010001', yearSem: '3rd Year / 5th Sem', feedbackScore: '5' },
      { name: 'Priya Sharma', rollNo: '230029010002', yearSem: '3rd Year / 5th Sem', feedbackScore: '5' }
    ],
    extraFields: [
      { key: 'subType', label: 'Proforma Type: 19a (Detailed Report) or 19b (Student Feedback)', placeholder: '19a' },
      { key: 'industryName', label: 'Name of Industry Visited', placeholder: 'e.g., Mother Dairy Plant / BHEL / STMicroelectronics' },
      { key: 'visitDate', label: 'Date of Visit', placeholder: 'DD/MM/YYYY' },
      { key: 'industryProfile', label: 'Profile of Industry Visited (Products, Services)', isTextarea: true, placeholder: 'Leading automated manufacturing plant with SCADA control...' },
      { key: 'industryExperts', label: 'Industry Experts Interacted With (Name, Desig)', placeholder: 'Mr. R. K. Sharma, Plant General Manager' },
      { key: 'learningOutcomes', label: 'Key Learning Outcomes Gained', isTextarea: true, placeholder: 'Observed automated packaging, robotics, quality assurance...' },
      { key: 'courseMapped', label: 'Course Mapped (Name, Code, Semester)', placeholder: 'Industrial Automation (KCS-504), 5th Sem' },
      { key: 'academicGap', label: 'Academic Gap Fulfilled & Industrial Solution', isTextarea: true, placeholder: 'Bridged theoretical PLC knowledge with actual plant implementation...' },
    ],
    impactLabel: 'Theory-to-Practice Gap Fulfilment & Engineering Exposure',
  },
  '23': {
    title: 'Report on Skill Development & Employability Training',
    tableTitle: 'Program Details',
    columns: [
      { key: 'programName', label: 'Program Name', placeholder: 'Employability Bootcamp' },
      { key: 'duration', label: 'Duration (Hours)', placeholder: '30', type: 'number' },
      { key: 'mode', label: 'Mode (Offline/Online/Hybrid)', placeholder: 'Offline' },
      { key: 'resourcePerson', label: 'Resource Person / Agency', placeholder: 'Industry Specialist' },
      { key: 'enrolled', label: 'Students Enrolled', placeholder: '120', type: 'number' },
      { key: 'completed', label: 'Students Completed', placeholder: '118', type: 'number' },
    ],
    defaultRows: [
      { programName: 'Campus to Corporate: Skill Development Bootcamp', duration: '30', mode: 'Offline', resourcePerson: 'Corporate Trainers', enrolled: '120', completed: '118' }
    ],
    extraFields: [
      { key: 'programTitle', label: 'Title of the Programme', placeholder: 'Campus to Corporate Employability Accelerator' },
      { key: 'assessmentMethod', label: 'Assessment Method', placeholder: 'Objective Test & Mock Technical Interviews' },
      { key: 'minAttendance', label: 'Minimum Attendance Requirement', placeholder: '75%' },
      { key: 'passingCriteria', label: 'Passing / Completion Criteria', placeholder: 'Minimum 50% in assessment and 75% attendance' },
      { key: 'feedbackScore', label: 'Student Feedback Score (out of 5)', placeholder: '4.7' },
      { key: 'suggestions', label: 'Major Suggestions Received', isTextarea: true, placeholder: 'Conduct more mock coding rounds and behavioral workshops...' },
    ],
    impactLabel: 'Employability & Placement Clearance Impact',
  },
  '33': {
    title: 'Alumni Events Organized – Chapter Meet & Engagement',
    tableTitle: 'Participating Alumni',
    columns: [
      { key: 'alumniName', label: 'Alumni Name', placeholder: 'Rohan Mehra' },
      { key: 'batch', label: 'Batch / Programme', placeholder: '2019 / B.Tech CSE' },
      { key: 'organization', label: 'Organization / Designation', placeholder: 'Amazon / Lead Data Scientist' },
      { key: 'natureEngagement', label: 'Nature of Engagement', placeholder: 'Mentoring / Expert Talk' },
      { key: 'dateActivity', label: 'Date / Activity', placeholder: '14/10/2026' },
      { key: 'studentsBenefited', label: 'Students Benefited', placeholder: '65', type: 'number' },
    ],
    defaultRows: [
      { alumniName: 'Rohan Mehra', batch: '2019 / CSE', organization: 'Amazon / Lead Data Scientist', natureEngagement: 'Mentoring', dateActivity: '14/10/2026', studentsBenefited: '65' }
    ],
    extraFields: [
      { key: 'chapterName', label: 'Name of Alumni Chapter / Association', placeholder: 'KIET CSE Alumni Chapter' },
      { key: 'eventName', label: 'Name of Event', placeholder: 'Annual Alumni Chapter Meet & Mentorship Drive' },
      { key: 'eventDate', label: 'Date of Event', placeholder: 'DD/MM/YYYY' },
      { key: 'venue', label: 'Venue / Platform', placeholder: 'KIET Auditorium' },
      { key: 'alumniParticipants', label: 'No. of Alumni Participants', placeholder: '35', type: 'number' },
      { key: 'studentParticipants', label: 'No. of Student Participants', placeholder: '180', type: 'number' },
      { key: 'facultyParticipants', label: 'No. of Faculty Participants', placeholder: '15', type: 'number' },
      { key: 'briefDescription', label: 'Brief Description of the Activity', isTextarea: true, placeholder: 'Alumni reconnected and shared insights on AI career pathways...' },
    ],
    impactLabel: 'Alumni Engagement & Mentorship Linkage',
  },
  '36': {
    title: 'Report on Faculty Development Programme (FDP) / STP',
    tableTitle: 'Faculty Participation Records',
    columns: [
      { key: 'facultyName', label: 'Name of Faculty', placeholder: 'Dr. Suresh Kumar' },
      { key: 'department', label: 'Department', placeholder: 'CSE' },
      { key: 'designation', label: 'Designation', placeholder: 'Associate Professor' },
      { key: 'attendance', label: 'Attendance / Participation', placeholder: '100%' },
      { key: 'certificate', label: 'Certificate Issued (Yes/No)', placeholder: 'Yes' },
    ],
    defaultRows: [
      { facultyName: 'Dr. Suresh Kumar', department: 'CSE', designation: 'Associate Professor', attendance: '100%', certificate: 'Yes' }
    ],
    extraFields: [
      { key: 'fdpTitle', label: 'Title of the FDP / STP', placeholder: 'National FDP on AI-Assisted Pedagogy and OBE Standards' },
      { key: 'duration', label: 'Duration (Days / Hours)', placeholder: '5 Days (35 Hours)' },
      { key: 'organizedBy', label: 'Organized by', placeholder: 'Department of CSE, KIET' },
      { key: 'mode', label: 'Mode (Offline / Online / Hybrid)', placeholder: 'Hybrid' },
      { key: 'assessmentMethod', label: 'Assessment Method', placeholder: 'Hands-on Assignment & Mini-Project' },
      { key: 'minAttendance', label: 'Minimum Attendance Requirement', placeholder: '80%' },
    ],
    impactLabel: 'Pedagogical & Research Competence Impact',
  },
  '37': {
    title: 'Report on Staff Training Programme (STP)',
    tableTitle: 'Staff Participation Records',
    columns: [
      { key: 'facultyName', label: 'Name of Staff Member', placeholder: 'Mr. Technical Staff' },
      { key: 'department', label: 'Department', placeholder: 'CSE' },
      { key: 'designation', label: 'Designation', placeholder: 'Lab Technical Officer' },
      { key: 'attendance', label: 'Attendance', placeholder: '100%' },
      { key: 'certificate', label: 'Certificate Issued', placeholder: 'Yes' },
    ],
    defaultRows: [
      { facultyName: 'Mr. Ramesh Chand', department: 'CSE', designation: 'Senior Lab Technician', attendance: '100%', certificate: 'Yes' }
    ],
    extraFields: [
      { key: 'fdpTitle', label: 'Title of Staff Training Programme', placeholder: 'Hands-on Training on Advanced Lab Equipment & Cloud Virtualization' },
      { key: 'duration', label: 'Duration', placeholder: '3 Days (18 Hours)' },
      { key: 'organizedBy', label: 'Organized by', placeholder: 'Central Computing Facility, KIET' },
      { key: 'mode', label: 'Mode', placeholder: 'Offline' },
    ],
    impactLabel: 'Laboratory Administration & Technical Upgradation',
  },
  '44': {
    title: 'EVENT REPORT – BOOT Camp & Peer Learning Activity',
    tableTitle: 'Session / Peer Mentoring Schedule',
    columns: [
      { key: 'sessionTitle', label: 'Session / Bootcamp Topic', placeholder: 'Full Stack Sprint' },
      { key: 'date', label: 'Date', placeholder: 'DD/MM/YYYY' },
      { key: 'time', label: 'Time & Venue', placeholder: '10 AM - 4 PM, Lab 3' },
      { key: 'participants', label: 'Participants', placeholder: '60', type: 'number' },
      { key: 'mentors', label: 'Peer Mentors', placeholder: 'Final Year Student Leads' },
    ],
    defaultRows: [
      { sessionTitle: 'Web3 & AI Hackathon Sprint', date: '20/10/2026', time: '10:00 AM - 05:00 PM', participants: '60', mentors: 'Student Mentors' }
    ],
    extraFields: [
      { key: 'activityName', label: 'Name of Activity', placeholder: 'Peer Coding & Hackathon Bootcamp' },
      { key: 'activityId', label: 'Activity ID', placeholder: 'BOOT-2026-01' },
      { key: 'activityType', label: 'Type of Activity', placeholder: 'BOOT Camp / Peer Learning' },
      { key: 'theme', label: 'Theme / Title', placeholder: 'Agile Coding & Competitive Problem Solving' },
      { key: 'dates', label: 'Date(s) & Duration', placeholder: '20th - 21st October 2026 (2 Days)' },
      { key: 'venueMode', label: 'Venue / Mode', placeholder: 'Auditorium / Offline' },
      { key: 'studentCoordinators', label: 'Student Coordinator(s)', placeholder: 'Aarav (4th Yr), Priya (3rd Yr)' },
      { key: 'resourceMentor', label: 'Resource Person / Mentor', placeholder: 'Alumni & Peer Mentors' },
      { key: 'studentsRegistered', label: 'No. of Students Registered', placeholder: '75', type: 'number' },
      { key: 'studentsParticipated', label: 'No. of Students Participated', placeholder: '72', type: 'number' },
    ],
    impactLabel: 'Peer-to-Peer Collaborative Learning & Skill Growth',
  },
  '45': {
    title: 'Report for National & International Flagship Event',
    tableTitle: 'Technical Sessions / Track Details',
    columns: [
      { key: 'trackTitle', label: 'Track / Session Name', placeholder: 'AI & Data Science Track' },
      { key: 'date', label: 'Date', placeholder: 'DD/MM/YYYY' },
      { key: 'participants', label: 'Participants', placeholder: '180', type: 'number' },
      { key: 'keynoteSpeaker', label: 'Keynote Speaker / Jury', placeholder: 'Prof. S. K. Das, IIT Delhi' },
    ],
    defaultRows: [
      { trackTitle: 'International Conference on Sustainable Computing', date: '18/10/2026', participants: '250', keynoteSpeaker: 'Dr. V. K. Saraswat' }
    ],
    extraFields: [
      { key: 'eventName', label: 'Name of the Event', placeholder: 'INNOVENT 2026: International Tech Flagship' },
      { key: 'eventLevel', label: 'Level (International / National / State)', placeholder: 'International' },
      { key: 'mode', label: 'Mode of Event (Online / Offline / Hybrid)', placeholder: 'Hybrid' },
      { key: 'sdgMapping', label: 'UN SDGs Mapped (e.g. SDG 4, SDG 9, SDG 11)', placeholder: 'Quality Education (SDG 4), Industry & Innovation (SDG 9)' },
      { key: 'venue', label: 'Venue', placeholder: 'KIET Convention Centre' },
      { key: 'dates', label: 'Dates & No. of Days', placeholder: '18th - 19th October 2026 (2 Days)' },
      { key: 'fundedBy', label: 'Funded by (DST / CSIR / IEEE / Management)', placeholder: 'DST & Management' },
      { key: 'collaborations', label: 'Details of Collaboration (if any)', placeholder: 'IEEE UP Section & ACM' },
      { key: 'totalParticipants', label: 'Total Number of Participants', placeholder: '450', type: 'number' },
      { key: 'briefReport', label: 'Brief Report & Outcomes (Academic, Research, SDG)', isTextarea: true, placeholder: '45 research papers presented, 12 awards conferred...' },
    ],
    impactLabel: 'Global Academic Visibility & Research Impact',
  },
};

export default function KRAActivityReportForm({
  kraCode,
  departmentName,
  cycle,
  hodName,
  formData,
  patchFormData,
}: KRAFormProps) {
  const cleanNum = kraCode.replace(/[^0-9]/g, '');
  const config = KRA_ACTIVITY_CONFIGS[cleanNum] || {
    title: `Official Activity Report – ${kraCode}`,
    tableTitle: 'Activity & Performance Records',
    columns: [
      { key: 'title', label: 'Activity Title', placeholder: 'Title of activity' },
      { key: 'date', label: 'Date', placeholder: 'DD/MM/YYYY' },
      { key: 'participants', label: 'Participants', placeholder: '50', type: 'number' },
      { key: 'outcome', label: 'Measurable Outcome', placeholder: 'Outcome achieved' },
    ],
    defaultRows: [
      { title: 'Department Activity', date: '01/10/2026', participants: '50', outcome: 'Executed successfully' }
    ],
    extraFields: [
      { key: 'coordinatorName', label: 'Faculty Coordinator Name', placeholder: hodName || 'Faculty Name' },
      { key: 'objectives', label: 'Key Objectives', isTextarea: true, placeholder: 'Objectives of this KRA...' },
    ],
    impactLabel: 'Outcome & Impact',
  };

  const [activeTab, setActiveTab] = useState<'info' | 'records' | 'outcomes' | 'evidence'>('info');

  const custom = formData.customFields || {};
  const rows: Record<string, any>[] = custom.rows || config.defaultRows;

  const updateField = (field: string, val: any) => {
    const updated = { ...custom, [field]: val };
    patchFormData({
      customFields: updated,
    });
  };

  const updateRow = (index: number, key: string, val: any) => {
    const nextRows = [...rows];
    nextRows[index] = { ...nextRows[index], [key]: val };
    patchFormData({
      customFields: { ...custom, rows: nextRows },
      achievementClaim: `${nextRows.length} Records`,
    });
  };

  const addRow = () => {
    const emptyRow: Record<string, any> = {};
    config.columns.forEach((c) => (emptyRow[c.key] = ''));
    const nextRows = [...rows, emptyRow];
    patchFormData({
      customFields: { ...custom, rows: nextRows },
      achievementClaim: `${nextRows.length} Records`,
    });
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    const nextRows = rows.filter((_, i) => i !== index);
    patchFormData({
      customFields: { ...custom, rows: nextRows },
      achievementClaim: `${nextRows.length} Records`,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-Header Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 pt-2 flex items-center gap-1 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'info'
              ? 'border-[#00236f] text-[#00236f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">info</span>
          <span>1. Basic Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('records')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'records'
              ? 'border-[#00236f] text-[#00236f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">table_rows</span>
          <span>2. {config.tableTitle} ({rows.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outcomes')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'outcomes'
              ? 'border-[#00236f] text-[#00236f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">psychology</span>
          <span>3. Outcomes &amp; Impact</span>
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
          <span>4. Evidence</span>
        </button>
      </div>

      {/* Main Form Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Auto-populated Institutional Information (matching KRA 7) */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#00236f] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Automatically Populated Institutional Information
            </span>
            <span className="text-[10px] text-slate-500 italic">Retrieved from system</span>
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
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 block">Head of Department / Dean:</span>
              </div>
              <span className="font-semibold text-slate-800 truncate block">{hodName || 'Dean'}</span>
            </div>
            <div className="bg-white/90 p-2 rounded border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Institution:</span>
              <span className="font-semibold text-slate-800 truncate block">KIET Deemed to be University</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic m-0">
            * Note: These institutional details appear automatically on the official report without requiring manual entry.
          </p>
        </div>

        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 'info' && (
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                {config.title} – Required Inputs
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Fill in the program coordinator and event specifics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Coordinator Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={custom.coordinatorName || ''}
                  onChange={(e) => updateField('coordinatorName', e.target.value)}
                  placeholder="e.g., Dr. Ajay Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={custom.designation || 'Professor & Dean'}
                  onChange={(e) => updateField('designation', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
              </div>

              {config.extraFields.map((field) => (
                <div
                  key={field.key}
                  className={field.isTextarea ? 'col-span-2' : 'col-span-1'}
                >
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {field.label}
                  </label>
                  {field.isTextarea ? (
                    <textarea
                      rows={3}
                      value={custom[field.key] || ''}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={custom[field.key] || ''}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#00236f]"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>Proceed to {config.tableTitle}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: RECORDS TABLE */}
        {activeTab === 'records' && (
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
            <div className="border-b pb-2 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                  {config.tableTitle} ({rows.length} Entries)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Add, edit, or remove entries in the official tabular format.
                </p>
              </div>
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#00236f] bg-blue-100 px-2 py-0.5 rounded">
                      Record #{rIdx + 1}
                    </span>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(rIdx)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {config.columns.map((col) => (
                      <div key={col.key}>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          {col.label}
                        </label>
                        <input
                          type={col.type || 'text'}
                          value={row[col.key] || ''}
                          onChange={(e) => updateRow(rIdx, col.key, e.target.value)}
                          placeholder={col.placeholder || ''}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-[#00236f]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition cursor-pointer"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('outcomes')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>Proceed to Outcomes &amp; Impact</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: OUTCOMES & IMPACT */}
        {activeTab === 'outcomes' && (
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                {config.impactLabel || 'Outcomes, Observations & Summary'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Summarize outcomes, participant feedback, and recommendations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Summary of Outcomes &amp; Impact on Students / Department:
              </label>
              <textarea
                rows={5}
                value={custom.narrative || custom.impactSummary || ''}
                onChange={(e) => {
                  updateField('narrative', e.target.value);
                  updateField('impactSummary', e.target.value);
                }}
                placeholder="Describe the technical learning gained, student projects developed, certifications awarded, industry exposure, or career impact..."
                className="w-full p-3 text-xs border border-slate-300 rounded-md focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs">
              <span className="font-bold text-slate-700 block mb-1">
                Dual Signatory Verification Block
              </span>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="border-r pr-2">
                  <span className="text-slate-500 block">Coordinator:</span>
                  <strong className="text-slate-800 block">{custom.coordinatorName || 'Faculty Coordinator'}</strong>
                  <span className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Approving Authority:</span>
                  <strong className="text-slate-800 block">HOD / Dean, {departmentName}</strong>
                  <span className="text-[10px] text-slate-400">KIET Deemed to be University</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition cursor-pointer"
              >
                Back to Records
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
                Upload notices, attendance sheets, geo-tagged photos, or approval letters.
              </p>
            </div>

            <MultiEvidenceUploader
              formData={formData}
              patchFormData={patchFormData}
            />

            <div className="pt-3 border-t flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('outcomes')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition cursor-pointer"
              >
                Back to Outcomes
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
