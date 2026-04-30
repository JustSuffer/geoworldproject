import React from 'react';
import { Flame, Calendar as CalendarIcon, X } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function StreakHeader({ onCalendarClick }) {
    const { stats } = useGame();
    
    // Safety check just in case
    const currentStreak = stats?.currentStreak || 0;

    return (
        <div className="absolute top-4 left-4 z-[60] flex items-center gap-3">
            {/* Streak Indicator */}
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-auto">
                <Flame className={`w-5 h-5 md:w-6 md:h-6 ${currentStreak > 0 ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'text-gray-500'}`} />
                <span className={`font-bold font-mono text-sm md:text-base ${currentStreak > 0 ? 'text-white' : 'text-gray-400'}`}>
                    {currentStreak}
                </span>
            </div>
            
            {/* Calendar Button */}
            <button 
                onClick={onCalendarClick}
                className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/10 shadow-lg transition-colors pointer-events-auto"
                title="View History"
            >
                <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
        </div>
    );
}
