import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addMissingEvidence, 
  updateEvidenceStatus, 
  removeMissingEvidence 
} from '../../features/investigations/investigationSlice';
import { 
  FileSearch, 
  CheckCircle, 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle,
  FileText
} from 'lucide-react';

export default function MissingEvidencePanel() {
  const dispatch = useDispatch();
  const current = useSelector((state) => state.investigations.currentInvestigation);
  const evidenceList = current?.missing_evidence || [];

  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Maintenance');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    dispatch(
      addMissingEvidence({
        item: newItem.trim(),
        category: newCategory,
        status: 'Pending Review',
        required: true,
      })
    );
    setNewItem('');
  };

  const statusColors = {
    Obtained: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'In Progress': 'bg-sky-100 text-sky-800 border-sky-300',
    Requested: 'bg-amber-100 text-amber-800 border-amber-300',
    'Pending Review': 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
            <FileSearch className="w-4 h-4 text-teal-600" />
            <span>Evidence Gaps & Investigation Requirements</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">Required Supporting Documentation Checklist</h2>
          <p className="text-xs text-slate-500">
            Suggested records to verify hypotheses before final QA root cause approval.
          </p>
        </div>
      </div>

      {/* Suggested Quick Add Pills */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700">Quick-Add Standard Pharmaceutical Records:</div>
        <div className="flex flex-wrap gap-2">
          {[
            'Equipment Maintenance History (CMMS)',
            'Operator Training & Qualification Records',
            'Batch Manufacturing Record (BMR) Review',
            'Instrument Calibration Logs',
            'Continuous Temperature & SCADA Raw Data',
            'Historical Deviation & CAPA Records',
            'Standard Operating Procedure (SOP) Compliance',
            'Cleanroom Environmental Monitoring Logs',
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                dispatch(
                  addMissingEvidence({
                    item: suggestion,
                    category: 'GMP Record',
                    status: 'Requested',
                    required: true,
                  })
                );
              }}
              className="text-[11px] bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-300 text-slate-700 px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3 h-3 text-teal-600" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Document / Evidence Item</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Audit Requirement</th>
              <th className="px-4 py-3">Current Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {evidenceList.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.item}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-700">
                    {item.category || 'General'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${item.required ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                    {item.required ? 'Mandatory for Sign-off' : 'Optional / Supportive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={item.status}
                    onChange={(e) => dispatch(updateEvidenceStatus({ id: item.id, status: e.target.value }))}
                    className={`text-[11px] font-semibold border rounded px-2 py-1 bg-white focus:outline-none ${
                      statusColors[item.status] || 'border-slate-300'
                    }`}
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Requested">Requested</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Obtained">Obtained & Verified</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => dispatch(removeMissingEvidence(item.id))}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleAdd} className="pt-2 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Specify other records needed (e.g., Pneumatic header pressure chart)..."
          className="flex-1 text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
        >
          <option value="Maintenance">Maintenance & Engineering</option>
          <option value="Calibration">Instrumentation & Metrology</option>
          <option value="Operations">Manufacturing Operations</option>
          <option value="Quality QA">Quality Assurance & Risk</option>
          <option value="Analytical QC">Quality Control Analytical</option>
        </select>
        <button
          type="submit"
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0 flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Record</span>
        </button>
      </form>
    </div>
  );
}

