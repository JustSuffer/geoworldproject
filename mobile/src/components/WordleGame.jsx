import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Share, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { Activity, Eye, EyeOff, RefreshCw, Share2, X, Home, ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

const WORD_LENGTH = 6;
const MAX_GUESSES = 5;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function WordleGame({ navigation }) {
    const { t } = useTranslation();
    const { 
        dailyWord, foundLetters, gameMode, newGame, startTime, distanceWalked,
        guesses, setGuesses, currentGuess, setCurrentGuess, gameStatus, setGameStatus
    } = useGame();
    
    const insets = useSafeAreaInsets();
    
    const [statsOpen, setStatsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [timeLeft, setTimeLeft] = useState('');
    const [showLiveStats, setShowLiveStats] = useState(false);
    
    // Timer Logic
    useEffect(() => {
        // Reset immediately on start time change
        setElapsedTime('00:00:00');
        
        if (gameStatus !== 'playing') return;
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - startTime;
            // Cap at 24 hours
            if (diff >= 24 * 60 * 60 * 1000) {
                 setElapsedTime('00:00:00');
                 return;
            }
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setElapsedTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, gameStatus]);

    useEffect(() => {
        if (gameMode !== 'daily') return;
        const interval = setInterval(() => {
             const now = new Date();
             const tomorrow = new Date(now);
             tomorrow.setDate(tomorrow.getDate() + 1);
             tomorrow.setHours(0, 0, 0, 0);
             const diff = tomorrow - now;
             const h = Math.floor(diff / (1000 * 60 * 60));
             const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
             const s = Math.floor((diff % (1000 * 60)) / 1000);
             setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [gameMode]);

    // Check Status
    useEffect(() => {
        if (guesses.length > 0) {
            const lastGuess = guesses[guesses.length - 1];
            if (lastGuess.toUpperCase() === dailyWord.toUpperCase()) {
                setGameStatus('won');
                setStatsOpen(true);
            } else if (guesses.length >= MAX_GUESSES) {
                setGameStatus('lost');
                setStatsOpen(true);
            }
        }
    }, [guesses]);

    const handleKeyup = (key) => {
        if (gameStatus !== 'playing') return;
        if (key === 'ENTER') {
            if (currentGuess.length !== WORD_LENGTH) return;
            setGuesses([...guesses, currentGuess]);
            setCurrentGuess('');
        } else if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (/^[A-Z\u00C0-\u017F]$/.test(key) && currentGuess.length < WORD_LENGTH) {
             setCurrentGuess(prev => prev + key);
        }
    };

    // Hidden Input for native keyboard
    const inputRef = useRef(null);
    const handleGameClick = () => {
        if (inputRef.current) inputRef.current.focus();
    };

    // Calculate stats (simple mock)
    const stats = {
        played: guesses.length > 0 ? 1 : 0,
        winRate: 100,
        currentStreak: 1,
        maxStreak: 1
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 items-center justify-center relative pointer-events-box-none"
        >
            {/* Top Controls - Dynamic Safe Area */}
            <View 
                className="absolute left-4 right-4 flex-row items-center justify-between z-50"
                style={{ top: insets.top + 10 }} // Dynamic top padding
            >
                {/* Back to Menu */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Home')}
                    className="flex-row items-center bg-gray-900/90 py-2 px-4 rounded-full border border-white/20 shadow-lg"
                >
                    <ArrowLeft size={20} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold text-xs tracking-wider">{t('common.menu')}</Text>
                </TouchableOpacity>

                {/* Right Side Tools */}
                <View className="flex-row">
                    <TouchableOpacity 
                        onPress={() => setShowLiveStats(!showLiveStats)}
                        className={`p-3 rounded-full border shadow-lg mr-2 ${showLiveStats ? 'bg-red-500 border-red-400' : 'bg-gray-900/90 border-white/20'}`}
                    >
                        <Activity size={24} color="white" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => setIsVisible(!isVisible)}
                        className="p-3 bg-gray-900/90 rounded-full border border-white/20 shadow-lg"
                    >
                        {isVisible ? <EyeOff size={24} color="white" /> : <Eye size={24} color="white" />}
                    </TouchableOpacity>
                </View>
            </View>

             {/* Live Stats Popover */}
             {showLiveStats && (
                <View className="absolute top-24 right-4 w-48 bg-gray-900/95 border border-white/10 rounded-xl p-4 z-50">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-400 text-xs">{t('game.time')}</Text>
                        <Text className="text-red-500 font-bold">{elapsedTime}</Text>
                    </View>
                    <View className="h-[1px] bg-white/10 my-2" />
                    <View className="flex-row justify-between items-center">
                        <Text className="text-gray-400 text-xs">{t('game.distance')}</Text>
                        <Text className="text-green-400 font-bold">{distanceWalked.toFixed(2)} km</Text>
                    </View>
                </View>
            )}

            {/* Game Container (Floating Card) */}
            <TouchableOpacity 
                activeOpacity={1} 
                onPress={handleGameClick}
                className={`
                    w-[95%] bg-gray-900/95 border border-white/10 rounded-3xl p-4 items-center shadow-xl
                    transition-all duration-500
                    ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-20 secret-hide'}
                `}
                style={{
                  display: isVisible ? 'flex' : 'none', 
                  marginTop: 60 // Add top margin to avoid status bar overlap
                }}
            >
                 <TextInput
                    ref={inputRef}
                    className="opacity-0 absolute w-0 h-0"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    value=""
                    onChangeText={(text) => {
                        const char = text.toUpperCase().slice(-1);
                        if (/^[A-Z\u00C0-\u017F]$/.test(char)) handleKeyup(char);
                    }}
                    onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace') handleKeyup('BACKSPACE');
                        if (nativeEvent.key === 'Enter') handleKeyup('ENTER');
                    }}
                 />

                 {/* Header Info */}
                 <View className="w-full max-w-[320px] mb-4 flex-row justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                    {gameMode === 'daily' ? (
                        <View className="flex-row items-center gap-2">
                             <Text className="text-gray-400 text-xs">{t('common.next')}:</Text>
                             <Text className="text-red-500 text-lg font-mono">{timeLeft}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={newGame} className="bg-red-500 px-4 py-2 rounded-lg flex-row gap-2">
                            <RefreshCw size={16} color="white" />
                            <Text className="text-white font-bold">{t('common.newGame').replace('GAME', '')}</Text> 
                        </TouchableOpacity>
                    )}
                    <Text className="text-xs text-gray-400 font-bold">
                        {gameMode === 'daily' ? t('common.daily') : t('common.unlimited')}
                    </Text>
                 </View>

                 {/* Found Letters */}
                 <View className="w-full max-w-[320px] mb-4 flex-row justify-center gap-1 bg-black/20 p-2 rounded-2xl border border-white/5">
                    {Array.from({ length: WORD_LENGTH }).map((_, i) => {
                        const letter = dailyWord[i];
                        const isFound = foundLetters.includes(letter);
                        return (
                            <View key={i} className={`
                                w-10 h-10 rounded-xl items-center justify-center border-2
                                ${isFound ? 'bg-green-500 border-green-400' : 'bg-gray-800 border-gray-700'}
                            `}>
                                <Text className={`text-lg font-bold ${isFound ? 'text-white' : 'text-gray-600'}`}>
                                    {isFound ? letter : '?'}
                                </Text>
                            </View>
                        );
                    })}
                 </View>

                 {/* Grid */}
                 <Grid guesses={guesses} currentGuess={currentGuess} targetWord={dailyWord} maxGuesses={MAX_GUESSES} />

                 {/* Keyboard */}
                 <Keyboard onKeyPress={handleKeyup} guesses={guesses} targetWord={dailyWord} />

            </TouchableOpacity>

            {/* Stats Modal */}
            <Modal visible={statsOpen} transparent animationType="fade">
                <View className="flex-1 bg-black/80 items-center justify-center p-4">
                    <View className="bg-gray-900 w-full max-w-sm rounded-3xl p-6 border border-white/10">
                        <TouchableOpacity 
                            onPress={() => setStatsOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-white/5 rounded-full"
                        >
                            <X size={20} color="white" />
                        </TouchableOpacity>
                        
                        <Text className="text-center text-2xl font-black text-white mb-6">{t('common.statistics')}</Text>
                        
                        <View className="flex-row justify-between mb-6">
                            <StatBox label={t('stats.gamesPlayed')} value={stats.played || 1} />
                            <StatBox label={t('stats.winRate')} value={stats.winRate || 100} color="text-green-400" />
                            <StatBox label={t('stats.streak')} value={stats.currentStreak || 1} color="text-blue-400" />
                            <StatBox label={t('stats.maxStreak')} value={stats.maxStreak || 1} color="text-purple-400" />
                        </View>
                        
                        <View className="border-t border-white/10 pt-4 gap-3">
                             <TouchableOpacity 
                                className="bg-green-600 py-3 rounded-xl flex-row justify-center items-center gap-2"
                                onPress={() => Share.share({ message: `I won GeoWord Quest! ${guesses.length}/6` })}
                             >
                                 <Share2 size={20} color="white" />
                                 <Text className="text-white font-bold">{t('common.share')}</Text>
                             </TouchableOpacity>
                             
                             <TouchableOpacity 
                                className="bg-gray-800 py-3 rounded-xl flex-row justify-center items-center gap-2"
                                onPress={() => {
                                    setStatsOpen(false);
                                    if (navigation && navigation.navigate) {
                                        navigation.navigate('Home');
                                    } else {
                                        console.log("Navigation not available");
                                    }
                                }}
                             >
                                 <Home size={20} color="white" />
                                 <Text className="text-white font-bold">{t('common.mainMenu')}</Text>
                             </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

function StatBox({ label, value, color = "text-white" }) {
    return (
        <View className="items-center p-2 bg-white/5 rounded-xl border border-white/5 flex-1 mx-1">
            <Text className={`text-xl font-bold ${color}`}>{value}</Text>
            <Text className="text-[10px] text-gray-400 mt-1">{label}</Text>
        </View>
    );
}

function Grid({ guesses, currentGuess, targetWord, maxGuesses }) {
    const empties = maxGuesses - 1 - guesses.length;
    return (
        <View className="mb-4">
            {guesses.map((guess, i) => <Row key={i} guess={guess} targetWord={targetWord} isFinal={true} />)}
            {guesses.length < maxGuesses && <Row guess={currentGuess} targetWord={targetWord} isFinal={false} />}
             {Array.from({ length: empties > 0 ? empties : 0 }).map((_, i) => (
                <Row key={`empty-${i}`} guess="" targetWord={targetWord} isFinal={false} />
            ))}
        </View>
    );
}

function Row({ guess, targetWord, isFinal }) {
    const splitGuess = guess ? guess.split('') : [];
    const splitTarget = targetWord ? targetWord.toUpperCase().split('') : []; // Safety check
    
    return (
        <View className="flex-row gap-1 mb-1">
             {Array.from({ length: 6 }).map((_, i) => {
                 const char = splitGuess[i];
                 let bgClass = 'bg-gray-800 border-gray-700';
                 if (isFinal && char) {
                     if (char === splitTarget[i]) bgClass = 'bg-green-600 border-green-500';
                     else if (splitTarget.includes(char)) bgClass = 'bg-orange-500 border-orange-400';
                     else bgClass = 'bg-gray-700 border-gray-600';
                 }
                 return (
                     <View key={i} className={`w-10 h-10 items-center justify-center border-2 rounded-lg ${bgClass}`}>
                         <Text className="text-white font-bold text-xl">{char}</Text>
                     </View>
                 );
             })}
        </View>
    );
}

function Keyboard({ onKeyPress, guesses, targetWord }) {
    const rows = [
        ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
        ['ENTER', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'BACKSPACE']
    ];
    
    // Simple logic for key colors could be added here
    return (
        <View className="w-full pb-0">
            {rows.map((row, i) => (
                <View key={i} className="flex-row justify-center mb-1">
                    {row.map((key) => (
                        <TouchableOpacity 
                            key={key} 
                            onPress={() => onKeyPress(key)}
                            className={`
                                ${key.length > 1 ? 'px-2' : 'w-8'}
                                h-10 bg-gray-700 rounded-lg items-center justify-center mx-0.5
                                active:bg-gray-600
                            `}
                        >
                            <Text className="text-white text-[10px] font-bold">{key === 'BACKSPACE' ? '⌫' : key}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
}
