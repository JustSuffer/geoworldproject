import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapRecenter({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15);
        }
    }, [position, map]);
    return null;
}

export default function MapView() {
    const { userLocation, spheres } = useGame();

    if (!userLocation) {
        return <div className="h-full w-full flex items-center justify-center text-white bg-gray-800">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Acquiring GPS Location...</p>
                <p className="text-xs text-gray-400 mt-2">Please allow location access</p>
            </div>
        </div>;
    }

    return (
        <MapContainer center={userLocation} zoom={15} className="h-full w-full z-0">
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            <MapRecenter position={userLocation} />
            
            <Marker position={userLocation}>
                <Popup>You are here 👣</Popup>
            </Marker>

            {spheres.map((sphere) => (
                <Circle
                    key={sphere.id}
                    center={[sphere.lat, sphere.lng]}
                    radius={30} // 30 meters
                    pathOptions={{
                        color: sphere.found ? '#10B981' : '#CBCBCB', // Green if found, Light Gray if not
                        fillColor: sphere.found ? '#10B981' : '#B20B0B', // Green or Primary Red
                        fillOpacity: 0.6,
                        className: sphere.found ? '' : 'animate-pulse' // Pulse if not found
                    }}
                >
                    <Popup>
                        {sphere.found ? `Letter Found: ${sphere.letter}` : "Walk closer (within 50m) to unlock!"}
                    </Popup>
                </Circle>
            ))}
        </MapContainer>
    );
}
