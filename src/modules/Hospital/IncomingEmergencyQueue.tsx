import React from 'react';
import { AlertCircle, Clock, MapPin, Truck, Radio, Activity, Wifi } from 'lucide-react';
import { useHospitalStore } from '../../store/useHospitalStore';
import type { EmergencyRequest } from '../../types';

export const IncomingEmergencyQueue: React.FC = () => {
  const { emergencies, selectedRequestId, setSelectedRequestId } = useHospitalStore();

  // Provide realistic fallback cases if list is empty
  const displayCases: EmergencyRequest[] = emergencies.length > 0 ? emergencies : [
    {
      id: 'EM-01',
      type: 'Road Accident Trauma',
      priority: 'critical',
      patientCondition: 'Patient: Male, 42 • Multiple Soft Tissue Injuries',
      assignedAmbulance: 'AMB-01',
      distance: '2.4 km',
      eta: '08 min',
      location: { lat: 13.0600, lng: 80.2500 },
      status: 'dispatched',
      timestamp: Date.now() - 360000,
    } as EmergencyRequest,
    {
      id: 'EM-02',
      type: 'Acute Respiratory Failure',
      priority: 'high',
      patientCondition: 'Patient: Female, 58 • Severe Dyspnea',
      assignedAmbulance: 'AMB-03',
      distance: '4.8 km',
      eta: '14 min',
      location: { lat: 13.0750, lng: 80.2400 },
      status: 'dispatched',
      timestamp: Date.now() - 480000,
    } as EmergencyRequest,
  ];

  const selectedId = selectedRequestId || displayCases[0]?.id;

  return (
    <div className="flex flex-col h-full gap-3 select-none">
      {/* 1. QUEUE CARD */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle size={14} />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase">
                Incoming Queue
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Live Dispatch Inbound</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-white font-mono">
            {displayCases.length} CASES
          </span>
        </div>

        {/* Emergency Case Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
          {displayCases.map((em) => {
            const isSelected = selectedId === em.id;
            const priority = em.priority || 'high';

            // Severity left-stripe and badge styling
            const severityConfig = {
              critical: {
                stripe: 'border-l-red-500',
                badge: 'bg-red-50 text-red-700 border-red-200',
                label: 'CRITICAL',
              },
              high: {
                stripe: 'border-l-amber-500',
                badge: 'bg-amber-50 text-amber-700 border-amber-200',
                label: 'HIGH',
              },
              stable: {
                stripe: 'border-l-emerald-500',
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                label: 'STABLE',
              },
            }[priority];

            return (
              <div
                key={em.id}
                onClick={() => setSelectedRequestId(em.id)}
                className={`p-3 rounded-xl border-l-4 ${severityConfig.stripe} border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-900/10 shadow-xs'
                    : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Header: Priority & Ambulance */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${severityConfig.badge}`}
                  >
                    {severityConfig.label}
                  </span>
                  <div className="flex items-center gap-1 font-mono font-black text-xs text-slate-800">
                    <Truck size={12} className="text-slate-500" />
                    <span>{em.assignedAmbulance || 'AMB-01'}</span>
                  </div>
                </div>

                {/* Emergency Type & Patient Condition */}
                <h4 className="text-xs font-bold text-slate-900 leading-snug tracking-tight mb-1 truncate">
                  {em.type}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium line-clamp-1 mb-2">
                  {em.patientCondition || 'Patient: Male, 42 • Monitored'}
                </p>

                {/* Distance & ETA Footer */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] font-mono text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">{em.distance || '2.4 km'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-900 font-bold">
                    <Clock size={11} className="text-amber-500" />
                    <span>ETA {em.eta || '08 min'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. COMPACT SYSTEM OVERVIEW */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            System Overview
          </span>
          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            OPERATIONAL
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
              <Truck size={11} className="text-sky-600" />
              <span className="text-[9px] uppercase font-bold text-slate-500">Ambulances</span>
            </div>
            <p className="text-sm font-black text-slate-900 font-mono">4 Active</p>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
              <Radio size={11} className="text-indigo-600" />
              <span className="text-[9px] uppercase font-bold text-slate-500">Drones</span>
            </div>
            <p className="text-sm font-black text-slate-900 font-mono">2 Linked</p>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
              <Activity size={11} className="text-red-500" />
              <span className="text-[9px] uppercase font-bold text-slate-500">Alerts</span>
            </div>
            <p className="text-sm font-black text-slate-900 font-mono">1 Critical</p>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
              <Wifi size={11} className="text-emerald-600" />
              <span className="text-[9px] uppercase font-bold text-slate-500">Network</span>
            </div>
            <p className="text-sm font-black text-slate-900 font-mono">14 ms</p>
          </div>
        </div>
      </div>
    </div>
  );
};
