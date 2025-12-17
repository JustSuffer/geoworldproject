import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Search, Edit3 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function HowToPlayScreen({ navigation }) {
    const { t } = useTranslation();

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'left', 'right']}>
            <ScrollView className="flex-1 p-4">
                <View className="flex-row items-center justify-center relative mb-8 mt-4">
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        className="absolute left-0 p-2 bg-gray-800 rounded-lg"
                    >
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-white text-center">{t('howToPlay.title')}</Text>
                </View>

                {/* Content Container with extra padding to prevent left cut-off */}
                <View className="pb-8 pl-4 pr-2">
                    <Step 
                        number="1"
                        title={t('howToPlay.step1Title')}
                        desc={t('howToPlay.step1Desc')}
                        icon={<MapPin size={28} color="#EF4444" />}
                    />
                    
                    <Step 
                        number="2"
                        title={t('howToPlay.step2Title')}
                        desc={t('howToPlay.step2Desc')}
                        icon={<Search size={28} color="#60A5FA" />}
                    />

                    <Step 
                        number="3"
                        title={t('howToPlay.step3Title')}
                        desc={t('howToPlay.step3Desc')}
                        icon={<Edit3 size={28} color="#34D399" />}
                    />

                    <View className="bg-gray-800 p-6 rounded-2xl mt-4 items-center mx-2">
                        <Text className="text-lg font-bold text-white mb-2">{t('howToPlay.dailyTitle')}</Text>
                        <Text className="text-gray-400 text-center text-sm">
                            {t('howToPlay.dailyDesc')}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function Step({ number, title, desc, icon }) {
    return (
        <View className="flex-row mb-6">
            <View className="items-center mr-4">
                <View className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center border border-white/10">
                    {icon}
                </View>
                <View className="w-0.5 flex-1 bg-gray-800 my-2" />
            </View>
            <View className="flex-1 pb-2">
                <Text className="text-white font-bold text-lg mb-1">{title}</Text>
                <Text className="text-gray-400 text-sm leading-relaxed">{desc}</Text>
            </View>
        </View>
    );
}
