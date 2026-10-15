"use client";

import React, { useState } from 'react';
import { KRAFormProps } from './types';
import MultiEvidenceUploader from './MultiEvidenceUploader';

interface ColumnDef {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
}

interface TemplatePreset {
  title: string;
  metricLabel: string;
  columns: ColumnDef[];
  sampleRow: Record<string, any>;
}

export const KRA_PRESETS: Record<string, TemplatePreset> = {
  // KRA 2 & 3: VAC & Online Courses / MOOCs
  '2': {
    title: 'Value-Added Courses Completed by Students',
    metricLabel: 'Courses',
    columns: [
      { key: 'courseName', label: 'Course / Programme Name', placeholder: 'e.g. AWS Cloud Practitioner' },
      { key: 'courseCode', label: 'Course Code', placeholder: 'VAC-CS-01' },
      { key: 'platform', label: 'Platform / Mode', placeholder: 'In-House / Online' },
      { key: 'hours', label: 'Contact Hours', placeholder: '30', type: 'number' },
      { key: 'enrolled', label: 'Enrolled Students', placeholder: '60', type: 'number' },
      { key: 'completed', label: 'Completed Students', placeholder: '58', type: 'number' },
    ],
    sampleRow: { courseName: 'Deep Learning with PyTorch', courseCode: 'VAC-AI-04', platform: 'In-House', hours: '36', enrolled: '65', completed: '62' },
  },
  '3': {
    title: 'Online Courses (MOOCs / SWAYAM / NPTEL / Global Certifications)',
    metricLabel: 'Certifications',
    columns: [
      { key: 'courseName', label: 'Course / Certification Name', placeholder: 'e.g. Machine Learning Specialization' },
      { key: 'platform', label: 'Platform (SWAYAM/NPTEL/Coursera)', placeholder: 'SWAYAM' },
      { key: 'studentName', label: 'Student / Faculty Name', placeholder: 'Student Name' },
      { key: 'rollNo', label: 'Roll / Employee ID', placeholder: '230029010022' },
      { key: 'score', label: 'Score / Tag', placeholder: 'Elite + Silver (84%)' },
    ],
    sampleRow: { courseName: 'Cloud Computing Architecture', platform: 'NPTEL', studentName: 'Aditya Rao', rollNo: '230029010045', score: 'Elite (78%)' },
  },
  // KRA 4, 5, 6: Projects and Internships (from KRA 4-6 Template.xlsx)
  '4': {
    title: 'Students Field Projects',
    metricLabel: 'Field Projects',
    columns: [
      { key: 'programmeName', label: 'Programme Name', placeholder: 'B.Tech CSE' },
      { key: 'programmeCode', label: 'Programme Code', placeholder: '101' },
      { key: 'hasComponent', label: 'Field Project Component (Yes/No)', placeholder: 'Yes' },
      { key: 'componentName', label: 'Component Name', placeholder: 'Field Project' },
      { key: 'courseCode', label: 'Course Code', placeholder: 'CS-601' },
      { key: 'studentsCount', label: 'Students Undertaking', placeholder: '45', type: 'number' },
    ],
    sampleRow: { programmeName: 'B.Tech CSE', programmeCode: '101', hasComponent: 'Yes', componentName: 'Field Project', courseCode: 'CS-601', studentsCount: '45' },
  },
  '5': {
    title: 'Students Research Projects',
    metricLabel: 'Research Projects',
    columns: [
      { key: 'programmeName', label: 'Programme Name', placeholder: 'B.Tech CSE' },
      { key: 'programmeCode', label: 'Programme Code', placeholder: '101' },
      { key: 'hasComponent', label: 'Research Component (Yes/No)', placeholder: 'Yes' },
      { key: 'componentName', label: 'Component Name', placeholder: 'Research Project' },
      { key: 'courseCode', label: 'Course Code', placeholder: 'CS-705' },
      { key: 'studentsCount', label: 'Students Undertaking', placeholder: '38', type: 'number' },
    ],
    sampleRow: { programmeName: 'B.Tech CSE', programmeCode: '101', hasComponent: 'Yes', componentName: 'Research Project', courseCode: 'CS-705', studentsCount: '38' },
  },
  '6': {
    title: 'Student Internships Completed',
    metricLabel: 'Internships',
    columns: [
      { key: 'programmeName', label: 'Programme Name', placeholder: 'B.Tech CSE' },
      { key: 'programmeCode', label: 'Programme Code', placeholder: '101' },
      { key: 'hasComponent', label: 'Internship Component (Yes/No)', placeholder: 'Yes' },
      { key: 'componentName', label: 'Component Name', placeholder: 'Industrial Internship' },
      { key: 'courseCode', label: 'Course Code', placeholder: 'CS-801' },
      { key: 'studentsCount', label: 'Students Undertaking', placeholder: '142', type: 'number' },
    ],
    sampleRow: { programmeName: 'B.Tech CSE', programmeCode: '101', hasComponent: 'Yes', componentName: 'Industrial Internship', courseCode: 'CS-801', studentsCount: '142' },
  },
  // KRA 14, 15, 16: Entrepreneurship (from KRA 15 Entrepreneur.xlsx)
  '14': {
    title: 'Yukthi Innovation Challenge Registrations',
    metricLabel: 'Ideas',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'teamLead', label: 'Team Lead / Innovator Name', placeholder: 'Student Name' },
      { key: 'studentId', label: 'Student ID / Roll No.', placeholder: '230029010045' },
      { key: 'ideaTitle', label: 'Yukthi Innovation Title', placeholder: 'AI Soil Health Analyzer' },
      { key: 'theme', label: 'Innovation Theme / Sector', placeholder: 'AgriTech & Sustainability' },
    ],
    sampleRow: { academicYear: '2026-2027', teamLead: 'Siddharth Varma', studentId: '230029010045', ideaTitle: 'AI Soil Health Analyzer', theme: 'AgriTech' },
  },
  '15': {
    title: 'Entrepreneurs & Startups (Faculty, Alumni, Students)',
    metricLabel: 'Startups',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'entrepreneurName', label: 'Name of Entrepreneur', placeholder: 'Founder Name' },
      { key: 'founderType', label: 'Type (Faculty/Alumni/Student)', placeholder: 'Student' },
      { key: 'startupName', label: 'Startup / Enterprise Name', placeholder: 'NeuralCraft AI Labs' },
      { key: 'cinDpiit', label: 'CIN / DPIIT Reg. No.', placeholder: 'DIPP12345' },
      { key: 'incubator', label: 'Incubated at TBI / KIET', placeholder: 'KIET TBI' },
    ],
    sampleRow: { academicYear: '2026-2027', entrepreneurName: 'Aditya Gupta', founderType: 'Student', startupName: 'NeuralCraft AI Labs', cinDpiit: 'DIPP98765', incubator: 'KIET TBI' },
  },
  '16': {
    title: 'Startups Incubated in KIET-TBI',
    metricLabel: 'Incubated Startups',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'startupName', label: 'Startup Name', placeholder: 'BioGrid Tech' },
      { key: 'founders', label: 'Founders / Directors', placeholder: 'Dr. Rahul Singhal' },
      { key: 'domain', label: 'Technology Domain', placeholder: 'CleanTech & Bio-Energy' },
      { key: 'fundingGrant', label: 'Funding / Seed Support (INR)', placeholder: '5,00,000' },
      { key: 'employment', label: 'Direct Employment Generated', placeholder: '6', type: 'number' },
    ],
    sampleRow: { academicYear: '2026-2027', startupName: 'BioGrid Tech', founders: 'Dr. Rahul Singhal', domain: 'CleanTech', fundingGrant: '5,00,000', employment: '6' },
  },
  // KRA 17: Industry Centers of Excellence (from KRA 17 Training centers_labs.xlsx)
  '17': {
    title: 'Training Centers / Labs Established with Industries',
    metricLabel: 'Labs',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'labName', label: 'Name of Training Centre / Lab', placeholder: 'Cisco Networking Academy' },
      { key: 'industryPartner', label: 'Industry Partner', placeholder: 'Cisco Systems India' },
      { key: 'natureCollaboration', label: 'Nature of Collaboration', placeholder: 'CoE & Certified Training' },
      { key: 'dateEstablished', label: 'Date Established', placeholder: '15/08/2026' },
      { key: 'mouValidity', label: 'MoU Date & Validity', placeholder: '15/08/2026 to 2029' },
    ],
    sampleRow: { academicYear: '2026-2027', labName: 'Cisco Networking Academy', industryPartner: 'Cisco Systems India', natureCollaboration: 'CoE & Training', dateEstablished: '15/08/2026', mouValidity: '3 Years' },
  },
  // KRA 20: Faculty Industry Training (from KRA 20 Number of Faculty to be trained.xlsx)
  '20': {
    title: 'Faculty Trained in Industry',
    metricLabel: 'Faculty Trained',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'facultyName', label: 'Faculty Name', placeholder: 'Dr. Ankit Mishra' },
      { key: 'employeeId', label: 'Employee ID', placeholder: 'KIET-EMP-1042' },
      { key: 'designation', label: 'Designation', placeholder: 'Assistant Professor' },
      { key: 'industry', label: 'Industry / Organization', placeholder: 'L&T Technology Services' },
      { key: 'trainingTitle', label: 'Training Title / Domain', placeholder: 'Industrial Embedded Systems' },
      { key: 'durationDays', label: 'Duration (Days)', placeholder: '14', type: 'number' },
    ],
    sampleRow: { academicYear: '2026-2027', facultyName: 'Dr. Ankit Mishra', employeeId: 'KIET-EMP-1042', designation: 'Assistant Professor', industry: 'L&T Technology Services', trainingTitle: 'Industrial Embedded Systems', durationDays: '14' },
  },
  // KRA 21: GATE & Competitive Exams (from KRA 21 GATE and Training.xlsx)
  '21': {
    title: 'GATE & Competitive Exam Qualifiers',
    metricLabel: 'Qualifiers',
    columns: [
      { key: 'studentName', label: 'Name of Qualifying Student', placeholder: 'Student Name' },
      { key: 'rollNo', label: 'Roll Number', placeholder: '220029010045' },
      { key: 'yearQualifying', label: 'Year of Qualifying', placeholder: '2026' },
      { key: 'examName', label: 'Competitive Examination', placeholder: 'GATE / CAT / GRE / UPSC' },
      { key: 'scoreRank', label: 'Score / All India Rank', placeholder: 'AIR 342 (Score: 785)' },
    ],
    sampleRow: { studentName: 'Rishabh Pant', rollNo: '220029010045', yearQualifying: '2026', examName: 'GATE Computer Science', scoreRank: 'AIR 284' },
  },
  // KRA 22: Career Counselling Activities (from KRA 22 Career counselling.xlsx)
  '22': {
    title: 'Career Counselling & Guidance Activities',
    metricLabel: 'Activities',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'date', label: 'Date', placeholder: 'DD/MM/YYYY' },
      { key: 'activityTitle', label: 'Title of Activity', placeholder: 'Roadmap to PSU & Higher Studies' },
      { key: 'activityType', label: 'Type of Activity', placeholder: 'Seminar / Workshop / Mentoring' },
      { key: 'targetBranch', label: 'Target Programme / Branch', placeholder: 'B.Tech 3rd & 4th Year' },
      { key: 'resourcePerson', label: 'Resource Person / Counsellor', placeholder: 'Industry Veteran / IES Officer' },
      { key: 'participants', label: 'Students Benefited', placeholder: '150', type: 'number' },
    ],
    sampleRow: { academicYear: '2026-2027', date: '08/09/2026', activityTitle: 'Roadmap to Global MS & PSU Careers', activityType: 'Career Workshop', targetBranch: 'CSE & IT', resourcePerson: 'Mr. Vivek Joshi', participants: '185' },
  },
  // KRA 24: Placement and Higher Education (from KRA 24 Template.xlsx)
  '24': {
    title: 'Students Placed & Progressed to Higher Education',
    metricLabel: 'Placements',
    columns: [
      { key: 'studentName', label: 'Name of Student & Contact Details', placeholder: 'Student Name & Phone' },
      { key: 'progressionType', label: 'Placement / Higher Education', placeholder: 'Placement' },
      { key: 'programme', label: 'Program Graduated From', placeholder: 'B.Tech CSE' },
      { key: 'employerOrUniv', label: 'Employer / Institution Joined', placeholder: 'Microsoft India / IIT Bombay' },
      { key: 'payPackage', label: 'Pay Package (LPA) / Program Admitted', placeholder: '18.5 LPA' },
    ],
    sampleRow: { studentName: 'Ananya Sharma (9876543210)', progressionType: 'Placement', programme: 'B.Tech CSE', employerOrUniv: 'Microsoft India', payPackage: '24.5 LPA' },
  },
  // KRA 25 to 30: Student Achievements & Sports/Cultural (from KRA 25 to 30 Template.xlsx)
  // KRA 25 to 30: Student Achievements & Sports/Cultural (from KRA 25 to 30 Template.xlsx)
  '25': {
    title: 'Student Awards/Medals in Sports (University / State / National / International)',
    metricLabel: 'Sports Awards',
    columns: [
      { key: 'studentName', label: 'Name of the Student', placeholder: 'Student Name' },
      { key: 'eventName', label: 'Name of the Sports Event', placeholder: 'All India Inter-University Athletics' },
      { key: 'date', label: 'Date of Event', placeholder: 'DD/MM/YYYY' },
      { key: 'teamIndividual', label: 'Team / Individual', placeholder: 'Individual' },
      { key: 'level', label: 'Level (Univ/State/National/Intl)', placeholder: 'National' },
      { key: 'position', label: 'Position Secured', placeholder: 'Gold Medal / 1st Position' },
      { key: 'organizingInst', label: 'Organising Institution', placeholder: 'AIU / Ministry of Youth Affairs' },
    ],
    sampleRow: { studentName: 'Vikas Kumar', eventName: 'All India Inter-University Athletics Meet', date: '18/09/2026', teamIndividual: 'Individual', level: 'National', position: 'Gold Medal (1st)', organizingInst: 'Association of Indian Universities (AIU)' },
  },
  '26': {
    title: 'Student Awards/Medals in Cultural Activities (University / State / National / Intl)',
    metricLabel: 'Cultural Awards',
    columns: [
      { key: 'studentName', label: 'Name of the Student / Team', placeholder: 'Student / Team Name' },
      { key: 'eventName', label: 'Name of the Cultural Event', placeholder: 'National Youth Festival - Classical Music' },
      { key: 'date', label: 'Date of Event', placeholder: 'DD/MM/YYYY' },
      { key: 'teamIndividual', label: 'Team / Individual', placeholder: 'Team' },
      { key: 'level', label: 'Level (Univ/State/National/Intl)', placeholder: 'National' },
      { key: 'position', label: 'Position Secured', placeholder: 'Winner / 1st Prize' },
      { key: 'organizingInst', label: 'Organising Institution', placeholder: 'AIU / Cultural Affairs Board' },
    ],
    sampleRow: { studentName: 'KIET Music Club Ensemble', eventName: 'North Zone Inter-University Cultural Fest', date: '22/09/2026', teamIndividual: 'Team', level: 'Inter-University', position: '1st Prize (Folk Orchestra)', organizingInst: 'AIU / Kurukshetra University' },
  },
  '27': {
    title: 'Sports Competitions / Events Organized by the Institution',
    metricLabel: 'Sports Events',
    columns: [
      { key: 'year', label: 'Year / Academic Session', placeholder: '2026-2027' },
      { key: 'eventDate', label: 'Date of Event (DD-MM-YYYY)', placeholder: '10/09/2026' },
      { key: 'eventType', label: 'Type of Event / Competition', placeholder: 'Inter-Departmental Sports Tournament' },
      { key: 'eventName', label: 'Name of Event / Competition', placeholder: 'KIET Annual Sports Meet - RANN' },
      { key: 'participants', label: 'No. of Participants', placeholder: '320', type: 'number' },
      { key: 'linkReport', label: 'Link to Activity Hosted / Report', placeholder: 'https://kiet.edu/sports/rann-2026' },
    ],
    sampleRow: { year: '2026-2027', eventDate: '10/09/2026', eventType: 'Sports Tournament', eventName: 'Inter-Departmental Football Championship', participants: '180', linkReport: 'https://kiet.edu/sports/football-2026' },
  },
  '28': {
    title: 'Cultural Competitions / Events Organized by the Institution',
    metricLabel: 'Cultural Events',
    columns: [
      { key: 'year', label: 'Year / Academic Session', placeholder: '2026-2027' },
      { key: 'eventDate', label: 'Date of Event (DD-MM-YYYY)', placeholder: '15/09/2026' },
      { key: 'eventType', label: 'Type of Event / Competition', placeholder: 'Cultural Fest / Dance & Music' },
      { key: 'eventName', label: 'Name of Event / Competition', placeholder: 'EPOQUE 2026: Annual Cultural Carnival' },
      { key: 'participants', label: 'No. of Participants', placeholder: '450', type: 'number' },
      { key: 'linkReport', label: 'Link to Activity Hosted / Report', placeholder: 'https://kiet.edu/cultural/epoque-2026' },
    ],
    sampleRow: { year: '2026-2027', eventDate: '15/09/2026', eventType: 'Cultural Fest', eventName: 'EPOQUE: Battle of Bands & Folk Dance', participants: '450', linkReport: 'https://kiet.edu/cultural/epoque-2026' },
  },
  '29': {
    title: 'Technical Fests and Academic Fests Organized by the Institution',
    metricLabel: 'Technical Fests',
    columns: [
      { key: 'year', label: 'Year / Academic Session', placeholder: '2026-2027' },
      { key: 'eventDate', label: 'Date of Event (DD-MM-YYYY)', placeholder: '28/09/2026' },
      { key: 'eventType', label: 'Type of Event / Competition', placeholder: 'Technical Fest / Hackathon' },
      { key: 'eventName', label: 'Name of Event / Competition', placeholder: 'INNOTECH 2026: National Tech Symposium' },
      { key: 'participants', label: 'No. of Participants', placeholder: '600', type: 'number' },
      { key: 'linkReport', label: 'Link to Activity Hosted / Report', placeholder: 'https://kiet.edu/innotech-2026' },
    ],
    sampleRow: { year: '2026-2027', eventDate: '28/09/2026', eventType: 'Technical Fest', eventName: 'INNOTECH 2026: Robotics & AI Challenge', participants: '600', linkReport: 'https://kiet.edu/innotech-2026' },
  },
  '30': {
    title: 'Events Organized Through Active Clubs and Student Forums',
    metricLabel: 'Club Events',
    columns: [
      { key: 'year', label: 'Year / Academic Session', placeholder: '2026-2027' },
      { key: 'eventDate', label: 'Date of Event (DD-MM-YYYY)', placeholder: '05/10/2026' },
      { key: 'clubName', label: 'Name of Active Club / Forum', placeholder: 'KIET Coding Ninjas / IEEE Student Branch' },
      { key: 'eventName', label: 'Name of Event / Activity', placeholder: 'Algorithm Sprint & Web3 Workshop' },
      { key: 'participants', label: 'No. of Participants', placeholder: '140', type: 'number' },
      { key: 'linkReport', label: 'Link to Activity Hosted / Report', placeholder: 'https://kiet.edu/clubs/coding-sprint' },
    ],
    sampleRow: { year: '2026-2027', eventDate: '05/10/2026', clubName: 'ACM Student Chapter', eventName: 'Algorithmic Problem Solving Sprint', participants: '140', linkReport: 'https://kiet.edu/clubs/acm-sprint' },
  },
  '31': {
    title: 'Hackathons and Ideathons Organized',
    metricLabel: 'Hackathons',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'eventId', label: 'Event ID', placeholder: 'HACK-2026-01' },
      { key: 'hackathonName', label: 'Name of Hackathon / Ideathon', placeholder: 'InnoHacks 2026' },
      { key: 'type', label: 'Type (Hackathon / Ideathon)', placeholder: 'Hackathon' },
      { key: 'level', label: 'Level (National / Regional)', placeholder: 'National' },
      { key: 'date', label: 'Date & Duration', placeholder: '12th - 13th Oct 2026 (36 Hrs)' },
      { key: 'teamsCount', label: 'Total Teams Registered', placeholder: '120', type: 'number' },
    ],
    sampleRow: { academicYear: '2026-2027', eventId: 'HACK-2026-01', hackathonName: 'InnoHacks 2026: 36-Hour National Sprint', type: 'Hackathon', level: 'National', date: '12th - 13th Oct 2026', teamsCount: '145' },
  },
  '32': {
    title: 'Alumni Financial & Non-Financial Contribution',
    metricLabel: 'Contributions',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'donorName', label: 'Donor / Alumnus Name', placeholder: 'Mr. Alok Singhal' },
      { key: 'alumniId', label: 'Alumni ID / Batch', placeholder: 'Batch 2015' },
      { key: 'date', label: 'Date of Contribution', placeholder: 'DD/MM/YYYY' },
      { key: 'contributionType', label: 'Contribution Type', placeholder: 'Scholarship / Lab Equipment' },
      { key: 'amountInr', label: 'Amount / Value (INR)', placeholder: '2,50,000' },
      { key: 'modeOfPayment', label: 'Mode of Payment', placeholder: 'NEFT/RTGS/UPI' },
    ],
    sampleRow: { academicYear: '2026-2027', donorName: 'Mr. Alok Singhal', alumniId: 'Batch 2015', date: '15/09/2026', contributionType: 'Student Merit Scholarship', amountInr: '2,50,000', modeOfPayment: 'NEFT' },
  },
  '34': {
    title: 'Teachers Provided with Financial Support for Conferences/Workshops',
    metricLabel: 'Teachers Supported',
    columns: [
      { key: 'facultyName', label: 'Name of the Teacher', placeholder: 'Dr. Faculty Member' },
      { key: 'panOrEmpId', label: 'PAN / Employee ID', placeholder: 'KIET-EMP-1025' },
      { key: 'designation', label: 'Designation', placeholder: 'Associate Professor' },
      { key: 'confTitle', label: 'Name of Conference / Workshop', placeholder: 'IEEE International Conference on Smart Systems' },
      { key: 'organizingBody', label: 'Organising Body / Institution', placeholder: 'IEEE Delhi Section' },
      { key: 'amountInr', label: 'Financial Support Provided (INR)', placeholder: '12,500' },
      { key: 'linkSanction', label: 'Link to Sanction Letter / Receipt', placeholder: 'https://kiet.edu/faculty/sanction-1025' },
    ],
    sampleRow: { facultyName: 'Dr. Vivek Kumar', panOrEmpId: 'KIET-EMP-1025', designation: 'Associate Professor', confTitle: 'IEEE 6th International Conference on Smart Computing', organizingBody: 'IEEE Computational Society', amountInr: '15,000', linkSanction: 'https://kiet.edu/faculty/sanction-1025' },
  },
  '35': {
    title: 'Teachers Provided with Membership Fee of Professional Bodies',
    metricLabel: 'Memberships Supported',
    columns: [
      { key: 'facultyName', label: 'Name of the Teacher', placeholder: 'Dr. Faculty Member' },
      { key: 'employeeId', label: 'Employee ID', placeholder: 'KIET-EMP-1088' },
      { key: 'designation', label: 'Designation', placeholder: 'Assistant Professor' },
      { key: 'profBody', label: 'Professional Body Name', placeholder: 'ACM / IEEE / Computer Society of India' },
      { key: 'membershipType', label: 'Membership Level', placeholder: 'Senior Member' },
      { key: 'amountInr', label: 'Fee Reimbursed (INR)', placeholder: '8,500' },
      { key: 'receiptLink', label: 'Link to Membership Receipt', placeholder: 'https://kiet.edu/faculty/receipt-1088' },
    ],
    sampleRow: { facultyName: 'Dr. Pooja Verma', employeeId: 'KIET-EMP-1088', designation: 'Assistant Professor', profBody: 'Association for Computing Machinery (ACM)', membershipType: 'Professional Member', amountInr: '9,200', receiptLink: 'https://kiet.edu/faculty/receipt-1088' },
  },
  '38': {
    title: 'Professional Development & Orientation Programmes (FDP / MDP / Refresher)',
    metricLabel: 'Programmes',
    columns: [
      { key: 'facultyName', label: 'Name of the Faculty', placeholder: 'Dr. Faculty Name' },
      { key: 'programType', label: 'Type of Program (FDP/Refresher/STC)', placeholder: 'Professional Development Programme' },
      { key: 'durationDays', label: 'Duration (Days)', placeholder: '7', type: 'number' },
      { key: 'dates', label: 'Start Date & End Date', placeholder: '10/09/2026 to 16/09/2026' },
      { key: 'organizingInst', label: 'Organising Institution', placeholder: 'NITTTR Chandigarh / IIT Delhi' },
    ],
    sampleRow: { facultyName: 'Dr. Meenakshi Sundaram', programType: 'Refresher Course in Cloud AI', durationDays: '14', dates: '01/09/2026 to 14/09/2026', organizingInst: 'IIT Bombay' },
  },
  '39': {
    title: 'Sponsored Research Projects, Endowments & Grants',
    metricLabel: 'Research Grants',
    columns: [
      { key: 'piName', label: 'Name of PI / Co-PI', placeholder: 'Dr. Principal Investigator' },
      { key: 'projectTitle', label: 'Title of Research Project', placeholder: 'IoT-Enabled River Water Telemetry' },
      { key: 'fundingAgency', label: 'Funding Agency', placeholder: 'DST / SERB / AICTE / CSIR' },
      { key: 'duration', label: 'Duration (Years/Months)', placeholder: '2 Years' },
      { key: 'yearAward', label: 'Year of Award / Sanction', placeholder: '2026' },
      { key: 'amountInr', label: 'Amount (INR in Lakhs)', placeholder: '28.5' },
    ],
    sampleRow: { piName: 'Dr. Sunil Kumar (PI), Dr. Neha (Co-PI)', projectTitle: 'AI-Guided Cyber Threat Neutralization in Smart Grids', fundingAgency: 'SERB - DST', duration: '3 Years', yearAward: '2026', amountInr: '34.2' },
  },
  '40': {
    title: 'Institution Gender Audit and Promotion of Gender Equity Measures',
    metricLabel: 'Gender Equity Initiatives',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'initiativeTitle', label: 'Title of Gender Equity / Audit Initiative', placeholder: 'Annual Gender Audit & Women Leadership Drive' },
      { key: 'type', label: 'Type (Audit / Workshop / Mentorship)', placeholder: 'Institutional Gender Audit' },
      { key: 'targetGroup', label: 'Target Beneficiaries', placeholder: 'Students & Faculty' },
      { key: 'datePeriod', label: 'Date / Period', placeholder: '15/09/2026' },
      { key: 'participants', label: 'Participants (Female / Male)', placeholder: '240 (160 F / 80 M)' },
      { key: 'outcome', label: 'Outcomes & Policy Directives', placeholder: 'Adopted progressive safety and leadership guidelines' },
    ],
    sampleRow: { academicYear: '2026-2027', initiativeTitle: 'Institutional Gender Audit & Women in STEM Summit', type: 'Gender Audit & Summit', targetGroup: 'B.Tech Female Students & Faculty', datePeriod: '15/09/2026', participants: '250 (180 F / 70 M)', outcome: 'Enhanced STEM scholarship access and mentorship circles' },
  },
  '41': {
    title: 'Activities Organized for Providing an Inclusive Environment',
    metricLabel: 'Inclusive Activities',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'date', label: 'Date of Activity', placeholder: 'DD/MM/YYYY' },
      { key: 'activityTitle', label: 'Title of the Programme / Activity', placeholder: 'Ek Bharat Shreshtha Bharat: Cultural Exchange' },
      { key: 'theme', label: 'Theme (Cultural / Regional / Harmony)', placeholder: 'Regional & Linguistic Diversity' },
      { key: 'targetGroup', label: 'Target Participants', placeholder: 'First Year & Lateral Students' },
      { key: 'beneficiaries', label: 'Total Beneficiaries', placeholder: '350', type: 'number' },
      { key: 'reportLink', label: 'Link to Documentation / Media', placeholder: 'https://kiet.edu/inclusive/harmony-2026' },
    ],
    sampleRow: { academicYear: '2026-2027', date: '02/10/2026', activityTitle: 'Socio-Cultural Unity & Communal Harmony Seminar', theme: 'Cultural & Communal Harmony', targetGroup: 'All University Students', beneficiaries: '420', reportLink: 'https://kiet.edu/inclusive/unity-2026' },
  },
  '42': {
    title: 'Sensitization to Constitutional Obligations (Values, Rights, Duties)',
    metricLabel: 'Sensitization Events',
    columns: [
      { key: 'academicYear', label: 'Academic Year', placeholder: '2026-2027' },
      { key: 'date', label: 'Date of Activity', placeholder: 'DD/MM/YYYY' },
      { key: 'title', label: 'Title of the Programme', placeholder: 'Constitution Day: Fundamental Duties Symposium' },
      { key: 'activityType', label: 'Type of Activity', placeholder: 'Symposium & Preamble Reading' },
      { key: 'dignitaries', label: 'Key Dignitaries / Guest Speakers', placeholder: 'Hon. Justice / Legal Scholar' },
      { key: 'participants', label: 'Students & Staff Count', placeholder: '280', type: 'number' },
      { key: 'outcomes', label: 'Key Civic Outcomes', placeholder: 'Preamble pledge and constitutional ethics adherence' },
    ],
    sampleRow: { academicYear: '2026-2027', date: '26/09/2026', title: 'National Voter Awareness & Civic Responsibilities Drive', activityType: 'Civic Awareness Workshop', dignitaries: 'District Election Officer', participants: '310', outcomes: '100% voter pledge signed by eligible student citizens' },
  },
  '43': {
    title: 'Research Publications in Scopus / WoS / UGC-CARE',
    metricLabel: 'Publications',
    columns: [
      { key: 'paperTitle', label: 'Title of Paper', placeholder: 'Paper Title' },
      { key: 'authorNames', label: 'Name of the Author/s', placeholder: 'Dr. A. Sharma, Prof. B. Verma' },
      { key: 'department', label: 'Department of Teacher', placeholder: 'CSE' },
      { key: 'journalName', label: 'Name of Journal', placeholder: 'IEEE Transactions on Computers' },
      { key: 'yearPublication', label: 'Year of Publication', placeholder: '2026' },
      { key: 'issn', label: 'ISSN Number', placeholder: '0018-9340' },
      { key: 'indexing', label: 'Indexing (Scopus / WoS)', placeholder: 'Scopus Q1' },
      { key: 'ugcCare', label: 'Listed in UGC-CARE (Yes/No)', placeholder: 'Yes' },
    ],
    sampleRow: { paperTitle: 'Deep Reinforcement Learning for Autonomous Drone Swarms', authorNames: 'Dr. Vikram Seth, Dr. Priya Sharma', department: 'CSE', journalName: 'IEEE Robotics and Automation Letters', yearPublication: '2026', issn: '2377-3766', indexing: 'Scopus Q1 / SCIE', ugcCare: 'Yes' },
  },
};

export default function KRATemplateDataForm({
  kraCode,
  departmentName,
  cycle,
  hodName,
  formData,
  patchFormData,
}: KRAFormProps) {
  const cleanNum = kraCode.replace(/[^0-9]/g, '');
  const preset: TemplatePreset = KRA_PRESETS[cleanNum] || {
    title: `Data Template – ${kraCode}`,
    metricLabel: 'Records',
    columns: [
      { key: 'name', label: 'Participant / Activity Name', placeholder: 'Name' },
      { key: 'date', label: 'Date / Period', placeholder: 'DD/MM/YYYY' },
      { key: 'count', label: 'Count / Value', placeholder: '1', type: 'number' },
      { key: 'outcome', label: 'Outcome / Remarks', placeholder: 'Details of achievement' },
    ],
    sampleRow: { name: 'Institutional Record 1', date: '01/10/2026', count: '1', outcome: 'Verified & Documented' },
  };

  const [activeTab, setActiveTab] = useState<'table' | 'narrative' | 'evidence'>('table');

  const custom = formData.customFields || {};
  const rows: Record<string, any>[] = custom.rows || [preset.sampleRow];

  const updateField = (field: string, val: any) => {
    const updated = { ...custom, [field]: val };
    patchFormData({ customFields: updated });
  };

  const updateRow = (index: number, key: string, val: any) => {
    const nextRows = [...rows];
    nextRows[index] = { ...nextRows[index], [key]: val };
    patchFormData({
      customFields: { ...custom, rows: nextRows },
      achievementClaim: `${nextRows.length} ${preset.metricLabel}`,
    });
  };

  const addRow = () => {
    const emptyRow: Record<string, any> = {};
    preset.columns.forEach((c) => (emptyRow[c.key] = ''));
    const nextRows = [...rows, emptyRow];
    patchFormData({
      customFields: { ...custom, rows: nextRows },
      achievementClaim: `${nextRows.length} ${preset.metricLabel}`,
    });
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    const nextRows = rows.filter((_, i) => i !== index);
    patchFormData({
      customFields: { ...custom, rows: nextRows },
      achievementClaim: `${nextRows.length} ${preset.metricLabel}`,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-Header Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 pt-2 flex items-center gap-1 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'table'
              ? 'border-[#00236f] text-[#00236f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">table_chart</span>
          <span>1. Official Data Records ({rows.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('narrative')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'narrative'
              ? 'border-[#00236f] text-[#00236f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">description</span>
          <span>2. Narrative &amp; Verification</span>
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
          <span>3. Evidence</span>
        </button>
      </div>

      {/* Main Form Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Auto-populated Institutional Information */}
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
              <span className="text-[10px] text-slate-500 block">Head of Department / Dean:</span>
              <span className="font-semibold text-slate-800 truncate block">{hodName || 'Dean'}</span>
            </div>
            <div className="bg-white/90 p-2 rounded border border-blue-100">
              <span className="text-[10px] text-slate-500 block">Metric Prescribed:</span>
              <span className="font-semibold text-slate-800 truncate block">{preset.title}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic m-0">
            * Note: These institutional details are pre-filled automatically and appear on the official report.
          </p>
        </div>

        {/* TAB 1: DATA TABLE */}
        {activeTab === 'table' && (
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
            <div className="border-b pb-2 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                  {preset.title} ({rows.length} {preset.metricLabel})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter data matching the official Excel prescribed template.
                </p>
              </div>
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Add Record</span>
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
                    {preset.columns.map((col) => (
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

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('narrative')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#00236f] hover:bg-[#001b55] rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>Proceed to Narrative &amp; Verification</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: NARRATIVE */}
        {activeTab === 'narrative' && (
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                Summary Observations &amp; Verification Signatures
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Provide the summary narrative that appears on the official report.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Executive Summary / Outcome Narrative:
              </label>
              <textarea
                rows={4}
                value={custom.narrative || ''}
                onChange={(e) => updateField('narrative', e.target.value)}
                placeholder={`A total of ${rows.length} ${preset.metricLabel.toLowerCase()} were achieved and verified in accordance with institutional guidelines...`}
                className="w-full p-3 text-xs border border-slate-300 rounded-md focus:border-[#00236f] focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs">
              <span className="font-bold text-slate-700 block mb-1">
                Institutional Dual Signatures
              </span>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="border-r pr-2">
                  <span className="text-slate-500 block">Prepared By:</span>
                  <input
                    type="text"
                    value={custom.preparedBy || hodName || ''}
                    onChange={(e) => updateField('preparedBy', e.target.value)}
                    placeholder="Coordinator Name"
                    className="w-full px-2 py-1 text-xs border rounded bg-white mt-1"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Date: {new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Approved By:</span>
                  <strong className="text-slate-800 block mt-1">Dean / HOD, {departmentName}</strong>
                  <span className="text-[10px] text-slate-400 mt-1 block">KIET Deemed to be University</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition cursor-pointer"
              >
                Back to Table Records
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

        {/* TAB 3: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 space-y-4 shadow-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                Documentary Evidence &amp; Verification Files
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Attach certificates, spreadsheets, appointment orders, or verified proofs.
              </p>
            </div>

            <MultiEvidenceUploader
              formData={formData}
              patchFormData={patchFormData}
            />

            <div className="pt-3 border-t flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('narrative')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition cursor-pointer"
              >
                Back to Narrative
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
