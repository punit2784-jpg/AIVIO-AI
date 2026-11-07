import React from 'react';

export function StatusBadge({ status }) {
  const configs = {
    Open: 'bg-amber-100 text-amber-800 border-amber-300',
    'Under Review': 'bg-sky-100 text-sky-800 border-sky-300',
    Completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Draft: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const currentClass = configs[status] || configs.Draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentClass}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const configs = {
    Critical: 'bg-rose-100 text-rose-800 border-rose-300',
    'Major Deviation': 'bg-orange-100 text-orange-800 border-orange-300',
    'Minor Deviation': 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const currentClass = configs[severity] || configs['Minor Deviation'];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${currentClass}`}>
      {severity}
    </span>
  );
}

export function EvidenceStrengthBadge({ strength }) {
  const configs = {
    'Human-Confirmed': 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold',
    'Evidence-Supported': 'bg-teal-100 text-teal-800 border-teal-300',
    'AI Hypothesis': 'bg-purple-100 text-purple-800 border-purple-300 italic',
  };

  const currentClass = configs[strength] || configs['AI Hypothesis'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border ${currentClass}`}>
      {strength === 'Human-Confirmed' && '✓ '}
      {strength}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const configs = {
    Critical: 'bg-red-100 text-red-800',
    High: 'bg-orange-100 text-orange-800',
    Medium: 'bg-amber-100 text-amber-800',
    Low: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${configs[priority] || configs.Medium}`}>
      {priority}
    </span>
  );
}

