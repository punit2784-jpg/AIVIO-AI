import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  FilePlus, 
  ClipboardList, 
  GitBranch, 
  CheckSquare, 
  Server, 
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const current = useSelector((state) => state.investigations.currentInvestigation);
  const currentId = current?.id || current?.investigation_code || 'RCA-2026-001';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'New Investigation', path: '/investigations/new', icon: FilePlus },
    { name: 'Active Workspace', path: `/investigations/${currentId}/workspace`, icon: Sparkles, badge: 'RCA' },
    { name: 'Investigation History', path: '/investigations', icon: ClipboardList },
    { name: 'System & DB Status', path: '/system-status', icon: Server },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)]">
      <div className="py-4">
        <div className="px-4 mb-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Quality Operations
        </div>
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border-l-4 border-teal-500 font-bold'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-teal-900/60 text-teal-300 border border-teal-700/40 px-1.5 py-0.5 rounded font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Current Active Investigation Mini-Card */}
        {current && (
          <div className="mx-3 mt-6 p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl text-xs space-y-1">
            <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
              Selected Investigation
            </div>
            <div className="font-mono font-bold text-white text-xs truncate">
              {current.investigation_code || current.id}
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              {current.product_name}
            </div>
            <div className="pt-2">
              <NavLink
                to={`/investigations/${currentId}/workspace`}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
              >
                <span>Enter Workspace →</span>
              </NavLink>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
          <div className="flex items-center space-x-2 text-teal-400 font-semibold mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>RCA investigation workspace</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Interactive 5 Whys, 6M Fishbone, CAPA Review, and AI Copilot active.
          </p>
        </div>
      </div>
    </aside>
  );
}
