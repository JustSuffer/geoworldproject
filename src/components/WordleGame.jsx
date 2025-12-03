import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { supabase } from '../supabaseClient';
import { X, BarChart2, HelpCircle, Settings, RotateCcw, User, MapPin, Eye, EyeOff, RefreshCw } from 'lucide-react';
import AuthModal from './AuthModal';

// Constants
const WORD_LENGTH = 6;
const MAX_GUESSES = 5; 

export default function WordleGame({ onStats }) {
    const { dailyWord, foundLetters, gameMode, newGame } = useGame();
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
    const [statsOpen, setStatsOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    
    const [stats, setStats] = useState({
        played: 0,
        winRate: 0,
        currentStreak: 0,
        maxStreak: 0,
        distribution: [0, 0, 0, 0, 0, 0]
    });

    // Reset game when dailyWord changes (or mode changes)
    useEffect(() => {
        setGuesses([]);
        setCurrentGuess('');
        setGameStatus('playing');
    }, [dailyWord]);

    // Timer for Daily Mode
    useEffect(() => {
        if (gameMode !== 'daily') return;

        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const diff = tomorrow - now;
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(interval);
    }, [gameMode]);

    // Load stats from Supabase or LocalStorage on mount
    useEffect(() => {
        checkUser();
        loadStats();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) loadStats(user.id);
    };

    // Check game status
    useEffect(() => {
        if (guesses.length > 0) {
            const lastGuess = guesses[guesses.length - 1];
            if (lastGuess.toUpperCase() === dailyWord.toUpperCase()) {
                setGameStatus('won');
                updateStats(true, guesses.length);
                setStatsOpen(true);
            } else if (guesses.length >= MAX_GUESSES) {
                setGameStatus('lost');
                updateStats(false, 0);
                setStatsOpen(true);
            }
        }
    }, [guesses]);

    const loadStats = async (userId) => {
        let localStats = JSON.parse(localStorage.getItem('wordleStats')) || {
            played: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: {1:0, 2:0, 3:0, 4:0, 5:0}
        };

        if (userId) {
            const { data, error } = await supabase
                .from('profiles')
                .select('stats')
                .eq('id', userId)
                .single();
            
            if (data && data.stats) {
                localStats = { ...localStats, ...data.stats };
            }
        }
        
        const winRate = localStats.played > 0 ? Math.round((localStats.wins / localStats.played) * 100) : 0;
        setStats({ ...localStats, winRate });
    };

    const updateStats = async (won, guessCount) => {
        const newStats = { ...stats };
        newStats.played += 1;
        if (won) {
            newStats.wins = (newStats.wins || 0) + 1;
            newStats.currentStreak += 1;
            newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
            newStats.distribution[guessCount] = (newStats.distribution[guessCount] || 0) + 1;
        } else {
            newStats.currentStreak = 0;
        }
        
        newStats.winRate = Math.round((newStats.wins / newStats.played) * 100);
        setStats(newStats);
        localStorage.setItem('wordleStats', JSON.stringify(newStats));

        if (user) {
            await supabase.from('profiles').upsert({ 
                id: user.id,
                updated_at: new Date(),
                stats: newStats
            });
        }
    };

    const handleKeyup = (key) => {
        if (gameStatus !== 'playing') return;

        if (key === 'ENTER') {
            if (currentGuess.length !== WORD_LENGTH) {
                return;
            }
            setGuesses([...guesses, currentGuess]);
            setCurrentGuess('');
        } else if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (/^[A-Z\u00C0-\u017F]$/.test(key) && currentGuess.length < WORD_LENGTH) {
             setCurrentGuess(prev => prev + key);
        }
    };

    const onKeyPress = (key) => {
        handleKeyup(key);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toUpperCase();
            if (key === 'ENTER' || key === 'BACKSPACE') {
                handleKeyup(key);
            } else if (/^[A-Z\u011E\u00DC\u015E\u0130\u00D6\u00C7]$/.test(key)) {
                handleKeyup(key);
            } else if (/^[A-Z]$/.test(key)) {
                handleKeyup(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, gameStatus]);

    return (
        <div className="flex flex-col items-center justify-between h-full w-full max-w-lg mx-auto pointer-events-none">
            {/* Visibility Toggle Button */}
            <button 
                onClick={() => setIsVisible(!isVisible)}
                className="pointer-events-auto absolute top-4 right-4 p-3 bg-gray-900/80 hover:bg-gray-800 text-white rounded-full backdrop-blur-md z-50 transition-all"
                title={isVisible ? "Hide Game" : "Show Game"}
            >
                {isVisible ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </button>

            {/* Spacer for Map visibility */}
            <div className="flex-1 w-full"></div>

            {/* Game Container */}
            <div className={`
                pointer-events-auto w-full bg-gray-900/95 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pt-8 pb-6 px-4 flex flex-col items-center transition-all duration-500 transform rounded-t-3xl
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}>
                
                {/* Header Info (Timer or Play Again) */}
                <div className="w-full max-w-[380px] mb-4 flex justify-between items-center text-white font-bold bg-black/40 p-3 rounded-xl border border-white/5">
                    {gameMode === 'daily' ? (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">NEXT WORD:</span>
                            <span className="text-primary text-lg font-mono">{timeLeft}</span>
                        </div>
                    ) : (
                        <button 
                            onClick={newGame}
                            className="flex items-center gap-2 bg-primary hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors shadow-lg shadow-red-900/20"
                        >
                            <RefreshCw className="w-4 h-4" />
                            NEW WORD
                        </button>
                    )}
                    
                    <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                        {gameMode === 'daily' ? 'DAILY CHALLENGE' : 'UNLIMITED MODE'}
                    </div>
                </div>

                {/* Found Letters / Hints */}
                <div className="w-full max-w-[380px] mb-6 flex justify-center gap-2 bg-black/20 p-4 rounded-2xl border border-white/5">
                    {Array.from({ length: WORD_LENGTH }).map((_, i) => {
                        const letter = dailyWord[i];
                        const isFound = foundLetters.includes(letter); 
                        
                        return (
                            <div key={i} className={`
                                w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border-2 transition-all duration-300
                                ${isFound 
                                    ? 'bg-green-500 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)] transform scale-110' 
                                    : 'bg-gray-800 border-gray-700 text-gray-600'}
                            `}>
                                {isFound ? letter : '?'}
                            </div>
                        );
                    })}
                </div>

                {/* Grid */}
                <div className="w-full mb-6 flex justify-center">
                    <Grid guesses={guesses} currentGuess={currentGuess} targetWord={dailyWord} maxGuesses={MAX_GUESSES} />
                </div>

                {/* Keyboard */}
                <div className="w-full max-w-3xl">
                    <Keyboard onKeyPress={onKeyPress} guesses={guesses} targetWord={dailyWord} />
                </div>
            </div>

            {/* Modals */}
            {statsOpen && <StatsModal stats={stats} onClose={() => setStatsOpen(false)} nextWordTime={timeLeft} />}
            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={(u) => { setUser(u); loadStats(u.id); }} />}
        </div>
    );
}

function Grid({ guesses, currentGuess, targetWord, maxGuesses }) {
    const empties = maxGuesses - 1 - guesses.length;
    
    return (
        <div className="grid grid-rows-5 gap-2 w-full max-w-[380px]">
            {guesses.map((guess, i) => (
                <Row key={i} guess={guess} targetWord={targetWord} isFinal={true} />
            ))}
            {guesses.length < maxGuesses && (
                <Row guess={currentGuess} targetWord={targetWord} isFinal={false} />
            )}
            {Array.from({ length: empties > 0 ? empties : 0 }).map((_, i) => (
                <Row key={`empty-${i}`} guess="" targetWord={targetWord} isFinal={false} />
            ))}
        </div>
    );
}

function Row({ guess, targetWord, isFinal }) {
    const splitGuess = guess.split('');
    const splitTarget = targetWord.toUpperCase().split('');
    const length = 6;

    return (
        <div className="grid grid-cols-6 gap-2">
            {Array.from({ length }).map((_, i) => {
                const char = splitGuess[i];
                let status = 'empty';
                if (isFinal && char) {
                    if (char === splitTarget[i]) {
                        status = 'correct';
                    } else if (splitTarget.includes(char)) {
                        status = 'present';
                    } else {
                        status = 'absent';
                    }
                }

                let bgClass = 'bg-gray-800 border-2 border-gray-700';
                if (status === 'correct') bgClass = 'bg-green-600 border-green-500 shadow-[0_0_20px_rgba(22,163,74,0.6)] z-10';
                if (status === 'present') bgClass = 'bg-orange-500 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.6)] z-10';
                if (status === 'absent') bgClass = 'bg-gray-700 border-gray-600 opacity-80';
                if (!isFinal && char) bgClass = 'border-gray-400 bg-gray-700 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]';

                return (
                    <div key={i} className={`
                        w-full aspect-square flex items-center justify-center 
                        text-2xl md:text-3xl font-black uppercase select-none rounded-lg
                        transition-all duration-300 flip-animation transform
                        ${bgClass}
                    `}>
                        {char}
                    </div>
                );
            })}
        </div>
    );
}

function Keyboard({ onKeyPress, guesses, targetWord }) {
    const rows = [
        ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
        ['ENTER', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'BACKSPACE']
    ];

    const keyStatus = {};
    guesses.forEach(guess => {
        guess.split('').forEach((char, i) => {
            if (!keyStatus[char] || keyStatus[char] !== 'correct') {
                if (targetWord[i] === char) {
                    keyStatus[char] = 'correct';
                } else if (targetWord.includes(char)) {
                    if (keyStatus[char] !== 'correct') keyStatus[char] = 'present';
                } else {
                    if (!keyStatus[char]) keyStatus[char] = 'absent';
                }
            }
        });
    });

    return (
        <div className="flex flex-col gap-2 w-full px-1 pb-4">
            {rows.map((row, i) => (
                <div key={i} className="flex justify-center gap-1.5">
                    {row.map((key) => {
                        let bgClass = 'bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm border border-white/5';
                        if (keyStatus[key] === 'correct') bgClass = 'bg-green-600 border-green-500 shadow-[0_0_10px_rgba(22,163,74,0.3)]';
                        if (keyStatus[key] === 'present') bgClass = 'bg-orange-500 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
                        if (keyStatus[key] === 'absent') bgClass = 'bg-gray-800/50 text-gray-500 border-transparent';

                        const isWide = key === 'ENTER' || key === 'BACKSPACE';
                        
                        return (
                            <button
                                key={key}
                                onClick={() => onKeyPress(key)}
                                className={`
                                    ${isWide ? 'px-4 md:px-6 text-xs md:text-sm' : 'flex-1 aspect-[2/3] md:aspect-square max-w-[42px] md:max-w-[48px]'}
                                    h-12 md:h-14 rounded-xl font-bold text-white transition-all duration-200
                                    flex items-center justify-center active:scale-95
                                    ${bgClass}
                                `}
                            >
                                {key === 'BACKSPACE' ? '⌫' : key}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function StatsModal({ stats, onClose, nextWordTime }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#121213] text-white p-6 rounded-lg shadow-2xl w-full max-w-sm relative border border-gray-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X />
                </button>
                
                <h2 className="text-center font-bold mb-6">İSTATİSTİK</h2>
                
                <div className="flex justify-between mb-8 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold">{stats.played}</span>
                        <span className="text-xs text-gray-400">Oynanan</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold">{stats.winRate}</span>
                        <span className="text-xs text-gray-400">Galibiyet %</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold">{stats.currentStreak}</span>
                        <span className="text-xs text-gray-400">Seri</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold">{stats.maxStreak}</span>
                        <span className="text-xs text-gray-400">Max Seri</span>
                    </div>
                </div>

                <h3 className="font-bold mb-3">TAHMİN DAĞILIMI</h3>
                <div className="flex flex-col gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((num) => {
                        const count = stats.distribution[num] || 0;
                        const max = Math.max(...Object.values(stats.distribution), 1);
                        const width = Math.max((count / max) * 100, 7); // Min width for visibility
                        
                        return (
                            <div key={num} className="flex items-center gap-2">
                                <span className="w-2 text-xs">{num}</span>
                                <div 
                                    className={`h-5 flex items-center justify-end px-2 text-xs font-bold ${count > 0 ? 'bg-green-600' : 'bg-gray-700'}`}
                                    style={{ width: `${width}%` }}
                                >
                                    {count}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-400">SONRAKİ WORDLE</span>
                        <span className="text-xl md:text-2xl font-bold">{nextWordTime}</span>
                    </div>
                    <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded font-bold flex items-center gap-2">
                        PAYLAŞ <span className="text-xl">share</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
