import React from 'react';
import { View } from 'react-native';
import GameMap from '../components/GameMap';
import WordleGame from '../components/WordleGame';

export default function GameScreen({ navigation }) {
    return (
        <View className="flex-1 bg-gray-900">
            {/* Map Layer - Full Screen */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <GameMap />
            </View>

            {/* UI Layer - Full Screen, Transparent to touches where empty */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} pointerEvents="box-none">
                <WordleGame navigation={navigation} />
            </View>
        </View>
    );
}
