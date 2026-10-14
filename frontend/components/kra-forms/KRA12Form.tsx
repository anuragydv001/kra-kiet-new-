import React from 'react';
import { KRAFormProps } from './types';

const DeanInput = ({ label, field, placeholder, isTextarea = false, type = "text", customFields, handleChange }: any) => (
  <div className="mb-4">
    <label className="block text-[11px] font-bold text-[#515f74] mb-1">{label}</label>
    {isTextarea ? (
      <textarea
        value={customFields[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full text-xs rounded border border-[#c5c5d3] px-3 py-2 bg-white focus:outline-hidden focus:border-[#00236f] min-h-[80px]"
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        value={customFields[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full text-xs rounded border border-[#c5c5d3] px-3 py-2 bg-white focus:outline-hidden focus:border-[#00236f]"
        placeholder={placeholder}
      />
    )}
  </div>
);

export default function KRA12Form({ departmentName, cycle, formData, patchFormData }: KRAFormProps) {
  const customFields = formData.customFields || {};

  const handleChange = (field: string, value: string) => {
    patchFormData({
      customFields: {
        ...customFields,
        [field]: value,
      },
    });
  };

  const inputProps = { customFields, handleChange };

  return (
    <div className="space-y-6">
      <div className="bg-[#eff4ff] p-4 rounded-lg border border-[#c5c5d3]">
        <h3 className="text-[12px] font-bold text-[#0b1c30] uppercase mb-2">KRA 12 Context (Auto-Filled)</h3>
        <div className="grid grid-cols-2 gap-4 text-[11px] text-[#515f74]">
          <div><strong>School/Department:</strong> {departmentName}</div>
          <div><strong>Academic Session:</strong> 2026-2027</div>
          <div className="col-span-2"><strong>Reporting Period:</strong> {cycle}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]">
        <h3 className="text-[13px] font-bold text-[#0b1c30] border-b pb-2 mb-4">Report Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <DeanInput {...inputProps} label="Date" field="date" type="date" />
          <DeanInput {...inputProps} label="Coordinator (if any)" field="coordinator" placeholder="Name of coordinator..." />
        </div>
        <DeanInput {...inputProps} label="Complete Detail of Award/ Recognition" field="awardDetails" isTextarea={true} placeholder="Describe the award and recognition completely..." />
      </div>

      <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]">
        <h3 className="text-[13px] font-bold text-[#0b1c30] border-b pb-2 mb-4">Documentary Evidence to Maintain</h3>
        <p className="text-[11px] text-[#515f74] mb-4">
          Please fill out the details below. For required files (certificates, photos, brochures), upload them in the <strong>Evidence</strong> tab.
        </p>

        <DeanInput {...inputProps} label="3. Details of awarding body" field="awardingBody" />
        <DeanInput {...inputProps} label="8. Details of the recipient" field="recipientDetails" />
        <DeanInput {...inputProps} label="9. Department verification" field="deptVerification" />
        <DeanInput {...inputProps} label="10. Institutional approval/record, where applicable" field="institutionalApproval" />
        <DeanInput {...inputProps} label="12. Award citation/trophy details" field="citationDetails" />
        <DeanInput {...inputProps} label="13. Prize/funding details, where applicable" field="prizeDetails" />
      </div>
    </div>
  );
}
