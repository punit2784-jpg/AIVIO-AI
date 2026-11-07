import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Sparkles, 
  Bot, 
  HelpCircle, 
  GitBranch, 
  ShieldCheck, 
  FileSearch, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { 
  setActiveWorkspaceTab, 
  addToast, 
  setAiAnalyzing 
} from '../../features/ui/uiSlice';
import { runAnalysis, setRcaMethodology } from '../../features/investigations/investigationSlice';

export default function AIAssistantPanel() {
  const dispatch = useDispatch();
  const current = useSelector((state) => state.investigations.currentInvestigation);
  const groqModel = useSelector((state) => state.investigations.systemHealth.groqModel);
  const isAiAnalyzing = useSelector((state) => state.ui.isAiAnalyzing);

  const hypothesis = current?.potential_root_causes?.[0];

  const runAiNode = async (nodeName, targetTab, stopAfter, rcaMethod) => {
    dispatch(setAiAnalyzing(true));
    if (rcaMethod) {
      dispatch(setRcaMethodology(rcaMethod));
    }
    dispatch(
      addToast({
        type: 'info',
        title: nodeName,
        message: 'Sending the investigation to the Groq LangGraph workflow.',
      })
    );
    const result = await dispatch(runAnalysis({
      stop_after: stopAfter,
      methodology: rcaMethod,
    }));
    dispatch(setAiAnalyzing(false));
    if (runAnalysis.fulfilled.match(result)) {
      dispatch(setActiveWorkspaceTab(targetTab));
      dispatch(
        addToast({
          type: 'success',
          title: 'AI suggestions are ready for review',
          message: result.payload.notice || 'A qualified investigator must review these suggestions before confirming a root cause.',
        })
      );
    } else {
      dispatch(
        addToast({
          type: 'error',
          title: 'AI analysis was not completed',
          message: result.payload?.message || 'The AI workflow did not return a result.',
        })
      );
    }
  };

  return (
    <aside className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden shrink-0">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-teal-500 rounded-lg text-slate-950">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight">AIVOA AI Copilot</div>
              <div className="text-[10px] text-teal-400 font-mono">LangGraph + Groq LLM</div>
            </div>
          </div>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
        {/* Compliance Guardrail Warning */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 leading-relaxed text-[11px]">
          <div className="font-bold flex items-center space-x-1.5 text-amber-800 mb-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Human-in-the-Loop Principle</span>
          </div>
          AI findings are suggestions. A qualified human quality professional must evaluate and formally confirm conclusions.
        </div>

        {/* AI Processing Status */}
        {isAiAnalyzing ? (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-center space-y-2 animate-pulse">
            <Sparkles className="w-6 h-6 text-teal-600 mx-auto animate-spin" />
            <div className="font-bold text-teal-900 text-xs">Executing LangGraph AI Workflow...</div>
            <p className="text-[11px] text-teal-700">Evaluating SCADA boundaries & CMMS maintenance logs</p>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>Source text</span>
              <span className="text-teal-700 font-bold">
                {(current?.source_input?.rawContent || current?.incident_description || '').trim().length >= 30 ? 'Ready' : 'Needed'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className={`bg-teal-500 h-1.5 rounded-full ${(current?.source_input?.rawContent || current?.incident_description || '').trim().length >= 30 ? 'w-full' : 'w-1/4'}`}></div>
            </div>
            <div className="text-[10px] text-slate-500">
              Model: <span className="font-mono text-slate-700">{groqModel || 'openai/gpt-oss-120b'}</span>
            </div>
          </div>
        )}

        {/* Workflow Action Triggers */}
        <div className="space-y-2">
          <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
            AI Investigation Actions
          </div>

          <button
            onClick={() => runAiNode('5 Whys analysis', 'rca', 'five_whys', '5_whys')}
            disabled={isAiAnalyzing}
            className="w-full p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500 rounded-lg text-left transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <div>
                <div className="font-bold text-slate-900 text-xs">Execute 5 Whys Chain</div>
                <div className="text-[10px] text-slate-400">Stepwise causal interrogation</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </button>

          <button
            onClick={() => runAiNode('Fishbone analysis', 'rca', 'fishbone', 'fishbone')}
            disabled={isAiAnalyzing}
            className="w-full p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500 rounded-lg text-left transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-indigo-600" />
              <div>
                <div className="font-bold text-slate-900 text-xs">Generate 6M Fishbone</div>
                <div className="text-[10px] text-slate-400">Categorize by Machine, Method, etc.</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </button>

          <button
            onClick={() => runAiNode('Potential root causes', 'rootcauses', 'root_causes')}
            disabled={isAiAnalyzing}
            className="w-full p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500 rounded-lg text-left transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <div>
                <div className="font-bold text-slate-900 text-xs">Evaluate Root Causes</div>
                <div className="text-[10px] text-slate-400">Hypotheses vs evidence-supported</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </button>

          <button
            onClick={() => runAiNode('Missing evidence', 'rootcauses', 'missing_evidence')}
            disabled={isAiAnalyzing}
            className="w-full p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500 rounded-lg text-left transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <FileSearch className="w-4 h-4 text-amber-600" />
              <div>
                <div className="font-bold text-slate-900 text-xs">Detect Missing Evidence</div>
                <div className="text-[10px] text-slate-400">Identify unverified GMP logs</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </button>

          <button
            onClick={() => runAiNode('CAPA recommendations', 'capa', 'capa')}
            disabled={isAiAnalyzing}
            className="w-full p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500 rounded-lg text-left transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="font-bold text-slate-900 text-xs">Synthesize CAPA Plan</div>
                <div className="text-[10px] text-slate-400">Corrective & Preventive actions</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </button>
        </div>

        {/* AI Key Insights Summary */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Latest AI hypothesis</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
            {hypothesis?.description || 'No AI hypothesis yet. Run an analysis action after supplying incident text.'}
          </p>
          <div className="text-[10px] text-slate-500">
            {hypothesis
              ? `${hypothesis.evidence_strength || 'AI Hypothesis'} · ${hypothesis.confidence || 'Unrated'} confidence. Not a confirmed root cause.`
              : 'Suggestions appear here after Groq returns a result.'}
          </div>
        </div>
      </div>
    </aside>
  );
}

