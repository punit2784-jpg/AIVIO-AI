import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FileUp, 
  FileText, 
  Mail, 
  UploadCloud, 
  AlertCircle, 
  Sparkles, 
  RotateCcw,
  CheckCircle,
  FlaskConical
} from 'lucide-react';
import { 
  updateSourceInput, 
  loadSampleInvestigation, 
  initializeNewInvestigation,
  runAnalysis
} from '../../features/investigations/investigationSlice';
import { addToast, setAiAnalyzing } from '../../features/ui/uiSlice';
import api, { apiErrorMessage } from '../../services/api';
import { store } from '../../app/store';

export default function DocumentInputPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentInvestigation = useSelector((state) => state.investigations.currentInvestigation);
  
  const [activeTab, setActiveTab] = useState(currentInvestigation?.source_input?.type || 'text');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textInput, setTextInput] = useState(currentInvestigation?.source_input?.rawContent || '');
  const [inputError, setInputError] = useState('');

  // Handle PDF file selection
  const handleFileChange = (file) => {
    setInputError('');
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setInputError('Invalid file type: Please upload a standard investigation PDF document.');
      return;
    }

    const maxSizeMB = 25;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setInputError(`File size exceeds the ${maxSizeMB}MB regulatory upload limit.`);
      return;
    }

    setSelectedFile(file);
    dispatch(
      updateSourceInput({
        type: 'pdf',
        fileName: file.name,
        rawContent: `[Attached PDF Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`,
      })
    );
    dispatch(
      addToast({
        type: 'success',
        title: 'PDF Document Attached',
        message: `${file.name} ready for PyMuPDF text extraction.`,
      })
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setTextInput(val);
    setInputError('');
    dispatch(
      updateSourceInput({
        type: activeTab,
        fileName: '',
        rawContent: val,
      })
    );
  };

  // Load Section 14 Sample
  const handleLoadSample = () => {
    dispatch(loadSampleInvestigation());
    setTextInput(
      'Incident title: Unexpected Temperature Excursion During API Manufacturing\nDepartment: Production\nProduct: API Batch – API-2026-001\n\nIncident description:\nDuring the manufacturing process, the reactor temperature exceeded the established operating limit. The operator observed the abnormal temperature reading and immediately informed the production supervisor. The batch was placed on hold pending investigation.\n\nInitial information:\n- Reactor temperature exceeded the operating limit.\n- Batch was placed on hold.\n- Operator informed the supervisor.\n- Cooling system performance is suspected.\n- Equipment maintenance history is not yet available.'
    );
    dispatch(
      addToast({
        type: 'info',
        title: 'Section 14 Scenario Loaded',
        message: 'Active Pharmaceutical Ingredient Batch API-2026-001 scenario populated.',
      })
    );
  };

  const handleAnalyze = async () => {
    if (activeTab === 'pdf' && !selectedFile) {
      setInputError('Select an investigation PDF before starting extraction.');
      return;
    }
    if (activeTab !== 'pdf' && textInput.trim().length < 30) {
      setInputError('Paste at least 30 characters of incident or email text so extraction has enough context.');
      return;
    }

    if (!currentInvestigation) {
      dispatch(initializeNewInvestigation());
    }

    dispatch(setAiAnalyzing(true));
    dispatch(
      addToast({
        type: 'info',
        title: 'Document extraction started',
        message: 'The backend will extract incident fields with Groq. Missing facts stay Not Provided.',
      })
    );

    try {
      let content = textInput.trim();
      let sourceType = activeTab === 'email' ? 'email' : 'text';
      if (activeTab === 'pdf') {
        const form = new FormData();
        form.append('file', selectedFile);
        const parsed = await api.post('/documents/parse', form, {
          transformRequest: [(data, headers) => {
            delete headers['Content-Type'];
            return data;
          }],
        });
        content = parsed.data.text;
        sourceType = 'pdf';
        dispatch(
          updateSourceInput({
            type: 'pdf',
            fileName: parsed.data.filename,
            rawContent: content,
            filePath: parsed.data.stored_path,
          })
        );
      } else {
        dispatch(updateSourceInput({ type: sourceType, fileName: '', rawContent: content }));
      }

      const result = await dispatch(runAnalysis({ stop_after: 'extract', content, methodology: '5_whys' }));
      if (!runAnalysis.fulfilled.match(result)) {
        dispatch(
          addToast({
            type: 'error',
            title: 'Extraction was not completed',
            message: result.payload?.message || 'The AI service did not return incident fields.',
          })
        );
        return;
      }

      const current = store.getState().investigations.currentInvestigation;
      dispatch(
        addToast({
          type: 'success',
          title: 'Incident fields extracted',
          message: result.payload.notice || 'Review and edit the form before saving.',
        })
      );
      navigate(`/investigations/${current?.investigation_code || current?.id || 'draft'}/workspace`);
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Document processing failed',
          message: apiErrorMessage(err),
        })
      );
    } finally {
      dispatch(setAiAnalyzing(false));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header with Quick Actions */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Step 1 of Investigation</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">Document Intake & Parsing</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Provide Investigation Documentation</h2>
          <p className="text-xs text-slate-500">
            Upload manufacturer deviation report, paste supervisor observations, or input incident email threads.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleLoadSample}
            type="button"
            className="inline-flex items-center space-x-1.5 text-xs bg-teal-50 border border-teal-300 text-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-100 font-medium transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
            <span>Load Section 14 Scenario</span>
          </button>
          <button
            onClick={() => {
              dispatch(initializeNewInvestigation());
              setTextInput('');
              setSelectedFile(null);
            }}
            type="button"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-6 bg-white">
        <button
          onClick={() => { setActiveTab('pdf'); setInputError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'pdf'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileUp className="w-4 h-4" />
          <span>Upload PDF Document</span>
        </button>

        <button
          onClick={() => { setActiveTab('text'); setInputError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'text'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Incident Description</span>
        </button>

        <button
          onClick={() => { setActiveTab('email'); setInputError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'email'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Pasted Email Thread</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {activeTab === 'pdf' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragOver ? 'border-teal-500 bg-teal-50/50' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="w-12 h-12 text-teal-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Drag & Drop Investigation PDF Document'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Supports official deviation reports, equipment logs, and QA batch records up to 25MB
              </p>

              <div className="mt-4">
                <label className="cursor-pointer inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
                  <span>Browse PDF Files</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4 inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>File Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>PyMuPDF backend parser enabled for high-fidelity table and text extraction.</span>
              <span>Regulatory PDF Size Limit: 25 MB</span>
            </div>
          </div>
        )}

        {(activeTab === 'text' || activeTab === 'email') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {activeTab === 'text' ? 'Incident Description / Deviation Notes' : 'Email Thread / Quality Communication'}
              </label>
              <span className="text-[11px] text-slate-400">{textInput.length} characters</span>
            </div>
            <textarea
              rows={8}
              value={textInput}
              onChange={handleTextChange}
              placeholder={
                activeTab === 'text'
                  ? 'Paste incident details, observed reactor readings, timeline, and immediate actions taken...'
                  : 'From: QA Operations <qa@pharma.com>\nSubject: Temperature excursion during API Batch synthesis...'
              }
              className="w-full text-xs font-mono p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white leading-relaxed text-slate-800"
            />
            <p className="text-[11px] text-slate-400">
              The AI analyzer extracts Title, Date, Batch No., Equipment, Observations, Immediate Actions, and Contributing Factors.
            </p>
          </div>
        )}

        {/* Validation Error Banner */}
        {inputError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Input Validation Notice</div>
              <div>{inputError}</div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            type="button"
            className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>Process Document & Launch RCA Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}

