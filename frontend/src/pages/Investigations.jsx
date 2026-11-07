import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  PlusCircle, 
  Search, 
  ArrowRight, 
  FlaskConical,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { 
  fetchInvestigationById, 
  setFilterStatus, 
  setSearchQuery 
} from '../features/investigations/investigationSlice';
import { addToast } from '../features/ui/uiSlice';
import { StatusBadge, SeverityBadge } from '../components/common/Badge';

export default function Investigations() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, filterStatus, searchQuery } = useSelector((state) => state.investigations);

  const handleOpen = async (id) => {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Link to="/" className="hover:text-slate-600">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Investigation History</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Historical Investigation Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready repository of past and ongoing Root Cause Analyses.
          </p>
        </div>

        <Link
          to="/investigations/new"
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-teal-400" />
          <span>New Investigation</span>
        </Link>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Filter Records ({filteredItems.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search deviation or batch..."
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => dispatch(setFilterStatus(e.target.value))}
              className="text-xs py-1.5 px-3 border border-slate-300 rounded-lg bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Incident Title & Details</th>
                <th className="px-5 py-3">Product / API</th>
                <th className="px-5 py-3">Batch Number</th>
                <th className="px-5 py-3">Methodology</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((inv) => (
                <tr
                  key={inv.id || inv.investigation_code}
                  onClick={() => handleOpen(inv.id || inv.investigation_code)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 font-mono font-bold text-slate-900">
                    {inv.investigation_code || inv.id}
                  </td>
                  <td className="px-5 py-4 max-w-sm">
                    <div className="font-semibold text-slate-900">{inv.incident_title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {inv.department} • {inv.equipment}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {inv.product_name}
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-700">
                    {inv.batch_number}
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-slate-100 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded capitalize">
                      {inv.methodology === '5_whys' ? '5 Whys' : 'Fishbone 6M'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={inv.investigation_status || 'Open'} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen(inv.id || inv.investigation_code);
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
