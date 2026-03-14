import React, { useEffect, useRef } from 'react';
import { ScrollText, Bell } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/useLanguageStore';

export const ActivityLog: React.FC = () => {
  const { logs } = useAppStore();
  const { t } = useLanguageStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="bg-dashboard-card rounded-xl border border-white/10 p-5 shadow-lg h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold flex items-center text-white">
          <ScrollText size={20} className="mr-2 text-gray-400" />
          {t('activityLog.title')}
        </h3>
        <Bell size={16} className="text-gray-500" />
      </div>

      <div className="flex-1 overflow-auto space-y-3 font-mono text-xs pr-1 scrollbar-thin">
        {logs.length === 0 && <div className="text-gray-600 text-center mt-10">{t('activityLog.noActivity')}</div>}

        {/* We map in reverse to show newest at bottom if we used flex-col-reverse, but standard log is top-down history. 
            User asked for "Auto-scroll on new event", implying standard chat-like view. */}
        {[...logs].reverse().map(log => (
          <div key={log.id} className="flex flex-col border-l-2 border-white/5 pl-3 py-1 relative">
            {/* Timeline dot */}
            <div className={`absolute -left-[5px] top-2 w-2 h-2 rounded-full ${log.level === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                log.level === 'warning' ? 'bg-amber-500' :
                  'bg-blue-500'
              }`}></div>

            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500 opacity-70">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-600 bg-white/5 px-1 rounded">{log.module}</span>
            </div>
            <span className={`leading-relaxed ${log.level === 'critical' ? 'text-red-300' :
                log.level === 'warning' ? 'text-amber-300' :
                  'text-gray-300'
              }`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};