import React from 'react';

const STATIC_EVIDENCE_TYPES = [
  'Award certificate',
  'Award notification/letter from awarding organization',
  'Official webpage/link of the award, wherever available',
  'Event brochure/announcement',
  'Photograph of award ceremony, wherever applicable',
  'Research paper/project/patent/prototype details forming the basis of the award',
  'Newspaper/media coverage, if available',
  'Evidence of national/international level, where claimed'
];

export default function MultiEvidenceUploader({ formData, patchFormData }: { formData: any; patchFormData: any }) {
  const customEvidence = formData.customEvidence || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const newEvidence = {
      type: type,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`
    };

    // Replace if this type already exists, or append if it doesn't
    const existingIndex = customEvidence.findIndex((ev: any) => ev.type === type);
    const updated = [...customEvidence];
    
    if (existingIndex >= 0) {
      updated[existingIndex] = newEvidence;
    } else {
      updated.push(newEvidence);
    }

    patchFormData({
      customEvidence: updated
    });
    
    e.target.value = '';
  };

  const removeEvidence = (type: string) => {
    const updated = customEvidence.filter((ev: any) => ev.type !== type);
    patchFormData({ customEvidence: updated });
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#eff4ff] border border-blue-200 rounded-lg p-3 text-[11px] text-[#0b1c30]">
        <strong>Upload Evidence Files</strong> &mdash; Please provide the required evidence documents below.
      </div>
      
      <div className="space-y-3">
        {STATIC_EVIDENCE_TYPES.map((type, idx) => {
          const uploaded = customEvidence.find((ev: any) => ev.type === type);
          
          return (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-[#c5c5d3] p-3 rounded-lg gap-3">
              <div className="flex-1 text-xs font-medium text-[#0b1c30]">
                {idx + 1}. {type}
              </div>
              
              <div className="shrink-0">
                {uploaded ? (
                  <div className="flex items-center gap-2 bg-[#e5eeff] px-2 py-1.5 rounded border border-blue-200">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                    <span className="text-[11px] font-mono text-[#00236f] max-w-[150px] truncate" title={uploaded.name}>
                      {uploaded.name}
                    </span>
                    <button 
                      onClick={() => removeEvidence(type)} 
                      className="text-rose-500 hover:text-rose-700 ml-1 flex items-center justify-center"
                      title="Remove file"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="cursor-pointer bg-[#00236f] hover:bg-[#1e3a8a] text-white text-[10px] font-bold px-3 py-1.5 rounded transition inline-block">
                      Choose File
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, type)}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
