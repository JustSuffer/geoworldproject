import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useGame } from '../context/GameContext';

export default function GameMap() {
    const { userLocation, spheres } = useGame();

    if (!userLocation) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-800">
                <ActivityIndicator size="large" color="#EF4444" />
                <Text className="text-white mt-4">Acquiring GPS Location...</Text>
                <Text className="text-xs text-gray-400 mt-2">Please allow location access</Text>
            </View>
        );
    }
    
    // Convert [lat, lng] to {latitude, longitude}
    const region = {
        latitude: userLocation[0],
        longitude: userLocation[1],
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
    };

    return (
        <MapView
            style={{ flex: 1, width: '100%', height: '100%' }}
            initialRegion={region}
            showsUserLocation={true}
            followsUserLocation={true}
            // provider={PROVIDER_GOOGLE} // Optional: Enable if Google Maps is configured
        >
            {/* 
                We don't strictly need a Marker for userLocation if showsUserLocation is true,
                but keeping it consistent with web logic if needed. 
                Commonly on mobile, the blue dot is sufficient.
            */}

            {spheres.map((sphere) => (
                <Circle
                    key={sphere.id}
                    center={{ latitude: sphere.lat, longitude: sphere.lng }}
                    radius={30} // meters
                    strokeColor={sphere.found ? '#10B981' : '#CBCBCB'}
                    fillColor={sphere.found ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'} // Green or Primary Red
                    zIndex={2}
                />
            ))}
        </MapView>
    );
}
