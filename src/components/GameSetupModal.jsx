import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Infinity, Play, AlertTriangle } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function GameSetupModal({ onClose, onStart, onContinue }) {
    const { t } = useTranslation();
    const { gameType, isGeoworldStarted, isGeodokuStarted } = useGame();
    
    const isStarted = gameType === 'geoworld' ? isGeoworldStarted : isGeodokuStarted;
    
    const [step, setStep] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    
    // Shared Options
    const [mode, setMode] = useState(null); // 'daily' or 'unlimited'
    
    // Geoworld Options
    const [language, setLanguage] = useState(null); // 'tr' or 'en'
    
    // Geodoku Options
    const [difficulty, setDifficulty] = useState(null); // 'easy', 'medium', 'hard'

    const executeStart = () => {
        if (gameType === 'geoworld') {
            onStart('geoworld', mode, language, null, null);
        } else if (gameType === 'geodoku') {
            onStart('geodoku', mode, 'en', difficulty, mode); 
        }
    };

    const handleNewGameClick = () => {
        if (isStarted) {
            setShowWarning(true);
        } else {
            setStep(1);
        }
    };

    const confirmNewGame = () => {
        setShowWarning(false);
        setStep(1);
    };

    const handleStart = () => {
        executeStart();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X />
                </button>

                <h2 className="text-2xl font-bold text-center mb-8 uppercase">
                    {gameType === 'geoworld' ? 'GeoWorld' : 'GeoDoku'} SETUP
                </h2>

                {step === 0 && (
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={onContinue}
                            disabled={!isStarted}
                            className={`w-full py-4 rounded-xl font-bold text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isStarted ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'}`}
                        >
                            <Play className="w-6 h-6 fill-current" />
                            CONTINUE
                        </button>
                        <button 
                            onClick={handleNewGameClick}
                            className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-xl transition-all"
                        >
                            NEW GAME
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <div className="mb-6">
                        <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Select Mode</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setMode('daily')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mode === 'daily' ? 'border-primary bg-primary/20' : 'border-gray-700 hover:border-gray-500'}`}
                            >
                                <Calendar className="w-8 h-8 text-blue-400" />
                                <span className="font-bold">Daily</span>
                            </button>

                            <button 
                                onClick={() => setMode('unlimited')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mode === 'unlimited' ? 'border-primary bg-primary/20' : 'border-gray-700 hover:border-gray-500'}`}
                            >
                                <Infinity className="w-8 h-8 text-purple-400" />
                                <span className="font-bold">Unlimited</span>
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => setStep(2)}
                            disabled={!mode}
                            className={`w-full mt-6 py-4 rounded-xl font-bold text-xl transition-all ${mode ? 'bg-primary hover:bg-red-700 text-white shadow-lg' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            NEXT
                        </button>
                    </div>
                )}

                {step === 2 && gameType === 'geoworld' && (
                    <>
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

                        <button 
                            onClick={handleStart}
                            disabled={!language}
                            className={`w-full py-4 rounded-xl font-bold text-xl transition-all ${language ? 'bg-primary hover:bg-red-700 text-white shadow-lg shadow-red-900/50' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            START GEOWORLD
                        </button>
                    </>
                )}

                {step === 2 && gameType === 'geodoku' && (
                    <>
                        <div className="mb-8">
                            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Select Difficulty</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <button 
                                    onClick={() => setDifficulty('easy')}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${difficulty === 'easy' ? 'border-green-500 bg-green-500/20' : 'border-gray-700 hover:border-gray-500'}`}
                                >
                                    <span className="font-bold text-green-400">Easy</span>
                                </button>
                                <button 
                                    onClick={() => setDifficulty('medium')}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${difficulty === 'medium' ? 'border-yellow-500 bg-yellow-500/20' : 'border-gray-700 hover:border-gray-500'}`}
                                >
                                    <span className="font-bold text-yellow-400">Medium</span>
                                </button>
                                <button 
                                    onClick={() => setDifficulty('hard')}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${difficulty === 'hard' ? 'border-red-500 bg-red-500/20' : 'border-gray-700 hover:border-gray-500'}`}
                                >
                                    <span className="font-bold text-red-400">Hard</span>
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 text-center">
                                Collect spheres to reveal numbers! <br/> Hard mode has a 2-HOUR time limit!
                            </p>
                        </div>
                        
                        <button 
                            onClick={handleStart}
                            disabled={!difficulty}
                            className={`w-full py-4 rounded-xl font-bold text-xl transition-all ${difficulty ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            START GEODOKU
                        </button>
                    </>
                )}

                {showWarning && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 rounded-2xl">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-red-500 mb-4">Dikkat!</h3>
                            <p className="text-gray-300 mb-6">
                                Devam eden bir oyun süreciniz var. Yeni oyuna girmekten emin misiniz? <br/>
                                <span className="text-red-400 text-sm">(Eski kayıt silinir)</span>
                            </p>
                            <div className="flex gap-4 w-full">
                                <button 
                                    onClick={() => setShowWarning(false)}
                                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-colors"
                                >
                                    İptal
                                </button>
                                <button 
                                    onClick={confirmNewGame}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-colors shadow-lg shadow-red-900/50"
                                >
                                    Devam Et
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
