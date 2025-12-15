import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Play, BarChart2, Settings, HelpCircle, User, AlertTriangle } from 'lucide-react-native';
import { useGame } from '../context/GameContext';

export default function HomeScreen({ navigation }) {
    const { gameMode, newGame, isGameStarted, setIsGameStarted, resetGame } = useGame();
    const [setupOpen, setSetupOpen] = useState(false);
    const [showResetWarning, setShowResetWarning] = useState(false);

    const handleContinue = () => {
        navigation.navigate('Game');
    };

    const handlePlayClick = () => {
        if (isGameStarted) {
            setShowResetWarning(true);
        } else {
            // For now, simple start logic without full modal for simplicity in first pass
            // Or we can assume default 'daily' mode or just trigger newGame
            // Let's implement basic mode selection if needed, or just start daily
            // Since we don't have the modal yet, let's just trigger daily new game
            newGame();
            navigation.navigate('Game');
        }
    };

    const t = (key) => key; // Mock translation for now, will implement i18n later if needed

    return (
        <View className="flex-1 items-center justify-center bg-gray-900 p-4 relative">
             {/* Background Effects */}
             <View className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" style={{ opacity: 0.2 }} />
             <View className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" style={{ opacity: 0.2 }} />

            {/* Header */}
            <View className="z-10 items-center mb-12">
                <Text className="text-5xl font-black text-white mb-2 shadow-lg">
                    GEOWORD
                </Text>
                <Text className="text-2xl font-bold text-red-500 tracking-[0.5em] uppercase">
                    QUEST
                </Text>
            </View>

            {/* Menu Buttons */}
            <View className="z-10 w-full max-w-xs gap-4">
                {isGameStarted && (
                    <TouchableOpacity 
                        onPress={handleContinue}
                        className="bg-blue-600 p-4 rounded-xl flex-row items-center justify-center gap-3 shadow-lg shadow-blue-500/30"
                    >
                        <Play size={24} color="white" fill="white" />
                        <Text className="text-white font-bold text-xl">CONTINUE</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    onPress={handlePlayClick}
                    className="bg-red-500 p-4 rounded-xl flex-row items-center justify-center gap-3 shadow-lg shadow-red-500/30"
                >
                    <Play size={24} color="white" fill="white" />
                    <Text className="text-white font-bold text-xl">PLAY</Text>
                </TouchableOpacity>

                <View className="flex-row gap-4">
                    <TouchableOpacity 
                        className="flex-1 bg-gray-800 p-4 rounded-xl items-center justify-center gap-2"
                        // onPress={() => navigation.navigate('Statistics')}
                    >
                        <BarChart2 size={24} color="white" />
                        <Text className="text-white text-xs font-bold">STATISTICS</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className="flex-1 bg-gray-800 p-4 rounded-xl items-center justify-center gap-2"
                        // onPress={() => navigation.navigate('Settings')}
                    >
                        <Settings size={24} color="white" />
                        <Text className="text-white text-xs font-bold">SETTINGS</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    className="bg-gray-800 p-4 rounded-xl flex-row items-center justify-center gap-3"
                    // onPress={() => navigation.navigate('HowToPlay')}
                >
                    <HelpCircle size={24} color="white" />
                    <Text className="text-white font-bold">HOW TO PLAY</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="absolute bottom-8">
                <Text className="text-white/30 text-sm">v1.0.0 • GeoWord Quest</Text>
            </View>
            
            {/* Reset Warning Modal */}
            <Modal
                transparent={true}
                visible={showResetWarning}
                animationType="fade"
                onRequestClose={() => setShowResetWarning(false)}
            >
                <View className="flex-1 items-center justify-center bg-black/80 p-4">
                    <View className="bg-gray-900 border border-red-500/50 p-6 rounded-2xl w-full max-w-sm">
                        <View className="items-center gap-4">
                            <View className="w-16 h-16 bg-red-500/20 rounded-full items-center justify-center mb-2">
                                <AlertTriangle size={32} color="#EF4444" />
                            </View>
                            <Text className="text-2xl font-bold text-white">Warning!</Text>
                            <Text className="text-gray-300 text-center">
                                Starting a new game will reset your current progress. Are you sure you want to continue?
                            </Text>
                            
                            <View className="flex-row gap-3 w-full mt-4">
                                <TouchableOpacity 
                                    onPress={() => setShowResetWarning(false)}
                                    className="flex-1 py-3 px-4 bg-gray-800 rounded-xl items-center"
                                >
                                    <Text className="text-white font-bold">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => {
                                        setShowResetWarning(false);
                                        newGame();
                                        navigation.navigate('Game');
                                    }}
                                    className="flex-1 py-3 px-4 bg-red-600 rounded-xl items-center"
                                >
                                    <Text className="text-white font-bold">New Game</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
