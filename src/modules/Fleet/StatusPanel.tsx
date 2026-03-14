import React, { useEffect, useState } from 'react';
import { Truck, Activity, Wrench, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/useLanguageStore';

export const StatusPanel: React.FC = () => {
  const { fleet } = useAppStore();
  const { t } = useLanguageStore();
  const [now, setNow] = useState(Date.now());

  // Only show Ambulances (filter out the simulated Drone D-001)
  const ambulanceFleet = fleet.filter(unit => unit.id !== 'D-001');

  // Force re-render every 5 seconds to update "Offline" status
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const isOffline = (lastUpdate?: number) => {
    if (!lastUpdate) return true;
    return (now - lastUpdate) > 20000; // 20 seconds timeout
  };

  return (
    <div className="bg-dashboard-card rounded-xl border border-white/10 p-5 shadow-lg h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold flex items-center text-white">
          <Truck size={20} className="mr-2 text-blue-500" />
          {t('dashboard.fleetStatus')}
        </h3>
        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
          {ambulanceFleet.length} {t('statusPanel.units')}
        </span>
      </div>

      <div className="flex-1 overflow-auto space-y-3 pr-2 scrollbar-thin">
        {ambulanceFleet.map(unit => {
          const offline = isOffline(unit.lastUpdate);

          return (
            <div key={unit.id} className={`p-3 rounded-lg border transition-colors group ${offline ? 'bg-gray-800/50 border-gray-700 opacity-60' : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-white group-hover:text-blue-400 transition-colors">{unit.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider flex items-center ${offline ? 'bg-gray-700 text-gray-400' :
                    unit.status === 'available' ? 'bg-green-500/20 text-green-400' :
                      unit.status === 'busy' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                        'bg-red-500/20 text-red-400'
                  }`}>
                  {offline ? (
                    <><WifiOff size={10} className="mr-1" /> {t('status.offline').toUpperCase()}</>
                  ) : (
                    <><Wifi size={10} className="mr-1" /> {unit.status.toUpperCase()}</>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-xs text-gray-400">
                  <Activity size={12} className="mr-1.5" />
                  <span>{unit.driverName}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500" title={t('statusPanel.vehicleHealth')}>
                  <Wrench size={10} className="mr-1" />
                  <span>{t('statusPanel.ok')}</span>
                </div>
              </div>
              {unit.eta && !offline && (
                <div className="mt-2 text-xs font-mono text-blue-300 bg-blue-500/10 px-2 py-1 rounded flex justify-between">
                  <span>{t('statusPanel.etaTarget')}</span>
                  <span>{unit.eta}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};