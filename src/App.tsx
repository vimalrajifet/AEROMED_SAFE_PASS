import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './modules/Dashboard';
import { MobileApp } from './modules/Mobile/MobileApp';
import { HospitalLayout } from './components/HospitalLayout';
import { HospitalDashboard } from './modules/Hospital/HospitalDashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ambulance Dashboard (Default) */}
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />

        {/* Hospital Dashboard */}
        <Route path="/hospital" element={
          <HospitalLayout>
            <HospitalDashboard />
          </HospitalLayout>
        } />

        {/* Mobile Trigger App Route (No Layout) */}
        <Route path="/sos" element={<MobileApp />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
