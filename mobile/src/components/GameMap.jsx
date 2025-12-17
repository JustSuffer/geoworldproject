import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useGame } from '../context/GameContext';

export default function GameMap() {
    const { userLocation, spheres } = useGame();

    // Default to Istanbul/Turkey if no location yet
    const initialRegion = {
        latitude: userLocation ? userLocation[0] : 41.0082,
        longitude: userLocation ? userLocation[1] : 28.9784,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#222' }}>
            {/* The Map */}
            <MapView
                style={{ flex: 1, width: '100%', height: '100%' }}
                initialRegion={initialRegion}
                // Do NOT use 'region' prop to avoid snapping back
                showsUserLocation={true}
            >
                {spheres.map((sphere) => (
                    <Circle
                        key={sphere.id}
                        center={{ latitude: sphere.lat, longitude: sphere.lng }}
                        radius={30} // meters
                        strokeColor={sphere.found ? '#10B981' : '#CBCBCB'}
                        fillColor={sphere.found ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'}
                        zIndex={2}
                    />
                ))}
            </MapView>
            
            {!userLocation && (
                <View className="absolute inset-0 items-center justify-center bg-black/60 pointer-events-none">
                    <ActivityIndicator size="large" color="#EF4444" />
                    <Text className="text-white mt-4 font-bold bg-black/40 px-3 py-1 rounded">Acquiring GPS...</Text>
                </View>
            )}
        </View>
    );
}
