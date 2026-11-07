import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  RefreshCw, 
  Server, 
  Database,
  ArrowRight,
  FlaskConical,
  Filter,
  Search,
  Activity,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { 
  fetchHealthStatus, 
  fetchInvestigationById,
  loadSampleInvestigation, 
  setFilterStatus,
  setSearchQuery
} from '../features/investigations/investigationSlice';
import { StatusBadge, SeverityBadge } from '../components/common/Badge';
import { addToast } from '../features/ui/uiSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, systemHealth, filterStatus, searchQuery, error } = useSelector((state) => state.investigations);
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  useEffect(() => {
    dispatch(fetchHealthStatus());
  }, [dispatch]);

  const handleRefresh = async () => {
    setLoadingRefresh(true);
    await dispatch(fetchHealthStatus());
    setLoadingRefresh(false);
    dispatch(
      addToast({
        type: 'info',
        title: 'System Diagnostics Updated',
        message: 'Endpoint status and database integration health polled.',
      })
    );
  };

  const handleOpenInvestigation = async (id) => {
    const result = await dispatch(fetchInvestigationById(id));
    if (fetchInvestigationById.fulfilled.match(result)) {
      navigate(`/investigations/${result.payload.id}/workspace`);
    } else {
      dispatch(addToast({
        type: 'error',
        title: 'Could not open investigation',
        message: result.payload?.message || 'The investigation could not be loaded.',
      }));
    }
  };

  const handleQuickLoadSample = () => {
    dispatch(loadSampleInvestigation());
    dispatch(
      addToast({
        type: 'success',
        title: 'Section 14 Scenario Active',
        message: 'Loaded Active Pharmaceutical Ingredient Batch API-2026-001.',
      })
    );
    navigate('/investigations/RCA-2026-001/workspace');
  };

  // Metrics
  const total = items.length;
  const openCount = items.filter((i) => i.investigation_status === 'Open').length;
  const underReviewCount = items.filter((i) => i.investigation_status === 'Under Review').length;
  const completedCount = items.filter((i) => i.investigation_status === 'Completed').length;

  const stats = [
    { title: 'Total Investigations', value: total, subtitle: 'Active records', icon: ClipboardCheck, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Open Investigations', value: openCount, subtitle: 'RCA in progress', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Under QA Review', value: underReviewCount, subtitle: 'Awaiting sign-off', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Completed & Closed', value: completedCount, subtitle: 'Verified CAPA plans', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  // Filtering
  const filteredItems = items.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.investigation_status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      item.incident_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.investigation_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batch_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900">
              API Manufacturing QMS
            </span>
            <span className="text-xs text-slate-400">• Quality Intelligence Platform</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Root Cause Analysis Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured 5 Whys, Fishbone 6M, and CAPA formulation for pharmaceutical API deviations.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleQuickLoadSample}
            type="button"
            className="inline-flex items-center space-x-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-800 text-xs font-semibold px-3.5 py-2.5 rounded-lg transition-colors shadow-xs"
          >
            <FlaskConical className="w-4 h-4 text-teal-600" />
            <span>Launch Section 14 Sample</span>
          </button>

          <Link
            to="/investigations/new"
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            <span>New RCA Investigation</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">{stat.title}</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Services Health Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">React 19 + Redux Toolkit:</span>
            <span className="text-slate-500">Active</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${systemHealth.api === 'online' ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
            <span className="font-semibold text-slate-800">FastAPI Backend:</span>
            <span className="text-slate-500">{systemHealth.api === 'online' ? 'Online' : systemHealth.api === 'checking' ? 'Checking' : 'Offline'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold text-slate-800">PostgreSQL (SQLAlchemy):</span>
            <span className={systemHealth.database === 'connected' ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-medium'}>
              {systemHealth.database === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">Groq:</span>
            <span className={systemHealth.groqConfigured ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-medium'}>
              {systemHealth.groqConfigured ? `Configured (${systemHealth.groqModel || 'model set'})` : 'API key not configured'}
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loadingRefresh}
          className="flex items-center space-x-1 text-xs text-slate-500 hover:text-teal-600 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingRefresh ? 'animate-spin' : ''}`} />
          <span>Refresh Services</span>
        </button>
      </div>

      {/* Investigations Table with Search & Status Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Pharmaceutical Investigations</h2>
            <p className="text-xs text-slate-500">Manufacturing deviations under structured investigation</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search code, title, batch..."
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => dispatch(setFilterStatus(e.target.value))}
              className="text-xs py-1.5 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Deviation Title & Overview</th>
                <th className="px-5 py-3">Product / Batch</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    {error || 'No investigations are stored yet. Create an RCA or load the Section 14 sample.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((inv) => (
                  <tr
                    key={inv.id || inv.investigation_code}
                    onClick={() => handleOpenInvestigation(inv.id || inv.investigation_code)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 text-xs">
                      {inv.investigation_code || inv.id}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{inv.incident_title}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {inv.equipment || 'Reactor / Process Equipment'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">{inv.product_name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{inv.batch_number}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {inv.department}
                    </td>
                    <td className="px-5 py-4">
                      <SeverityBadge severity={inv.severity || 'Major Deviation'} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={inv.investigation_status || 'Open'} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInvestigation(inv.id || inv.investigation_code);
                        }}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
