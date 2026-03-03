import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
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
    const initialized = useRef(false);

    useEffect(() => {
        // Fix for rendering issues and resize
        map.invalidateSize();

        if (position && !initialized.current) {
            map.flyTo(position, 15);
            initialized.current = true;
        }
    }, [position, map]);
    return null;
}

export default function MapView() {
    const { userLocation, spheres, locationError } = useGame();
    // Cache the initial location so the map doesn't snap back on every GPS update
    const initialLocationRef = useRef(null);
    
    // Store the first valid location
    if (userLocation && !initialLocationRef.current) {
        initialLocationRef.current = userLocation;
    }

    if (!userLocation) {
        return <div className="h-full w-full flex items-center justify-center text-white bg-gray-800">
            <div className="text-center px-4">
                {!locationError && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>}
                
                {locationError ? (
                    <>
                        <div className="text-red-500 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-red-400 font-medium">{locationError}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                        >
                            Retry
                        </button>
                    </>
                ) : (
                    <>
                        <p>Acquiring GPS Location...</p>
                        <p className="text-xs text-gray-400 mt-2">Please allow location access and wait</p>
                    </>
                )}
            </div>
        </div>;
    }

    return (
        <MapContainer 
            center={initialLocationRef.current} 
            zoom={15} 
            className="h-full w-full z-0"
            dragging={true}
            touchZoom={true} // Enables two-finger pinch-to-zoom
            scrollWheelZoom={true} // Enables mouse wheel zoom
            doubleClickZoom={true} // Enables double-tap to zoom
            tap={false} // Improves touch panning on mobile WebKit/Blink
            zoomControl={false} // We can add a custom one if needed, or keep default. Let's keep default actually, or false if it overlaps UI.
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
                keepBuffer={20}
                maxNativeZoom={19}
                maxZoom={20}
                updateWhenZooming={false}
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
