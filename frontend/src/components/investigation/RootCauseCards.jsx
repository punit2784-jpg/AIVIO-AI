import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  confirmRootCause, 
  addPotentialRootCause, 
  removePotentialRootCause, 
  updatePotentialRootCause 
} from '../../features/investigations/investigationSlice';
import { EvidenceStrengthBadge } from '../common/Badge';
import { 
  CheckCircle2, 
  Sparkles, 
  FileCheck2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  HelpCircle,
  ShieldCheck,
  Award
} from 'lucide-react';
import { addToast } from '../../features/ui/uiSlice';

export default function RootCauseCards() {
  const dispatch = useDispatch();
  const current = useSelector((state) => state.investigations.currentInvestigation);
  const potentialCauses = current?.potential_root_causes || [];
  const confirmedCause = current?.confirmed_root_cause;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newReasoning, setNewReasoning] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newConfidence, setNewConfidence] = useState('Medium');
  const [newStrength, setNewStrength] = useState('Evidence-Supported');

  const handleConfirm = (id, desc) => {
    dispatch(confirmRootCause({ id }));
    dispatch(
      addToast({
        type: 'success',
        title: 'Root Cause Confirmed by Quality Investigator',
        message: 'Primary root cause officially designated for CAPA assignment.',
      })
    );
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    dispatch(
      addPotentialRootCause({
        description: newDesc.trim(),
        reasoning: newReasoning.trim(),
        supporting_evidence: newEvidence.trim(),
        confidence: newConfidence,
        evidence_strength: newStrength,
      })
    );
    setNewDesc('');
    setNewReasoning('');
    setNewEvidence('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
            <Award className="w-4 h-4 text-teal-600" />
            <span>Root Cause Identification & Human Confirmation</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">Evaluated Root Cause Candidates</h2>
          <p className="text-xs text-slate-500">
            Differentiate between AI hypotheses, evidence-backed findings, and human-confirmed conclusions.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Candidate</span>
        </button>
      </div>

      {/* Confirmed Root Cause Banner */}
      {confirmedCause && (
        <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-xl shadow-sm flex items-start space-x-3.5">
          <div className="p-2 bg-emerald-500 text-white rounded-lg shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Confirmed Primary Root Cause
              </span>
              <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                Human QA Investigator Verified
              </span>
            </div>
            <p className="text-sm font-bold text-emerald-950 mt-1 leading-snug">
              {confirmedCause}
            </p>
            <p className="text-xs text-emerald-800 mt-1">
              This cause now serves as the mandatory foundation for Corrective and Preventive Actions (CAPA).
            </p>
          </div>
        </div>
      )}

      {/* Distinction Guide Alert */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-xs">
          <div className="font-bold text-purple-900 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>1. AI-Generated Hypothesis</span>
          </div>
          <p className="text-[11px] text-purple-800 mt-1">
            Statistical suggestion inferred from text. Must never be accepted without physical verification.
          </p>
        </div>

        <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg text-xs">
          <div className="font-bold text-teal-900 flex items-center space-x-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
            <span>2. Evidence-Supported Cause</span>
          </div>
          <p className="text-[11px] text-teal-800 mt-1">
            Candidate supported by SCADA sensors, maintenance logs, or physical inspection reports.
          </p>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
          <div className="font-bold text-emerald-900 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Human-Confirmed Root Cause</span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-1">
            Formally confirmed by a qualified QA investigator. Only this level establishes causal responsibility.
          </p>
        </div>
      </div>

      {/* New Candidate Form */}
      {showAddForm && (
        <form onSubmit={handleAddNew} className="bg-white p-5 rounded-xl border border-slate-300 shadow-md space-y-4">
          <div className="text-xs font-bold text-slate-800">Add Root Cause Candidate</div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Causal Description</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="e.g., Sluggish actuator diaphragm response due to unserviced elastomer seal..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Causal Reasoning</label>
              <textarea
                rows={2}
                value={newReasoning}
                onChange={(e) => setNewReasoning(e.target.value)}
                placeholder="Explain the mechanical/operational mechanism connecting this cause to the deviation..."
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Supporting Evidence</label>
              <textarea
                rows={2}
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                placeholder="List sensors, logs, or photos proving this causal link..."
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Confidence</label>
              <select
                value={newConfidence}
                onChange={(e) => setNewConfidence(e.target.value)}
                className="text-xs p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="High">High Confidence</option>
                <option value="Medium">Medium Confidence</option>
                <option value="Low">Low Confidence</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Evidence Status</label>
              <select
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                className="text-xs p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="AI Hypothesis">AI Hypothesis</option>
                <option value="Evidence-Supported">Evidence-Supported</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs bg-slate-900 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-slate-800"
            >
              Save Candidate
            </button>
          </div>
        </form>
      )}

      {/* Cards List */}
      <div className="space-y-4">
        {potentialCauses.map((cause) => {
          const isSelected = cause.is_confirmed || confirmedCause === cause.description;
          return (
            <div
              key={cause.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all space-y-4 ${
                isSelected
                  ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <EvidenceStrengthBadge strength={isSelected ? 'Human-Confirmed' : cause.evidence_strength} />
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600">
                    Confidence: <span className="text-slate-900">{cause.confidence}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {!isSelected ? (
                    <button
                      onClick={() => handleConfirm(cause.id, cause.description)}
                      className="inline-flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm as Root Cause</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Confirmed Root Cause</span>
                    </span>
                  )}

                  <button
                    onClick={() => dispatch(removePotentialRootCause(cause.id))}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                    title="Remove candidate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Causal Statement
                </div>
                <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                  {cause.description}
                </p>
              </div>

              {/* Reasoning & Evidence Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                    <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>Technical Reasoning</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {cause.reasoning || 'No technical justification logged.'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Supporting Sensor / Document Evidence</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {cause.supporting_evidence || 'Pending physical inspection records.'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

