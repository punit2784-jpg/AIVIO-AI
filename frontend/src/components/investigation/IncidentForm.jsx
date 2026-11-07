import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCurrentField } from '../../features/investigations/investigationSlice';
import { StatusBadge, SeverityBadge } from '../common/Badge';
import { 
  Building2, 
  Calendar, 
  Tag, 
  Layers, 
  Cpu, 
  AlertOctagon, 
  FileText, 
  ShieldAlert
} from 'lucide-react';

export default function IncidentForm() {
  const dispatch = useDispatch();
  const current = useSelector((state) => state.investigations.currentInvestigation);

  if (!current) return null;

  const handleChange = (field, value) => {
    dispatch(updateCurrentField({ field, value }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {current.investigation_code || current.id}
            </span>
            <StatusBadge status={current.investigation_status || 'Open'} />
            <SeverityBadge severity={current.severity || 'Major Deviation'} />
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">Incident Parameters & Core Deviation Data</h2>
        </div>

        <div className="text-xs text-slate-400">
          Editable structured form populated via document extraction
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Incident Title */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Incident Title</span>
          </label>
          <input
            type="text"
            value={current.incident_title || ''}
            onChange={(e) => handleChange('incident_title', e.target.value)}
            placeholder="e.g., Unexpected Temperature Excursion During API Manufacturing"
            className="w-full text-xs font-semibold text-slate-900 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Product / API Information */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Product / Active Pharmaceutical Ingredient (API)</span>
          </label>
          <input
            type="text"
            value={current.product_name || ''}
            onChange={(e) => handleChange('product_name', e.target.value)}
            placeholder="e.g., API Batch – API-2026-001"
            className="w-full text-xs text-slate-800 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Batch Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
            <Tag className="w-3.5 h-3.5 text-teal-600" />
            <span>Batch Number</span>
          </label>
          <input
            type="text"
            value={current.batch_number || ''}
            onChange={(e) => handleChange('batch_number', e.target.value)}
            placeholder="e.g., API-2026-001"
            className="w-full text-xs font-mono text-slate-800 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Manufacturing Department</span>
          </label>
          <select
            value={current.department || 'Production'}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full text-xs text-slate-800 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
          >
            <option value="Production">Production (API Synthesis / Purification)</option>
            <option value="Quality Assurance">Quality Assurance (QA)</option>
            <option value="Quality Control">Quality Control (QC Analytical)</option>
            <option value="Engineering & Maintenance">Engineering & Utilities</option>
            <option value="Supply Chain & Warehouse">Materials & Warehouse</option>
            {current.department && !['Production', 'Quality Assurance', 'Quality Control', 'Engineering & Maintenance', 'Supply Chain & Warehouse'].includes(current.department) && (
              <option value={current.department}>{current.department}</option>
            )}
          </select>
        </div>

        {/* Equipment / Process Involved */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            <span>Equipment / Unit Operation Involved</span>
          </label>
          <input
            type="text"
            value={current.equipment || ''}
            onChange={(e) => handleChange('equipment', e.target.value)}
            placeholder="e.g., Reactor R-101 (Jacketed Vessel)"
            className="w-full text-xs text-slate-800 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Incident Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Incident Timestamp</span>
          </label>
          <input
            type="datetime-local"
            value={current.incident_date ? current.incident_date.slice(0, 16) : ''}
            onChange={(e) => handleChange('incident_date', e.target.value)}
            className="w-full text-xs text-slate-800 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Deviation Severity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
            <span>Deviation Classification</span>
          </label>
          <select
            value={current.severity || 'Major Deviation'}
            onChange={(e) => handleChange('severity', e.target.value)}
            className="w-full text-xs text-slate-800 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
          >
            <option value="Critical">Critical Deviation (Direct CQA/Safety Impact)</option>
            <option value="Major Deviation">Major Deviation (Process Operating Limit Exceeded)</option>
            <option value="Minor Deviation">Minor Deviation (Procedural / No Quality Impact)</option>
          </select>
        </div>

        {/* Incident Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Comprehensive Incident Narrative & Observed Abnormality
          </label>
          <textarea
            rows={4}
            value={current.incident_description || ''}
            onChange={(e) => handleChange('incident_description', e.target.value)}
            placeholder="Detailed description of process parameters, temperature curve, alarms, and immediate containment..."
            className="w-full text-xs text-slate-800 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed font-sans"
          />
        </div>

        {/* Immediate Actions Taken */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Immediate Actions & Containment Measures Executed</span>
          </label>
          <textarea
            rows={3}
            value={current.immediate_actions || ''}
            onChange={(e) => handleChange('immediate_actions', e.target.value)}
            placeholder="1. Secondary cooling engaged. 2. Batch quarantined on QA hold..."
            className="w-full text-xs text-slate-800 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}

