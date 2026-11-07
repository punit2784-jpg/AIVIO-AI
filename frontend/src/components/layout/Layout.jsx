import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Header from './Header';
import Sidebar from './Sidebar';
import ToastContainer from '../common/ToastContainer';
import { fetchHealthStatus, fetchInvestigations } from '../../features/investigations/investigationSlice';

export default function Layout() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchHealthStatus());
    dispatch(fetchInvestigations());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
