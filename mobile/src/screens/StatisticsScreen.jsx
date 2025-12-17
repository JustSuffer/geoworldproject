import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Flame, Target, Calendar } from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { useTranslation } from 'react-i18next';

export default function StatisticsScreen({ navigation }) {
    const { t } = useTranslation();
    const { distanceWalked, score, gameMode } = useGame();

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'left', 'right']}>
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
            <View className="flex-row items-center justify-center relative mb-8 mt-4">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    className="absolute left-0 p-2 bg-gray-800 rounded-lg"
                >
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-white">{t('stats.title')}</Text>
            </View>

            {/* Top Row */}
            <View className="flex-row justify-center mb-4">
                <StatCard 
                    title={t('stats.totalScore')}
                    value={score} 
                    icon={<Trophy size={24} color="#FBBF24" />} 
                    color="bg-yellow-500/20"
                    style={{ marginRight: 12 }}
                />
                <StatCard 
                    title={t('stats.distance')}
                    value={`${distanceWalked.toFixed(2)} km`} 
                    icon={<GlobeIcon size={24} color="#34D399" />} 
                    color="bg-green-500/20"
                    style={{ marginLeft: 12 }}
                />
            </View>

            {/* Bottom Row */}
            <View className="flex-row justify-center">
                <StatCard 
                    title={t('stats.streak')}
                    value="1" 
                    icon={<Flame size={24} color="#EF4444" />} 
                    color="bg-red-500/20"
                    style={{ marginRight: 12 }}
                />
                <StatCard 
                    title={t('stats.gamesPlayed')}
                    value="1" 
                    icon={<Target size={24} color="#60A5FA" />} 
                    color="bg-blue-500/20"
                    style={{ marginLeft: 12 }}
                />
            </View>

            <Text className="text-white font-bold text-xl mt-8 mb-4">{t('stats.recentGames')}</Text>
            <View className="bg-gray-800 rounded-xl p-4">
                <View className="flex-row justify-between border-b border-gray-700 pb-2 mb-2">
                    <Text className="text-gray-400">{t('stats.date')}</Text>
                    <Text className="text-gray-400">{t('stats.mode')}</Text>
                    <Text className="text-gray-400">{t('stats.score')}</Text>
                </View>
                {/* Mock Data */}
                <View className="flex-row justify-between py-2">
                    <Text className="text-white">{t('stats.today')}</Text>
                    <Text className="text-blue-400 uppercase">{gameMode === 'daily' ? t('common.daily') : t('common.unlimited')}</Text>
                    <Text className="text-green-400 font-bold">{t('stats.win')}</Text>
                </View>
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function StatCard({ title, value, icon, color, style }) {
    return (
        <View 
            className="bg-gray-800 p-4 rounded-2xl items-center justify-center w-40 h-40"
            style={style}
        >
            <View className={`p-3 rounded-full mb-2 ${color}`}>
                {icon}
            </View>
            <Text className="text-2xl font-black text-white text-center mb-1">{value}</Text>
            <Text className="text-gray-400 text-xs text-center font-bold uppercase">{title}</Text>
        </View>
    );
}

// Helper icon component since Globe isn't imported from lucide in this file directly
function GlobeIcon({ size, color }) {
    return <Target size={size} color={color} />;
}
