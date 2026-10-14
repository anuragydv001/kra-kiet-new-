export type FieldType = 'text' | 'number' | 'textarea' | 'dynamic_table';

export interface TableColumn {
  name: string;
  label: string;
  type: 'text' | 'number';
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  tableColumns?: TableColumn[]; // Only used if type is 'dynamic_table'
}

export interface KRASchema {
  kraCode: string;
  title: string;
  fields: FormField[];
  evidenceChecklist: string[];
}

export const KRA_SCHEMAS: Record<string, KRASchema> = {
  'KRA-11': {
    kraCode: 'KRA-11',
    title: 'Bridge courses conducted',
    fields: [
      { name: 'faculty_coordinator', label: 'Faculty Coordinator(s)', type: 'text' },
      {
        name: 'bridge_courses',
        label: 'Detail of Bridge Courses',
        type: 'dynamic_table',
        tableColumns: [
          { name: 'course_name', label: 'Course Name', type: 'text' },
          { name: 'duration', label: 'Duration (Hours)', type: 'number' },
          { name: 'mode', label: 'Mode (Offline/Online/Hybrid)', type: 'text' },
          { name: 'resource_person', label: 'Resource Person', type: 'text' },
          { name: 'enrolled', label: 'No. of Students Enrolled', type: 'number' },
          { name: 'completed', label: 'No. of Students Completed', type: 'number' }
        ]
      },
      {
        name: 'course_content',
        label: 'Course Content / Syllabus',
        type: 'dynamic_table',
        tableColumns: [
          { name: 'module', label: 'Module', type: 'text' },
          { name: 'topic', label: 'Topic', type: 'text' },
          { name: 'hours', label: 'No. of Hours', type: 'number' }
        ]
      },
      { name: 'assessment_method', label: 'Assessment Method', type: 'text' },
      { name: 'attendance_req', label: 'Minimum Attendance Requirement', type: 'text' },
      { name: 'passing_criteria', label: 'Passing/Completion Criteria', type: 'text' },
      { name: 'cert_authority', label: 'Certificate Issuing Authority', type: 'text' },
      { name: 'num_certs_issued', label: 'Number of Certificates Issued', type: 'number' },
      { name: 'impact_indicators', label: 'Impact Indicators (Describe improvements, outcomes, placements)', type: 'textarea' },
      { name: 'feedback_score', label: 'Overall Feedback Score (out of 5)', type: 'number' },
      { name: 'major_suggestions', label: 'Major Suggestions Received', type: 'textarea' }
    ],
    evidenceChecklist: [
      'Approval/permission for conducting the course',
      'Course proposal/concept note',
      'Course syllabus/content',
      'Academic calendar/activity schedule',
      'Course timetable',
      'Resource person/faculty details',
      'Expert profile/CV, wherever applicable',
      'Attendance records',
      'Registration/enrolment records',
      'Assessment records',
      'Result/score sheet',
      'Student feedback',
      'Sample certificates',
      'Photographs with date and caption',
      'Geo-tagged photographs, wherever applicable',
      'Course completion report',
      'List of students who completed the course',
      'Any other relevant supporting document'
    ]
  },
  'KRA-12': {
    kraCode: 'KRA-12',
    title: 'Number of awards received for research/ innovations by Faculty/Students/ Dept./Institute',
    fields: [
      { name: 'reporting_period', label: 'Reporting Period', type: 'text' },
      { name: 'coordinator', label: 'Coordinator (if any)', type: 'text' },
      {
        name: 'awards_list',
        label: 'Complete Detail of Awards',
        type: 'dynamic_table',
        tableColumns: [
          { name: 'award_id', label: 'Award ID', type: 'text' },
          { name: 'name_of_award', label: 'Name of Award', type: 'text' },
          { name: 'award_category', label: 'Category (Research/Innovation)', type: 'text' },
          { name: 'recipient', label: 'Recipient Name', type: 'text' },
          { name: 'recipient_type', label: 'Faculty/Student/Dept/Institute', type: 'text' },
          { name: 'awarding_org', label: 'Awarding Organization', type: 'text' },
          { name: 'level', label: 'Level (National/International)', type: 'text' },
          { name: 'date', label: 'Date', type: 'text' }
        ]
      }
    ],
    evidenceChecklist: [
      'Award certificate.',
      'Award notification/letter from awarding organization.',
      'Details of awarding body.',
      'Official webpage/link of the award, wherever available.',
      'Event brochure/announcement.',
      'Photograph of award ceremony, wherever applicable.',
      'Research paper/project/patent/prototype details forming the basis of the award.',
      'Details of the recipient.',
      'Department verification.',
      'Institutional approval/record, where applicable.',
      'Newspaper/media coverage, if available.',
      'Award citation/trophy details.',
      'Prize/funding details, where applicable.',
      'Evidence of national/international level, where claimed.'
    ]
  }
};
