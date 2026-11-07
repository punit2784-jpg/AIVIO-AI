# AIVOA.AI – AI-Powered Root Cause Analysis (RCA) Platform
## Master Project Requirements and Antigravity Implementation Brief

**Project type:** AI-powered pharmaceutical quality investigation application  
**Development environment:** Windows 11 + Google Antigravity  
**Primary objective:** Build a working Root Cause Analysis (RCA) module for a pharmaceutical manufacturer producing Active Pharmaceutical Ingredients (API).

---

## 1. Project overview

Build a full-stack application that helps pharmaceutical manufacturing quality professionals investigate incidents, organize evidence, identify potential root causes, and recommend Corrective and Preventive Actions (CAPA).

The application must focus specifically on **Root Cause Analysis**. It is not a Customer Complaint Management, Deviation Management, or Change Control application.

The intended workflow is:

**Deviation Identification → Root Cause Analysis → Corrective and Preventive Actions (CAPA)**

AI-generated findings are suggestions. A qualified human investigator must review and confirm conclusions and actions.

## 2. Business problem and goals

The application should help users understand incidents from supplied investigation documents, extract information automatically, populate an RCA form, perform structured analysis using 5 Whys or Fishbone, identify potential root causes and contributing factors, highlight missing evidence, recommend CAPA, and review, edit, and save the investigation.

The AI-assisted workflow must be the primary interaction. Do not make manual form filling the main user experience.

## 3. Mandatory technology stack

### Frontend
- React.js with Vite
- Redux Toolkit
- React Router DOM
- Axios
- Lucide React
- CSS or Tailwind CSS

### Backend
- Python 3.11 or 3.12
- FastAPI
- Pydantic
- SQLAlchemy

### AI
- LangGraph
- Groq API
- A currently supported Groq model, such as Llama 3.3 70B Versatile if available.

### Database and document processing
- PostgreSQL
- PyMuPDF for PDF text extraction
- Support pasted text and email content

### Development
- Windows 11
- Google Antigravity
- Local development environment

Do not replace mandatory technologies with unrelated alternatives. Verify package and model availability before selecting versions.

## 4. User journey

1. User opens the dashboard.
2. User creates a new RCA investigation.
3. User uploads an investigation PDF, pastes incident text, or provides email content.
4. AI analyzes the supplied information and extracts relevant incident details.
5. The application automatically populates the RCA form.
6. User reviews and edits extracted information.
7. User selects 5 Whys or Fishbone analysis.
8. AI identifies possible root causes and contributing factors.
9. AI highlights missing evidence and further investigation requirements.
10. AI recommends CAPA actions.
11. User reviews and edits recommendations.
12. User saves the investigation.
13. The application stores and retrieves investigation data using PostgreSQL.

## 5. Functional modules

### 5.1 Dashboard
Display total investigations, open investigations, investigations under review, completed investigations, recent investigations, investigation status, and an action to create a new RCA.

### 5.2 Create investigation and input
Support:
1. PDF document upload.
2. Pasted incident description.
3. Pasted email or investigation communication.

Validate inputs and show understandable error messages.

### 5.3 AI document analysis and extraction
Use Groq and LangGraph to extract fields where available:
- Incident title and description
- Incident date
- Department
- Manufacturing process
- Product or API information
- Batch number
- Equipment involved
- Observed abnormality
- Immediate actions taken
- Investigation observations
- Available evidence
- Potential contributing factors

Do not invent missing information. Use **Not Provided** or **Requires Investigation** where appropriate. Automatically populate the RCA form with structured extracted information.

### 5.4 Editable RCA investigation form
Include investigation ID, incident title and description, incident date, department, product or API name, batch number, equipment or process involved, immediate containment actions, investigation methodology, investigation findings, evidence collected, potential root causes, contributing factors, final confirmed root cause, and investigation conclusion.

Allow users to review and edit all AI-generated information.

### 5.5 Root Cause Analysis methods

**5 Whys:** Generate a structured sequence of why-questions and answers. Continue only when supported by available information. Do not invent answers just to reach five steps. Identify where further evidence is needed.

**Fishbone:** Organize possible causes under Manpower, Machine, Method, Material, Measurement, and Environment. Allow users to edit and add findings.

### 5.6 Potential root cause identification
For each potential cause, provide cause description, reasoning, supporting evidence, evidence-strength or confidence indication, and missing information if applicable.

Clearly distinguish:
1. AI-generated hypothesis
2. Evidence-supported potential cause
3. Human-confirmed root cause

Never present an AI hypothesis as an established fact.

### 5.7 Missing evidence
Identify potentially useful additional information based on the incident, such as equipment maintenance history, operator training records, batch manufacturing records, calibration records, temperature monitoring logs, previous deviation records, relevant SOPs, and environmental monitoring records.

These are suggestions only. Do not imply records exist or have been reviewed unless supplied.

### 5.8 CAPA recommendations
Generate separate **Corrective Actions** and **Preventive Actions**. For each recommendation, include action description, reason, action type, suggested responsible department or role, suggested priority, and effectiveness verification method.

Allow users to edit recommendations. Do not automatically approve or close CAPA actions.

### 5.9 Review and save
Users must be able to edit extracted information, edit 5 Whys and Fishbone findings, modify potential root causes, confirm or revise the final root cause, modify CAPA recommendations, save drafts, update status, and reopen saved investigations.

## 6. LangGraph workflow

Implement modular LangGraph nodes for:
1. Document input
2. Content extraction
3. Incident information extraction
4. Investigation analysis
5. 5 Whys or Fishbone analysis
6. Potential root cause identification
7. Missing evidence identification
8. CAPA recommendation
9. Structured output validation

Conceptual flow:

`START → Extract Content → Extract Incident Information → Analyze Investigation → Perform RCA → Identify Potential Root Causes → Identify Missing Evidence → Generate CAPA → Validate Structured Output → END`

Use shared state and structured Pydantic schemas. Add validation, exception handling, and clear error reporting. Avoid unnecessary LLM calls.

## 7. Groq configuration

Keep credentials on the backend only. Use environment variables.

Example `.env`:

```env
GROQ_API_KEY=replace_with_your_key
GROQ_MODEL=llama-3.3-70b-versatile
DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/ai_rca_db
```

Create `.env.example` containing placeholders only. Never expose real API keys in frontend code or source files. Verify that the selected model is currently supported by Groq.

## 8. Database design

Use PostgreSQL with SQLAlchemy models and appropriate relationships.

Suggested tables:

### investigations
- id
- investigation_code
- incident_title
- incident_description
- incident_date
- department
- product_name
- batch_number
- equipment
- immediate_actions
- investigation_status
- created_at
- updated_at

### investigation_evidence
- id
- investigation_id
- evidence_name
- evidence_description
- evidence_type
- evidence_status

### root_cause_analyses
- id
- investigation_id
- methodology
- analysis_data
- potential_root_causes
- confirmed_root_cause
- investigation_conclusion

### capa_actions
- id
- investigation_id
- action_type
- action_description
- justification
- responsible_role
- priority
- effectiveness_verification
- status

Use foreign keys and sensible data types. JSONB columns may be used for structured analysis data. Do not store uploaded files as unbounded database blobs; use safe local file storage for this prototype and store metadata/path references.

## 9. Suggested backend API

Use FastAPI REST endpoints.

### Investigations
- `POST /api/investigations/` – create
- `GET /api/investigations/` – list
- `GET /api/investigations/{id}` – retrieve
- `PUT /api/investigations/{id}` – update
- `DELETE /api/investigations/{id}` – delete where appropriate

### AI
- `POST /api/ai/extract` – extract incident information
- `POST /api/ai/analyze` – run RCA workflow
- `POST /api/ai/five-whys` – 5 Whys analysis
- `POST /api/ai/fishbone` – Fishbone analysis
- `POST /api/ai/root-causes` – potential causes
- `POST /api/ai/missing-evidence` – evidence gaps
- `POST /api/ai/capa` – CAPA recommendations

### Evidence
- `POST /api/evidence/upload` – upload supporting evidence
- `GET /api/evidence/{investigation_id}` – retrieve evidence metadata

Use Pydantic request and response schemas, validation, and consistent error responses.

## 10. Frontend pages and components

### Pages
- Dashboard
- Create Investigation
- Investigation Workspace
- RCA Analysis
- CAPA Review
- Investigation History
- Investigation Details

### Reusable components
- Sidebar and top navigation
- Dashboard cards
- Investigation table
- Document upload panel
- AI Assistant panel
- Incident information form
- 5 Whys analysis
- Fishbone analysis
- Root cause cards
- Missing evidence panel
- CAPA recommendations
- Review and save panel

Use Redux Toolkit for shared state and Axios for backend communication. Keep components reusable and maintainable.

## 11. UI/UX direction

Create a modern pharmaceutical enterprise SaaS interface:
- White and light-grey surfaces
- Dark navy or deep-blue primary color
- Subtle teal or green accents
- Clear typography and consistent spacing
- Professional cards and tables
- Understandable status indicators
- Responsive layouts
- Helpful empty states
- Loading indicators during AI processing
- Clear error and success notifications

The AI Assistant should be prominent in the investigation workspace. Avoid excessive gradients, clutter, and unnecessary animations. The product should look like a credible enterprise quality-workflow prototype, not a basic CRUD demo.

## 12. Security and prototype limitations

- Keep API keys in backend environment variables.
- Validate file types and impose a reasonable PDF upload-size limit.
- Use safe file handling and validate user inputs.
- Do not expose backend credentials.
- Handle API failures gracefully.
- Avoid unnecessary logging of confidential investigation documents.
- Do not upload assignment files, source code, screenshots, sample documents, or demo videos to GitHub or any public repository.

This is an assignment prototype, not a validated pharmaceutical QMS. Do not claim regulatory validation or production readiness. Authentication, authorization, audit trails, electronic signatures, retention, and validation may be documented as limitations or future enhancements unless specifically implemented.

## 13. Development phases

### Phase 1 – Project initialization
- Create project directory and clean folder structure.
- Initialize React using Vite.
- Install Redux Toolkit and frontend dependencies.
- Create Python virtual environment.
- Configure FastAPI backend.
- Install backend dependencies.
- Prepare PostgreSQL connection and configuration.
- Create `.env.example` and `.gitignore`.
- Verify frontend and backend independently.
- Verify PostgreSQL connectivity if installed and configured.

### Phase 2 – Frontend UI
- Develop dashboard and navigation.
- Build investigation workspace.
- Build document input interface.
- Build RCA and CAPA review interfaces.
- Implement Redux state management.

### Phase 3 – Backend and database
- Configure FastAPI and PostgreSQL.
- Create SQLAlchemy models and Pydantic schemas.
- Implement investigation APIs.
- Test database operations.

### Phase 4 – Document processing
- Implement PDF text extraction with PyMuPDF.
- Implement pasted-text and email-content input.
- Validate extracted content.

### Phase 5 – AI integration
- Integrate Groq.
- Implement LangGraph nodes and shared state.
- Create extraction and analysis prompts.
- Implement structured AI outputs and validation.

### Phase 6 – RCA and CAPA
- Implement 5 Whys and Fishbone.
- Identify potential root causes and evidence gaps.
- Generate CAPA recommendations.

### Phase 7 – Integration
- Connect React to FastAPI.
- Integrate AI processing with the investigation workspace.
- Implement automatic form population, review, editing, and saving.

### Phase 8 – Testing and finalization
- Test PDF and text input.
- Test AI extraction and RCA.
- Test CAPA recommendations.
- Test editing, persistence, and retrieval.
- Fix errors and prepare demo scenarios.
- Prepare product demo and code explanation videos.

## 14. Fictional sample investigation for testing

**Incident title:** Unexpected Temperature Excursion During API Manufacturing  
**Department:** Production  
**Product:** API Batch – API-2026-001

**Incident description:**  
During the manufacturing process, the reactor temperature exceeded the established operating limit. The operator observed the abnormal temperature reading and immediately informed the production supervisor. The batch was placed on hold pending investigation.

**Initial information:**
- Reactor temperature exceeded the operating limit.
- Batch was placed on hold.
- Operator informed the supervisor.
- Cooling system performance is suspected.
- Equipment maintenance history is not yet available.

The AI should extract the supplied information, identify missing evidence, and suggest possible investigation directions. It must not declare cooling system failure as the confirmed root cause without supporting evidence.

This scenario is fictional and intended only for software testing.

## 15. Acceptance criteria

The application is functionally complete when:
1. React frontend starts successfully.
2. FastAPI backend starts successfully.
3. PostgreSQL connection works.
4. User can create and retrieve investigations.
5. User can upload a PDF and paste incident text.
6. AI extracts incident information.
7. Extracted information populates the editable investigation form.
8. User can edit extracted information.
9. 5 Whys analysis works.
10. Fishbone analysis works.
11. AI identifies potential root causes and missing evidence.
12. AI generates CAPA recommendations.
13. User can review and edit recommendations.
14. Investigation data persists in PostgreSQL.
15. Errors are handled clearly.

## 16. Instructions for Antigravity

Act as a senior full-stack AI product engineer. Read this entire document before making changes.

Follow these rules:
1. Use the mandatory technology stack specified here.
2. Implement one development phase at a time.
3. Do not generate the entire application in one uncontrolled operation.
4. Start with Phase 1 only.
5. Inspect the existing project folder before changing files.
6. Use Windows 11-compatible commands.
7. Keep frontend and backend in separate directories.
8. Use modular, maintainable code and reusable components.
9. Do not hardcode API keys or secrets.
10. Do not fake AI functionality or label mock outputs as real AI results.
11. Do not present an AI hypothesis as a confirmed root cause.
12. Test each phase before moving to the next.
13. Diagnose and resolve errors before reporting completion.
14. Explain important files and modules.
15. Do not skip mandatory technologies.
16. Do not upload assignment materials or source code to a public repository.
17. Keep the project running locally.

### FIRST TASK – PHASE 1 ONLY

Begin Phase 1. Create the project structure, initialize the React frontend, configure the Python FastAPI backend, prepare PostgreSQL integration, and install required dependencies.

Do not implement the complete AI workflow or later-phase UI yet.

At the end of Phase 1:
- Show the created folder structure.
- List installed dependencies.
- Explain important files.
- Start and test the frontend.
- Start and test the backend.
- Verify PostgreSQL connectivity if it is configured.
- Clearly report any remaining setup requirements.

Stop after Phase 1 and wait for the user's approval before proceeding to Phase 2.
