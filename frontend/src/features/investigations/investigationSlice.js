import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { apiErrorMessage } from '../../services/api';

// Section 14 Fictional Reference Investigation for API Manufacturing
export const SECTION_14_SAMPLE = {
  id: 'RCA-2026-001',
  investigation_code: 'RCA-2026-001',
  incident_title: 'Unexpected Temperature Excursion During API Manufacturing',
  incident_description:
    'During the synthesis phase of Active Pharmaceutical Ingredient Batch API-2026-001 in Reactor R-101, the reaction mixture temperature exceeded the specified upper limit of 65°C, reaching a peak of 74.2°C for 28 minutes. The operator observed the abnormal high-temperature alarm on SCADA and immediately notified the production supervisor. Containment actions were executed immediately by engaging secondary cooling water and placing the batch on formal Quality Hold pending Root Cause Analysis.',
  incident_date: '2026-11-06T10:15:00',
  department: 'Production',
  product_name: 'API Active Substance – Batch API-2026-001',
  batch_number: 'API-2026-001',
  equipment: 'Reactor R-101 (Jacketed Vessel)',
  immediate_actions:
    '1. Secondary cooling water engaged manually.\n2. Batch API-2026-001 placed on Quality Quarantine Hold.\n3. Production supervisor and QA Deviation team alerted.\n4. Reaction vessel temperature stabilized at 62°C.',
  investigation_status: 'Open', // Open, Under Review, Completed
  severity: 'Major Deviation', // Critical, Major Deviation, Minor Deviation
  methodology: '5_whys', // 5_whys or fishbone
  five_whys: [
    {
      id: 1,
      why_question: 'Why did the reactor temperature exceed the 65°C operating limit?',
      answer: 'The jacket cooling system was unable to remove exothermic reaction heat sufficiently.',
      evidence: 'SCADA temperature and cooling jacket flow log (Log #SCADA-2026-11-06)',
      evidence_needed: '',
    },
    {
      id: 2,
      why_question: 'Why was the jacket cooling system unable to remove the heat?',
      answer: 'Cooling water flow through valve CV-102 dropped by 45% during peak exotherm.',
      evidence: 'Cooling jacket differential pressure sensor DP-102',
      evidence_needed: '',
    },
    {
      id: 3,
      why_question: 'Why did the cooling water flow drop through valve CV-102?',
      answer: 'Actuator diaphragm on CV-102 had partial pneumatic pressure loss and sluggish response.',
      evidence: 'Initial mechanical inspection report from maintenance engineer',
      evidence_needed: 'Pneumatic line pressure verification logs',
    },
    {
      id: 4,
      why_question: 'Why did the actuator diaphragm suffer pressure loss?',
      answer: 'Elastomer seal had degraded past operating tolerance and air line filter was partially clogged.',
      evidence: 'Maintenance physical inspection (preliminary)',
      evidence_needed: 'Preventive maintenance history and seal replacement interval logs',
    },
    {
      id: 5,
      why_question: 'Why was the degraded seal and clogged filter not replaced prior to batch execution?',
      answer: 'Preventive maintenance cycle for Reactor R-101 was overdue by 18 days due to high production scheduling demands.',
      evidence: 'CMMS Maintenance Work Order Schedule (WO-R101-PM-Q3)',
      evidence_needed: 'Maintenance deviation approval or deferral documentation',
    },
  ],
  fishbone: {
    manpower: [
      { id: 'mp-1', cause: 'Operator correctly identified alarm but manual override was delayed by 4 minutes', evidence: 'Control room log' },
      { id: 'mp-2', cause: 'Shift handover did not highlight sluggish cooling valve response during previous cycle', evidence: 'Shift logbook' },
    ],
    machine: [
      { id: 'mc-1', cause: 'Control valve CV-102 actuator diaphragm degraded causing flow restriction', evidence: 'Mechanical inspection' },
      { id: 'mc-2', cause: 'Secondary backup chilled water pump did not auto-start on high temp setpoint', evidence: 'PLC logic review' },
    ],
    method: [
      { id: 'me-1', cause: 'SOP-PROD-240 lacking explicit threshold for pre-batch cooling valve stroke testing', evidence: 'SOP review' },
      { id: 'me-2', cause: 'Preventive maintenance deferral procedure was not followed for scheduled downtime', evidence: 'QMS procedure gap' },
    ],
    material: [
      { id: 'ma-1', cause: 'Raw material reagent lot 8824 demonstrated standard exotherm profile within CoA specs', evidence: 'CoA Verification' },
      { id: 'ma-2', cause: 'Cooling water quality met conductivity and particulate limits', evidence: 'Utilities testing' },
    ],
    measurement: [
      { id: 'mm-1', cause: 'Temperature transmitter TT-101 calibration current and verified accurate (±0.2°C)', evidence: 'Calibration Certificate CAL-2026-08' },
      { id: 'mm-2', cause: 'Pressure gauge PG-104 on air line had sticky needle concealing low pneumatic pressure', evidence: 'Visual inspection' },
    ],
    environment: [
      { id: 'en-1', cause: 'Cleanroom ambient temperature was 21.5°C (within 20–25°C specification)', evidence: 'BMS environmental log' },
    ],
  },
  potential_root_causes: [
    {
      id: 'prc-1',
      description: 'Overdue preventive maintenance on cooling control valve CV-102 leading to degraded pneumatic actuator and restricted heat removal',
      reasoning: 'Cooling flow restriction coincided exactly with reaction exotherm. Physical inspection revealed degraded elastomer seal and scheduled PM was 18 days overdue.',
      supporting_evidence: 'SCADA flow logs, Differential Pressure sensor DP-102, CMMS PM schedule WO-R101-PM-Q3',
      confidence: 'High',
      evidence_strength: 'Evidence-Supported', // 'AI Hypothesis', 'Evidence-Supported', 'Human-Confirmed'
      is_confirmed: false,
    },
    {
      id: 'prc-2',
      description: 'Chilled water supply distribution pressure fluctuation from central utilities',
      reasoning: 'Possible utility plant supply dip during concurrent multi-reactor batch operations.',
      supporting_evidence: 'Not supported: Utilities header pressure logs showed stable 4.2 bar.',
      confidence: 'Low',
      evidence_strength: 'AI Hypothesis',
      is_confirmed: false,
    },
  ],
  confirmed_root_cause: '',
  investigation_conclusion: '',
  missing_evidence: [
    { id: 'me-1', item: 'Equipment Maintenance History for Reactor R-101 and Valve CV-102', status: 'Pending Review', required: true, category: 'Maintenance' },
    { id: 'me-2', item: 'Calibration certificate for pneumatic air supply gauge PG-104', status: 'Requested', required: true, category: 'Calibration' },
    { id: 'me-3', item: 'Shift handover logbook for prior 3 production runs on Reactor R-101', status: 'Obtained', required: false, category: 'Operations' },
    { id: 'me-4', item: 'Quality Risk Assessment for batch API-2026-001 impurity profile impact', status: 'In Progress', required: true, category: 'Quality QA' },
    { id: 'me-5', item: 'Preventive maintenance deferral authorization documentation', status: 'Pending Review', required: true, category: 'Compliance' },
  ],
  capa_actions: [
    {
      id: 'capa-1',
      action_type: 'Corrective',
      action_description: 'Rebuild actuator on cooling valve CV-102 with replacement diaphragm kit, clean pneumatic air filters, and perform 5-point stroke validation.',
      justification: 'Directly resolves the physical flow restriction in Reactor R-101 cooling loop.',
      responsible_role: 'Engineering & Maintenance Lead',
      priority: 'Critical',
      effectiveness_verification: 'Execute 3 dummy water runs verifying temperature response within ±1°C of setpoint.',
      status: 'Proposed',
    },
    {
      id: 'capa-2',
      action_type: 'Corrective',
      action_description: 'Subject API Batch API-2026-001 to HPLC impurity profiling and stability testing to evaluate thermal degradation products.',
      justification: 'Ensure product safety and determine batch disposition (release or reject).',
      responsible_role: 'Quality Control Analytical Manager',
      priority: 'High',
      effectiveness_verification: 'CoA analytical data comparison against ICH Q3A degradation threshold limits.',
      status: 'Proposed',
    },
    {
      id: 'capa-3',
      action_type: 'Preventive',
      action_description: 'Implement a hard CMMS production lock preventing batch initiation when critical reactor preventive maintenance tasks are overdue (>0 days).',
      justification: 'Prevents operational postponement of GMP-critical equipment servicing.',
      responsible_role: 'Quality Assurance & Manufacturing Operations Director',
      priority: 'Critical',
      effectiveness_verification: 'Audit 100% of batch initiation logs over the next 6 months for zero overdue PM overrides.',
      status: 'Proposed',
    },
    {
      id: 'capa-4',
      action_type: 'Preventive',
      action_description: 'Update SOP-PROD-240 to mandate pre-batch automated cooling valve stroke and response time verification before charging exothermic reactants.',
      justification: 'Provides early warning of valve sluggishness prior to chemical exotherm.',
      responsible_role: 'Production Technical Services Lead',
      priority: 'Medium',
      effectiveness_verification: 'Check 20 batch records for completion of pre-batch valve check sign-offs.',
      status: 'Proposed',
    },
  ],
  source_input: {
    type: 'text', // 'pdf', 'text', 'email'
    fileName: '',
    rawContent:
      'Incident title: Unexpected Temperature Excursion During API Manufacturing\nDepartment: Production\nProduct: API Batch – API-2026-001\n\nIncident description:\nDuring the manufacturing process, the reactor temperature exceeded the established operating limit. The operator observed the abnormal temperature reading and immediately informed the production supervisor. The batch was placed on hold pending investigation.\n\nInitial information:\n- Reactor temperature exceeded the operating limit.\n- Batch was placed on hold.\n- Operator informed the supervisor.\n- Cooling system performance is suspected.\n- Equipment maintenance history is not yet available.',
  },
};

export const fetchHealthStatus = createAsyncThunk(
  'investigations/fetchHealthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { status: 'offline', message: err.message });
    }
  }
);

export const fetchInvestigations = createAsyncThunk(
  'investigations/fetchInvestigations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/investigations');
      return response.data;
    } catch (err) {
      return rejectWithValue({ message: apiErrorMessage(err) });
    }
  }
);

export const fetchInvestigationById = createAsyncThunk(
  'investigations/fetchInvestigationById',
  async (investigationRef, { rejectWithValue }) => {
    try {
      const response = await api.get(`/investigations/${investigationRef}`);
      return response.data;
    } catch (err) {
      return rejectWithValue({ message: apiErrorMessage(err) });
    }
  }
);

export const saveInvestigation = createAsyncThunk(
  'investigations/saveInvestigation',
  async (_, { getState, rejectWithValue }) => {
    const current = getState().investigations.currentInvestigation;
    if (!current?.incident_title?.trim()) {
      return rejectWithValue({ message: 'Enter an incident title before saving.' });
    }
    const numericId = typeof current.id === 'number' || (typeof current.id === 'string' && /^\d+$/.test(current.id));
    try {
      const response = numericId
        ? await api.put(`/investigations/${current.id}`, current)
        : await api.post('/investigations', current);
      return response.data;
    } catch (err) {
      return rejectWithValue({ message: apiErrorMessage(err) });
    }
  }
);

export const runAnalysis = createAsyncThunk(
  'investigations/runAnalysis',
  async ({ stop_after, methodology, content }, { getState, rejectWithValue }) => {
    const current = getState().investigations.currentInvestigation || {};
    const source = content ?? current.source_input?.rawContent ?? current.incident_description ?? '';
    const trimmed = String(source || '').trim();
    if (trimmed.length < 20 || trimmed.startsWith('[Attached PDF')) {
      return rejectWithValue({
        message: 'Add incident text, email content, or a PDF with extractable text before running AI analysis.',
      });
    }
    const paths = {
      extract: '/ai/extract',
      five_whys: '/ai/five-whys',
      fishbone: '/ai/fishbone',
      root_causes: '/ai/root-causes',
      missing_evidence: '/ai/missing-evidence',
      capa: '/ai/capa',
      full: '/ai/analyze',
    };
    try {
      const response = await api.post(paths[stop_after] || '/ai/analyze', {
        content: trimmed,
        source_type: current.source_input?.type || 'text',
        methodology: methodology || current.methodology || '5_whys',
        stop_after,
        incident: {
          incident_title: current.incident_title,
          incident_description: current.incident_description,
          incident_date: current.incident_date,
          department: current.department,
          product_name: current.product_name,
          batch_number: current.batch_number,
          equipment: current.equipment,
          immediate_actions: current.immediate_actions,
          manufacturing_process: current.manufacturing_process,
          observed_abnormality: current.observed_abnormality,
          investigation_observations: current.investigation_observations,
        },
        five_whys: current.five_whys || [],
        fishbone: current.fishbone || {},
        potential_root_causes: current.potential_root_causes || [],
      });
      return response.data;
    } catch (err) {
      return rejectWithValue({ message: apiErrorMessage(err) });
    }
  }
);

function applyAiResult(current, data) {
  const sections = data.updated_sections || [];
  if (sections.includes('incident') && data.incident) {
    const incident = data.incident;
    ['incident_title', 'incident_description', 'department', 'product_name', 'batch_number', 'equipment', 'immediate_actions', 'manufacturing_process', 'observed_abnormality', 'investigation_observations'].forEach((field) => {
      const value = incident[field];
      if (value && value !== 'Not Provided') {
        current[field] = value;
      } else if (!current[field]) {
        current[field] = value && value !== 'Not Provided' ? value : current[field] || '';
      }
    });
    if (incident.incident_date) {
      current.incident_date = String(incident.incident_date).slice(0, 16);
    }
    if (Array.isArray(incident.contributing_factors)) {
      current.contributing_factors = incident.contributing_factors;
    }
  }
  if (sections.includes('five_whys') && Array.isArray(data.five_whys)) current.five_whys = data.five_whys;
  if (sections.includes('fishbone') && data.fishbone) current.fishbone = data.fishbone;
  if (sections.includes('potential_root_causes')) current.potential_root_causes = data.potential_root_causes || [];
  if (sections.includes('missing_evidence')) current.missing_evidence = data.missing_evidence || [];
  if (sections.includes('capa_actions')) current.capa_actions = data.capa_actions || [];
  if (data.methodology && (sections.includes('five_whys') || sections.includes('fishbone') || sections.includes('incident'))) {
    current.methodology = data.methodology;
  }
}

function upsertInvestigation(state, record) {
  const index = state.items.findIndex(
    (item) => item.id === record.id || item.investigation_code === record.investigation_code
  );
  if (index >= 0) {
    state.items[index] = record;
  } else {
    state.items.unshift(record);
  }
}

const initialState = {
  items: [],
  currentInvestigation: null,
  filterStatus: 'all', // 'all', 'Open', 'Under Review', 'Completed'
  searchQuery: '',
  loading: false,
  saving: false,
  error: null,
  systemHealth: {
    status: 'checking',
    api: 'checking',
    database: 'unknown',
    groqConfigured: false,
    groqModel: '',
    version: '1.0.0',
    timestamp: null,
  },
};

const investigationSlice = createSlice({
  name: 'investigations',
  initialState,
  reducers: {
    // Select an investigation to edit
    selectInvestigation: (state, action) => {
      const key = String(action.payload);
      const found = state.items.find(
        (item) => String(item.id) === key || item.investigation_code === action.payload || item.investigation_code === key
      );
      if (found) {
        state.currentInvestigation = { ...found };
      }
    },
    // Reset/Initialize a blank investigation
    initializeNewInvestigation: (state) => {
      const newId = `RCA-${new Date().getFullYear()}-${String(state.items.length + 1).padStart(3, '0')}`;
      state.currentInvestigation = {
        id: newId,
        investigation_code: newId,
        incident_title: '',
        incident_description: '',
        incident_date: new Date().toISOString().slice(0, 16),
        department: 'Production',
        product_name: '',
        batch_number: '',
        equipment: '',
        immediate_actions: '',
        investigation_status: 'Open',
        severity: 'Major Deviation',
        methodology: '5_whys',
        five_whys: [
          { id: 1, why_question: 'Why did the deviation occur?', answer: '', evidence: '', evidence_needed: '' },
        ],
        fishbone: {
          manpower: [],
          machine: [],
          method: [],
          material: [],
          measurement: [],
          environment: [],
        },
        potential_root_causes: [],
        confirmed_root_cause: '',
        investigation_conclusion: '',
        missing_evidence: [],
        capa_actions: [],
        source_input: {
          type: 'text',
          fileName: '',
          rawContent: '',
        },
      };
    },
    // Load Section 14 Sample directly
    loadSampleInvestigation: (state) => {
      state.currentInvestigation = { ...SECTION_14_SAMPLE };
    },
    // Update specific field in current investigation
    updateCurrentField: (state, action) => {
      const { field, value } = action.payload;
      if (state.currentInvestigation) {
        state.currentInvestigation[field] = value;
      }
    },
    // Update Source Document Input
    updateSourceInput: (state, action) => {
      if (state.currentInvestigation) {
        state.currentInvestigation.source_input = {
          ...state.currentInvestigation.source_input,
          ...action.payload,
        };
      }
    },
    // Set RCA Methodology ('5_whys' or 'fishbone')
    setRcaMethodology: (state, action) => {
      if (state.currentInvestigation) {
        state.currentInvestigation.methodology = action.payload;
      }
    },
    // 5 Whys actions
    updateWhyStep: (state, action) => {
      const { id, field, value } = action.payload;
      if (state.currentInvestigation?.five_whys) {
        const step = state.currentInvestigation.five_whys.find((s) => s.id === id);
        if (step) {
          step[field] = value;
        }
      }
    },
    addWhyStep: (state) => {
      if (state.currentInvestigation?.five_whys) {
        const currentWhys = state.currentInvestigation.five_whys;
        const nextId = currentWhys.length > 0 ? Math.max(...currentWhys.map((s) => s.id)) + 1 : 1;
        currentWhys.push({
          id: nextId,
          why_question: `Why #${nextId}: `,
          answer: '',
          evidence: '',
          evidence_needed: '',
        });
      }
    },
    removeWhyStep: (state, action) => {
      if (state.currentInvestigation?.five_whys) {
        state.currentInvestigation.five_whys = state.currentInvestigation.five_whys.filter(
          (s) => s.id !== action.payload
        );
      }
    },
    // Fishbone actions
    addFishboneCause: (state, action) => {
      const { category, cause, evidence } = action.payload;
      if (state.currentInvestigation?.fishbone?.[category]) {
        state.currentInvestigation.fishbone[category].push({
          id: `fb-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
          cause,
          evidence: evidence || '',
        });
      }
    },
    removeFishboneCause: (state, action) => {
      const { category, id } = action.payload;
      if (state.currentInvestigation?.fishbone?.[category]) {
        state.currentInvestigation.fishbone[category] = state.currentInvestigation.fishbone[category].filter(
          (c) => c.id !== id
        );
      }
    },
    updateFishboneCause: (state, action) => {
      const { category, id, cause, evidence } = action.payload;
      if (state.currentInvestigation?.fishbone?.[category]) {
        const item = state.currentInvestigation.fishbone[category].find((c) => c.id === id);
        if (item) {
          if (cause !== undefined) item.cause = cause;
          if (evidence !== undefined) item.evidence = evidence;
        }
      }
    },
    // Root Causes
    addPotentialRootCause: (state, action) => {
      if (state.currentInvestigation?.potential_root_causes) {
        state.currentInvestigation.potential_root_causes.push({
          id: `prc-${Date.now().toString(36)}`,
          description: action.payload.description || '',
          reasoning: action.payload.reasoning || '',
          supporting_evidence: action.payload.supporting_evidence || '',
          confidence: action.payload.confidence || 'Medium',
          evidence_strength: action.payload.evidence_strength || 'AI Hypothesis',
          is_confirmed: false,
        });
      }
    },
    confirmRootCause: (state, action) => {
      const { id } = action.payload;
      if (state.currentInvestigation?.potential_root_causes) {
        state.currentInvestigation.potential_root_causes.forEach((prc) => {
          if (prc.id === id) {
            prc.is_confirmed = true;
            prc.evidence_strength = 'Human-Confirmed';
            state.currentInvestigation.confirmed_root_cause = prc.description;
          } else {
            prc.is_confirmed = false;
          }
        });
      }
    },
    updatePotentialRootCause: (state, action) => {
      const { id, updates } = action.payload;
      if (state.currentInvestigation?.potential_root_causes) {
        const item = state.currentInvestigation.potential_root_causes.find((c) => c.id === id);
        if (item) {
          Object.assign(item, updates);
        }
      }
    },
    removePotentialRootCause: (state, action) => {
      if (state.currentInvestigation?.potential_root_causes) {
        state.currentInvestigation.potential_root_causes = state.currentInvestigation.potential_root_causes.filter(
          (c) => c.id !== action.payload
        );
      }
    },
    // Missing Evidence actions
    addMissingEvidence: (state, action) => {
      if (state.currentInvestigation?.missing_evidence) {
        state.currentInvestigation.missing_evidence.push({
          id: `me-${Date.now().toString(36)}`,
          item: action.payload.item,
          status: action.payload.status || 'Pending Review',
          required: action.payload.required ?? true,
          category: action.payload.category || 'Documentation',
        });
      }
    },
    updateEvidenceStatus: (state, action) => {
      const { id, status } = action.payload;
      if (state.currentInvestigation?.missing_evidence) {
        const item = state.currentInvestigation.missing_evidence.find((e) => e.id === id);
        if (item) {
          item.status = status;
        }
      }
    },
    removeMissingEvidence: (state, action) => {
      if (state.currentInvestigation?.missing_evidence) {
        state.currentInvestigation.missing_evidence = state.currentInvestigation.missing_evidence.filter(
          (e) => e.id !== action.payload
        );
      }
    },
    // CAPA actions
    addCapaAction: (state, action) => {
      if (state.currentInvestigation?.capa_actions) {
        state.currentInvestigation.capa_actions.push({
          id: `capa-${Date.now().toString(36)}`,
          action_type: action.payload.action_type || 'Corrective',
          action_description: action.payload.action_description || '',
          justification: action.payload.justification || '',
          responsible_role: action.payload.responsible_role || 'Quality Assurance',
          priority: action.payload.priority || 'Medium',
          effectiveness_verification: action.payload.effectiveness_verification || '',
          status: 'Proposed',
        });
      }
    },
    updateCapaAction: (state, action) => {
      const { id, updates } = action.payload;
      if (state.currentInvestigation?.capa_actions) {
        const item = state.currentInvestigation.capa_actions.find((c) => c.id === id);
        if (item) {
          Object.assign(item, updates);
        }
      }
    },
    removeCapaAction: (state, action) => {
      if (state.currentInvestigation?.capa_actions) {
        state.currentInvestigation.capa_actions = state.currentInvestigation.capa_actions.filter(
          (c) => c.id !== action.payload
        );
      }
    },
    // Save current investigation to local item list
    saveCurrentInvestigationLocally: (state) => {
      if (state.currentInvestigation) {
        const existingIndex = state.items.findIndex(
          (i) => i.id === state.currentInvestigation.id || i.investigation_code === state.currentInvestigation.investigation_code
        );
        if (existingIndex >= 0) {
          state.items[existingIndex] = { ...state.currentInvestigation };
        } else {
          state.items.unshift({ ...state.currentInvestigation });
        }
      }
    },
    // Filters & Search
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthStatus.pending, (state) => {
        state.systemHealth.status = 'checking';
      })
      .addCase(fetchHealthStatus.fulfilled, (state, action) => {
        state.systemHealth = {
          status: action.payload.status || 'healthy',
          api: 'online',
          database: action.payload.database?.status || 'disconnected',
          groqConfigured: Boolean(action.payload.groq_configured),
          groqModel: action.payload.groq_model || '',
          version: action.payload.version || '1.0.0',
          timestamp: action.payload.timestamp || new Date().toISOString(),
        };
      })
      .addCase(fetchHealthStatus.rejected, (state) => {
        state.systemHealth = {
          status: 'offline',
          api: 'offline',
          database: 'disconnected',
          groqConfigured: false,
          groqModel: '',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        };
      })
      .addCase(fetchInvestigations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestigations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInvestigations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch investigations';
      })
      .addCase(fetchInvestigationById.fulfilled, (state, action) => {
        state.currentInvestigation = action.payload;
        upsertInvestigation(state, action.payload);
        state.error = null;
      })
      .addCase(saveInvestigation.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveInvestigation.fulfilled, (state, action) => {
        state.saving = false;
        state.currentInvestigation = action.payload;
        upsertInvestigation(state, action.payload);
      })
      .addCase(saveInvestigation.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload?.message || 'Save failed';
      })
      .addCase(runAnalysis.fulfilled, (state, action) => {
        if (!state.currentInvestigation) return;
        applyAiResult(state.currentInvestigation, action.payload);
        state.error = null;
      })
      .addCase(runAnalysis.rejected, (state, action) => {
        state.error = action.payload?.message || 'AI analysis failed';
      });
  },
});

export const {
  selectInvestigation,
  initializeNewInvestigation,
  loadSampleInvestigation,
  updateCurrentField,
  updateSourceInput,
  setRcaMethodology,
  updateWhyStep,
  addWhyStep,
  removeWhyStep,
  addFishboneCause,
  removeFishboneCause,
  updateFishboneCause,
  addPotentialRootCause,
  confirmRootCause,
  updatePotentialRootCause,
  removePotentialRootCause,
  addMissingEvidence,
  updateEvidenceStatus,
  removeMissingEvidence,
  addCapaAction,
  updateCapaAction,
  removeCapaAction,
  saveCurrentInvestigationLocally,
  setFilterStatus,
  setSearchQuery,
  clearError,
} = investigationSlice.actions;

export default investigationSlice.reducer;
