import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { X, Calendar, Infinity, Globe } from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { useTranslation } from 'react-i18next';

export default function GameSetupModal({ visible, onClose, onStart }) {
    const { t } = useTranslation();
    const { gameMode, setGameMode, gameLanguage, setGameLanguage, newGame } = useGame();
    
    // Local state to hold selection before starting
    const [selectedMode, setSelectedMode] = useState(gameMode);
    const [selectedLang, setSelectedLang] = useState(gameLanguage);

    const handleStart = () => {
        setGameMode(selectedMode);
        setGameLanguage(selectedLang);
        newGame(); // Initialize the game with new settings
        onStart();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/80 items-center justify-center p-4">
                <View className="bg-gray-900 w-full max-w-sm rounded-3xl p-6 border border-white/10 relative">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-black text-white text-center flex-1 ml-6">{t('setup.title')}</Text>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <X size={24} color="gray" />
                        </TouchableOpacity>
                    </View>

                    {/* Select Mode */}
                    <Text className="text-gray-400 text-xs font-bold mb-2 ml-1 uppercase tracking-wider text-center">{t('setup.selectMode')}</Text>
                    <View className="flex-row justify-between mb-6">
                        <SelectionCard 
                            active={selectedMode === 'daily'} 
                            onPress={() => setSelectedMode('daily')}
                            icon={<Calendar size={28} color={selectedMode === 'daily' ? '#60A5FA' : 'white'} />}
                            title={t('setup.dailyTitle')}
                            subtitle={t('setup.dailyDesc')}
                            color="border-blue-500 bg-blue-500/10"
                            style={{ marginRight: 8 }}
                        />
                        <SelectionCard 
                            active={selectedMode === 'unlimited'} 
                            onPress={() => setSelectedMode('unlimited')}
                            icon={<Infinity size={28} color={selectedMode === 'unlimited' ? '#A78BFA' : 'white'} />}
                            title={t('setup.unlimitedTitle')}
                            subtitle={t('setup.unlimitedDesc')}
                            color="border-purple-500 bg-purple-500/10"
                            style={{ marginLeft: 8 }}
                        />
                    </View>

                    {/* Select Language */}
                    <Text className="text-gray-400 text-xs font-bold mb-2 ml-1 uppercase tracking-wider text-center">{t('setup.selectLanguage')}</Text>
                    <View className="flex-row justify-between mb-8">
                        <LanguageCard 
                            active={selectedLang === 'tr'} 
                            onPress={() => setSelectedLang('tr')}
                            code="TR"
                            name={t('setup.turkish')}
                            style={{ marginRight: 8 }}
                        />
                        <LanguageCard 
                            active={selectedLang === 'en'} 
                            onPress={() => setSelectedLang('en')}
                            code="GB"
                            name={t('setup.english')}
                            style={{ marginLeft: 8 }}
                        />
                    </View>

                    {/* Start Button */}
                    <TouchableOpacity 
                        onPress={handleStart}
                        className="bg-gray-800 hover:bg-gray-700 w-full py-4 rounded-xl items-center border border-white/10"
                    >
                        <Text className="text-gray-400 font-bold text-lg">{t('setup.startGame')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function SelectionCard({ active, onPress, icon, title, subtitle, color, style }) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className={`flex-1 p-3 rounded-2xl border-2 items-center justify-center h-32 ${active ? color : 'border-white/10 bg-gray-800'}`}
            style={style}
        >
            <View className="mb-1">{icon}</View>
            <Text className="text-white font-bold text-center text-sm mb-0.5">{title}</Text>
            <Text className="text-gray-400 text-[9px] text-center leading-tight">{subtitle}</Text>
        </TouchableOpacity>
    );
}

function LanguageCard({ active, onPress, code, name, style }) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className={`flex-1 p-3 rounded-2xl border-2 items-center justify-center h-20 ${active ? 'border-white bg-white/10' : 'border-white/10 bg-gray-800'}`}
            style={style}
        >
            <Text className="text-white font-bold text-lg">{code}</Text>
            <Text className="text-gray-400 text-[10px]">{name}</Text>
        </TouchableOpacity>
    );
}
