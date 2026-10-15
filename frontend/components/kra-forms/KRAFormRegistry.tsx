import React from 'react';
import { KRAFormProps } from './types';
import KRA1Form from './KRA1Form';
import KRAFeedbackSurveyForm from './KRAFeedbackSurveyForm';
import KRAActivityReportForm from './KRAActivityReportForm';
import KRATemplateDataForm from './KRATemplateDataForm';

export default function KRAFormRegistry(props: KRAFormProps) {
  const kraNumber = parseInt(props.kraCode.replace(/[^0-9]/g, ''), 10);

  // KRA 1: Value Added Courses
  const isKRA1 =
    kraNumber === 1 ||
    props.kraCode.trim() === 'KRA 01' ||
    props.kraCode.trim() === 'KRA 1' ||
    props.kraCode.toLowerCase().includes('vac') ||
    props.kraCode.toLowerCase().includes('value added');

  if (isKRA1) {
    return <KRA1Form {...props} />;
  }

  // Structured Feedback Survey KRAs (8: Employer, 9: Alumni, 10: Academic Expert)
  if ([8, 9, 10].includes(kraNumber)) {
    return <KRAFeedbackSurveyForm {...props} />;
  }

  // Activity & Event Report KRAs
  // 11: Bridge Courses, 12: Awards & Recognition, 13: Industry Advisory Board, 18: Functional MoU, 19: Industrial Visit,
  // 23: Skill Development, 33: Alumni Events, 36: STP/Admin Training, 37: FDP, 44: Boot Camps, 45: Flagship Event
  if ([11, 12, 13, 18, 19, 23, 33, 36, 37, 44, 45].includes(kraNumber)) {
    return <KRAActivityReportForm {...props} />;
  }

  // All Tabular Data-Template KRAs (2, 3, 4, 5, 6, 12, 14, 15, 16, 17, 20, 21, 22, 24, 25-32, 34-35, 38-43)
  return <KRATemplateDataForm {...props} />;
}
