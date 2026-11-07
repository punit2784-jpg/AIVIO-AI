import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateWhyStep, 
  addWhyStep, 
  removeWhyStep 
} from '../../features/investigations/investigationSlice';
import { 
  HelpCircle, 
  PlusCircle, 
  Trash2, 
  AlertTriangle, 
  FileCheck2, 
  ArrowDown,
  Info
} from 'lucide-react';

export default function FiveWhysAnalysis() {
  const dispatch = useDispatch();
  const current = useSelector((state) => state.investigations.currentInvestigation);
  const steps = current?.five_whys || [];

  const handleUpdate = (id, field, value) => {
    dispatch(updateWhyStep({ id, field, value }));
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Structured 5 Whys Methodology</span>
          </div>
          <h3 className="text-base font-bold mt-1">Iterative Root Cause Interrogation Chain</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Progress through successive causal levels only when supported by objective records. Flag evidence gaps where unverified.
          </p>
        </div>

        <button
          onClick={() => dispatch(addWhyStep())}
          type="button"
          className="inline-flex items-center space-x-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Interrogation Step</span>
        </button>
      </div>

      {/* Guidelines Alert */}
      <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-lg flex items-start space-x-2.5 text-xs text-teal-900">
        <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>GMP Rule:</strong> Answers must be justified by physical inspections, SCADA logs, or verified documentation. Do not fabricate speculative answers merely to reach five steps.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isFinal = index === steps.length - 1;
          return (
            <div key={step.id} className="relative">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-teal-400 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Interrogation Level {index + 1}
                    </span>
                    {isFinal && (
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                        Potential Root Cause Candidate
                      </span>
                    )}
                  </div>

                  {steps.length > 1 && (
                    <button
                      onClick={() => dispatch(removeWhyStep(step.id))}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Remove step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Question */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Causal Question (Why?)
                  </label>
                  <input
                    type="text"
                    value={step.why_question}
                    onChange={(e) => handleUpdate(step.id, 'why_question', e.target.value)}
                    placeholder="Why did this abnormality occur?"
                    className="w-full text-xs font-medium text-slate-900 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50/50"
                  />
                </div>

                {/* Answer */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Direct Cause / Explanation
                  </label>
                  <textarea
                    rows={2}
                    value={step.answer}
                    onChange={(e) => handleUpdate(step.id, 'answer', e.target.value)}
                    placeholder="Describe the direct factual cause supported by technical evidence..."
                    className="w-full text-xs text-slate-800 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Two Column Evidence / Missing Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Supporting Evidence / Sensor Data</span>
                    </label>
                    <input
                      type="text"
                      value={step.evidence || ''}
                      onChange={(e) => handleUpdate(step.id, 'evidence', e.target.value)}
                      placeholder="e.g., SCADA flow log #SCADA-2026-11-06"
                      className="w-full text-xs text-slate-800 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-700 mb-1 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Missing Information / Further Evidence Required</span>
                    </label>
                    <input
                      type="text"
                      value={step.evidence_needed || ''}
                      onChange={(e) => handleUpdate(step.id, 'evidence_needed', e.target.value)}
                      placeholder="e.g., Awaiting CMMS valve maintenance log..."
                      className="w-full text-xs text-amber-900 p-2 border border-amber-300 bg-amber-50/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Connecting Down Arrow */}
              {!isFinal && (
                <div className="flex justify-center my-2">
                  <div className="bg-slate-200 text-slate-600 p-1 rounded-full">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

