import React, { useMemo } from 'react';
import { Send, Navigation, CheckCircle2, Siren } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/useLanguageStore';

export const DispatchPanel: React.FC = () => {
   const { selectedRequestId, requests, fleet, dispatchAmbulance } = useAppStore();
   const { t } = useLanguageStore();

   const selectedReq = requests.find(r => r.id === selectedRequestId);

   // Logic to find nearest ambulance (simple Euclidean for prototype)
   const nearestAmbulance = useMemo(() => {
      if (!selectedReq) return null;
      return fleet
         .filter(a => a.status === 'available')
         .map(a => {
            const dist = Math.sqrt(
               Math.pow(a.location.lat - selectedReq.location.lat, 2) +
               Math.pow(a.location.lng - selectedReq.location.lng, 2)
            );
            return { ...a, dist };
         })
         .sort((a, b) => a.dist - b.dist)[0];
   }, [selectedReq, fleet]);

   // List of ACTIVE DISPATCHES
   const activeDispatches = fleet.filter(a => a.status === 'busy');

   return (
      <div className="bg-dashboard-card rounded-xl border border-white/10 p-5 shadow-lg relative overflow-hidden flex flex-col max-h-full">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

         <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-lg font-bold text-white">{t('dispatchPanel.smartDispatch')}</h3>
            <span className="text-xs text-blue-400 border border-blue-500/30 px-2 py-1 rounded bg-blue-500/10">{t('dispatchPanel.aiRecommended')}</span>
         </div>

         {/* --- SECTION 1: ACTION AREA (If Request Selected) --- */}
         {selectedReq ? (
            <div className="mb-6 border-b border-white/10 pb-6">
               {selectedReq.status !== 'new' ? (
                  <div className={`border rounded-lg p-4 flex items-center space-x-4 transition-all ${selectedReq.hospitalAccepted ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20 animate-pulse'}`}>
                     <div className={`p-3 rounded-full ${selectedReq.hospitalAccepted ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {selectedReq.hospitalAccepted ? <CheckCircle2 size={24} /> : <Navigation size={24} className="animate-bounce" />}
                     </div>
                     <div>
                        <h4 className={`font-bold ${selectedReq.hospitalAccepted ? 'text-green-400' : 'text-amber-400'}`}>
                           {selectedReq.hospitalAccepted ? t('dispatchPanel.unitDispatched') : 'WAITING FOR HOSPITAL'}
                        </h4>
                        <p className="text-xs text-gray-400">
                           {selectedReq.hospitalAccepted 
                              ? `${t('dispatchPanel.request')} ${selectedReq.id} ${t('dispatchPanel.handled')}`
                              : `Unit ${selectedReq.assignedAmbulance} notified. Awaiting hospital confirmation.`
                           }
                        </p>
                     </div>
                  </div>
               ) : (
                  <>
                     <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/5">
                        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">{t('dispatchPanel.nearestUnit')}</label>
                        {nearestAmbulance ? (
                           <div className="flex items-center justify-between">
                              <div>
                                 <div className="text-xl font-bold text-white">{nearestAmbulance.id}</div>
                                 <div className="text-sm text-gray-400">{nearestAmbulance.driverName}</div>
                              </div>
                              <div className="text-right">
                                 <div className="text-lg font-bold text-green-400">{(nearestAmbulance.dist * 111).toFixed(1)} km</div>
                                 <div className="text-xs text-gray-500">{t('dispatchPanel.distance')}</div>
                              </div>
                           </div>
                        ) : (
                           <div className="text-amber-500 text-sm font-semibold">{t('dispatchPanel.noUnits')}</div>
                        )}
                     </div>

                     <div className="space-y-3">
                        <button
                           onClick={() => nearestAmbulance && dispatchAmbulance(selectedReq.id, nearestAmbulance.id)}
                           disabled={!nearestAmbulance}
                           className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 flex items-center justify-center"
                        >
                           <Send size={18} className="mr-2" />
                           {t('dispatchPanel.dispatchUnit')}
                        </button>
                     </div>
                  </>
               )}
            </div>
         ) : (
            <div className="bg-white/5 rounded-lg p-6 mb-6 text-center text-gray-500 border border-white/5 border-dashed">
               <Navigation size={32} className="mx-auto mb-2 opacity-50" />
               <p className="text-sm">{t('dispatchPanel.selectEmergency')}</p>
            </div>
         )}

         {/* --- SECTION 2: LIVE OPERATIONS (List of Active Units) --- */}
         <div className="flex-1 overflow-hidden flex flex-col">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
               <Siren size={12} className="mr-2 text-red-500 animate-pulse" />
               {t('dispatchPanel.dispatchInProgress')} ({activeDispatches.length})
            </h4>

            <div className="flex-1 overflow-auto space-y-2 pr-1 scrollbar-thin">
               {activeDispatches.length === 0 && (
                  <div className="text-xs text-gray-600 italic text-center mt-4">{t('dispatchPanel.noActiveMissions')}</div>
               )}

               {activeDispatches.map(amb => (
                  <div key={amb.id} className="bg-gray-900/50 border border-blue-500/20 rounded p-3 flex justify-between items-center relative overflow-hidden">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 animate-pulse"></div>

                     <div>
                        <div className="text-sm font-bold text-white flex items-center">
                           {amb.id} <span className="mx-2 text-gray-600">•</span> <span className="text-blue-400">REQ-{amb.assignedEmergencyId?.slice(0, 4)}</span>
                        </div>
                        <div className="text-xs text-gray-500">{t('dispatchPanel.driver')}: {amb.driverName}</div>
                     </div>

                     <div className="text-right">
                        <div className="text-xs font-bold text-white bg-blue-500/20 px-2 py-1 rounded">
                           {amb.eta || t('dispatchPanel.enRoute')}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};