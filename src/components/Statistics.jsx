import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function Statistics() {
    const { t } = useTranslation();
    const { stats } = useGame();

    const played = stats?.played || 0;
    const winRate = stats?.winRate || 0;
    const currentStreak = stats?.currentStreak || 0;
    const maxStreak = stats?.maxStreak || 0;

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm text-white p-4">
             <Link to="/" className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md text-white">
                <ArrowLeft className="w-6 h-6" />
            </Link>

            <div className="bg-gray-800/50 p-8 rounded-2xl border border-white/10 backdrop-blur-md max-w-md w-full">
                <h2 className="text-3xl font-bold text-center mb-8">{t('statsTitle')}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-primary">{played}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{t('gamesPlayed')}</div>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-green-500">{winRate}%</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{t('winRate')}</div>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-blue-500">{currentStreak}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{t('currentStreak')}</div>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-yellow-500">{maxStreak}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{t('maxStreak')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
