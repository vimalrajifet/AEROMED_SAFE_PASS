import React, { useEffect } from 'react';
import { useHospitalStore } from '../../store/useHospitalStore';
import { HospitalHeader } from './HospitalHeader';
import { IncomingEmergencyQueue } from './IncomingEmergencyQueue';
import { EmergencyArrivalHero } from './EmergencyArrivalHero';
import { LivePatientMonitor } from './LivePatientMonitor';
import { AIConditionAssessment } from './AIConditionAssessment';
import { TacticalRouteMap } from './TacticalRouteMap';
import { HospitalReadinessMeter } from './HospitalReadinessMeter';
import { MedicalTeamRoster } from './MedicalTeamRoster';
import { HospitalResourceMeters } from './HospitalResourceMeters';
import { ArrivalChecklist } from './ArrivalChecklist';
import { ActivityTimelineRibbon } from './ActivityTimelineRibbon';

export const HospitalDashboard: React.FC = () => {
  const { subscribeAll, emergencies, selectedRequestId } = useHospitalStore();

  useEffect(() => {
    const unsub = subscribeAll();
    return () => unsub();
  }, [subscribeAll]);

  const selectedEmergency = emergencies.find((e) => e.id === selectedRequestId) || emergencies[0];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans select-none">
      {/* 1. TOP HEADER */}
      <HospitalHeader selectedEmergency={selectedEmergency} />

      {/* 2. MAIN 3-COLUMN COMMAND CENTER WORKSPACE */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3 sm:p-4 min-h-0 overflow-y-auto lg:overflow-hidden bg-[#F8FAFC]">
        {/* LEFT COLUMN — 20% (lg:col-span-3 or xl:col-span-3) */}
        <section className="lg:col-span-3 flex flex-col min-h-0 gap-3">
          <IncomingEmergencyQueue />
        </section>

        {/* CENTER COLUMN — 55% (lg:col-span-6 or xl:col-span-6) — MAIN PATIENT MISSION WORKSPACE */}
        <section className="lg:col-span-6 flex flex-col gap-3.5 min-h-0 overflow-y-auto custom-scrollbar pr-0.5">
          {/* SECTION 1: EMERGENCY ARRIVAL HERO WITH GIANT COUNTDOWN */}
          <EmergencyArrivalHero emergency={selectedEmergency} />

          {/* SECTION 2: LIVE PATIENT TELEMETRY INSTRUMENT PANEL */}
          <LivePatientMonitor emergency={selectedEmergency} />

          {/* SECTION 3: AEROMED AI CLINICAL ASSESSMENT */}
          <AIConditionAssessment emergency={selectedEmergency} />

          {/* SECTION 4: TACTICAL ROUTE & DRONE MAP */}
          <TacticalRouteMap />
        </section>

        {/* RIGHT COLUMN — 25% (lg:col-span-3 or xl:col-span-3) — HOSPITAL PREPARATION & RESOURCES */}
        <section className="lg:col-span-3 flex flex-col gap-3 min-h-0 overflow-y-auto custom-scrollbar pr-0.5">
          {/* SECTION 1: HOSPITAL READINESS METER */}
          <HospitalReadinessMeter />

          {/* SECTION 2: MEDICAL TEAM ROSTER */}
          <MedicalTeamRoster />

          {/* SECTION 3: HOSPITAL RESOURCES */}
          <HospitalResourceMeters />

          {/* SECTION 4: ARRIVAL CHECKLIST */}
          <ArrivalChecklist />
        </section>
      </main>

      {/* 3. BOTTOM COLLAPSIBLE EMERGENCY ACTIVITY TIMELINE */}
      <footer className="px-3 sm:px-4 pb-2.5 bg-[#F8FAFC] flex-shrink-0">
        <ActivityTimelineRibbon />
      </footer>
    </div>
  );
};
