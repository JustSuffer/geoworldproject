import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, Monitor } from 'lucide-react';

export default function Settings() {
    const { t } = useTranslation();

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm text-white p-4">
             <Link to="/" className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md text-white">
                <ArrowLeft className="w-6 h-6" />
            </Link>

            <div className="bg-gray-800/50 p-8 rounded-2xl border border-white/10 backdrop-blur-md max-w-md w-full">
                <h2 className="text-3xl font-bold text-center mb-8">{t('settingsTitle')}</h2>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Volume2 className="w-6 h-6 text-gray-400" />
                            <span className="font-medium">{t('audio')}</span>
                        </div>
                        <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Monitor className="w-6 h-6 text-gray-400" />
                            <span className="font-medium">{t('graphics')}</span>
                        </div>
                         <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
