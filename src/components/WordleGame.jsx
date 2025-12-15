import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { supabase } from '../supabaseClient';
import { X, BarChart2, HelpCircle, Settings, RotateCcw, User, MapPin, Eye, EyeOff, RefreshCw, Activity, Share2, Home, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthModal from './AuthModal';

// Constants
const WORD_LENGTH = 6;
const MAX_GUESSES = 5; 

export default function WordleGame({ onStats }) {
    const { 
        dailyWord, foundLetters, gameMode, newGame, startTime, distanceWalked,
        guesses, setGuesses, currentGuess, setCurrentGuess, gameStatus, setGameStatus
    } = useGame();
    const [statsOpen, setStatsOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [showLiveStats, setShowLiveStats] = useState(false);
    
    const [stats, setStats] = useState({
        played: 0,
        winRate: 0,
        currentStreak: 0,
        maxStreak: 0,
        distribution: [0, 0, 0, 0, 0, 0]
    });

    // Reset game when dailyWord changes (or mode changes)
    // Reset effect removed - handled in GameContext

    // Live Timer
    useEffect(() => {
        if (gameStatus !== 'playing') return;

        const updateElapsed = () => {
            const now = Date.now();
            const diff = now - startTime;
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setElapsedTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        const interval = setInterval(updateElapsed, 1000);
        updateElapsed();
        return () => clearInterval(interval);
    }, [startTime, gameStatus]);

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

    // Hidden input ref for native keyboard on mobile
    const inputRef = useRef(null);

    // Focus hidden input when clicking on game area
    const handleGameClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value.toUpperCase();
        // We only care about the last character added if it's a letter
        // But since we reset it, we just check the value
        if (!val) return; // Handle backspace separately via onKeyDown if needed, or just check length
        
        const lastChar = val.slice(-1);
        if (/^[A-Z\u00C0-\u017F]$/.test(lastChar)) {
            handleKeyup(lastChar);
        }
        // Reset input to keep it empty or simple
        e.target.value = '';
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Backspace') {
            handleKeyup('BACKSPACE');
        } else if (e.key === 'Enter') {
            handleKeyup('ENTER');
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            // If we are typing in the hidden input, ignore global window events to avoid double firing
            if (document.activeElement === inputRef.current) return;

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
        <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full max-w-lg mx-auto pointer-events-none py-14 md:py-8">
            {/* Top Right Controls */}
            <div className="pointer-events-auto absolute top-4 right-4 flex items-center gap-2 z-50">
                {/* Live Stats Button */}
                <div className="relative">
                    <button 
                        onClick={() => setShowLiveStats(!showLiveStats)}
                        className={`p-3 rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg ${showLiveStats ? 'bg-primary text-white' : 'bg-gray-900/80 hover:bg-gray-800 text-white'}`}
                        title="Live Stats"
                    >
                        <Activity className="w-6 h-6" />
                    </button>
                    
                    {/* Live Stats Popover */}
                    {showLiveStats && (
                        <div className="absolute top-14 right-0 w-48 bg-gray-900/95 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-md text-white">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-xs uppercase">Time</span>
                                    <span className="font-mono font-bold text-lg text-primary">{elapsedTime}</span>
                                </div>
                                <div className="h-px bg-white/10"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-xs uppercase">Distance</span>
                                    <span className="font-mono font-bold text-lg text-green-400">{distanceWalked.toFixed(2)} km</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Visibility Toggle Button */}
                <button 
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-3 bg-gray-900/80 hover:bg-gray-800 text-white rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all"
                    title={isVisible ? "Hide Game" : "Show Game"}
                >
                    {isVisible ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
            </div>

            {/* Game Container */}
            <div 
                onClick={handleGameClick}
                className={`
                pointer-events-auto w-[95%] md:w-full bg-gray-900/95 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] 
                pt-4 pb-4 px-2 md:pt-8 md:pb-6 md:px-4 
                flex flex-col items-center transition-all duration-500 transform rounded-3xl
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
            `}>
                {/* Hidden Input for Mobile Keyboard */}
                <input
                    ref={inputRef}
                    type="text"
                    className="opacity-0 absolute top-0 left-0 h-0 w-0 pointer-events-none text-base"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    enterKeyHint="enter"
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                />
                
                {/* Header Info (Timer or Play Again) */}
                <div className="w-full max-w-[320px] md:max-w-[380px] mb-4 flex justify-between items-center text-white font-bold bg-black/40 p-3 rounded-xl border border-white/5">
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
                <div className="w-full max-w-[320px] md:max-w-[380px] mb-2 md:mb-6 flex justify-center gap-1 md:gap-2 bg-black/20 p-2 md:p-4 rounded-2xl border border-white/5">
                    {Array.from({ length: WORD_LENGTH }).map((_, i) => {
                        const letter = dailyWord[i];
                        const isFound = foundLetters.includes(letter); 
                        
                        return (
                            <div key={i} className={`
                                w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-base md:text-lg font-bold border-2 transition-all duration-300
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
                <div className="w-full mb-2 md:mb-6 flex justify-center">
                    <Grid guesses={guesses} currentGuess={currentGuess} targetWord={dailyWord} maxGuesses={MAX_GUESSES} />
                </div>

                {/* Keyboard */}
                <div className="w-full max-w-3xl">
                    <Keyboard onKeyPress={onKeyPress} guesses={guesses} targetWord={dailyWord} />
                </div>
            </div>

            {/* Modals */}
            {statsOpen && (
                <StatsModal 
                    stats={stats} 
                    onClose={() => setStatsOpen(false)} 
                    nextWordTime={timeLeft} 
                    gameLanguage={useGame().gameLanguage}
                    guesses={guesses}
                    dailyWord={dailyWord}
                />
            )}
            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={(u) => { setUser(u); loadStats(u.id); }} />}
        </div>
    );
}

function Grid({ guesses, currentGuess, targetWord, maxGuesses }) {
    const empties = maxGuesses - 1 - guesses.length;
    
    return (
        <div className="grid grid-rows-5 gap-1 md:gap-2 w-full max-w-[320px] md:max-w-[380px]">
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
        <div className="grid grid-cols-6 gap-1 md:gap-2">
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
        <div className="flex flex-col gap-1 md:gap-2 w-full px-1 pb-2 md:pb-4">
            {rows.map((row, i) => (
                <div key={i} className="flex justify-center gap-0.5 md:gap-1.5">
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
                                    ${isWide ? 'px-1 md:px-6 text-[10px] md:text-sm' : 'flex-1 aspect-[2/3] md:aspect-square max-w-[36px] md:max-w-[48px] text-xs md:text-base'}
                                    min-w-0 h-9 md:h-14 rounded-lg md:rounded-xl font-bold text-white transition-all duration-200
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

function StatsModal({ stats, onClose, nextWordTime, gameLanguage, guesses, dailyWord }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const grid = guesses.map(guess => {
            return guess.split('').map((char, i) => {
                if (char === dailyWord[i]) return '🟩';
                if (dailyWord.includes(char)) return '🟨';
                return '⬛';
            }).join('');
        }).join('\n');

        const title = "GeoWord Quest";
        const score = guesses[guesses.length - 1] === dailyWord ? guesses.length : 'X';
        const text = `${title} ${score}/6\n\n${grid}`;

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300 pointer-events-auto"
            onClick={onClose}
        >
            <div 
                className="bg-gray-900 text-white p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md relative border border-white/10 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>

                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-center text-2xl font-black tracking-tight mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {t('statistics') || 'STATISTICS'}
                </h2>
                
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-2xl md:text-3xl font-bold text-white">{stats.played}</span>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Played</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-2xl md:text-3xl font-bold text-green-400">{stats.winRate}</span>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Win %</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-2xl md:text-3xl font-bold text-blue-400">{stats.currentStreak}</span>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Streak</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-2xl md:text-3xl font-bold text-purple-400">{stats.maxStreak}</span>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Max</span>
                    </div>
                </div>

                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Guess Distribution</h3>
                <div className="flex flex-col gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((num) => {
                        const count = stats.distribution[num] || 0;
                        const max = Math.max(...Object.values(stats.distribution), 1);
                        const width = Math.max((count / max) * 100, 7);
                        
                        return (
                            <div key={num} className="flex items-center gap-3">
                                <span className="w-3 text-xs font-mono text-gray-500">{num}</span>
                                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${count > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-transparent'}`}
                                        style={{ width: `${width}%` }}
                                    ></div>
                                </div>
                                <span className="w-6 text-xs text-right font-bold text-gray-300">{count}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Next Wordle</span>
                            <span className="text-xl font-mono font-bold text-white">{nextWordTime}</span>
                        </div>
                        <button 
                            onClick={handleShare}
                            className={`
                                px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95
                                ${copied ? 'bg-white text-green-600' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'}
                            `}
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                            {copied 
                                ? (gameLanguage === 'tr' ? 'KOPYALANDI' : 'COPIED') 
                                : (gameLanguage === 'tr' ? 'PAYLAŞ' : 'SHARE')
                            }
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/20"
                    >
                        <Home className="w-5 h-5" />
                        {gameLanguage === 'tr' ? 'ANA MENÜ' : 'MAIN MENU'}
                    </button>
                </div>
            </div>
        </div>
    );
}
