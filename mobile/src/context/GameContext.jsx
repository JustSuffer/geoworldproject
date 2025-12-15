import { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as turf from '@turf/turf';
import { generateSpheres } from '../utils/generateSpheres';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [userLocation, setUserLocation] = useState(null);
  const [gameMode, setGameMode] = useState('daily');
  const [gameLanguage, setGameLanguage] = useState('tr');
  const [loading, setLoading] = useState(true);
  
  // Word Pools
  const WORDS_TR = [
    "KARTAL", "BASKET", "KAPTAN", "MARKET", "PARKUR", 
    "SISTEM", "DOKTOR", "MANTAR", "KANTAR", "SANYIE", "KORFEZ", "DEPREM", "SIMSEK", "YAGMUR"
  ];
  
  const WORDS_EN = [
    "PLANET", "ROCKET", "MARKET", "DOCTOR", "SYSTEM", 
    "FOREST", "ISLAND", "GARDEN", "TRAVEL", "WINTER", "SUMMER", "NATURE", "ENERGY"
  ];

  const getDailyWord = (lang) => {
    const pool = lang === 'en' ? WORDS_EN : WORDS_TR;
    const epochMs = new Date(2024, 0, 1).valueOf();
    const now = Date.now();
    const msPerDay = 86400000;
    const index = Math.floor((now - epochMs) / msPerDay) % pool.length;
    return pool[index];
  };

  const getRandomWord = (lang) => {
    const pool = lang === 'en' ? WORDS_EN : WORDS_TR;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const [dailyWord, setDailyWord] = useState("");
  
  // State initialization from AsyncStorage
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem('gameState');
        if (saved) {
          const parsed = JSON.parse(saved);
          setGameMode(parsed.gameMode || 'daily');
          setGameLanguage(parsed.gameLanguage || 'tr');
          setDailyWord(parsed.savedWord || "");
          setSpheres(parsed.spheres || []);
          setFoundLetters(parsed.foundLetters || []);
          setStartTime(parsed.startTime || Date.now());
          setDistanceWalked(parsed.distanceWalked || 0);
          setGuesses(parsed.guesses || []);
          setCurrentGuess(parsed.currentGuess || '');
          setGameStatus(parsed.gameStatus || 'playing');
          setIsGameStarted(parsed.isGameStarted || false);
        }
      } catch (e) {
        console.error("Failed to load state", e);
      }
    };
    loadState();
  }, []);

  // Initialize word based on mode and language
  useEffect(() => {
      if (gameMode === 'daily') {
          setDailyWord(getDailyWord(gameLanguage));
      } else {
          if (!dailyWord) {
              setDailyWord(getRandomWord(gameLanguage));
          }
      }
  }, [gameMode, gameLanguage]);

  const newGame = () => {
      if (gameMode === 'unlimited') {
          setDailyWord(getRandomWord(gameLanguage));
          if (spheres.length > 0) {
             setSpheres(prev => prev.map(s => ({ ...s, found: false })));
          } else {
             setSpheres([]); 
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
  };

  // Update daily word at midnight
  useEffect(() => {
      if (gameMode !== 'daily') return;
      const checkMidnight = () => {
          const newWord = getDailyWord(gameLanguage);
          if (newWord !== dailyWord) {
              setDailyWord(newWord);
              setSpheres([]);
              setFoundLetters([]);
              setGuesses([]);
              setCurrentGuess('');
              setGameStatus('playing');
              setIsGameStarted(false);
          }
      };
      const interval = setInterval(checkMidnight, 60000);
      return () => clearInterval(interval);
  }, [dailyWord, gameMode, gameLanguage]);

  const [spheres, setSpheres] = useState([]);
  const [foundLetters, setFoundLetters] = useState([]);
  const [score, setScore] = useState(0);
  
  // Live Tracking
  const [startTime, setStartTime] = useState(Date.now());
  const [distanceWalked, setDistanceWalked] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);

  // Game Persistence State
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing');
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Save game state
  useEffect(() => {
      const saveState = async () => {
        try {
            await AsyncStorage.setItem('gameState', JSON.stringify({
                guesses,
                currentGuess,
                gameStatus,
                isGameStarted,
                savedWord: dailyWord,
                startTime,
                spheres,
                foundLetters,
                distanceWalked,
                gameMode,
                gameLanguage
            }));
        } catch (e) {
            console.error("Failed to save state", e);
        }
      };
      saveState();
  }, [guesses, currentGuess, gameStatus, isGameStarted, dailyWord, spheres, foundLetters, distanceWalked, gameMode, gameLanguage]);

  // Reset tracking on new game
  useEffect(() => {
      if (!dailyWord) return;
      const checkReset = async () => {
        const saved = await AsyncStorage.getItem('gameState');
        const parsed = saved ? JSON.parse(saved) : {};
        if (parsed.savedWord !== dailyWord) {
            setStartTime(Date.now());
            setDistanceWalked(0);
            setLastLocation(null);
        }
      };
      checkReset();
  }, [dailyWord]);

  // Watch location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setLoading(false);
        return;
      }

      await Location.watchPositionAsync({
        accuracy: Location.Accuracy.High,
        distanceInterval: 1 // Update every 1 meter
      }, (location) => {
        const { latitude, longitude } = location.coords;
        const newLoc = [latitude, longitude];
        setUserLocation(newLoc);
        setLoading(false);
      });
    })();
  }, []);

  // Distance calculation
  useEffect(() => {
      if (userLocation) {
          if (lastLocation) {
            const from = turf.point([lastLocation[1], lastLocation[0]]);
            const to = turf.point([userLocation[1], userLocation[0]]);
            const dist = turf.distance(from, to, { units: 'kilometers' });
            
            if (dist > 0.005) {
                setDistanceWalked(prev => prev + dist);
                setLastLocation(userLocation);
            }
          } else {
              setLastLocation(userLocation);
          }
      }
  }, [userLocation]);

  // Generate spheres
  useEffect(() => {
    if (userLocation && dailyWord) {
        if (spheres.length === 0) {
            const newSpheres = generateSpheres(userLocation, 6, 0.5);
            const wordLetters = dailyWord.split('');
            newSpheres.forEach((sphere, index) => {
                sphere.letter = wordLetters[index] || '?';
            });
            setSpheres(newSpheres);
        } else {
            const wordLetters = dailyWord.split('');
            const currentLetters = spheres.map(s => s.letter).join('');
            if (currentLetters !== dailyWord) {
                 setSpheres(prev => prev.map((sphere, index) => ({
                    ...sphere,
                    letter: wordLetters[index] || '?',
                    found: false
                })));
            }
        }
    }
  }, [userLocation, dailyWord, spheres.length]);

  // Check distance for collecting spheres
  useEffect(() => {
    if (userLocation && spheres.length > 0) {
      const userPoint = turf.point([userLocation[1], userLocation[0]]);
      
      setSpheres(prevSpheres => {
        let updated = false;
        const newSpheres = prevSpheres.map(sphere => {
          if (sphere.found) return sphere;
          
          const spherePoint = turf.point([sphere.lng, sphere.lat]);
          const distanceKm = turf.distance(userPoint, spherePoint, { units: 'kilometers' });
          const distanceMeters = distanceKm * 1000;
          
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
        gameMode,
        setGameMode,
        gameLanguage,
        setGameLanguage,
        newGame,
        startTime,
        distanceWalked,
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
