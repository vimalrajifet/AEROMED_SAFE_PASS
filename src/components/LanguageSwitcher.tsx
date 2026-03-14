import React from 'react';
import { useLanguageStore, type Language } from '../store/useLanguageStore';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguageStore();

    const languages: { code: Language; label: string }[] = [
        { code: 'en', label: 'English' },
        { code: 'ta', label: 'தமிழ்' },
        { code: 'hi', label: 'हिन्दी' },
    ];

    return (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
            <Globe size={14} className="text-gray-400 ml-1" />
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                        language === lang.code
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
};