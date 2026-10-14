import React, { useState } from 'react';
import { KRASchema, FormField, TableColumn } from '../services/kraSchemas';

interface DynamicKRAFormProps {
  schema: KRASchema;
  value: Record<string, any>;
  onChange: (newValue: Record<string, any>) => void;
}

export default function DynamicKRAForm({ schema, value, onChange }: DynamicKRAFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFieldChange = (fieldName: string, fieldValue: any) => {
    onChange({ ...value, [fieldName]: fieldValue });
  };

  const handleTableChange = (fieldName: string, rowIndex: number, colName: string, colValue: any) => {
    const currentTable = value[fieldName] || [];
    const newTable = [...currentTable];
    
    // Ensure the row exists
    if (!newTable[rowIndex]) {
      newTable[rowIndex] = {};
    }
    
    newTable[rowIndex][colName] = colValue;
    handleFieldChange(fieldName, newTable);
  };

  const addTableRow = (fieldName: string) => {
    const currentTable = value[fieldName] || [];
    handleFieldChange(fieldName, [...currentTable, {}]);
  };

  const removeTableRow = (fieldName: string, rowIndex: number) => {
    const currentTable = value[fieldName] || [];
    const newTable = currentTable.filter((_: any, idx: number) => idx !== rowIndex);
    handleFieldChange(fieldName, newTable);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-white rounded-lg shadow">
      
      {/* Title */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">{schema.title}</h2>
        <p className="text-sm text-gray-500 mt-1">Please fill in the required details based on the exact template format.</p>
      </div>

      {/* Dynamic Fields */}
      <div className="space-y-6">
        {schema.fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">{field.label}</label>

            {field.type === 'text' && (
              <input
                type="text"
                className="border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={value[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                className="border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={value[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={`0`}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                className="border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={4}
                value={value[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}

            {field.type === 'dynamic_table' && field.tableColumns && (
              <div className="overflow-x-auto border rounded p-4 bg-gray-50">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {field.tableColumns.map((col) => (
                        <th key={col.name} className="px-4 py-2 font-semibold text-gray-600">{col.label}</th>
                      ))}
                      <th className="px-4 py-2 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(value[field.name] || []).map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className="border-t">
                        {field.tableColumns!.map((col) => (
                          <td key={col.name} className="px-4 py-2">
                            <input
                              type={col.type === 'number' ? 'number' : 'text'}
                              className="w-full border rounded px-2 py-1"
                              value={row[col.name] || ''}
                              onChange={(e) => handleTableChange(field.name, rowIndex, col.name, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeTableRow(field.name, rowIndex)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={() => addTableRow(field.name)}
                  className="mt-4 bg-blue-50 text-blue-600 px-4 py-2 rounded border border-blue-200 hover:bg-blue-100 transition"
                >
                  + Add Row
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Direct Evidence Uploads & Checklist */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Documentary Evidence to Maintain</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Checklist */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Required Checklist:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-900">
              {schema.evidenceChecklist.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Secure Upload Zone */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded p-6 flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <p className="text-gray-600 text-sm mb-4 text-center">Upload certificates, approvals, and photos directly to the KIET secure server.</p>
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              <span>Select Files</span>
              <input type="file" multiple className="hidden" onChange={handleFileUpload} />
            </label>
            
            {/* Show attached files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 w-full">
                <p className="text-xs font-semibold text-gray-500 mb-2">Attached Files:</p>
                <ul className="text-xs text-gray-700 space-y-1 w-full truncate">
                  {uploadedFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
