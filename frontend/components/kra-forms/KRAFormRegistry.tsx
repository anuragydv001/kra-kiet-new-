import React from 'react';
import { KRAFormProps } from './types';
import KRA1Form from './KRA1Form';
import KRA12Form from './KRA12Form';

export default function KRAFormRegistry(props: KRAFormProps) {
  const kraNumber = parseInt(props.kraCode.replace(/[^0-9]/g, ''), 10);
  const isKRA1 =
    kraNumber === 1 ||
    props.kraCode.trim() === 'KRA 01' ||
    props.kraCode.trim() === 'KRA 1' ||
    props.kraCode.toLowerCase().includes('vac') ||
    props.kraCode.toLowerCase().includes('value added');

  if (isKRA1) {
    return <KRA1Form {...props} />;
  }

  switch (kraNumber) {
    case 12:
      return <KRA12Form {...props} />;
      
    default:
      return (
        <div className="bg-amber-50 text-amber-800 p-6 rounded-lg border border-amber-200 text-center">
          <span className="material-symbols-outlined text-[32px] mb-2 opacity-50">build</span>
          <h3 className="font-bold text-sm mb-1">Custom Form Pending</h3>
          <p className="text-xs opacity-80">
            The manual custom form for <strong>{props.kraCode}</strong> has not been built yet. 
            Tell me the requirements for this KRA and I will build it!
          </p>
        </div>
      );
  }
}
