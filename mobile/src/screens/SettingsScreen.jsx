import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Bell, Volume2, Globe } from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen({ navigation }) {
    const { t } = useTranslation();
    const { gameLanguage, setGameLanguage } = useGame();

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'left', 'right']}>
            <View className="flex-1 p-4">
            <View className="flex-row items-center mb-8">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    className="p-2 bg-gray-800 rounded-lg mr-4"
                >
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-white">{t('settings.title')}</Text>
            </View>

            <View className="gap-4">
                {/* Language */}
                <View className="bg-gray-800 p-4 rounded-xl flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <Globe size={24} color="#60A5FA" />
                        <Text className="text-white font-bold text-lg">{t('settings.language')}</Text>
                    </View>
                    <View className="flex-row gap-2 bg-gray-700 p-1 rounded-lg">
                        <TouchableOpacity 
                            onPress={() => setGameLanguage('tr')}
                            className={`px-3 py-1 rounded-md ${gameLanguage === 'tr' ? 'bg-blue-500' : ''}`}
                        >
                            <Text className="text-white font-bold">TR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setGameLanguage('en')}
                            className={`px-3 py-1 rounded-md ${gameLanguage === 'en' ? 'bg-blue-500' : ''}`}
                        >
                            <Text className="text-white font-bold">EN</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sound (Mock) */}
                <View className="bg-gray-800 p-4 rounded-xl flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <Volume2 size={24} color="#F87171" />
                        <Text className="text-white font-bold text-lg">{t('settings.sound')}</Text>
                    </View>
                    <Switch 
                        value={true} 
                        trackColor={{ false: "#374151", true: "#EF4444" }}
                        thumbColor="#ffffff"
                    />
                </View>

                {/* Notifications (Mock) */}
                <View className="bg-gray-800 p-4 rounded-xl flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <Bell size={24} color="#FBBF24" />
                        <Text className="text-white font-bold text-lg">{t('settings.notifications')}</Text>
                    </View>
                    <Switch 
                        value={false} 
                        trackColor={{ false: "#374151", true: "#EF4444" }}
                        thumbColor="#ffffff"
                    />
                </View>

                {/* Account (Mock) */}
                <View className="bg-gray-800 p-4 rounded-xl flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <User size={24} color="#A78BFA" />
                        <Text className="text-white font-bold text-lg">{t('settings.about')}</Text>
                    </View>
                    <Text className="text-gray-400">Guest</Text>
                </View>
            </View>

            <View className="mt-auto items-center">
                <Text className="text-gray-600">v1.0.0 (Beta)</Text>
            </View>
            </View>
        </SafeAreaView>
    );
}
