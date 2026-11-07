import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  updateCurrentField, 
  saveInvestigation 
} from '../../features/investigations/investigationSlice';
import { addToast } from '../../features/ui/uiSlice';
import { StatusBadge, SeverityBadge } from '../common/Badge';
import { 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Download, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  Building,
  Award
} from 'lucide-react';

export default function ReviewSavePanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const current = useSelector((state) => state.investigations.currentInvestigation);

  const [saving, setSaving] = useState(false);

  if (!current) return null;

  const handleStatusChange = (status) => {
    dispatch(updateCurrentField({ field: 'investigation_status', value: status }));
    dispatch(
      addToast({
        type: 'info',
        title: 'Status Updated',
        message: `Investigation status changed to ${status}.`,
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await dispatch(saveInvestigation());
    setSaving(false);
    if (saveInvestigation.fulfilled.match(result)) {
      dispatch(
        addToast({
          type: 'success',
          title: 'Investigation saved',
          message: `${result.payload.investigation_code} is stored in PostgreSQL. CAPA actions remain proposed until a person approves them.`,
        })
      );
      navigate(`/investigations/${result.payload.id}/workspace`);
    } else {
      dispatch(
        addToast({
          type: 'error',
          title: 'Investigation was not saved',
          message: result.payload?.message || 'The database did not accept this record.',
        })
      );
    }
  };

  // Check completeness
  const checks = [
    { label: 'Incident details & batch parameters recorded', passed: !!(current.incident_title && current.batch_number) },
    { label: 'Root cause analysis executed (5 Whys or Fishbone)', passed: !!(current.five_whys?.length > 1 || Object.values(current.fishbone || {}).some(arr => arr.length > 0)) },
    { label: 'Primary root cause formally confirmed by investigator', passed: !!current.confirmed_root_cause },
    { label: 'Corrective & Preventive Actions (CAPA) assigned', passed: !!(current.capa_actions?.length > 0) },
    { label: 'Missing evidence items reviewed', passed: !!(current.missing_evidence?.length > 0) },
  ];

  const allPassed = checks.every((c) => c.passed);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
              {current.investigation_code || current.id}
            </span>
            <StatusBadge status={current.investigation_status || 'Open'} />
            <SeverityBadge severity={current.severity || 'Major Deviation'} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Investigation Review & Approval Sign-off</h2>
          <p className="text-xs text-slate-500">
            Review completed root cause analysis and submit for Quality Assurance final disposition.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            type="button"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            type="button"
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 text-teal-400" />
            <span>{saving ? 'Saving...' : 'Save Investigation Record'}</span>
          </button>
        </div>
      </div>

      {/* Quality Completeness Checklist */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              GMP Investigation Completeness Gate
            </h3>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {checks.filter((c) => c.passed).length} / {checks.length} Criteria Satisfied
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checks.map((chk, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border flex items-center space-x-2 text-xs ${
                chk.passed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}
            >
              {chk.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-medium">{chk.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Review Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Executive Investigation Synopsis
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Incident Title</span>
              <span className="font-semibold text-slate-900">{current.incident_title}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[11px] block">Product / API</span>
                <span className="font-medium text-slate-800">{current.product_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Batch Number</span>
                <span className="font-mono font-medium text-slate-800">{current.batch_number}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[11px] block">Department</span>
                <span className="font-medium text-slate-800">{current.department}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Equipment</span>
                <span className="font-medium text-slate-800">{current.equipment}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmed Root Cause Box */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Confirmed Root Cause & CAPA Count
          </h3>
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Investigator Verified Root Cause</span>
            </div>
            <p className="text-xs font-bold text-emerald-950 mt-1 leading-snug">
              {current.confirmed_root_cause || 'None confirmed yet. Please confirm a candidate in the Root Causes tab.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-lg font-bold text-amber-900">
                {current.capa_actions?.filter(c => c.action_type === 'Corrective').length || 0}
              </div>
              <div className="text-[11px] text-amber-800 font-medium">Corrective Actions</div>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
              <div className="text-lg font-bold text-teal-900">
                {current.capa_actions?.filter(c => c.action_type === 'Preventive').length || 0}
              </div>
              <div className="text-[11px] text-teal-800 font-medium">Preventive Actions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Investigation Conclusion Notes */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-900">
          Formal QA Conclusion & Batch Disposition Statement
        </label>
        <textarea
          rows={3}
          value={current.investigation_conclusion || ''}
          onChange={(e) => dispatch(updateCurrentField({ field: 'investigation_conclusion', value: e.target.value }))}
          placeholder="State official quality conclusion: batch impact assessment, QA sign-off status, and conditions for closeout..."
          className="w-full text-xs text-slate-800 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
        />
      </div>

      {/* Workflow Stage Transitions */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">Formal Workflow Stage</div>
          <div className="text-sm font-semibold mt-0.5">
            Current Stage: <span className="text-teal-300 font-bold">{current.investigation_status}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {['Open', 'Under Review', 'Completed'].map((stage) => (
            <button
              key={stage}
              onClick={() => handleStatusChange(stage)}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                current.investigation_status === stage
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

