import React from 'react';
import { X, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';

export default function CalendarModal({ onClose }) {
    const { t } = useTranslation();
    const { stats } = useGame();
    
    // Safety fallback
    const history = stats?.history || {};
    
    // Generate dates for the last 35 days (5 weeks)
    const today = new Date();
    const days = [];
    
    for (let i = 34; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
    }
    
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div 
            className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300 pointer-events-auto"
            onClick={onClose}
        >
            <div 
                className="bg-gray-900 text-white p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-sm relative border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>

                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-center text-xl md:text-2xl font-black tracking-tight mb-2 bg-gradient-to-r gap-2 flex items-center justify-center from-white to-gray-400 bg-clip-text text-transparent">
                    <Flame className="w-6 h-6 text-orange-500" />
                    PLAY HISTORY
                </h2>
                <div className="text-center text-sm text-gray-400 mb-6">Last 35 Days</div>
                
                {/* Stats Summary Area */}
                <div className="flex justify-around items-center mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex flex-col items-center">
                       <span className="text-2xl font-bold text-white">{stats?.currentStreak || 0}</span>
                       <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Current Streak</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                       <span className="text-2xl font-bold text-orange-400">{stats?.maxStreak || 0}</span>
                       <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Max Streak</span>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="w-full">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekdays.map((day, i) => (
                            <div key={`header-${i}`} className="text-center text-xs font-bold text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>
                    
                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {days.map((date, index) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const status = history[dateStr];
                            const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
                            
                            let bgClass = "bg-gray-800 border-gray-700 text-gray-500";
                            if (status === 'won') bgClass = "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]";
                            if (status === 'lost') bgClass = "bg-red-500/20 border-red-500 text-red-500";
                            if (isToday && !status) bgClass = "bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse";

                            return (
                                <div 
                                    key={index} 
                                    className={`
                                        aspect-square flex items-center justify-center rounded-lg border 
                                        text-xs md:text-sm font-bold transition-all relative
                                        ${bgClass}
                                    `}
                                    title={dateStr}
                                >
                                    {date.getDate()}
                                    {status === 'won' && <Flame className="w-3 h-3 absolute top-0.5 right-0.5 opacity-50" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
