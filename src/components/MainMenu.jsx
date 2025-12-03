import React, { useState } from 'react';
import { Play, BarChart2, Settings, HelpCircle, User, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import GameSetupModal from './GameSetupModal';
import { useGame } from '../context/GameContext';

export default function MainMenu({ onAuth }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setGameMode, setGameLanguage, newGame, isGameStarted, setIsGameStarted, resetGame } = useGame();
    const [setupOpen, setSetupOpen] = useState(false);
    const [showResetWarning, setShowResetWarning] = useState(false);

    const handleGameStart = (mode, language) => {
        resetGame(); // Ensure fresh start
        setGameMode(mode);
        setGameLanguage(language);
        setIsGameStarted(true);
        navigate('/play');
    };

    const handlePlayClick = () => {
        if (isGameStarted) {
            setShowResetWarning(true);
        } else {
            setSetupOpen(true);
        }
    };

    const handleContinue = () => {
        navigate('/play');
    };

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm text-white p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent drop-shadow-lg">
                    GEOWORD
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-widest uppercase">
                    QUEST
                </h2>
            </div>

            {/* Menu Buttons */}
            <div className="relative z-10 flex flex-col gap-4 w-full max-w-xs">
                {isGameStarted && (
                    <button 
                        onClick={handleContinue}
                        className="group relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-3"
                    >
                        <Play className="w-6 h-6 fill-current" />
                        {t('continue') || "CONTINUE"}
                    </button>
                )}

                <button 
                    onClick={handlePlayClick}
                    className="group relative bg-primary hover:bg-red-700 text-white p-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(178,11,11,0.4)] hover:shadow-[0_0_30px_rgba(178,11,11,0.6)] flex items-center justify-center gap-3"
                >
                    <Play className="w-6 h-6 fill-current" />
                    {t('play')}
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <Link 
                        to="/statistics"
                        className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2"
                    >
                        <BarChart2 className="w-6 h-6" />
                        <span className="text-xs">{t('statistics')}</span>
                    </Link>
                    
                    <Link 
                        to="/settings"
                        className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2"
                    >
                        <Settings className="w-6 h-6" />
                        <span className="text-xs">{t('settings')}</span>
                    </Link>
                </div>

                <Link 
                    to="/howtoplay"
                    className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
                >
                    <HelpCircle className="w-6 h-6" />
                    {t('howToPlay')}
                </Link>
            </div>

            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-4">
                <LanguageSelector />
                <button 
                    onClick={onAuth}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
                    title="Sign Up / Login"
                >
                    <User className="w-6 h-6" />
                </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-white/30 text-sm">
                v1.0.0 • GeoWord Quest
            </div>

            {/* Setup Modal */}
            {setupOpen && (
                <GameSetupModal 
                    onClose={() => setSetupOpen(false)} 
                    onStart={handleGameStart} 
                />
            )}

            {/* Reset Warning Modal */}
            {showResetWarning && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-red-500/50 text-white p-6 rounded-2xl shadow-2xl w-full max-w-sm transform scale-100 transition-all">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Warning!</h3>
                            <p className="text-gray-300">
                                Starting a new game will reset your current progress. Are you sure you want to continue?
                            </p>
                            
                            <div className="flex gap-3 w-full mt-4">
                                <button 
                                    onClick={() => setShowResetWarning(false)}
                                    className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowResetWarning(false);
                                        setSetupOpen(true);
                                    }}
                                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-colors shadow-lg shadow-red-900/20"
                                >
                                    New Game
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
