import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchInvestigationById, 
  setRcaMethodology,
  saveInvestigation
} from '../features/investigations/investigationSlice';
import { 
  setActiveWorkspaceTab, 
  toggleAiPanel,
  addToast
} from '../features/ui/uiSlice';
import IncidentForm from '../components/investigation/IncidentForm';
import FiveWhysAnalysis from '../components/investigation/FiveWhysAnalysis';
import FishboneAnalysis from '../components/investigation/FishboneAnalysis';
import RootCauseCards from '../components/investigation/RootCauseCards';
import MissingEvidencePanel from '../components/investigation/MissingEvidencePanel';
import CapaReviewPanel from '../components/investigation/CapaReviewPanel';
import ReviewSavePanel from '../components/investigation/ReviewSavePanel';
import AIAssistantPanel from '../components/investigation/AIAssistantPanel';
import { StatusBadge, SeverityBadge } from '../components/common/Badge';
import { store } from '../app/store';
import { 
  FileText, 
  GitBranch, 
  Cpu, 
  CheckSquare2, 
  ClipboardCheck, 
  Save, 
  Bot, 
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  Award
} from 'lucide-react';

export default function InvestigationWorkspace() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const current = useSelector((state) => state.investigations.currentInvestigation);
  const activeTab = useSelector((state) => state.ui.activeWorkspaceTab);
  const aiPanelOpen = useSelector((state) => state.ui.aiPanelOpen);

  useEffect(() => {
    if (!id || id === 'draft') return;
    const open = store.getState().investigations.currentInvestigation;
    const alreadyOpen = open && (open.investigation_code === id || String(open.id) === String(id));
    if (alreadyOpen && !/^\d+$/.test(String(id))) return;
    dispatch(fetchInvestigationById(id));
  }, [id, dispatch]);

  if (!current) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800">No Investigation Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select an investigation from the dashboard or history.</p>
        <Link to="/" className="inline-flex items-center space-x-1 text-xs text-teal-600 font-bold mt-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: 'incident', label: '1. Incident Data', icon: FileText, desc: 'Parameters & Description' },
    { key: 'rca', label: '2. RCA Methods', icon: GitBranch, desc: '5 Whys / Fishbone 6M' },
    { key: 'rootcauses', label: '3. Root Causes & Evidence', icon: Cpu, desc: 'Hypotheses & Gaps' },
    { key: 'capa', label: '4. CAPA Review', icon: CheckSquare2, desc: 'Corrective & Preventive' },
    { key: 'review', label: '5. Review & Sign-off', icon: ClipboardCheck, desc: 'Audit & Finalize' },
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Sub-header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Link to="/" className="hover:text-slate-600">Dashboard</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <Link to="/investigations" className="hover:text-slate-600">Investigations</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-mono font-semibold text-slate-700">{current.investigation_code || current.id}</span>
          </div>

          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900 truncate max-w-xl">
              {current.incident_title || 'Untitled RCA Investigation'}
            </h1>
            <StatusBadge status={current.investigation_status || 'Open'} />
            <SeverityBadge severity={current.severity || 'Major Deviation'} />
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {current.product_name} • Batch: <span className="font-mono text-slate-700 font-medium">{current.batch_number}</span> • Dept: {current.department}
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => dispatch(toggleAiPanel())}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
              aiPanelOpen
                ? 'bg-teal-50 border-teal-300 text-teal-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bot className="w-4 h-4 text-teal-600" />
            <span>AI Copilot Panel</span>
          </button>

          <button
            onClick={async () => {
              const result = await dispatch(saveInvestigation());
              if (saveInvestigation.fulfilled.match(result)) {
                dispatch(
                  addToast({
                    type: 'success',
                    title: 'Investigation saved',
                    message: `${result.payload.investigation_code} was stored in the database.`,
                  })
                );
              } else {
                dispatch(
                  addToast({
                    type: 'error',
                    title: 'Investigation was not saved',
                    message: result.payload?.message || 'The database did not accept this record.',
                  })
                );
              }
            }}
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 text-teal-400" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Main Workflow Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => dispatch(setActiveWorkspaceTab(tab.key))}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-teal-500 bg-white ring-2 ring-teal-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                  {tab.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 pl-6 truncate">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Dual Column Layout with Persistent AI Assistant */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Workspace Active Section */}
        <div className="flex-1 w-full space-y-6">
          {activeTab === 'incident' && <IncidentForm />}

          {activeTab === 'rca' && (
            <div className="space-y-6">
              {/* Methodology Switcher */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-700">Root Cause Methodology Selection:</span>
                  <p className="text-[11px] text-slate-400">Choose between sequential interrogation (5 Whys) or categorized factor mapping (Fishbone 6M)</p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => dispatch(setRcaMethodology('5_whys'))}
                    className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
                      current.methodology === '5_whys'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>5 Whys Chain</span>
                  </button>

                  <button
                    onClick={() => dispatch(setRcaMethodology('fishbone'))}
                    className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
                      current.methodology === 'fishbone'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Fishbone (Ishikawa 6M)</span>
                  </button>
                </div>
              </div>

              {current.methodology === '5_whys' ? <FiveWhysAnalysis /> : <FishboneAnalysis />}
            </div>
          )}

          {activeTab === 'rootcauses' && (
            <div className="space-y-6">
              <RootCauseCards />
              <MissingEvidencePanel />
            </div>
          )}

          {activeTab === 'capa' && <CapaReviewPanel />}

          {activeTab === 'review' && <ReviewSavePanel />}
        </div>

        {/* AI Assistant Side Panel */}
        {aiPanelOpen && <AIAssistantPanel />}
      </div>
    </div>
  );
}
