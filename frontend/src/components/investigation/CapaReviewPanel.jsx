import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addCapaAction, 
  updateCapaAction, 
  removeCapaAction 
} from '../../features/investigations/investigationSlice';
import { PriorityBadge } from '../common/Badge';
import { 
  ShieldCheck, 
  Wrench, 
  ShieldAlert, 
  CheckSquare2, 
  Plus, 
  Trash2, 
  UserCheck, 
  Target,
  Sparkles
} from 'lucide-react';
import { addToast } from '../../features/ui/uiSlice';

export default function CapaReviewPanel() {
  const dispatch = useDispatch();
  const current = useSelector((state) => state.investigations.currentInvestigation);
  const capaList = current?.capa_actions || [];

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'Corrective', 'Preventive'
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState('Corrective');
  const [newDesc, setNewDesc] = useState('');
  const [newJustification, setNewJustification] = useState('');
  const [newRole, setNewRole] = useState('Engineering & Maintenance Lead');
  const [newPriority, setNewPriority] = useState('High');
  const [newVerification, setNewVerification] = useState('');

  const filteredCapa = activeTab === 'all' ? capaList : capaList.filter((c) => c.action_type === activeTab);
  const correctiveCount = capaList.filter((c) => c.action_type === 'Corrective').length;
  const preventiveCount = capaList.filter((c) => c.action_type === 'Preventive').length;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    dispatch(
      addCapaAction({
        action_type: newType,
        action_description: newDesc.trim(),
        justification: newJustification.trim(),
        responsible_role: newRole.trim(),
        priority: newPriority,
        effectiveness_verification: newVerification.trim(),
      })
    );

    dispatch(
      addToast({
        type: 'success',
        title: 'CAPA Action Item Registered',
        message: `${newType} action assigned to ${newRole}.`,
      })
    );

    setNewDesc('');
    setNewJustification('');
    setNewVerification('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
            <CheckSquare2 className="w-4 h-4 text-teal-600" />
            <span>Corrective and Preventive Actions (CAPA)</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">Remediation & Recurrence Prevention Plan</h2>
          <p className="text-xs text-slate-500">
            Mandatory bifurcation: immediate corrective containment vs systemic preventive controls.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom CAPA</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Actions ({capaList.length})
        </button>

        <button
          onClick={() => setActiveTab('Corrective')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'Corrective'
              ? 'bg-amber-600 text-white'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Corrective Actions ({correctiveCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('Preventive')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'Preventive'
              ? 'bg-teal-700 text-white'
              : 'text-teal-800 bg-teal-50 hover:bg-teal-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Preventive Actions ({preventiveCount})</span>
        </button>
      </div>

      {/* New CAPA Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white p-5 rounded-xl border border-slate-300 shadow-md space-y-4">
          <div className="text-xs font-bold text-slate-800">New CAPA Assignment</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">CAPA Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Corrective">Corrective Action (Fix existing defect)</option>
                <option value="Preventive">Preventive Action (Prevent recurrence)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Critical">Critical (Immediate action required)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Responsible Role / Owner</label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g., Engineering Lead"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Action Description</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Explicit, verifiable description of technical or procedural change..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Technical Justification</label>
              <input
                type="text"
                value={newJustification}
                onChange={(e) => setNewJustification(e.target.value)}
                placeholder="Why this action directly remediates the root cause..."
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Effectiveness Verification Method</label>
              <input
                type="text"
                value={newVerification}
                onChange={(e) => setNewVerification(e.target.value)}
                placeholder="e.g., Verify 3 consecutive batches with 0 excursions..."
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs bg-slate-900 text-white px-4 py-1.5 rounded-lg font-semibold"
            >
              Register CAPA
            </button>
          </div>
        </form>
      )}

      {/* CAPA Action Cards */}
      <div className="space-y-4">
        {filteredCapa.map((capa) => {
          const isCorrective = capa.action_type === 'Corrective';
          return (
            <div
              key={capa.id}
              className={`bg-white rounded-xl border p-5 shadow-sm space-y-3 transition-colors ${
                isCorrective ? 'border-amber-200 hover:border-amber-300' : 'border-teal-200 hover:border-teal-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-md ${
                      isCorrective ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900'
                    }`}
                  >
                    {isCorrective ? <Wrench className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>{capa.action_type} Action</span>
                  </span>
                  <PriorityBadge priority={capa.priority} />
                  <span className="text-[11px] font-mono text-slate-400">ID: {capa.id}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Status: {capa.status || 'Proposed'}
                  </span>
                  <button
                    onClick={() => dispatch(removeCapaAction(capa.id))}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    title="Remove action"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <textarea
                  rows={2}
                  value={capa.action_description}
                  onChange={(e) =>
                    dispatch(
                      updateCapaAction({
                        id: capa.id,
                        updates: { action_description: e.target.value },
                      })
                    )
                  }
                  className="w-full text-xs font-semibold text-slate-900 p-2 border border-transparent hover:border-slate-300 focus:border-teal-500 rounded bg-transparent focus:bg-white leading-relaxed"
                />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                    <UserCheck className="w-3 h-3 text-teal-600" />
                    <span>Responsible Role</span>
                  </div>
                  <input
                    type="text"
                    value={capa.responsible_role || ''}
                    onChange={(e) =>
                      dispatch(
                        updateCapaAction({
                          id: capa.id,
                          updates: { responsible_role: e.target.value },
                        })
                      )
                    }
                    className="w-full text-xs font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 mt-0.5"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                    <Target className="w-3 h-3 text-teal-600" />
                    <span>Justification</span>
                  </div>
                  <input
                    type="text"
                    value={capa.justification || ''}
                    onChange={(e) =>
                      dispatch(
                        updateCapaAction({
                          id: capa.id,
                          updates: { justification: e.target.value },
                        })
                      )
                    }
                    className="w-full text-xs text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 mt-0.5 truncate"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                    <CheckSquare2 className="w-3 h-3 text-teal-600" />
                    <span>Verification of Effectiveness (VoE)</span>
                  </div>
                  <input
                    type="text"
                    value={capa.effectiveness_verification || ''}
                    onChange={(e) =>
                      dispatch(
                        updateCapaAction({
                          id: capa.id,
                          updates: { effectiveness_verification: e.target.value },
                        })
                      )
                    }
                    className="w-full text-xs text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 mt-0.5 truncate"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

