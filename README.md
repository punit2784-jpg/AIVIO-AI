# AIVOA.AI – AI-Powered Root Cause Analysis (RCA) Platform

> **Project Type:** Pharmaceutical Quality Investigation & Root Cause Analysis Application  
> **Environment:** Windows 11 + Google Antigravity  
> **Current Status:** Phases 1–2 were already in the project. Phases 3–8 are now implemented in this same codebase. Live PostgreSQL persistence and Groq calls require the values in `.env`.

---

## 1. Project Overview & Mandatory Technology Stack

The platform is designed to assist pharmaceutical quality assurance and manufacturing professionals in investigating deviations, organizing evidence, performing structured RCA (5 Whys and Fishbone 6M), highlighting evidence gaps, and formulating Corrective and Preventive Actions (CAPA).

### Frontend (Phase 2 Deliverables)
- **React 19** with **Vite 5**
- **Redux Toolkit** (`@reduxjs/toolkit`, `react-redux`) for global state management:
  - `investigationSlice`: Active investigation state, 5 Whys, 6M Fishbone, candidate root causes, evidence gaps, CAPA actions, and search/filtering.
  - `uiSlice`: Toast notifications, active workspace tabs, AI copilot drawer state.
- **React Router DOM v7** with complete navigation:
  - `/`: Main Investigation Dashboard
  - `/investigations/new`: Document Intake & Parsing
  - `/investigations/:id/workspace`: Primary RCA Investigation Workspace
  - `/investigations`: Historical Investigations Table
  - `/system-status`: Real-time backend & DB diagnostics
- **Axios** client with API error interceptors
- **Lucide React** enterprise icons
- **Tailwind CSS v3** customized with pharmaceutical enterprise palette (Dark Navy, Teal accents, Slate surfaces)

### Backend (Phase 1 Deliverables)
- **Python 3.12.10**
- **FastAPI** REST API framework
- **Pydantic v2** & **pydantic-settings**
- **SQLAlchemy 2.0** ORM
- **Psycopg 3** & **psycopg2-binary** (PostgreSQL drivers)
- **PyMuPDF** (text & PDF extraction engine)
- **LangGraph**, **Groq**, and **LangChain** (workflow nodes ready for Phase 5)
- **Uvicorn** ASGI server

### Database Architecture
- **PostgreSQL** schema mapped with SQLAlchemy models in `backend/app/models/`:
  - `investigations`: Primary deviation records
  - `investigation_evidence`: Document and sensor evidence items
  - `root_cause_analyses`: Structured 5 Whys and 6M Fishbone JSON data
  - `capa_actions`: Corrective and Preventive action assignments

---

## 2. Directory Structure

```
project/
├── .env.example                               # Environment template with Groq & DB placeholders
├── .env                                       # Local environment configuration
├── .gitignore                                 # Git exclusions for secrets, venv, node_modules
├── AIVOA_AI_RCA_Project_Requirements.md       # Master requirements specification
├── PROJECT_REQUIREMENTS.md                    # Requirements specification reference
├── README.md                                  # Project documentation & runbook
│
├── frontend/                                  # React + Vite Frontend (Phase 2)
│   ├── package.json                           # Dependencies & scripts
│   ├── vite.config.js                         # Vite config + Proxy (/api -> http://127.0.0.1:8000)
│   ├── tailwind.config.js                     # Pharmaceutical enterprise SaaS palette
│   ├── postcss.config.js                      # PostCSS pipeline
│   ├── index.html                             # HTML entry point
│   └── src/
│       ├── app/
│       │   └── store.js                       # Combined Redux store (investigations + ui)
│       ├── features/
│       │   ├── investigations/
│       │   │   └── investigationSlice.js      # Complete RCA state, 5 Whys, 6M Fishbone, CAPA, Section 14 scenario
│       │   └── ui/
│       │       └── uiSlice.js                 # Toasts, workspace active tabs, AI panel status
│       ├── services/
│       │   └── api.js                         # Axios client with interceptors
│       ├── components/
│       │   ├── common/
│       │   │   ├── Badge.jsx                  # Status, Severity, Priority & Evidence Strength badges
│       │   │   └── ToastContainer.jsx         # Enterprise slide-in alert notifications
│       │   ├── layout/
│       │   │   ├── Header.jsx                 # QA navigation header with live DB & API status
│       │   │   ├── Sidebar.jsx                # Quality Operations navigation & active mini-card
│       │   │   └── Layout.jsx                 # Shell wrapper with Redux dispatch
│       │   └── investigation/
│       │       ├── DocumentInputPanel.jsx     # PDF Drag & Drop (25MB limit), Pasted Text, Email tabs
│       │       ├── IncidentForm.jsx           # Editable deviation parameters & immediate actions
│       │       ├── FiveWhysAnalysis.jsx       # Interactive 5 Whys interrogation chain with citations
│       │       ├── FishboneAnalysis.jsx       # Interactive Ishikawa 6M diagram & branch factor editor
│       │       ├── RootCauseCards.jsx         # Hypotheses vs Evidence-backed vs Human-Confirmed causes
│       │       ├── MissingEvidencePanel.jsx   # Checklist for equipment logs, calibration, BMR, SOPs
│       │       ├── CapaReviewPanel.jsx        # Corrective vs Preventive action assignment
│       │       ├── ReviewSavePanel.jsx        # QA audit gate, conclusion statement, status switcher
│       │       └── AIAssistantPanel.jsx       # Persistent AI Copilot panel with LangGraph triggers
│       ├── pages/
│       │   ├── Dashboard.jsx                  # KPI metrics, recent deviations, Section 14 quick-load
│       │   ├── Investigations.jsx             # Filterable and searchable investigation repository
│       │   ├── NewInvestigation.jsx           # Document input intake with quality workflow guide
│       │   ├── InvestigationWorkspace.jsx     # Core multi-tab investigation powerhouse
│       │   └── SystemStatus.jsx               # Integration diagnostics & backend health response
│       ├── App.jsx                            # Router configuration
│       ├── main.jsx                           # Bootstrap & Provider mounting
│       └── index.css                          # Tailwind CSS base and utility directives
│
└── backend/                                   # FastAPI Backend (Phase 1)
    ├── requirements.txt                       # Backend dependency specifications
    ├── pytest.ini                             # Pytest configuration
    ├── run.py                                 # Uvicorn startup script
    ├── test_db_connection.py                  # Standalone PostgreSQL diagnostic script
    ├── venv/                                  # Python 3.12 virtual environment
    ├── tests/
    │   ├── test_health.py                     # Pytest suite (100% pass)
    │   └── run_tests.py                       # Async client validation script
    └── app/
        ├── main.py                            # FastAPI application and lifespan hooks
        ├── core/
        │   └── config.py                      # Pydantic BaseSettings (.env loading & CORS)
        ├── db/
        │   ├── base.py                        # Centralized model metadata
        │   └── session.py                     # SQLAlchemy engine, connection pooling, check_db_connection
        ├── models/
        │   ├── investigation.py               # investigations table
        │   ├── evidence.py                    # investigation_evidence table
        │   ├── root_cause.py                  # root_cause_analyses table (JSONB support)
        │   └── capa.py                        # capa_actions table
        ├── schemas/
        │   ├── health.py                      # Diagnostics & health response schemas
        │   └── investigation.py               # Pydantic v2 validation models
        └── api/
            └── v1/
                ├── health.py                  # GET /api/health & GET /api/system-info
                └── investigations.py          # GET /api/investigations endpoints
```

---

## 3. How to Run Locally (Windows 11)

### Terminal 1: Start Backend API
```powershell
cd c:\Users\punit\OneDrive\Desktop\project\backend
.\venv\Scripts\python.exe run.py
```
- API is available at: `http://127.0.0.1:8000`
- Interactive Swagger docs: `http://127.0.0.1:8000/docs`

### Terminal 2: Start Frontend Application
```powershell
cd c:\Users\punit\OneDrive\Desktop\project\frontend
npm run dev
```
- UI is accessible at: `http://127.0.0.1:3000`
- Click **"Launch Section 14 Sample"** on the Dashboard to instantly explore the Active Pharmaceutical Ingredient temperature excursion scenario.

---

## 4. Testing & Verification

### Frontend Build Test
```powershell
cd c:\Users\punit\OneDrive\Desktop\project\frontend
npm run build
```
Result:
```
vite v5.4.11 building for production...
✓ 2178 modules transformed.
dist/index.html                   0.46 kB
dist/assets/index.css            30.32 kB
dist/assets/index.js            498.45 kB
✓ built in 6.53s
```

### Backend Test Suite
```powershell
cd c:\Users\punit\OneDrive\Desktop\project\backend
$env:PYTHONPATH = "."
.\venv\Scripts\python.exe -m pytest
```
Result:
```
tests/test_health.py .... [100%]
4 passed in 1.41s
```
