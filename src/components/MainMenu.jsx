import React from 'react';
import { Play, BarChart2, Settings, HelpCircle, User } from 'lucide-react';

export default function MainMenu({ onPlay, onStats, onAuth }) {
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
                <button 
                    onClick={onPlay}
                    className="group relative bg-primary hover:bg-red-700 text-white p-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(178,11,11,0.4)] hover:shadow-[0_0_30px_rgba(178,11,11,0.6)] flex items-center justify-center gap-3"
                >
                    <Play className="w-6 h-6 fill-current" />
                    PLAY
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={onStats}
                        className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2"
                    >
                        <BarChart2 className="w-6 h-6" />
                        <span className="text-xs">STATISTICS</span>
                    </button>
                    
                    <button 
                        className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2"
                    >
                        <Settings className="w-6 h-6" />
                        <span className="text-xs">SETTINGS</span>
                    </button>
                </div>

                <button 
                    className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
                >
                    <HelpCircle className="w-6 h-6" />
                    HOW TO PLAY
                </button>
            </div>

            {/* Auth Button (Top Right) */}
            <button 
                onClick={onAuth}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
                title="Sign Up / Login"
            >
                <User className="w-6 h-6" />
            </button>

            {/* Footer */}
            <div className="absolute bottom-8 text-white/30 text-sm">
                v1.0.0 • GeoWord Quest
            </div>
        </div>
    );
}
