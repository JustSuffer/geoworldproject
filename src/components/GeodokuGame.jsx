import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { RefreshCw, Activity, Eye, EyeOff, Edit3, Undo, Eraser, Lightbulb, Heart } from 'lucide-react';

export default function GeodokuGame() {
    const { 
        geodokuDifficulty, geodokuBoard, geodokuSolution, geodokuRevealed, 
        geodokuStatus, setGeodokuStatus, distanceWalked, newGame, startTime, endTime, setEndTime,
        geodokuLives, setGeodokuLives
    } = useGame();

    const [userAnswers, setUserAnswers] = useState(() => {
        const saved = localStorage.getItem('geodokuAnswers');
        return saved ? JSON.parse(saved) : {};
    });
    
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('geodokuNotes');
        return saved ? JSON.parse(saved) : {};
    });

    const [history, setHistory] = useState([]);
    
    const [selectedCell, setSelectedCell] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [showLiveStats, setShowLiveStats] = useState(false);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [notesMode, setNotesMode] = useState(false);

    // Save state to local storage
    useEffect(() => {
        localStorage.setItem('geodokuAnswers', JSON.stringify(userAnswers));
    }, [userAnswers]);

    useEffect(() => {
        localStorage.setItem('geodokuNotes', JSON.stringify(notes));
    }, [notes]);

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

        if (geodokuStatus !== 'playing') {
            updateElapsed();
            return;
        }

        const interval = setInterval(updateElapsed, 1000);
        updateElapsed();
        return () => clearInterval(interval);
    }, [startTime, endTime, geodokuStatus]);

    // Check Win Condition
    useEffect(() => {
        if (!geodokuBoard || !geodokuSolution || geodokuStatus !== 'playing') return;

        let isWon = true;
        for (let i = 0; i < 81; i++) {
            if (geodokuRevealed.includes(i)) continue;
            if (userAnswers[i] !== geodokuSolution[i]) {
                isWon = false;
                break;
            }
        }
        
        if (isWon) {
            setGeodokuStatus('won');
            setEndTime(Date.now());
        }
    }, [userAnswers, geodokuRevealed, geodokuBoard, geodokuSolution, geodokuStatus, setGeodokuStatus, setEndTime]);

    // Clear answers/notes on new game
    useEffect(() => {
        if (geodokuStatus === 'playing' && geodokuRevealed.length < 30 && Object.keys(userAnswers).length === 0 && Object.keys(notes).length === 0) {
            setHistory([]);
        }
    }, [geodokuBoard]);

    const getRowColBlock = (index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        return { row, col, block };
    };

    const pushHistory = (action) => {
        setHistory(prev => [...prev, action]);
    };

    const handleCellClick = (index) => {
        if (geodokuStatus !== 'playing') return;
        setSelectedCell(index);
    };

    const autoRemoveNotes = (index, numStr) => {
        const { row, col, block } = getRowColBlock(index);
        const newNotes = { ...notes };
        let notesChanged = false;
        
        for (let i = 0; i < 81; i++) {
            if (i === index) continue;
            const target = getRowColBlock(i);
            if (target.row === row || target.col === col || target.block === block) {
                if (newNotes[i] && newNotes[i].includes(numStr)) {
                    newNotes[i] = newNotes[i].filter(n => n !== numStr);
                    if (newNotes[i].length === 0) delete newNotes[i];
                    notesChanged = true;
                }
            }
        }
        
        if (notesChanged) {
            setNotes(newNotes);
            return newNotes; // Return updated notes for history
        }
        return notes;
    };

    const handleNumberInput = useCallback((num) => {
        if (selectedCell === null || geodokuStatus !== 'playing') return;
        if (geodokuRevealed.includes(selectedCell)) return; // Cannot edit revealed cells
        
        const numStr = num.toString();

        if (notesMode) {
            // Handle Notes
            if (userAnswers[selectedCell]) return; // Don't add notes if there's a big number
            
            const currentNotes = notes[selectedCell] || [];
            let updatedNotes;
            if (currentNotes.includes(numStr)) {
                updatedNotes = currentNotes.filter(n => n !== numStr);
            } else {
                updatedNotes = [...currentNotes, numStr].sort();
            }
            
            const nextNotes = { ...notes };
            if (updatedNotes.length > 0) {
                nextNotes[selectedCell] = updatedNotes;
            } else {
                delete nextNotes[selectedCell];
            }
            
            pushHistory({
                type: 'note',
                index: selectedCell,
                prevNotes: notes,
                newNotes: nextNotes
            });
            
            setNotes(nextNotes);
            
        } else {
            // Handle Normal Input
            const prevValue = userAnswers[selectedCell];
            if (prevValue === numStr) return; // Same number

            const nextAnswers = { ...userAnswers, [selectedCell]: numStr };
            const prevNotesState = notes;
            
            setUserAnswers(nextAnswers);
            
            if (numStr !== geodokuSolution[selectedCell]) {
                const newLives = geodokuLives - 1;
                setGeodokuLives(newLives);
                if (newLives <= 0) {
                    setGeodokuStatus('lost');
                    setEndTime(Date.now());
                }
            }
            
            // Auto remove notes
            const nextNotesState = autoRemoveNotes(selectedCell, numStr);
            
            pushHistory({
                type: 'answer',
                index: selectedCell,
                prevValue,
                newValue: numStr,
                prevNotes: prevNotesState,
                newNotes: nextNotesState
            });
        }
    }, [selectedCell, geodokuStatus, notesMode, geodokuRevealed, userAnswers, notes, geodokuSolution, geodokuLives]);

    const handleClearCell = useCallback(() => {
        if (selectedCell === null || geodokuStatus !== 'playing') return;
        if (geodokuRevealed.includes(selectedCell)) return; // Cannot edit revealed cells
        
        const prevValue = userAnswers[selectedCell];
        const prevNotesForCell = notes[selectedCell];

        if (!prevValue && !prevNotesForCell) return; // Nothing to clear

        const nextAnswers = { ...userAnswers };
        delete nextAnswers[selectedCell];
        
        const nextNotes = { ...notes };
        delete nextNotes[selectedCell];

        pushHistory({
            type: 'clear',
            index: selectedCell,
            prevValue,
            prevNotesState: notes,
            newNotesState: nextNotes
        });

        setUserAnswers(nextAnswers);
        setNotes(nextNotes);
    }, [selectedCell, geodokuStatus, geodokuRevealed, userAnswers, notes]);

    const handleUndo = useCallback(() => {
        if (geodokuStatus !== 'playing' || history.length === 0) return;
        
        const lastAction = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        
        setSelectedCell(lastAction.index);

        if (lastAction.type === 'note') {
            setNotes(lastAction.prevNotes);
        } else if (lastAction.type === 'answer') {
            const nextAnswers = { ...userAnswers };
            if (lastAction.prevValue) {
                nextAnswers[lastAction.index] = lastAction.prevValue;
            } else {
                delete nextAnswers[lastAction.index];
            }
            setUserAnswers(nextAnswers);
            setNotes(lastAction.prevNotes);
        } else if (lastAction.type === 'clear') {
            if (lastAction.prevValue) {
                setUserAnswers(prev => ({ ...prev, [lastAction.index]: lastAction.prevValue }));
            }
            setNotes(lastAction.prevNotesState);
        }
    }, [history, geodokuStatus, userAnswers]);

    const handleHint = useCallback(() => {
        if (selectedCell === null || geodokuStatus !== 'playing') return;
        if (geodokuRevealed.includes(selectedCell)) return;
        if (userAnswers[selectedCell] === geodokuSolution[selectedCell]) return;

        const correctNum = geodokuSolution[selectedCell];
        
        const prevValue = userAnswers[selectedCell];
        const nextAnswers = { ...userAnswers, [selectedCell]: correctNum };
        const prevNotesState = notes;
        
        setUserAnswers(nextAnswers);
        const nextNotesState = autoRemoveNotes(selectedCell, correctNum);
        
        pushHistory({
            type: 'answer',
            index: selectedCell,
            prevValue,
            newValue: correctNum,
            prevNotes: prevNotesState,
            newNotes: nextNotesState
        });

    }, [selectedCell, geodokuStatus, geodokuRevealed, userAnswers, geodokuSolution, notes]);


    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (geodokuStatus !== 'playing') return;
            
            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(e.key);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleClearCell();
            } else if (e.key.toLowerCase() === 'n') {
                setNotesMode(prev => !prev);
            } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                handleUndo();
            } else if (e.key === 'ArrowUp') {
                setSelectedCell(prev => (prev === null ? 0 : (prev >= 9 ? prev - 9 : prev)));
            } else if (e.key === 'ArrowDown') {
                setSelectedCell(prev => (prev === null ? 0 : (prev < 72 ? prev + 9 : prev)));
            } else if (e.key === 'ArrowLeft') {
                setSelectedCell(prev => (prev === null ? 0 : (prev % 9 !== 0 ? prev - 1 : prev)));
            } else if (e.key === 'ArrowRight') {
                setSelectedCell(prev => (prev === null ? 0 : (prev % 9 !== 8 ? prev + 1 : prev)));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNumberInput, handleClearCell, handleUndo, geodokuStatus]);

    if (!geodokuBoard) return null;

    const getHighlightedNumber = () => {
        if (selectedCell === null) return null;
        if (geodokuRevealed.includes(selectedCell)) return geodokuSolution[selectedCell];
        return userAnswers[selectedCell] || null;
    };

    const activeNumber = getHighlightedNumber();

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
                
                <div className="w-full max-w-[340px] md:max-w-[400px] mb-4 flex justify-between items-center text-white font-bold bg-black/40 p-3 rounded-xl border border-white/5">
                    <button 
                        onClick={() => { 
                            localStorage.removeItem('geodokuAnswers'); 
                            localStorage.removeItem('geodokuNotes');
                            setUserAnswers({}); 
                            setNotes({}); 
                            setHistory([]); 
                            newGame('geodoku'); 
                        }}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors shadow-lg shadow-green-900/20"
                    >
                        <RefreshCw className="w-4 h-4" />
                        NEW GAME
                    </button>
                    <div className="flex gap-1">
                        {[1, 2, 3].map((life) => (
                            <Heart 
                                key={life} 
                                className={`w-5 h-5 ${life <= geodokuLives ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} 
                            />
                        ))}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex flex-col items-end">
                        <span>GEODOKU</span>
                        <span className="text-primary">{geodokuDifficulty}</span>
                    </div>
                </div>

                {geodokuStatus === 'won' && (
                    <div className="mb-4 bg-green-500/20 border border-green-500 text-green-400 p-3 rounded-xl font-bold w-full max-w-[340px] md:max-w-[400px] text-center animate-pulse">
                        🎉 YOU SOLVED IT! 🎉
                    </div>
                )}
                
                {geodokuStatus === 'lost' && (
                    <div className="mb-4 bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-xl font-bold w-full max-w-[340px] md:max-w-[400px] text-center animate-pulse">
                        💔 GAME OVER! 💔
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-9 gap-[1px] md:gap-[2px] bg-gray-600 p-1 rounded-xl mb-4 md:mb-6 select-none w-[340px] md:w-[400px] h-[340px] md:h-[400px] shadow-2xl">
                    {Array.from({ length: 81 }).map((_, i) => {
                        const { row, col, block } = getRowColBlock(i);
                        const isRevealed = geodokuRevealed.includes(i);
                        const value = isRevealed ? geodokuSolution[i] : userAnswers[i];
                        const cellNotes = notes[i] || [];
                        const isError = !isRevealed && value && value !== geodokuSolution[i];
                        
                        const isSelected = selectedCell === i;
                        let isSameGroup = false;
                        if (selectedCell !== null && !isSelected) {
                            const selectedTarget = getRowColBlock(selectedCell);
                            isSameGroup = selectedTarget.row === row || selectedTarget.col === col || selectedTarget.block === block;
                        }
                        
                        const isSameNumber = activeNumber && value === activeNumber && !isSelected;

                        // Calculate border radius for the board corners
                        let roundedClass = '';
                        if (i === 0) roundedClass = 'rounded-tl-lg';
                        if (i === 8) roundedClass = 'rounded-tr-lg';
                        if (i === 72) roundedClass = 'rounded-bl-lg';
                        if (i === 80) roundedClass = 'rounded-br-lg';

                        // Background Colors
                        let bgClass = 'bg-gray-800';
                        if (isSelected) bgClass = 'bg-blue-600';
                        else if (isError) bgClass = 'bg-red-900/50';
                        else if (isSameNumber) bgClass = 'bg-blue-500/40';
                        else if (isSameGroup) bgClass = 'bg-blue-900/30';

                        // Text Colors
                        let textClass = '';
                        if (isRevealed) textClass = 'text-green-400 font-black';
                        else if (isError) textClass = 'text-red-400 font-bold';
                        else if (value) textClass = 'text-blue-300 font-bold';

                        // 3x3 grid borders (thicker inner borders)
                        let borderClass = '';
                        if (col === 2 || col === 5) borderClass += ' border-r-[2px] md:border-r-[3px] border-r-gray-900';
                        if (row === 2 || row === 5) borderClass += ' border-b-[2px] md:border-b-[3px] border-b-gray-900';

                        return (
                            <div 
                                key={i}
                                onClick={() => handleCellClick(i)}
                                className={`
                                    relative flex items-center justify-center text-2xl md:text-3xl cursor-pointer
                                    transition-colors duration-150
                                    ${bgClass} ${roundedClass} ${borderClass} ${textClass}
                                `}
                            >
                                {value ? value : (
                                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-0.5 pointer-events-none">
                                        {[1,2,3,4,5,6,7,8,9].map(n => (
                                            <div key={n} className="flex items-center justify-center text-[10px] md:text-xs text-gray-400 leading-none">
                                                {cellNotes.includes(n.toString()) ? n : ''}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Toolbar */}
                <div className="flex justify-between w-full max-w-[340px] md:max-w-[400px] mb-4 px-2">
                    <button 
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${history.length > 0 ? 'text-white hover:bg-gray-800 active:scale-95' : 'text-gray-600'}`}
                    >
                        <div className="bg-gray-800 p-3 rounded-full"><Undo className="w-5 h-5" /></div>
                        <span className="text-xs font-semibold">Undo</span>
                    </button>
                    <button 
                        onClick={handleClearCell}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl text-white hover:bg-gray-800 transition-all active:scale-95"
                    >
                        <div className="bg-gray-800 p-3 rounded-full"><Eraser className="w-5 h-5" /></div>
                        <span className="text-xs font-semibold">Erase</span>
                    </button>
                    <button 
                        onClick={() => setNotesMode(!notesMode)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95 ${notesMode ? 'text-blue-400' : 'text-white hover:bg-gray-800'}`}
                    >
                        <div className={`p-3 rounded-full transition-colors ${notesMode ? 'bg-blue-900/50' : 'bg-gray-800'}`}><Edit3 className="w-5 h-5" /></div>
                        <span className="text-xs font-semibold">{notesMode ? 'Notes On' : 'Notes Off'}</span>
                    </button>
                    <button 
                        onClick={handleHint}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl text-white hover:bg-gray-800 transition-all active:scale-95"
                    >
                        <div className="bg-gray-800 p-3 rounded-full"><Lightbulb className="w-5 h-5" /></div>
                        <span className="text-xs font-semibold">Hint</span>
                    </button>
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-5 gap-2 md:gap-3 w-full max-w-[340px] md:max-w-[400px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumberInput(num)}
                            className="bg-gray-700 hover:bg-gray-600 text-white h-14 md:h-16 rounded-xl font-bold text-2xl md:text-3xl transition-colors active:scale-95 shadow-md flex items-center justify-center"
                        >
                            {num}
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}
