import { createContext, useContext, useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { generateSpheres } from '../utils/generateSpheres';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null);
  const [gameMode, setGameMode] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).gameMode || 'daily') : 'daily';
  }); 
  const [gameLanguage, setGameLanguage] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).gameLanguage || 'tr') : 'tr';
  });
  
  // Word Pools
  const WORDS_TR = [
    "KARTAL", "BASKET", "KAPTAN", "MARKET", "PARKUR", 
    "SISTEM", "DOKTOR", "MANTAR", "KANTAR", "SANYIE", "KORFEZ", "DEPREM", "SIMSEK", "YAGMUR"
  ];
  
  const WORDS_EN = [
    "PLANET", "ROCKET", "MARKET", "DOCTOR", "SYSTEM", 
    "FOREST", "ISLAND", "GARDEN", "TRAVEL", "WINTER", "SUMMER", "NATURE", "ENERGY"
  ];

  const getDailyIndex = () => {
    const epochMs = new Date(2024, 0, 1).valueOf();
    const now = Date.now();
    const msPerDay = 86400000;
    return Math.floor((now - epochMs) / msPerDay);
  };

  const getDailyWord = (lang) => {
    const pool = lang === 'en' ? WORDS_EN : WORDS_TR;
    return pool[getDailyIndex() % pool.length];
  };

  const getRandomWord = (lang) => {
    const pool = lang === 'en' ? WORDS_EN : WORDS_TR;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const [dailyWord, setDailyWord] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).savedWord || "") : "";
  });
  
  // Initialize word based on mode and language
  useEffect(() => {
      if (gameMode === 'daily') {
          setDailyWord(getDailyWord(gameLanguage));
      } else {
          // For unlimited, only set if empty to preserve session on reload
          if (!dailyWord) {
              setDailyWord(getRandomWord(gameLanguage));
          }
      }
  }, [gameMode, gameLanguage]);

  const newGame = () => {
      if (gameMode === 'unlimited') {
          setDailyWord(getRandomWord(gameLanguage));
          
          // Reuse existing spheres if they exist, just update letters
          // This prevents the map from "jumping" or spheres moving around
          if (spheres.length > 0) {
             // We will update the spheres in the useEffect that watches dailyWord
             // But we need to ensure we don't clear them here
             // We just reset the found status
             setSpheres(prev => prev.map(s => ({ ...s, found: false })));
          } else {
             setSpheres([]); // Only clear if we really want to regenerate (e.g. language change handled elsewhere)
          }

          setFoundLetters([]);
          setGuesses([]);
          setCurrentGuess('');
          setGameStatus('playing');
          setIsGameStarted(true);
      }
  };

  const resetGame = () => {
      setGuesses([]);
      setCurrentGuess('');
      setGameStatus('playing');
      setFoundLetters([]);
      setSpheres([]);
      // We don't necessarily change dailyWord here, as it depends on mode/lang
      // But clearing spheres will trigger regeneration
  };

  // Update daily word at midnight if in daily mode
  useEffect(() => {
      if (gameMode !== 'daily') return;

      const checkMidnight = () => {
          const newWord = getDailyWord(gameLanguage);
          if (newWord !== dailyWord) {
              setDailyWord(newWord);
              setSpheres([]); // Reset spheres
              setFoundLetters([]);
              setGuesses([]);
              setCurrentGuess('');
              setGameStatus('playing');
              setIsGameStarted(false); // Reset start status for new day? Or keep it? Maybe false to force "Play" again?
          }
      };
      
      const interval = setInterval(checkMidnight, 60000);
      return () => clearInterval(interval);
  }, [dailyWord, gameMode, gameLanguage]);

  const [spheres, setSpheres] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).spheres || []) : [];
  });
  const [foundLetters, setFoundLetters] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).foundLetters || []) : [];
  });
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  
  // Live Tracking
  const [startTime, setStartTime] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).startTime || Date.now()) : Date.now();
  });
  const [distanceWalked, setDistanceWalked] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).distanceWalked || 0) : 0;
  });
  const [lastLocation, setLastLocation] = useState(null);

  // Game Persistence State
  const [guesses, setGuesses] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? JSON.parse(saved).guesses : [];
  });
  const [currentGuess, setCurrentGuess] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? JSON.parse(saved).currentGuess : '';
  });
  const [gameStatus, setGameStatus] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? JSON.parse(saved).gameStatus : 'playing';
  });
  const [isGameStarted, setIsGameStarted] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? JSON.parse(saved).isGameStarted : false;
  });

  // Save game state to local storage
  useEffect(() => {
      localStorage.setItem('gameState', JSON.stringify({
          guesses,
          currentGuess,
          gameStatus,
          isGameStarted,
          savedWord: dailyWord,
          savedDayIndex: getDailyIndex(),
          startTime,
          spheres,
          foundLetters,
          distanceWalked,
          gameMode,
          gameLanguage
      }));
  }, [guesses, currentGuess, gameStatus, isGameStarted, dailyWord, spheres, foundLetters, distanceWalked, gameMode, gameLanguage]);

  // Reset tracking on new game
  useEffect(() => {
      if (!dailyWord) return;
      
      const saved = localStorage.getItem('gameState');
      const parsed = saved ? JSON.parse(saved) : {};
      
      const currentDayIndex = getDailyIndex();
      const isDailyAndDayChanged = gameMode === 'daily' && parsed.savedDayIndex !== undefined && parsed.savedDayIndex !== currentDayIndex;

      if (parsed.savedWord !== dailyWord || isDailyAndDayChanged) {
          setStartTime(Date.now());
          setDistanceWalked(0);
          setLastLocation(null);
      }
  }, [dailyWord, gameMode]);

  // Watch location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      setLocationError("Geolocation is not supported");
      setLoading(false);
      return;
    }

    // Try to get a quick initial position first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (!userLocation) {
             setUserLocation([latitude, longitude]);
        }
        setLocationError(null);
        setLoading(false);
      },
      (error) => {
        console.error("Initial position error:", error);
      },
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
    );

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = [latitude, longitude];
        
        setUserLocation(newLoc);
        setLocationError(null);
        setLoading(false);
      },
      (error) => {
        console.error("Error watching position:", error);
        if (error.code === 1) {
             setLocationError("Please allow browser location access.");
        } else if (error.code === 3) {
             setLocationError("GPS signal lost or timed out...");
        } else {
             setLocationError("Error acquiring GPS: " + error.message);
        }
        setLoading(false);
      },
      { 
          enableHighAccuracy: true, 
          maximumAge: 5000, 
          timeout: 10000 
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Validate saved state against current word
  useEffect(() => {
      if (!dailyWord) return;
      
      const saved = localStorage.getItem('gameState');
      if (saved) {
          const parsed = JSON.parse(saved);
          const currentDayIndex = getDailyIndex();
          const isDailyAndDayChanged = gameMode === 'daily' && parsed.savedDayIndex !== undefined && parsed.savedDayIndex !== currentDayIndex;
          
          // If saved word exists and is different from current dailyWord, reset
          if ((parsed.savedWord && parsed.savedWord !== dailyWord) || isDailyAndDayChanged) {
              setGuesses([]);
              setCurrentGuess('');
              setGameStatus('playing');
              setIsGameStarted(false);
              setSpheres([]); // Clear spheres if word mismatch
          }
      }
  }, [dailyWord, gameMode]);

  // Separate effect for distance calculation to handle state updates correctly
  useEffect(() => {
      if (userLocation) {
          if (lastLocation) {
            const from = turf.point([lastLocation[1], lastLocation[0]]);
            const to = turf.point([userLocation[1], userLocation[0]]);
            const dist = turf.distance(from, to, { units: 'kilometers' });
            
            // Filter out small movements (GPS jitter) - e.g. < 5 meters
            if (dist > 0.005) {
                setDistanceWalked(prev => prev + dist);
                setLastLocation(userLocation);
            }
          } else {
              setLastLocation(userLocation);
          }
      }
  }, [userLocation]);

  // Generate spheres or update letters
  useEffect(() => {
    if (userLocation && dailyWord) {
        if (spheres.length === 0) {
            // Initial generation
            const newSpheres = generateSpheres(userLocation, 6, 0.5);
            const wordLetters = dailyWord.split('');
            newSpheres.forEach((sphere, index) => {
                sphere.letter = wordLetters[index] || '?';
            });
            setSpheres(newSpheres);
        } else {
            // Update existing spheres with new word letters
            // Check if we need to update letters (e.g. new word started)
            // We can check if the current letters match the new word
            // But simpler is to just always update them if the word changes
            // However, we need to be careful not to cause infinite loops
            // The dependency array includes dailyWord.
            
            const wordLetters = dailyWord.split('');
            // Check if letters match current word to avoid unnecessary updates
            const currentLetters = spheres.map(s => s.letter).join('');
            if (currentLetters !== dailyWord) {
                 setSpheres(prev => prev.map((sphere, index) => ({
                    ...sphere,
                    letter: wordLetters[index] || '?',
                    found: false // Ensure they are hidden for the new word
                })));
            }
        }
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
          // Use kilometers and convert to meters for consistency
          const distanceKm = turf.distance(userPoint, spherePoint, { units: 'kilometers' });
          const distanceMeters = distanceKm * 1000;
          
          // Log distance for debugging (can be removed later)
          console.log(`Distance to sphere ${sphere.letter}: ${distanceMeters.toFixed(2)}m`);
          
          // Increased threshold slightly to 60m to be more forgiving -> Reduced to 30m to match visual
          if (distanceMeters < 30) {
            updated = true;
            return { ...sphere, found: true };
          }
          return sphere;
        });

        if (updated) {
             return newSpheres;
        }
        return prevSpheres;
      });
    }
  }, [userLocation]);

  // Update found letters
  useEffect(() => {
      const found = spheres.filter(s => s.found).map(s => s.letter);
      setFoundLetters(prev => {
          if (prev.length !== found.length) return found;
          return prev;
      });
  }, [spheres]);

  return (
    <GameContext.Provider value={{ 
        userLocation, 
        spheres, 
        dailyWord, 
        foundLetters, 
        score, 
        loading,
        locationError,
        gameMode,
        setGameMode,
        gameLanguage,
        setGameLanguage,
        newGame,
        startTime,
        distanceWalked,
        // Game State for Persistence
        guesses,
        setGuesses,
        currentGuess,
        setCurrentGuess,
        gameStatus,
        setGameStatus,
        isGameStarted,
        setIsGameStarted,
        resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
