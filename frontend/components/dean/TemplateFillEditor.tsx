'use client';

import React, { useState } from 'react';
import { CompletedDocument, ReportFormat } from '../../types/kra';
import { defaultTableColumns, isDocFilled } from '../../services/kraUtils';

const FIELD_LABELS = ['Reference / Document No.', 'Prepared By', 'Reporting Period'];

export interface TemplateFillEditorProps {
  kind: 'Report Format' | 'Summary Template';
  format: ReportFormat;
  doc?: CompletedDocument;
  deanName: string;
  cycle: string;
  onChange: (doc: CompletedDocument) => void;
  onPreview: () => void;
  onDownload: () => void;
}

/**
 * Structured, editable interface for ONE VC-uploaded document.
 *
 * IMPORTANT (technical honesty): an arbitrary DOCX / XLSX / PDF cannot be turned
 * into a live Microsoft Office document inside a browser. So instead of faking a
 * Word/PDF editor, the uploaded file metadata is preserved and shown, and the Dean
 * fills a structured template interface whose values are stored in app state.
 *  - XLSX-like templates get an editable table / grid.
 *  - DOCX / PDF-like templates get structured form fields + a content block.
 */
export default function TemplateFillEditor({
  kind,
  format,
  doc,
  deanName,
  cycle,
  onChange,
  onPreview,
  onDownload,
}: TemplateFillEditorProps) {
  const [showTemplate, setShowTemplate] = useState(false);
  const isTabular = format.fileType === 'XLSX';
  const completed = isDocFilled(doc);

  const ensureDoc = (): CompletedDocument =>
    doc ?? {
      formatId: format.id,
      fields: { 'Prepared By': deanName, 'Reporting Period': cycle },
      narrative: '',
      table: { columns: defaultTableColumns(), rows: [[String(1), '', '', '', '']] },
    };

  const patch = (updates: Partial<CompletedDocument>) =>
    onChange({ ...ensureDoc(), ...updates });

  const patchField = (label: string, value: string) =>
    patch({ fields: { ...ensureDoc().fields, [label]: value } });

  const patchCell = (rowIdx: number, colIdx: number, value: string) => {
    const current = ensureDoc();
    const rows = current.table.rows.map((row) => [...row]);
    rows[rowIdx] = [...(rows[rowIdx] ?? [])];
    rows[rowIdx][colIdx] = value;
    patch({ table: { ...current.table, rows } });
  };

  const addRow = () => {
    const current = ensureDoc();
    const rows = [...current.table.rows, [String(current.table.rows.length + 1), '', '', '', '']];
    patch({ table: { ...current.table, rows } });
  };

  const removeRow = (rowIdx: number) => {
    const current = ensureDoc();
    const rows = current.table.rows
      .filter((_, i) => i !== rowIdx)
      .map((row, i) => [String(i + 1), ...row.slice(1)]);
    patch({ table: { ...current.table, rows } });
  };
const table = ensureDoc().table;

  return (
    <div className="bg-white p-4 rounded-lg border border-[#c5c5d3]/70 shadow-xs space-y-3">
      {/* Document header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase text-[#515f74]">{kind}</span>
          <h4 className="text-[13px] font-bold text-[#0b1c30] leading-snug">{format.name}</h4>
          {format.description && (
            <p className="text-[11px] text-[#515f74] mt-0.5">{format.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {format.fileType && (
            <span className="bg-[#e5eeff] text-[#00236f] text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
              {format.fileType}
            </span>
          )}
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              completed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {completed ? 'Completed' : 'Not completed'}
          </span>
        </div>
      </div>

      {/* Original template (uploaded by the VC) */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded border border-[#c5c5d3]/60 bg-[#f8f9ff]">
        <span className="material-symbols-outlined text-[#00236f] text-[16px]">attach_file</span>
        <span className="text-[11px] font-mono text-[#0b1c30] truncate max-w-[220px]">
          {format.fileName || 'No file attached'}
        </span>
        <span className="text-[10px] text-[#515f74]">Uploaded by the VC Office</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowTemplate((v) => !v)}
            className="text-[11px] font-bold text-[#00236f] bg-white border border-[#c5c5d3] hover:bg-[#e5eeff] px-2 py-1 rounded"
          >
            {showTemplate ? 'Hide template' : 'View template'}
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="text-[11px] font-bold text-[#00236f] bg-white border border-[#c5c5d3] hover:bg-[#e5eeff] px-2 py-1 rounded"
          >
            Preview filled
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="text-[11px] font-bold text-[#00236f] bg-white border border-[#c5c5d3] hover:bg-[#e5eeff] px-2 py-1 rounded"
          >
            Download
          </button>
        </div>
      </div>
{showTemplate && (
        <div className="text-[11px] text-[#515f74] border border-dashed border-[#c5c5d3] rounded p-3 space-y-1">
          <p className="font-bold text-[#0b1c30]">
            Original template: {format.name} ({format.fileType || 'DOCUMENT'})
          </p>
          <p>
            Auto-filled header from the KRA: Department, KRA code, Bimonthly cycle, Annual Target
            (read-only).
          </p>
          {isTabular ? (
            <p>Tabular sections to complete: {table.columns.join(' • ')}</p>
          ) : (
            <p>Narrative sections to complete: Completed Content / Observations</p>
          )}
          <p className="text-[10px] text-slate-400">
            The uploaded office file is preserved as-is; values entered below are stored with the
            KRA submission and rendered in the completed copy.
          </p>
        </div>
      )}

      {/* Auto-filled, read-only context */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
        <div className="bg-[#eff4ff] rounded px-2 py-1.5">
          <span className="block uppercase font-bold text-[#515f74] text-[10px]">Department</span>
          <span className="text-[#0b1c30] font-medium">{deanName || '—'}</span>
        </div>
        <div className="bg-[#eff4ff] rounded px-2 py-1.5">
          <span className="block uppercase font-bold text-[#515f74] text-[10px]">Bimonthly Cycle</span>
          <span className="text-[#0b1c30] font-medium">{cycle}</span>
        </div>
        <div className="bg-[#eff4ff] rounded px-2 py-1.5">
          <span className="block uppercase font-bold text-[#515f74] text-[10px]">Annual Target</span>
          <span className="text-[#0b1c30] font-medium font-mono">Auto-filled • read-only</span>
        </div>
      </div>

      {/* Editable header fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FIELD_LABELS.map((label) => (
          <div key={label}>
            <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-1">
              {label}
            </label>
            <input
              type="text"
              value={doc?.fields?.[label] ?? ''}
              onChange={(e) => patchField(label, e.target.value)}
              placeholder={label}
              className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-white border focus:outline-hidden focus:border-[#00236f]"
            />
          </div>
        ))}
      </div>
{isTabular ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold uppercase text-[#515f74]">
              Tabular Data (editable grid)
            </label>
            <button
              type="button"
              onClick={addRow}
              className="text-[11px] font-bold text-[#00236f] bg-[#e5eeff] hover:bg-[#d5e3fc] px-2 py-1 rounded border border-blue-200"
            >
              + Add Row
            </button>
          </div>
          <div className="overflow-x-auto border border-[#c5c5d3]/70 rounded">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#eff4ff] text-[#515f74] uppercase text-[10px] font-bold">
                <tr>
                  {table.columns.map((c) => (
                    <th key={c} className="py-2 px-2 border-b border-[#c5c5d3]/70 whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                  <th className="py-2 px-2 border-b border-[#c5c5d3]/70" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c5d3]/50">
                {table.rows.length === 0 && (
                  <tr>
                    <td colSpan={table.columns.length + 1} className="py-3 px-2 text-center text-slate-400">
                      No rows added yet.
                    </td>
                  </tr>
                )}
                {table.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-[#f8f9ff]">
                    {table.columns.map((col, colIdx) => (
                      <td key={col} className="p-1">
                        <input
                          type="text"
                          value={row[colIdx] ?? ''}
                          readOnly={colIdx === 0}
                          onChange={(e) => patchCell(rowIdx, colIdx, e.target.value)}
                          className={`w-full text-[11px] rounded border border-[#c5c5d3] px-2 py-1.5 bg-white focus:outline-hidden focus:border-[#00236f] ${
                            colIdx === 0 ? 'bg-slate-100 text-slate-500 font-mono' : ''
                          }`}
                        />
                      </td>
                    ))}
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(rowIdx)}
                        className="text-rose-600 hover:text-rose-800"
                        title="Remove row"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <label className="text-[10px] font-bold uppercase text-[#515f74] block mb-1">
            Completed Content / Observations
          </label>
          <textarea
            rows={6}
            value={doc?.narrative ?? ''}
            onChange={(e) => patch({ narrative: e.target.value })}
            placeholder={`Complete "${format.name}" for the current bimonthly cycle…`}
            className="w-full text-xs rounded border-[#c5c5d3] px-3 py-2 bg-white border focus:outline-hidden focus:border-[#00236f]"
          />
        </div>
      )}
    </div>
  );
}