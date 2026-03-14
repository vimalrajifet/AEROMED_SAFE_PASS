import React, { useState } from 'react';
import { TrafficCone, Zap, ShieldAlert } from 'lucide-react';
import { simulateTraffic } from '../../api/simulationApi';
import type { SimulationResult } from '../../api/simulationApi';
import { SimulationResults } from '../../components/SimulationResults';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/useLanguageStore';

export const TrafficControl: React.FC = () => {
  const { fleet, requests, selectedRequestId } = useAppStore();
  const { t } = useLanguageStore();
  const [greenCorridor, setGreenCorridor] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [junctions, setJunctions] = useState([
    { id: 'J-1', status: 'normal', location: 'VTU Jn' },
    { id: 'J-2', status: 'normal', location: 'Avadi Checkpost Junction' },
    { id: 'J-3', status: 'normal', location: 'Padi Jn' },
  ]);

  const toggleCorridor = () => {
    const newState = !greenCorridor;
    setGreenCorridor(newState);
    setJunctions(prev => prev.map(j => ({
      ...j,
      status: newState ? 'cleared' : 'normal'
    })));
  };

  const handleSimulation = async () => {
    setSimulating(true);
    setShowResults(true);
    setSimulationResults(null);

    // Trigger the actual Python simulation script via Electron IPC
    try {
      const { ipcRenderer } = (window as any).require('electron');
      ipcRenderer.send('run-simulation');
    } catch (e) {
      console.warn('Failed to trigger native simulation. This is expected if running in browser.', e);
    }

    const req = requests.find(r => r.id === selectedRequestId) || requests[0];
    const amb = fleet.find(a => a.assignedEmergencyId === req?.id) || fleet[0];

    const start = amb?.location || { lat: 12.9716, lng: 77.5946 };
    const end = req?.location || { lat: 12.9352, lng: 77.6245 };

    const results = await simulateTraffic(start, end, 5.2);

    setTimeout(() => {
      setSimulationResults(results);
      setSimulating(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-dashboard-card rounded-xl border border-white/10 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <TrafficCone size={20} className="mr-2 text-amber-500" />
            {t('trafficControl.title')}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleSimulation}
              disabled={simulating}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${simulating
                ? 'bg-blue-600/10 text-blue-400/50 border-blue-500/20 cursor-wait'
                : 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 border-blue-500/40 hover:from-blue-600/50 hover:to-purple-600/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                }`}
            >
              {simulating ? (
                <>
                  <div className="w-3 h-3 border-2 border-blue-400/50 border-t-blue-400 rounded-full animate-spin" />
                  {t('trafficControl.simulating')}
                </>
              ) : (
                <>
                  <ShieldAlert size={14} />
                  {t('trafficControl.simulate')}
                </>
              )}
            </button>
            <button
              onClick={toggleCorridor}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${greenCorridor
                ? 'bg-green-500/20 text-green-400 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                : 'bg-gray-800 text-gray-500 border-gray-700'
                }`}
            >
              {greenCorridor ? t('trafficControl.corridorActive') : t('trafficControl.normalTraffic')}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {junctions.map(j => (
            <div key={j.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${greenCorridor ? 'bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-red-500'
                  }`} />
                <span className="text-sm font-medium text-gray-300">{j.location} <span className="text-gray-600">({j.id})</span></span>
              </div>
              {greenCorridor && (
                <Zap size={14} className="text-yellow-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Results Panel */}
      {showResults && (
        <SimulationResults
          results={simulationResults}
          loading={simulating}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
};