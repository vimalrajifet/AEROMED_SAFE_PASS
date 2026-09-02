import React from 'react';
import { Brain, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import type { EmergencyRequest } from '../../types';

interface AIConditionAssessmentProps {
  emergency?: EmergencyRequest;
}

export const AIConditionAssessment: React.FC<AIConditionAssessmentProps> = ({ emergency }) => {
  const aiPrediction = emergency?.aiPrediction || {
    condition: 'Multiple Soft Tissue Injuries & Suspected Lower-Limb Fracture',
    requiredPrep: ['Trauma Bay 1 - READY', 'Orthopedic Team - REQUIRED', 'X-Ray - STANDBY', 'Blood Bank - PREPARE', 'FAST Ultrasound - READY'],
  };

  const confidencePercent = 92;
  const possibleRisks = ['Internal abdominal trauma', 'Orthopedic pelvic injury', 'Moderate acute blood loss'];

  const prepItems = [
    { name: 'Trauma Bay 1', status: 'READY', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Orthopedic Team', status: 'REQUIRED', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'X-Ray & Imaging', status: 'STANDBY', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
    { name: 'Blood Bank (O-Neg)', status: 'PREPARE', badge: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'FAST Ultrasound', status: 'READY', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/50 rounded-2xl border border-indigo-200/80 p-4 shadow-xs select-none relative overflow-hidden">
      {/* Top Header with AI Badge */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
            <Brain size={14} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase leading-none flex items-center gap-1.5">
              <span>AeroMed AI Clinical Assessment</span>
              <Sparkles size={12} className="text-indigo-500" />
            </h3>
            <p className="text-[10px] text-indigo-950 font-medium">
              Neural Diagnostic & Pre-Hospital Triage Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-indigo-200 text-[10px] font-mono font-bold text-indigo-700 shadow-2xs">
            <span>CONFIDENCE</span>
            <strong className="text-indigo-900">{confidencePercent}%</strong>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Left Diagnosis & Right Preparation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT COLUMN: Condition & Possible Risks */}
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 block mb-1">
              Predicted Primary Condition
            </span>
            <p className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
              {aiPrediction.condition}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
              <AlertTriangle size={11} className="text-amber-500" />
              Identified Clinical Risk Factors
            </span>
            <div className="space-y-1">
              {possibleRisks.map((risk, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recommended Preparation */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-500" />
              Targeted Department Preparation
            </span>

            <div className="space-y-1.5">
              {prepItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-bold text-slate-800 text-[11px]">{item.name}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase font-mono ${item.badge}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: Strong AI Action Directive Banner */}
      <div className="mt-3 p-2.5 rounded-xl bg-indigo-600 text-white flex items-center justify-between shadow-xs text-xs font-bold">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-indigo-200 flex-shrink-0" />
          <span className="text-[11px] tracking-tight">
            AI DIRECTIVE: PREPARE TRAUMA BAY 1 & NOTIFY ON-CALL ORTHOPEDIC SURGEON
          </span>
        </div>
        <span className="hidden sm:inline text-[9px] px-2 py-0.5 rounded bg-white/20 font-mono font-bold uppercase">
          PRIORITY ALPHA
        </span>
      </div>
    </div>
  );
};
