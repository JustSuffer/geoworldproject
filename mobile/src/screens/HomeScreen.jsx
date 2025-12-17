import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, BarChart2, Settings, HelpCircle, AlertTriangle } from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import GameSetupModal from '../components/GameSetupModal';
import { useTranslation } from 'react-i18next';

export default function HomeScreen({ navigation }) {
    const { t } = useTranslation();
    const { isGameStarted, newGame } = useGame();
    const [setupOpen, setSetupOpen] = useState(false);
    const [showResetWarning, setShowResetWarning] = useState(false);

    const handleContinue = () => {
        navigation.navigate('Game');
    };

    const handlePlayClick = () => {
        if (isGameStarted) {
            setShowResetWarning(true);
        } else {
            setSetupOpen(true);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'left', 'right']}>
             <View className="flex-1 items-center justify-center p-4 pb-48 relative">
             {/* Background Effects */}
             <View className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" style={{ opacity: 0.2 }} />
             <View className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" style={{ opacity: 0.2 }} />

            {/* Header */}
            <View className="z-10 items-center mb-8">
                <Image 
                    source={require('../../assets/logo.png')} 
                    style={{ width: Dimensions.get('window').width * 0.95, height: 300 }} 
                    resizeMode="contain"
                />
            </View>

            {/* Menu Buttons - Centered and full width max */}
            <View className="z-10 w-full max-w-sm items-center">
                {/* Continue button */}
                {isGameStarted ? (
                    <TouchableOpacity 
                        onPress={handleContinue}
                        className="bg-blue-600 w-full p-4 rounded-xl flex-row items-center justify-center mb-4 shadow-lg shadow-blue-500/30"
                    >
                        <Play size={24} color="white" fill="white" style={{ marginRight: 12 }} />
                        <Text className="text-white font-bold text-xl">{t('common.continue')}</Text>
                    </TouchableOpacity>
                ) : null}

                <TouchableOpacity 
                    onPress={handlePlayClick}
                    className="bg-red-500 w-full p-4 rounded-xl flex-row items-center justify-center mb-4 shadow-lg shadow-red-500/30"
                >
                    <Play size={24} color="white" fill="white" style={{ marginRight: 12 }} />
                    <Text className="text-white font-bold text-xl uppercase">{t('common.play')}</Text>
                </TouchableOpacity>

                <View className="flex-row w-full mb-4">
                    <TouchableOpacity 
                        className="flex-1 bg-gray-800 p-4 rounded-xl items-center justify-center mr-2"
                        onPress={() => navigation.navigate('Statistics')}
                    >
                        <BarChart2 size={24} color="white" style={{ marginBottom: 8 }} />
                        <Text className="text-white text-xs font-bold uppercase">{t('common.statistics')}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className="flex-1 bg-gray-800 p-4 rounded-xl items-center justify-center ml-2"
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Settings size={24} color="white" style={{ marginBottom: 8 }} />
                        <Text className="text-white text-xs font-bold uppercase">{t('common.settings')}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    className="bg-gray-800 w-full p-4 rounded-xl flex-row items-center justify-center mb-4"
                    onPress={() => navigation.navigate('HowToPlay')}
                >
                    <HelpCircle size={24} color="white" style={{ marginRight: 12 }} />
                    <Text className="text-white font-bold uppercase">{t('common.howToPlay')}</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="absolute bottom-8">
                <Text className="text-white/30 text-sm">{t('home.version')}</Text>
            </View>
            
            {/* Game Setup Modal */}
            <GameSetupModal 
                visible={setupOpen} 
                onClose={() => setSetupOpen(false)}
                onStart={() => {
                    setSetupOpen(false);
                    navigation.navigate('Game');
                }}
            />

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
                            <Text className="text-2xl font-bold text-white text-center">{t('common.warning')}</Text>
                            <Text className="text-gray-300 text-center">
                                {t('home.resetWarning')}
                            </Text>
                            
                            <View className="flex-row gap-3 w-full mt-4">
                                <TouchableOpacity 
                                    onPress={() => setShowResetWarning(false)}
                                    className="flex-1 py-3 px-4 bg-gray-800 rounded-xl items-center"
                                >
                                    <Text className="text-white font-bold">{t('common.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => {
                                        setShowResetWarning(false);
                                        setSetupOpen(true);
                                    }}
                                    className="flex-1 py-3 px-4 bg-red-600 rounded-xl items-center"
                                >
                                    <Text className="text-white font-bold">{t('common.newGame')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            </View>
        </SafeAreaView>
    );
}
