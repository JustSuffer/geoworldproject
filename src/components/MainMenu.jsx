import React, { useState } from 'react';
import { Play, BarChart2, Settings, HelpCircle, User, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import GameSetupModal from './GameSetupModal';
import { useGame } from '../context/GameContext';
import logo from '../assets/logo.png';

export default function MainMenu({ onAuth }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setGameMode, setGameLanguage, newGame, isGeoworldStarted, isGeodokuStarted, resetGame, setGameType, setGeodokuDifficulty } = useGame();
    const [setupOpen, setSetupOpen] = useState(false);

    const handleGameStart = (type, mode, language, difficulty) => {
        setGameType(type);
        setGameMode(mode);
        setGameLanguage(language);
        if (difficulty) setGeodokuDifficulty(difficulty);
        newGame(type, mode, language, difficulty); // Ensure fresh start and board generation
        navigate('/play');
    };

    const handlePlayClick = (type) => {
        setGameType(type);
        setSetupOpen(true);
    };

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm text-white p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 text-center mb-8">
                <img src={logo} alt="GeoWord Quest" className="w-80 md:w-96 drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
            </div>

            {/* Menu Buttons */}
            <div className="relative z-10 flex flex-col gap-4 w-full max-w-xs">
                <button 
                    onClick={() => handlePlayClick('geoworld')}
                    className="group relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-3"
                >
                    <Play className="w-6 h-6 fill-current" />
                    PLAY GEOWORLD
                </button>
                
                <button 
                    onClick={() => handlePlayClick('geodoku')}
                    className="group relative bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] flex items-center justify-center gap-3"
                >
                    <Play className="w-6 h-6 fill-current" />
                    PLAY GEODOKU
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
                    onContinue={() => {
                        setSetupOpen(false);
                        navigate('/play');
                    }}
                />
            )}

        </div>
    );
}
