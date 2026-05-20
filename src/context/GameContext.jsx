import { createContext, useContext, useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { generateSpheres } from '../utils/generateSpheres';
import { getSudoku } from 'sudoku-gen';

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

  // Geodoku States
  const [gameType, setGameType] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).gameType || 'geoworld') : 'geoworld';
  });
  const [geodokuDifficulty, setGeodokuDifficulty] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).geodokuDifficulty || 'medium') : 'medium';
  });
  const [geodokuBoard, setGeodokuBoard] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).geodokuBoard || null) : null;
  });
  const [geodokuSolution, setGeodokuSolution] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).geodokuSolution || null) : null;
  });
  const [geodokuRevealed, setGeodokuRevealed] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).geodokuRevealed || []) : [];
  });

  // Global Stats & History
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('wordleStats');
    return saved ? JSON.parse(saved) : {
      played: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: {1:0, 2:0, 3:0, 4:0, 5:0, 6:0},
      history: {} // { 'YYYY-MM-DD': 'won' | 'lost' }
    };
  });

  const loadStats = async (userId, supabase) => {
    let localStats = JSON.parse(localStorage.getItem('wordleStats')) || {
        played: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: {1:0, 2:0, 3:0, 4:0, 5:0, 6:0}, history: {}
    };

    if (userId && supabase) {
        const { data, error } = await supabase
            .from('profiles')
            .select('stats')
            .eq('id', userId)
            .single();
        
        if (data && data.stats) {
            // merge history carefully
            const mergedHistory = { ...localStats.history, ...(data.stats.history || {}) };
            localStats = { ...localStats, ...data.stats, history: mergedHistory };
        }
    }
    
    // Ensure winRate is computed but we do it on the fly or keep it in state
    localStats.winRate = localStats.played > 0 ? Math.round((localStats.wins / localStats.played) * 100) : 0;
    setStats(localStats);
  };

  const updateStats = async (won, guessCount, supabaseObj, userObj) => {
      const newStats = { ...stats };
      newStats.played += 1;
      
      const todayDateStr = new Date().toISOString().split('T')[0];
      
      // Ensure history object exists
      if (!newStats.history) newStats.history = {};

      if (won) {
          newStats.wins = (newStats.wins || 0) + 1;
          newStats.currentStreak += 1;
          newStats.maxStreak = Math.max(newStats.maxStreak || 0, newStats.currentStreak);
          
          if (guessCount) {
             newStats.distribution[guessCount] = (newStats.distribution[guessCount] || 0) + 1;
          }
          newStats.history[todayDateStr] = 'won';
      } else {
          newStats.currentStreak = 0;
          newStats.history[todayDateStr] = 'lost';
      }
      
      newStats.winRate = Math.round((newStats.wins / newStats.played) * 100);
      setStats(newStats);
      localStorage.setItem('wordleStats', JSON.stringify(newStats));

      if (userObj && supabaseObj) {
          await supabaseObj.from('profiles').upsert({ 
              id: userObj.id,
              updated_at: new Date(),
              stats: newStats
          });
      }
  };

  
  // Word Pools
  const WORDS_TR = [
    "KARTAL", "BASKET", "KAPTAN", "MARKET", "PARKUR", 
    "SISTEM", "DOKTOR", "MANTAR", "KANTAR", "SANYIE", "KORFEZ", "DEPREM", "SIMSEK", "YAGMUR",
    "TINNET", "KEBELE", "ÇURÇUR", "ÜTÜLÜP", "YARATI", "DARALA", "TAKIYE", "KISACA", "PASTAV", "KORALA", "KUSMAK", "ÜRÜNCÜ", "CANSOY", "MARPUÇ", "AZABIM", "KATYON", "PULSUZ", "PORTAL", "STATIK", "SAĞLAŞ", "KÖPEĞE", "BANDIK", "GÜRECE", "GÜRGEN", "FÖNLET", "KOÇKAR", "AÇILAN", "SANSÜR", "RUSTIK", "EVIRIP", "OKSIDI", "AVUNTU", "EDIMCI", "ZEYCAN", "UTULAN", "İNCESU", "BOZASI", "GÖLOVA", "RAZMOL", "ÖNEMCI", "AĞZINA", "IRGALA", "MERHEM", "MAZICI", "PÜRÇÜK", "KIRKIM", "YANŞAK", "TAŞMAZ", "ARAMAZ", "IRADIN", "KOTSUZ", "PERVIN", "APATIT", "RITÜEL", "SEKSEK", "MASTOR", "YANALI", "PATLAT", "KASARA", "TESHIN", "LEKELI", "BINACI", "YUMRUL", "MUMLAN", "SÜCUDU", "EKIMCI", "KOPASI", "SOFIZM", "CEBELE", "ULAĞIN", "ILAÇLA", "MÜSRIF", "YETEME", "ZEKIYE", "PAŞASI", "TROLCÜ", "MOZOLE", "AKARCA", "ÜTOPYA", "POMPAJ", "ISELER", "SEKILI", "DELMEK", "IRAKLA", "GERDEL", "YERCIK", "SUŞICI", "GÜLFEM", "HAŞLAT", "UCUZCA", "FARSAL", "AYITLI", "KASICI", "DOĞALA", "AKASYA", "MÜMBIT", "NEZRIM", "IRAMAK", "KUYRUK", "TUTSAK", "ELENEN", "ÖKELEN", "NAYMAN", "KIRKIL", "YOLAMA", "GIZLEŞ", "BADELI", "ŞERIDI", "HARCAN", "KAFACA", "APSENT", "PARKÇI", "ANIĞIN", "ÇINGIR", "ILGECI", "DÜŞÜCÜ", "SARPER", "HESABA", "SAHLEP", "AĞALAN", "FILLET", "ÇAKTIK", "NEZRIN", "UKUBET", "TUTTUK", "POTALI", "GÜVEYI", "CUMBUR", "GERÇEK", "EREĞIN", "ŞEBEĞI", "SAHIRE", "CAMLAŞ", "ÖYKÜCE", "ZIKRIN", "ÖDÜLLE", "KOYALI", "BUUTLU", "PAKIZE", "BÜZÜCÜ", "KIBRIN", "KALBIN", "EŞITSI", "UMULMA", "FERSIZ", "TAMULA", "IBIKLI", "NAKIBI", "AĞIRLA", "IKILET", "UZAYIP", "BIYELI", "SARICA", "BOĞASI", "BETILI", "YITIĞI", "PRIMLI", "NÜKHET", "KORLAŞ", "HAMLET", "KARMAK", "HALVET", "UYANIL", "ASLIYE", "BILELI", "ZEHABI", "KONKAV", "EVERME", "ARKACI", "TÜMLEÇ", "TALIBI", "ŞEFFAF", "GRISEL", "TÜRKAN", "YAKLAN", "ANJIYO", "KAPSAL", "ANLAMA", "HIZSIZ", "GAZISI", "ÖVGÜLE", "AYIŞIK", "YILCIK", "SLIPLI", "ÖVMELI", "ÇERMIK", "FIZIĞE", "SIRIĞI", "BESICI", "MEVZII", "IBRALA", "BASLAT", "TAHKIM", "OLURSU", "IMALCI", "LIGSEL", "CELALI", "GOBLEN", "TAKRIP", "BAŞLIK", "ALEMCE", "CELISI", "TENLIK", "MALSIZ", "CILTLI", "ŞEFSEL", "KEMELI", "RAPTET", "GÖMESI", "BESLET", "KASTIR", "ŞAHNAZ", "PIKNIK", "TANDEM", "OYACIK", "TAYMAZ", "ALLAME", "DANALI", "YAYLAN", "BAYAĞI", "EMILIM", "DINÇSI", "KRONIK", "BIZZAT", "ANEMIK", "KASRIN", "MEFRUŞ", "KOLLAN", "SIKILA", "SIZMAZ", "TESHIR", "TÜRABA", "KOVASI", "DAĞLAT", "HÜRLEŞ", "SKECIN", "SARDIR", "RAFSIZ", "KIMONO", "GÜLSÜZ", "MÜBREM", "TEĞMEN", "RAHVAN", "PESOLA", "TEREĞE", "KORKUP", "EĞECEK", "ACINAN", "MODACA", "ADAPTE", "IMIŞIM", "YUMUŞA", "OTOBAN", "ERENCE", "TAZMIN", "SEMELE", "UÇUVER", "KURTÇU", "DALLAN", "TABISI", "AZIZLI", "VURDUK", "MÜNKIR", "MÜDRIR", "AYIBIN", "MATRAH", "ŞELEĞI", "YATALI", "MEALLI", "MEŞALE", "ÇATICI", "FELÇLI", "ÖRMELI", "ZIRKON", "KANALI", "MANICI", "KORPUS", "AVUTMA", "ÖTLEĞI", "ALIŞAN", "KANMAZ", "ERITME", "ÇOLPAN", "ÖCÜYLE", "PONPON", "SEVABA", "UÇMALI", "YASLAN", "KULÜBÜ", "BAĞRIN", "UYARIŞ", "EVRADA", "KARDEŞ", "ILKYAZ", "TUĞBAY", "OLMALI", "KUPALA", "ÖRÜNTÜ", "IZLEME", "EFENDI", "ADAMLI", "KEKELE", "CENUBA", "DÜŞMÜŞ", "ŞAŞAMA", "KADIRE", "KILSIZ", "ACIDIR", "CEVABI", "DÖŞEME", "TALICI", "ÜŞÜNÜL", "UFACIK", "KAUÇUK", "LALLAN", "HAYATI", "ÇIRKIN", "SLOVEN", "UĞURLU", "EŞLIĞE", "KÜTLEN", "ÇILGIN", "KOKMAK", "CÜCESI", "DAYAMA", "IŞIDIK", "IÇILEN", "BÜKÜLÜ", "GEVŞEK", "ILKECI", "ICAZET", "GÖZYAŞ", "KAFALI", "PIRLIK", "ÇILEĞE", "SOYKAN", "HARICI", "ILLICI", "LAIĞIN", "CALIBE", "ÇIZELI", "EKSILE", "MORFIN", "KÜNKLÜ", "AKAÇÇA", "UMUTLA", "IMANLI", "AZLIĞA", "CILTEV", "TEMYIZ", "ASALIK", "TOKLUK", "YOLMAK", "ICRAAT", "DENSIZ", "MEKTEP", "KOKTUK", "ACIYIP", "FETHET", "VUALET", "BADECE", "TAVSIF", "YAYAMA", "MENCIK", "ÇÖLSEL", "TERTIP", "TASALA", "ZEHRIM", "LAIĞIZ", "BÜZEME", "YÜRÜME", "EKLIĞI", "HAVALA", "MAVERA", "EKSICI", "BERGIN", "TIMSIZ", "MELODI", "MÜCVER", "SINECI", "KAPMIŞ", "ELMALI", "MANUEL", "FESADA", "YOLAĞI", "KALORI", "ILMIĞI", "MERALI", "MORLAŞ", "AKÇORA", "KIRIĞI", "OCAĞIN", "DOYDUR", "SETLIÇ", "TEHCIR", "RUSLAN", "IŞITAN", "YOLSAL", "ISTIVA", "MÜMTAZ", "KAKMAZ", "LIBERO", "BOĞUCU", "AZALIŞ", "AVCILI", "HAYRAN", "HILVAN", "ROTALI", "HARAMI", "EFORLU", "BAYAMA", "GOŞIZM", "DIZLIK", "OZANLI", "BUMBUZ", "ELEKSI", "MARLEY", "TEKFIR", "MAILEN", "RAYICI", "MAVICE", "UCUYSA", "DOKSAL", "DEFINE", "ÜRKEĞI", "ILMEĞI", "TERSLE", "SAYILA", "ACIMAZ", "GRANÜL", "KALABA", "TEDVIR", "KAVELA", "YILMAK", "ZARSIZ", "TERLET", "AMASYA", "ROKOKO", "KALKIŞ", "ARAMAK", "YIVSIZ", "NARDIN", "AKIMLA", "ERTELE", "IZOMER", "ABSÜRT", "AVUNCA", "ÜMITSI", "ZORLAT", "MECLUP", "YEDICI", "ÖREBIL", "SALLAŞ", "DISPEÇ", "KUMBAŞ", "JÜRICI", "RÜYALI", "MINELE", "GANICI", "KARTON", "EĞILIM", "AKNELI", "KIRAĞI", "BAŞBUĞ", "ASIRLI", "SIDDIK", "SONSAL", "ALTLIK", "DUBLAJ", "GÖBEĞE", "SEMIHA", "KONDOM", "JÜRILI", "BILGÜN", "INATLI", "MUTLAN", "ABDEST", "ANTIKA", "ADILET", "HODBIN", "AZIMSI", "AHDINE", "NESLIM", "ERIYIP", "CUMACI", "ÇINDAN", "SELMAN", "KOYAMA", "YAPTIR", "TAHRIP", "ÇOLAĞI", "HILALI", "BIBILI", "SINIĞI", "SAYILI", "SOLUMA", "DIMILI", "TÜRSÜZ", "YEMSIZ", "MASKOT"
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

  const getDailyIndex = () => {
    const epochMs = new Date(2024, 0, 1).valueOf();
    const now = Date.now();
    const msPerDay = 86400000;
    return Math.floor((now - epochMs) / msPerDay);
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

  const newGame = (overrideType = null, overrideMode = null, overrideLanguage = null, overrideDifficulty = null) => {
      const activeType = overrideType || gameType;
      const activeMode = overrideMode || gameMode;
      const activeLanguage = overrideLanguage || gameLanguage;
      const activeDifficulty = overrideDifficulty || geodokuDifficulty;

      if (activeType === 'geoworld') {
          if (activeMode === 'unlimited') {
              setDailyWord(getRandomWord(activeLanguage));
          }
          // For both unlimited and daily, we want to reset state but keep spheres if they exist
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
      } else if (activeType === 'geodoku') {
          const sudoku = getSudoku(activeDifficulty);
          setGeodokuBoard(sudoku.puzzle);
          setGeodokuSolution(sudoku.solution);
          
          const allClues = [];
          for(let i = 0; i < sudoku.puzzle.length; i++) {
              if (sudoku.puzzle[i] !== '-') {
                  allClues.push(i);
              }
          }
          
          // Shuffle allClues to pick a random subset
          for (let i = allClues.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [allClues[i], allClues[j]] = [allClues[j], allClues[i]];
          }
          
          let numToReveal = 10;
          if (activeDifficulty === 'easy') numToReveal = 15;
          if (activeDifficulty === 'hard') numToReveal = 5;
          
          const initialRevealed = allClues.slice(0, numToReveal);
          setGeodokuRevealed(initialRevealed);
          setGuesses([]);
          setSpheres([]); 
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
              setIsGameStarted(false); // Clear game started to remove continue button
          }
      };
      
      // Check every 1 second to make the UI refresh precisely at midnight
      const interval = setInterval(checkMidnight, 1000);
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
  const [endTime, setEndTime] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).endTime || null) : null;
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

  // Validate saved state against current word and reset if needed
  useEffect(() => {
      if (!dailyWord) return;
      
      const saved = localStorage.getItem('gameState');
      if (saved) {
          const parsed = JSON.parse(saved);
          const currentDayIndex = getDailyIndex();
          const isDailyAndDayChanged = gameMode === 'daily' && parsed.savedDayIndex !== undefined && parsed.savedDayIndex !== currentDayIndex;
          
          const isInvalidState = parsed.gameStatus !== 'playing' && (!parsed.guesses || parsed.guesses.length === 0);

          if ((parsed.savedWord && parsed.savedWord !== dailyWord) || isDailyAndDayChanged || isInvalidState) {
              setGuesses([]);
              setCurrentGuess('');
              setGameStatus('playing');
              setIsGameStarted(false);
              setSpheres([]);
              setStartTime(Date.now());
              setEndTime(null);
              setDistanceWalked(0);
              setLastLocation(null);
          }
      }
  }, [dailyWord, gameMode]);

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
          endTime,
          spheres,
          foundLetters,
          distanceWalked,
          gameMode,
          gameLanguage,
          gameType,
          geodokuDifficulty,
          geodokuBoard,
          geodokuSolution,
          geodokuRevealed
      }));
  }, [guesses, currentGuess, gameStatus, isGameStarted, dailyWord, spheres, foundLetters, distanceWalked, gameMode, gameLanguage, endTime, gameType, geodokuDifficulty, geodokuBoard, geodokuSolution, geodokuRevealed]);

  // Watch location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      setLocationError("Geolocation is not supported");
      setLoading(false);
      return;
    }

    const handleSuccess = (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLocationError(null);
        setLoading(false);
    };

    const handleError = (error) => {
        console.error("Geolocation error:", error);
        if (error.code === 1) {
             setLocationError("Please allow browser location access.");
             setLoading(false);
        } else if (error.code === 3) {
             console.warn("GPS signal timed out, waiting for next update...");
        } else {
             setLocationError("Error acquiring GPS: " + error.message);
             setLoading(false);
        }
    };

    const options = { 
        enableHighAccuracy: true, 
        maximumAge: 0, 
        timeout: 5000 
    };

    // 1. Initial position
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Only use this if userLocation isn't set yet (closure trap avoided since it's initial)
            handleSuccess(position);
        },
        (error) => console.error("Initial position error:", error),
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
    );

    // 2. Watch position for native updates
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    // 3. Fallback interval for iOS/Safari stalling issues
    const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
    }, 3000);

    return () => {
        navigator.geolocation.clearWatch(watchId);
        clearInterval(intervalId);
    };
  }, []);



  // Separate effect for distance calculation to handle state updates correctly
  useEffect(() => {
      if (gameStatus !== 'playing') return;

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
  }, [userLocation, gameStatus]);

  // Generate spheres or update letters
  useEffect(() => {
    if (userLocation) {
        if (gameType === 'geoworld' && dailyWord) {
            if (spheres.length === 0) {
                // Initial generation
                const newSpheres = generateSpheres(userLocation, 6, 0.5);
                const wordLetters = dailyWord.split('');
                newSpheres.forEach((sphere, index) => {
                    sphere.letter = wordLetters[index] || '?';
                });
                setSpheres(newSpheres);
            } else {
                const wordLetters = dailyWord.split('');
                const currentLetters = spheres.map(s => s.letter).join('');
                if (currentLetters !== dailyWord && !spheres.every(s => s.letter === '?')) {
                     setSpheres(prev => prev.map((sphere, index) => ({
                        ...sphere,
                        letter: wordLetters[index] || '?',
                        found: false 
                    })));
                }
            }
        } else if (gameType === 'geodoku' && gameStatus === 'playing') {
            const allFound = spheres.length > 0 && spheres.every(s => s.found);
            if (spheres.length === 0 || allFound) {
                const newSpheres = generateSpheres(userLocation, 6, 0.5);
                newSpheres.forEach((sphere) => {
                    sphere.letter = '?';
                });
                setSpheres(newSpheres);
            }
        }
    }
  }, [userLocation, dailyWord, gameType, gameStatus, spheres]);

  // Check distance
  useEffect(() => {
    if (userLocation && spheres.length > 0) {
      const userPoint = turf.point([userLocation[1], userLocation[0]]);
      
      setSpheres(prevSpheres => {
        let updated = false;
        let newlyFound = 0;
        const newSpheres = prevSpheres.map(sphere => {
          if (sphere.found) return sphere;
          
          const spherePoint = turf.point([sphere.lng, sphere.lat]);
          const distanceKm = turf.distance(userPoint, spherePoint, { units: 'kilometers' });
          const distanceMeters = distanceKm * 1000;
          
          if (distanceMeters < 30) {
            updated = true;
            newlyFound++;
            return { ...sphere, found: true };
          }
          return sphere;
        });

        if (updated) {
            if (gameType === 'geodoku' && newlyFound > 0) {
                setTimeout(() => {
                    setGeodokuRevealed(prev => {
                        const revealCount = geodokuDifficulty === 'easy' ? 3 : (geodokuDifficulty === 'medium' ? 2 : 1);
                        const totalReveal = newlyFound * revealCount;
                        
                        const unrevealedClues = [];
                        for(let i=0; i<81; i++) {
                            if (geodokuBoard && geodokuBoard[i] !== '-' && !prev.includes(i)) {
                                unrevealedClues.push(i);
                            }
                        }
                        
                        const unrevealedAny = [];
                        if (unrevealedClues.length < totalReveal) {
                            for(let i=0; i<81; i++) {
                                if (!prev.includes(i) && !unrevealedClues.includes(i)) {
                                    unrevealedAny.push(i);
                                }
                            }
                        }
                        
                        const toReveal = [];
                        while(toReveal.length < totalReveal && unrevealedClues.length > 0) {
                            const randIdx = Math.floor(Math.random() * unrevealedClues.length);
                            toReveal.push(unrevealedClues[randIdx]);
                            unrevealedClues.splice(randIdx, 1);
                        }
                        
                        while(toReveal.length < totalReveal && unrevealedAny.length > 0) {
                            const randIdx = Math.floor(Math.random() * unrevealedAny.length);
                            toReveal.push(unrevealedAny[randIdx]);
                            unrevealedAny.splice(randIdx, 1);
                        }
                        
                        return [...prev, ...toReveal];
                    });
                }, 0);
            }
            return newSpheres;
        }
        return prevSpheres;
      });
    }
  }, [userLocation, gameType, geodokuDifficulty, geodokuBoard]);

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
        gameType,
        setGameType,
        geodokuDifficulty,
        setGeodokuDifficulty,
        geodokuBoard,
        setGeodokuBoard,
        geodokuSolution,
        setGeodokuSolution,
        geodokuRevealed,
        setGeodokuRevealed,
        newGame,
        startTime,
        endTime,
        setEndTime,
        distanceWalked,
        guesses,
        setGuesses,
        currentGuess,
        setCurrentGuess,
        gameStatus,
        setGameStatus,
        isGameStarted,
        setIsGameStarted,
        resetGame,
        stats,
        setStats,
        loadStats,
        updateStats
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
