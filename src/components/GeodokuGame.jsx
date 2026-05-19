import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { RefreshCw, Activity, Eye, EyeOff } from 'lucide-react';

export default function GeodokuGame() {
    const { 
        geodokuDifficulty, geodokuBoard, geodokuSolution, geodokuRevealed, 
        gameStatus, setGameStatus, distanceWalked, newGame, startTime, endTime, setEndTime
    } = useGame();

    const [userAnswers, setUserAnswers] = useState(() => {
        const saved = localStorage.getItem('geodokuAnswers');
        return saved ? JSON.parse(saved) : {};
    });
    const [selectedCell, setSelectedCell] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [showLiveStats, setShowLiveStats] = useState(false);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    // Save answers to local storage
    useEffect(() => {
        localStorage.setItem('geodokuAnswers', JSON.stringify(userAnswers));
    }, [userAnswers]);

    // Live Timer
    useEffect(() => {
        const updateElapsed = () => {
            const finalTime = endTime || Date.now();
            const diff = Math.max(0, finalTime - startTime);
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setElapsedTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        if (gameStatus !== 'playing') {
            updateElapsed();
            return;
        }

        const interval = setInterval(updateElapsed, 1000);
        updateElapsed();
        return () => clearInterval(interval);
    }, [startTime, endTime, gameStatus]);

    // Check Win Condition
    useEffect(() => {
        if (!geodokuBoard || !geodokuSolution || gameStatus !== 'playing') return;

        let isWon = true;
        for (let i = 0; i < 81; i++) {
            if (geodokuRevealed.includes(i)) continue;
            if (userAnswers[i] !== geodokuSolution[i]) {
                isWon = false;
                break;
            }
        }
        
        if (isWon) {
            setGameStatus('won');
            setEndTime(Date.now());
        }
    }, [userAnswers, geodokuRevealed, geodokuBoard, geodokuSolution, gameStatus, setGameStatus, setEndTime]);

    // Clear user answers when a new board is loaded
    useEffect(() => {
        if (gameStatus === 'playing' && geodokuRevealed.length < 30 && Object.keys(userAnswers).length > 0) {
            // Very simple heuristic to detect a fresh game: very few revealed cells and playing
            // but actually we can just rely on user clearing. Wait, better to clear when newGame is called.
        }
    }, [geodokuBoard]);

    const handleCellClick = (index) => {
        if (gameStatus !== 'playing') return;
        if (geodokuRevealed.includes(index)) return; // Cannot edit revealed cells
        setSelectedCell(index);
    };

    const handleNumberInput = (num) => {
        if (selectedCell === null || gameStatus !== 'playing') return;
        setUserAnswers(prev => ({
            ...prev,
            [selectedCell]: num.toString()
        }));
    };

    const handleClearCell = () => {
        if (selectedCell === null || gameStatus !== 'playing') return;
        setUserAnswers(prev => {
            const next = { ...prev };
            delete next[selectedCell];
            return next;
        });
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedCell === null || gameStatus !== 'playing') return;
            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(e.key);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleClearCell();
            } else if (e.key === 'ArrowUp' && selectedCell >= 9) {
                setSelectedCell(selectedCell - 9);
            } else if (e.key === 'ArrowDown' && selectedCell < 72) {
                setSelectedCell(selectedCell + 9);
            } else if (e.key === 'ArrowLeft' && selectedCell % 9 !== 0) {
                setSelectedCell(selectedCell - 1);
            } else if (e.key === 'ArrowRight' && selectedCell % 9 !== 8) {
                setSelectedCell(selectedCell + 1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, gameStatus]);

    if (!geodokuBoard) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full max-w-lg mx-auto pointer-events-none py-14 md:py-8">
            {/* Top Right Controls */}
            <div className="pointer-events-auto absolute top-4 right-4 flex items-center gap-2 z-50">
                <div className="relative">
                    <button 
                        onClick={() => setShowLiveStats(!showLiveStats)}
                        className={`p-3 rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg ${showLiveStats ? 'bg-primary text-white' : 'bg-gray-900/80 hover:bg-gray-800 text-white'}`}
                        title="Live Stats"
                    >
                        <Activity className="w-6 h-6" />
                    </button>
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

                <button 
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-3 bg-gray-900/80 hover:bg-gray-800 text-white rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all"
                >
                    {isVisible ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
            </div>

            <div 
                className={`
                ${isVisible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-20 opacity-0'}
                w-[95%] md:w-full bg-gray-900/95 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] 
                pt-4 pb-4 px-2 md:pt-8 md:pb-6 md:px-4 
                flex flex-col items-center transition-all duration-500 transform rounded-3xl
            `}>
                
                <div className="w-full max-w-[320px] md:max-w-[380px] mb-4 flex justify-between items-center text-white font-bold bg-black/40 p-3 rounded-xl border border-white/5">
                    <button 
                        onClick={() => { setUserAnswers({}); newGame(); }}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors shadow-lg shadow-green-900/20"
                    >
                        <RefreshCw className="w-4 h-4" />
                        NEW GAME
                    </button>
                    <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                        GEODOKU - {geodokuDifficulty.toUpperCase()}
                    </div>
                </div>

                {gameStatus === 'won' && (
                    <div className="mb-4 bg-green-500/20 border border-green-500 text-green-400 p-3 rounded-xl font-bold w-full max-w-[320px] md:max-w-[380px] text-center">
                        YOU SOLVED IT!
                    </div>
                )}

                <div className="grid grid-cols-9 gap-0.5 md:gap-1 bg-gray-600 p-1 rounded-xl mb-4 md:mb-6 select-none w-[300px] md:w-[360px] h-[300px] md:h-[360px]">
                    {Array.from({ length: 81 }).map((_, i) => {
                        const row = Math.floor(i / 9);
                        const col = i % 9;
                        const isRevealed = geodokuRevealed.includes(i);
                        const value = isRevealed ? geodokuSolution[i] : userAnswers[i];
                        
                        const isSelected = selectedCell === i;
                        const isSameGroup = selectedCell !== null && !isSelected && (
                            Math.floor(selectedCell / 9) === row || 
                            selectedCell % 9 === col ||
                            (Math.floor(Math.floor(selectedCell / 9) / 3) === Math.floor(row / 3) && Math.floor((selectedCell % 9) / 3) === Math.floor(col / 3))
                        );

                        // Calculate border radius for the board corners
                        let roundedClass = '';
                        if (i === 0) roundedClass = 'rounded-tl-lg';
                        if (i === 8) roundedClass = 'rounded-tr-lg';
                        if (i === 72) roundedClass = 'rounded-bl-lg';
                        if (i === 80) roundedClass = 'rounded-br-lg';

                        let bgClass = 'bg-gray-800';
                        if (isRevealed) bgClass = 'bg-gray-700 text-green-400 font-black'; // Revealed by moving
                        else if (value) bgClass = 'bg-gray-800 text-blue-300 font-bold'; // User entered
                        else bgClass = 'bg-gray-800 text-transparent'; // Empty
                        
                        if (isSelected) bgClass = 'bg-blue-600 text-white font-black';
                        else if (isSameGroup) bgClass += ' brightness-150';

                        // 3x3 grid borders
                        let borderClass = '';
                        if (col === 2 || col === 5) borderClass += ' border-r-2 border-gray-900';
                        if (row === 2 || row === 5) borderClass += ' border-b-2 border-gray-900';

                        return (
                            <div 
                                key={i}
                                onClick={() => handleCellClick(i)}
                                className={`
                                    flex items-center justify-center text-lg md:text-2xl cursor-pointer
                                    transition-all duration-150
                                    ${bgClass} ${roundedClass} ${borderClass}
                                `}
                            >
                                {value || ''}
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-5 gap-2 w-full max-w-[300px] md:max-w-[360px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumberInput(num)}
                            className="bg-gray-700 hover:bg-gray-600 text-white h-12 md:h-14 rounded-xl font-bold text-xl transition-colors active:scale-95"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={handleClearCell}
                        className="bg-red-900/50 hover:bg-red-800/50 text-red-300 h-12 md:h-14 rounded-xl font-bold text-xl transition-colors active:scale-95"
                    >
                        ⌫
                    </button>
                </div>

            </div>
        </div>
    );
}
