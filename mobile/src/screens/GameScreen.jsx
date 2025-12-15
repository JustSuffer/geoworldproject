import React from 'react';
import { View } from 'react-native';
import GameMap from '../components/GameMap';
import WordleGame from '../components/WordleGame';
import { useGame } from '../context/GameContext';

export default function GameScreen({ navigation }) {
    return (
        <View className="flex-1 bg-black">
            {/* Map Layer (Background) */}
            <View className="absolute inset-0 z-0">
                <GameMap />
            </View>

            {/* UI Layer (Foreground) */}
            <View className="absolute inset-0 z-10 pointer-events-box-none">
                <WordleGame navigation={navigation} />
            </View>
        </View>
    );
}
