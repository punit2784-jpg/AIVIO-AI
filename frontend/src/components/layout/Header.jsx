import React from 'react';
import { Activity, ShieldCheck, Database, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Header() {
  const { systemHealth } = useSelector((state) => state.investigations);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-500 p-2 rounded-lg text-slate-950 font-bold flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">AIVOA<span className="text-teal-400">.AI</span></span>
              <span className="bg-slate-800 text-teal-400 text-xs px-2 py-0.5 rounded border border-teal-500/30 font-medium">
                API Manufacturing RCA
              </span>
            </div>
            <p className="text-xs text-slate-400">Pharmaceutical Root Cause Analysis Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700 text-xs">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-300">Database:</span>
            <span className={systemHealth.database === 'connected' ? 'text-teal-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {systemHealth.database === 'connected' ? 'PostgreSQL Connected' : 'PostgreSQL Disconnected'}
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-300">FastAPI:</span>
            <span className={systemHealth.api === 'online' ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {systemHealth.api === 'online' ? 'Online' : systemHealth.api === 'checking' ? 'Checking' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
            <div className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500/50 flex items-center justify-center text-teal-300 text-xs font-semibold">
              QA
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-medium text-slate-200">Quality Investigator</div>
              <div className="text-[10px] text-slate-400">API Production Unit</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

