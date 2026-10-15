"use client";

import React from 'react';
import { useApp } from '../../context/AppContext';
import { KRASubmission } from '../../types/kra';
import SmartVACReportBuilder from '../kra-forms/SmartVACReportBuilder';
import SmartKRA7ReportBuilder from '../kra-forms/SmartKRA7ReportBuilder';
import SmartUniversalReportBuilder from '../kra-forms/SmartUniversalReportBuilder';

export default function SplitTemplateEditor({
  kraCode,
  onClose,
  onPreviewSubmission,
}: {
  kraCode: string;
  onClose: () => void;
  onPreviewSubmission?: (submission: KRASubmission) => void;
}) {
  const { currentDept, selectedCycle } = useApp();

  const cleanKraNum = parseInt(kraCode.replace(/[^0-9]/g, ''), 10);

  // KRA 1: Value Added Courses & Add-on Courses
  const isKRA1 =
    cleanKraNum === 1 ||
    kraCode.trim() === 'KRA 01' ||
    kraCode.trim() === 'KRA 1' ||
    kraCode.toLowerCase().includes('vac') ||
    kraCode.toLowerCase().includes('value added');

  if (isKRA1) {
    return (
      <SmartVACReportBuilder
        kraCode={kraCode}
        departmentCode={currentDept}
        cycle={selectedCycle}
        onClose={onClose}
      />
    );
  }

  // KRA 7: Curriculum Feedback (Faculty Members)
  const isKRA7 =
    cleanKraNum === 7 ||
    kraCode.trim() === 'KRA 07' ||
    kraCode.trim() === 'KRA 7';

  if (isKRA7) {
    return (
      <SmartKRA7ReportBuilder
        kraCode={kraCode}
        departmentCode={currentDept}
        cycle={selectedCycle}
        onClose={onClose}
      />
    );
  }

  // ALL OTHER KRAs (KRA 2-6, 8-45): Dedicated Full-Screen Smart Report Builder matching KRA 7 exactly
  return (
    <SmartUniversalReportBuilder
      kraCode={kraCode}
      departmentCode={currentDept}
      cycle={selectedCycle}
      onClose={onClose}
    />
  );
}
