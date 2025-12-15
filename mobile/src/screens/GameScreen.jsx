import React from 'react';
import { View } from 'react-native';
import GameMap from '../components/GameMap';
import WordleGame from '../components/WordleGame';
import { useGame } from '../context/GameContext';

export default function GameScreen({ navigation }) {
    return (
        <View className="flex-1 bg-black">
            {/* <GameMap /> */}

            {/* <WordleGame navigation={navigation} /> */}
        </View>
    );
}
