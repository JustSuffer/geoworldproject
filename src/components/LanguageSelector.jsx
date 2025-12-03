import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'tr' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button 
            onClick={toggleLanguage}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md flex items-center justify-center text-white"
            title="Switch Language"
        >
            <Globe className="w-6 h-6" />
            <span className="ml-2 font-bold text-sm">{i18n.language.toUpperCase()}</span>
        </button>
    );
}
