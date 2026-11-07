import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DocumentInputPanel from '../components/investigation/DocumentInputPanel';
import { initializeNewInvestigation } from '../features/investigations/investigationSlice';
import { ArrowLeft, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function NewInvestigation() {
  const dispatch = useDispatch();
  const current = useSelector((state) => state.investigations.currentInvestigation);

  useEffect(() => {
    if (!current) {
      dispatch(initializeNewInvestigation());
    }
  }, [current, dispatch]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Link to="/" className="hover:text-slate-600">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">New RCA Investigation</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Initiate Root Cause Analysis Investigation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-assisted deviation extraction, 5 Whys / Fishbone analysis, and CAPA recommendation for API manufacturing.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Document Intake & Input Component */}
      <DocumentInputPanel />

      {/* Quality Process Guidelines */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>GMP RCA Workflow Architecture</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-3">
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1">
            <div className="font-bold text-slate-200 flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Input & AI Parsing</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Extract title, department, batch number, equipment, and timeline from PDF, text, or emails without inventing facts.
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1">
            <div className="font-bold text-slate-200 flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">2</span>
              <span>5 Whys & Fishbone 6M</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Perform structured root cause analysis with evidence citations. Highlight missing records before accepting conclusions.
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1">
            <div className="font-bold text-slate-200 flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Human QA Confirmation & CAPA</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Formally designate verified primary root causes and assign actionable corrective & preventive actions with VoE metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
