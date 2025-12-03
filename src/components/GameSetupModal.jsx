import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Infinity, Globe } from 'lucide-react';

export default function GameSetupModal({ onClose, onStart }) {
    const { t } = useTranslation();
    const [mode, setMode] = useState(null); // 'daily' or 'unlimited'
    const [language, setLanguage] = useState(null); // 'tr' or 'en'

    const handleStart = () => {
        if (mode && language) {
            onStart(mode, language);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X />
                </button>

                <h2 className="text-2xl font-bold text-center mb-8">GAME SETUP</h2>

                {/* Step 1: Mode Selection */}
                <div className="mb-8">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Select Mode</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setMode('daily')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mode === 'daily' ? 'border-primary bg-primary/20' : 'border-gray-700 hover:border-gray-500'}`}
                        >
                            <Calendar className="w-8 h-8 text-blue-400" />
                            <span className="font-bold">Daily Word</span>
                            <span className="text-xs text-gray-400 text-center">One word per day. Resets at 00:00.</span>
                        </button>

                        <button 
                            onClick={() => setMode('unlimited')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mode === 'unlimited' ? 'border-primary bg-primary/20' : 'border-gray-700 hover:border-gray-500'}`}
                        >
                            <Infinity className="w-8 h-8 text-purple-400" />
                            <span className="font-bold">Unlimited</span>
                            <span className="text-xs text-gray-400 text-center">Play as much as you want.</span>
                        </button>
                    </div>
                </div>

                {/* Step 2: Language Selection */}
                <div className="mb-8">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Select Language</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setLanguage('tr')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${language === 'tr' ? 'border-primary bg-primary/20' : 'border-gray-700 hover:border-gray-500'}`}
                        >
                            <span className="text-2xl">🇹🇷</span>
                            <span className="font-bold">Turkish</span>
                        </button>

                        <button 
                            onClick={() => setLanguage('en')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${language === 'en' ? 'border-primary bg-primary/20' : 'border-gray-700 hover:border-gray-500'}`}
                        >
                            <span className="text-2xl">🇬🇧</span>
                            <span className="font-bold">English</span>
                        </button>
                    </div>
                </div>

                {/* Start Button */}
                <button 
                    onClick={handleStart}
                    disabled={!mode || !language}
                    className={`w-full py-4 rounded-xl font-bold text-xl transition-all ${mode && language ? 'bg-primary hover:bg-red-700 text-white shadow-lg shadow-red-900/50' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                    START GAME
                </button>
            </div>
        </div>
    );
}
