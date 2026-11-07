import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Investigations from './pages/Investigations';
import NewInvestigation from './pages/NewInvestigation';
import InvestigationWorkspace from './pages/InvestigationWorkspace';
import SystemStatus from './pages/SystemStatus';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="investigations" element={<Investigations />} />
          <Route path="investigations/new" element={<NewInvestigation />} />
          <Route path="investigations/:id/workspace" element={<InvestigationWorkspace />} />
          <Route path="investigations/:id" element={<InvestigationWorkspace />} />
          <Route path="system-status" element={<SystemStatus />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
