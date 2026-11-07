import React, { useEffect, useState } from 'react';
import { Server, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function SystemStatus() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (err) {
      setHealth({
        status: 'error',
        database: 'disconnected',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">System Integration & Connectivity</h1>
          <p className="text-xs text-slate-500">Validation of Phase 1 Frontend, Backend, and PostgreSQL services</p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 text-xs bg-slate-900 text-white px-3 py-2 rounded-lg font-medium hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
            <Server className="w-4 h-4 text-teal-600" />
            <span>FastAPI Backend Service</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Service Status</span>
              <span className={health?.status ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                {health?.status ? `${health.status} (127.0.0.1:8000)` : 'Not reachable'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Python Runtime</span>
              <span className="font-mono text-slate-700">{health?.python_version || 'Unavailable'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Groq</span>
              <span className={health?.groq_configured ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                {health?.groq_configured ? `Configured (${health.groq_model})` : 'API key not configured'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">API Documentation</span>
              <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                /docs (Swagger UI)
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
            <Database className="w-4 h-4 text-teal-600" />
            <span>PostgreSQL Integration</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Integration Layer</span>
              <span className="font-semibold text-teal-600">SQLAlchemy 2.0 + Psycopg 3</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Database Engine Status</span>
              <span className={health?.database?.status === 'connected' ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                {health?.database?.status === 'connected' ? 'Connected' : health?.database?.message || 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">DATABASE_URL Pattern</span>
              <span className="font-mono text-[11px] text-slate-600">postgresql+psycopg://...</span>
            </div>
          </div>
        </div>
      </div>

      {health && (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="text-teal-400 font-sans font-semibold mb-2">Live Backend Health Response:</div>
          <pre>{JSON.stringify(health, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

