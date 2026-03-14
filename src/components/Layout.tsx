import React from 'react';
import { Siren } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguageStore } from '../store/useLanguageStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useLanguageStore();

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
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs border border-green-500/20">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="hidden sm:inline">{t('app.systemOnline')}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-3 sm:p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
};