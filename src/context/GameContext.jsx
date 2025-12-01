import { createContext, useContext, useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { generateSpheres } from '../utils/generateSpheres';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null);
  // 6-letter Turkish words pool
  const WORDS = [
    "PLANET", "KARTAL", "BASKET", "KAPTAN", "MARKET", "PARKUR", 
    "SISTEM", "DOKTOR", "MANTAR", "KANTAR", "SANYIE", "KORFEZ"
  ];

  const getDailyWord = () => {
    const epochMs = new Date(2024, 0, 1).valueOf();
    const now = Date.now();
    const msPerDay = 86400000;
    const index = Math.floor((now - epochMs) / msPerDay) % WORDS.length;
    return WORDS[index];
  };

  const [dailyWord, setDailyWord] = useState(getDailyWord());

  // Update word at midnight
  useEffect(() => {
      const checkMidnight = () => {
          const newWord = getDailyWord();
          if (newWord !== dailyWord) {
              setDailyWord(newWord);
          }
      };
      
      const interval = setInterval(checkMidnight, 60000); // Check every minute
      return () => clearInterval(interval);
  }, [dailyWord]);
  const [spheres, setSpheres] = useState([]);
  const [foundLetters, setFoundLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Watch location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLoading(false);
      },
      (error) => {
        console.error("Error watching position:", error);
        setLoading(false);
        // For testing purposes, if geolocation fails, maybe set a default location?
        // setUserLocation([41.0, 29.0]); // Istanbul
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Generate spheres once we have a location (and haven't generated yet)
  useEffect(() => {
    if (userLocation && spheres.length === 0) {
      const newSpheres = generateSpheres(userLocation, 6, 0.5); // 0.5km radius
      // Assign letters
      const wordLetters = dailyWord.split('');
      newSpheres.forEach((sphere, index) => {
        sphere.letter = wordLetters[index] || '?';
      });
      setSpheres(newSpheres);
    }
  }, [userLocation, dailyWord, spheres.length]);

  // Check distance
  useEffect(() => {
    if (userLocation && spheres.length > 0) {
      const userPoint = turf.point([userLocation[1], userLocation[0]]);
      
      setSpheres(prevSpheres => {
        let updated = false;
        const newSpheres = prevSpheres.map(sphere => {
          if (sphere.found) return sphere;
          
          const spherePoint = turf.point([sphere.lng, sphere.lat]);
          const distance = turf.distance(userPoint, spherePoint, { units: 'meters' });
          
          if (distance < 50) { // 50 meters
            updated = true;
            return { ...sphere, found: true };
          }
          return sphere;
        });

        if (updated) {
            // Calculate newly found letters
            const newFound = newSpheres.filter(s => s.found).map(s => s.letter);
            // We need to be careful not to cause infinite loop if we update foundLetters here directly
            // But since we are inside setSpheres, we should probably use a separate effect or do it here carefully
             // Actually, let's just update spheres here. We can derive foundLetters from spheres.
             return newSpheres;
        }
        return prevSpheres;
      });
    }
  }, [userLocation]);

  // Update found letters when spheres change
  useEffect(() => {
      const found = spheres.filter(s => s.found).map(s => s.letter);
      // Only update if different to avoid loops
      setFoundLetters(prev => {
          if (prev.length !== found.length) return found;
          return prev;
      });
  }, [spheres]);

  return (
    <GameContext.Provider value={{ userLocation, spheres, dailyWord, foundLetters, score, loading }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
