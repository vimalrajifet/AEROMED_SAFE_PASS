import React from 'react';
import { Siren, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguageStore } from '../store/useLanguageStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-dashboard-bg text-white">
      {/* Top Bar */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-dashboard-card/80 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
            <Siren size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight leading-none">{t('app.title')}</h1>
            <p className="text-[10px] text-gray-500 hidden sm:block">{t('app.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {/* Hospital Unit (HU) Button */}
          <button
            onClick={() => navigate('/hospital')}
            title="Open Hospital Unit Dashboard"
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-semibold border border-blue-500 shadow-md transition-all cursor-pointer"
          >
            <Building2 size={15} />
            <span>Hospital Unit (HU)</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-3 sm:p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
};