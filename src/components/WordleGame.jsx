import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { supabase } from '../supabaseClient';
import { X, BarChart2, HelpCircle, Settings, RotateCcw, User } from 'lucide-react';
import AuthModal from './AuthModal';

// Constants
const WORD_LENGTH = 5; // As per standard Wordle, but user said "Tahmin sayısı 5 olacak" (5 guesses). 
// Usually word length is 5. User didn't specify word length, but standard is 5.
// User said "Tahmin sayısı 5 olacak" -> 5 Guesses allowed.
const MAX_GUESSES = 5; 

export default function WordleGame() {
    const { dailyWord } = useGame(); // Assuming dailyWord is available from context
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
    const [statsOpen, setStatsOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        played: 0,
        winRate: 0,
        currentStreak: 0,
        maxStreak: 0,
        distribution: [0, 0, 0, 0, 0, 0] // 1-6 guesses (though we only have 5, keeping 6 for safety or mapping)
    });

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
        
        // Calculate win rate
        const winRate = localStats.played > 0 ? Math.round((localStats.wins / localStats.played) * 100) : 0;
        setStats({ ...localStats, winRate });
    };

    const updateStats = async (won, guessCount) => {
        // Update local state and Supabase
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

        // Supabase integration
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
                // Shake animation or alert
                return;
            }
            setGuesses([...guesses, currentGuess]);
            setCurrentGuess('');
        } else if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (/^[A-Z\u00C0-\u017F]$/.test(key) && currentGuess.length < WORD_LENGTH) { // Support for Turkish chars if needed, or just A-Z
             // Basic A-Z check + Turkish chars
             setCurrentGuess(prev => prev + key);
        }
    };

    // Virtual Keyboard Input
    const onKeyPress = (key) => {
        handleKeyup(key);
    };

    // Physical Keyboard Input
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toUpperCase();
            if (key === 'ENTER' || key === 'BACKSPACE') {
                handleKeyup(key);
            } else if (/^[A-Z\u011E\u00DC\u015E\u0130\u00D6\u00C7]$/.test(key)) { // Turkish chars: Ğ, Ü, Ş, İ, Ö, Ç
                handleKeyup(key);
            } else if (/^[A-Z]$/.test(key)) {
                handleKeyup(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, gameStatus]);

    return (
        <div className="flex flex-col items-center justify-between h-full max-h-screen p-2 md:p-4 text-white">
            {/* Header */}
            <div className="flex items-center justify-between w-full max-w-lg border-b border-gray-600 pb-2 mb-2">
                <div className="w-8"></div> {/* Spacer */}
                <h1 className="text-2xl md:text-3xl font-bold tracking-wider">WORDLE TR</h1>
                <div className="flex gap-2">
                    <User className={`cursor-pointer hover:text-gray-300 ${user ? 'text-green-500' : ''}`} onClick={() => setAuthOpen(true)} />
                    <BarChart2 className="cursor-pointer hover:text-gray-300" onClick={() => setStatsOpen(true)} />
                    <Settings className="cursor-pointer hover:text-gray-300" />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                <Grid guesses={guesses} currentGuess={currentGuess} targetWord={dailyWord} maxGuesses={MAX_GUESSES} />
            </div>

            {/* Keyboard */}
            <div className="w-full max-w-3xl mt-4">
                <Keyboard onKeyPress={onKeyPress} guesses={guesses} targetWord={dailyWord} />
            </div>

            {/* Modals */}
            {statsOpen && <StatsModal stats={stats} onClose={() => setStatsOpen(false)} nextWordTime="08:45:44" />}
            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={(u) => { setUser(u); loadStats(u.id); }} />}
        </div>
    );
}

function Grid({ guesses, currentGuess, targetWord, maxGuesses }) {
    const empties = maxGuesses - 1 - guesses.length;
    
    return (
        <div className="grid grid-rows-5 gap-1.5 aspect-[5/6] h-full max-h-[400px] md:max-h-[500px]">
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
    const length = 5;

    return (
        <div className="grid grid-cols-5 gap-1.5">
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

                // Tailwind classes for colors
                // Correct: Green (bg-green-600)
                // Present: Orange (bg-orange-500) as requested
                // Absent: Gray (bg-gray-700)
                // Empty/Typing: Border
                
                let bgClass = 'bg-transparent border-2 border-gray-600';
                if (status === 'correct') bgClass = 'bg-green-600 border-green-600';
                if (status === 'present') bgClass = 'bg-orange-500 border-orange-500'; // User requested Orange
                if (status === 'absent') bgClass = 'bg-gray-700 border-gray-700';
                if (!isFinal && char) bgClass = 'border-gray-400 text-white'; // Typing

                return (
                    <div key={i} className={`
                        w-full h-full flex items-center justify-center 
                        text-2xl md:text-3xl font-bold uppercase select-none
                        transition-all duration-500 flip-animation
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

    // Calculate key statuses
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
                <div key={i} className="flex justify-center gap-1">
                    {row.map((key) => {
                        let bgClass = 'bg-gray-500 hover:bg-gray-400';
                        if (keyStatus[key] === 'correct') bgClass = 'bg-green-600';
                        if (keyStatus[key] === 'present') bgClass = 'bg-orange-500';
                        if (keyStatus[key] === 'absent') bgClass = 'bg-gray-800';

                        const isWide = key === 'ENTER' || key === 'BACKSPACE';
                        
                        return (
                            <button
                                key={key}
                                onClick={() => onKeyPress(key)}
                                className={`
                                    ${isWide ? 'px-3 md:px-6 text-xs md:text-sm' : 'flex-1 aspect-[2/3] md:aspect-square max-w-[40px] md:max-w-[45px]'}
                                    h-12 md:h-14 rounded font-bold text-white transition-colors
                                    flex items-center justify-center
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
