import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addFishboneCause, 
  removeFishboneCause, 
  updateFishboneCause 
} from '../../features/investigations/investigationSlice';
import { 
  GitBranch, 
  UserCheck, 
  Cpu, 
  BookOpen, 
  Boxes, 
  Gauge, 
  SunMedium, 
  Plus, 
  Trash2,
  FileCheck
} from 'lucide-react';

export default function FishboneAnalysis() {
  const dispatch = useDispatch();
  const current = useSelector((state) => state.investigations.currentInvestigation);
  const fishbone = current?.fishbone || {};

  const [activeCategory, setActiveCategory] = useState('machine');
  const [newCause, setNewCause] = useState('');
  const [newEvidence, setNewEvidence] = useState('');

  const categories = [
    { key: 'machine', label: 'Machine (Equipment)', icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50', count: fishbone.machine?.length || 0 },
    { key: 'manpower', label: 'Manpower (Personnel)', icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50', count: fishbone.manpower?.length || 0 },
    { key: 'method', label: 'Method (Procedures / SOPs)', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', count: fishbone.method?.length || 0 },
    { key: 'material', label: 'Material (Raw Materials / Reagents)', icon: Boxes, color: 'text-emerald-600', bg: 'bg-emerald-50', count: fishbone.material?.length || 0 },
    { key: 'measurement', label: 'Measurement (Instruments / Calibration)', icon: Gauge, color: 'text-purple-600', bg: 'bg-purple-50', count: fishbone.measurement?.length || 0 },
    { key: 'environment', label: 'Environment (Facility / Cleanroom)', icon: SunMedium, color: 'text-teal-600', bg: 'bg-teal-50', count: fishbone.environment?.length || 0 },
  ];

  const handleAddCause = (e) => {
    e.preventDefault();
    if (!newCause.trim()) return;

    dispatch(
      addFishboneCause({
        category: activeCategory,
        cause: newCause.trim(),
        evidence: newEvidence.trim(),
      })
    );
    setNewCause('');
    setNewEvidence('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
          <GitBranch className="w-4 h-4" />
          <span>Ishikawa 6M Cause-and-Effect Methodology</span>
        </div>
        <h3 className="text-base font-bold mt-1">Pharmaceutical 6M Investigation Diagram</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Systematically categorize potential contributing factors across equipment, operations, SOPs, raw materials, sensors, and cleanroom facilities.
        </p>
      </div>

      {/* 6M Category Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-teal-500 bg-white ring-2 ring-teal-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-lg ${cat.bg}`}>
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {cat.count}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-2 truncate">{cat.label.split(' ')[0]}</div>
              <div className="text-[10px] text-slate-400 truncate">{cat.label.split('(')[1]?.replace(')', '') || ''}</div>
            </button>
          );
        })}
      </div>

      {/* Active Category Branch Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-900 capitalize">
              Branch: {categories.find((c) => c.key === activeCategory)?.label}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {fishbone[activeCategory]?.length || 0} factors recorded
          </span>
        </div>

        {/* Existing Causes List */}
        <div className="space-y-3">
          {(!fishbone[activeCategory] || fishbone[activeCategory].length === 0) && (
            <div className="p-8 text-center text-slate-400 border border-dashed rounded-lg text-xs">
              No potential causes logged under {activeCategory} yet. Add a factor below or rely on AI extraction.
            </div>
          )}

          {fishbone[activeCategory]?.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1.5 flex-1 w-full">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item.cause}
                    onChange={(e) =>
                      dispatch(
                        updateFishboneCause({
                          category: activeCategory,
                          id: item.id,
                          cause: e.target.value,
                        })
                      )
                    }
                    className="w-full text-xs font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pl-7">
                  <FileCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <input
                    type="text"
                    value={item.evidence || ''}
                    placeholder="Supporting documentation / verifiable evidence..."
                    onChange={(e) =>
                      dispatch(
                        updateFishboneCause({
                          category: activeCategory,
                          id: item.id,
                          evidence: e.target.value,
                        })
                      )
                    }
                    className="w-full text-[11px] text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => dispatch(removeFishboneCause({ category: activeCategory, id: item.id }))}
                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors self-start"
                title="Remove factor"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Cause Form */}
        <form onSubmit={handleAddCause} className="pt-3 border-t border-slate-100 space-y-3">
          <div className="text-xs font-bold text-slate-700">Add New Contributing Factor to this Category:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newCause}
                onChange={(e) => setNewCause(e.target.value)}
                placeholder="Observed causal factor (e.g., Sluggish pneumatic valve response)..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <input
                type="text"
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                placeholder="Verifying log or inspection note..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Factor to Branch</span>
          </button>
        </form>
      </div>
    </div>
  );
}

