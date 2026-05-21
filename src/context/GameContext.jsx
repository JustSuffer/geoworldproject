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
  const [geodokuMode, setGeodokuMode] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved ? (JSON.parse(saved).geodokuMode || 'unlimited') : 'unlimited';
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
  const [geodokuLives, setGeodokuLives] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved && JSON.parse(saved).geodokuLives !== undefined ? JSON.parse(saved).geodokuLives : 3;
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
    "TINNET", "KEBELE", "ÇURÇUR", "ÜTÜLÜP", "YARATI", "DARALA", "TAKIYE", "KISACA", "PASTAV", "KORALA", "KUSMAK", "ÜRÜNCÜ", "CANSOY", "MARPUÇ", "AZABIM", "KATYON", "PULSUZ", "PORTAL", "STATIK", "SAĞLAŞ", "KÖPEĞE", "BANDIK", "GÜRECE", "GÜRGEN", "FÖNLET", "KOÇKAR", "AÇILAN", "SANSÜR", "RUSTIK", "EVIRIP", "OKSIDI", "AVUNTU", "EDIMCI", "ZEYCAN", "UTULAN", "İNCESU", "BOZASI", "GÖLOVA", "RAZMOL", "ÖNEMCI", "AĞZINA", "IRGALA", "MERHEM", "MAZICI", "PÜRÇÜK", "KIRKIM", "YANŞAK", "TAŞMAZ", "ARAMAZ", "IRADIN", "KOTSUZ", "PERVIN", "APATIT", "RITÜEL", "SEKSEK", "MASTOR", "YANALI", "PATLAT", "KASARA", "TESHIN", "LEKELI", "BINACI", "YUMRUL", "MUMLAN", "SÜCUDU", "EKIMCI", "KOPASI", "SOFIZM", "CEBELE", "ULAĞIN", "ILAÇLA", "MÜSRIF", "YETEME", "ZEKIYE", "PAŞASI", "TROLCÜ", "MOZOLE", "AKARCA", "ÜTOPYA", "POMPAJ", "ISELER", "SEKILI", "DELMEK", "IRAKLA", "GERDEL", "YERCIK", "SUŞICI", "GÜLFEM", "HAŞLAT", "UCUZCA", "FARSAL", "AYITLI", "KASICI", "DOĞALA", "AKASYA", "MÜMBIT", "NEZRIM", "IRAMAK", "KUYRUK", "TUTSAK", "ELENEN", "ÖKELEN", "NAYMAN", "KIRKIL", "YOLAMA", "GIZLEŞ", "BADELI", "ŞERIDI", "HARCAN", "KAFACA", "APSENT", "PARKÇI", "ANIĞIN", "ÇINGIR", "ILGECI", "DÜŞÜCÜ", "SARPER", "HESABA", "SAHLEP", "AĞALAN", "FILLET", "ÇAKTIK", "NEZRIN", "UKUBET", "TUTTUK", "POTALI", "GÜVEYI", "CUMBUR", "GERÇEK", "EREĞIN", "ŞEBEĞI", "SAHIRE", "CAMLAŞ", "ÖYKÜCE", "ZIKRIN", "ÖDÜLLE", "KOYALI", "BUUTLU", "PAKIZE", "BÜZÜCÜ", "KIBRIN", "KALBIN", "EŞITSI", "UMULMA", "FERSIZ", "TAMULA", "IBIKLI", "NAKIBI", "AĞIRLA", "IKILET", "UZAYIP", "BIYELI", "SARICA", "BOĞASI", "BETILI", "YITIĞI", "PRIMLI", "NÜKHET", "KORLAŞ", "HAMLET", "KARMAK", "HALVET", "UYANIL", "ASLIYE", "BILELI", "ZEHABI", "KONKAV", "EVERME", "ARKACI", "TÜMLEÇ", "TALIBI", "ŞEFFAF", "GRISEL", "TÜRKAN", "YAKLAN", "ANJIYO", "KAPSAL", "ANLAMA", "HIZSIZ", "GAZISI", "ÖVGÜLE", "AYIŞIK", "YILCIK", "SLIPLI", "ÖVMELI", "ÇERMIK", "FIZIĞE", "SIRIĞI", "BESICI", "MEVZII", "IBRALA", "BASLAT", "TAHKIM", "OLURSU", "IMALCI", "LIGSEL", "CELALI", "GOBLEN", "TAKRIP", "BAŞLIK", "ALEMCE", "CELISI", "TENLIK", "MALSIZ", "CILTLI", "ŞEFSEL", "KEMELI", "RAPTET", "GÖMESI", "BESLET", "KASTIR", "ŞAHNAZ", "PIKNIK", "TANDEM", "OYACIK", "TAYMAZ", "ALLAME", "DANALI", "YAYLAN", "BAYAĞI", "EMILIM", "DINÇSI", "KRONIK", "BIZZAT", "ANEMIK", "KASRIN", "MEFRUŞ", "KOLLAN", "SIKILA", "SIZMAZ", "TESHIR", "TÜRABA", "KOVASI", "DAĞLAT", "HÜRLEŞ", "SKECIN", "SARDIR", "RAFSIZ", "KIMONO", "GÜLSÜZ", "MÜBREM", "TEĞMEN", "RAHVAN", "PESOLA", "TEREĞE", "KORKUP", "EĞECEK", "ACINAN", "MODACA", "ADAPTE", "IMIŞIM", "YUMUŞA", "OTOBAN", "ERENCE", "TAZMIN", "SEMELE", "UÇUVER", "KURTÇU", "DALLAN", "TABISI", "AZIZLI", "VURDUK", "MÜNKIR", "MÜDRIR", "AYIBIN", "MATRAH", "ŞELEĞI", "YATALI", "MEALLI", "MEŞALE", "ÇATICI", "FELÇLI", "ÖRMELI", "ZIRKON", "KANALI", "MANICI", "KORPUS", "AVUTMA", "ÖTLEĞI", "ALIŞAN", "KANMAZ", "ERITME", "ÇOLPAN", "ÖCÜYLE", "PONPON", "SEVABA", "UÇMALI", "YASLAN", "KULÜBÜ", "BAĞRIN", "UYARIŞ", "EVRADA", "KARDEŞ", "ILKYAZ", "TUĞBAY", "OLMALI", "KUPALA", "ÖRÜNTÜ", "IZLEME", "EFENDI", "ADAMLI", "KEKELE", "CENUBA", "DÜŞMÜŞ", "ŞAŞAMA", "KADIRE", "KILSIZ", "ACIDIR", "CEVABI", "DÖŞEME", "TALICI", "ÜŞÜNÜL", "UFACIK", "KAUÇUK", "LALLAN", "HAYATI", "ÇIRKIN", "SLOVEN", "UĞURLU", "EŞLIĞE", "KÜTLEN", "ÇILGIN", "KOKMAK", "CÜCESI", "DAYAMA", "IŞIDIK", "IÇILEN", "BÜKÜLÜ", "GEVŞEK", "ILKECI", "ICAZET", "GÖZYAŞ", "KAFALI", "PIRLIK", "ÇILEĞE", "SOYKAN", "HARICI", "ILLICI", "LAIĞIN", "CALIBE", "ÇIZELI", "EKSILE", "MORFIN", "KÜNKLÜ", "AKAÇÇA", "UMUTLA", "IMANLI", "AZLIĞA", "CILTEV", "TEMYIZ", "ASALIK", "TOKLUK", "YOLMAK", "ICRAAT", "DENSIZ", "MEKTEP", "KOKTUK", "ACIYIP", "FETHET", "VUALET", "BADECE", "TAVSIF", "YAYAMA", "MENCIK", "ÇÖLSEL", "TERTIP", "TASALA", "ZEHRIM", "LAIĞIZ", "BÜZEME", "YÜRÜME", "EKLIĞI", "HAVALA", "MAVERA", "EKSICI", "BERGIN", "TIMSIZ", "MELODI", "MÜCVER", "SINECI", "KAPMIŞ", "ELMALI", "MANUEL", "FESADA", "YOLAĞI", "KALORI", "ILMIĞI", "MERALI", "MORLAŞ", "AKÇORA", "KIRIĞI", "OCAĞIN", "DOYDUR", "SETLIÇ", "TEHCIR", "RUSLAN", "IŞITAN", "YOLSAL", "ISTIVA", "MÜMTAZ", "KAKMAZ", "LIBERO", "BOĞUCU", "AZALIŞ", "AVCILI", "HAYRAN", "HILVAN", "ROTALI", "HARAMI", "EFORLU", "BAYAMA", "GOŞIZM", "DIZLIK", "OZANLI", "BUMBUZ", "ELEKSI", "MARLEY", "TEKFIR", "MAILEN", "RAYICI", "MAVICE", "UCUYSA", "DOKSAL", "DEFINE", "ÜRKEĞI", "ILMEĞI", "TERSLE", "SAYILA", "ACIMAZ", "GRANÜL", "KALABA", "TEDVIR", "KAVELA", "YILMAK", "ZARSIZ", "TERLET", "AMASYA", "ROKOKO", "KALKIŞ", "ARAMAK", "YIVSIZ", "NARDIN", "AKIMLA", "ERTELE", "IZOMER", "ABSÜRT", "AVUNCA", "ÜMITSI", "ZORLAT", "MECLUP", "YEDICI", "ÖREBIL", "SALLAŞ", "DISPEÇ", "KUMBAŞ", "JÜRICI", "RÜYALI", "MINELE", "GANICI", "KARTON", "EĞILIM", "AKNELI", "KIRAĞI", "BAŞBUĞ", "ASIRLI", "SIDDIK", "SONSAL", "ALTLIK", "DUBLAJ", "GÖBEĞE", "SEMIHA", "KONDOM", "JÜRILI", "BILGÜN", "INATLI", "MUTLAN", "ABDEST", "ANTIKA", "ADILET", "HODBIN", "AZIMSI", "AHDINE", "NESLIM", "ERIYIP", "CUMACI", "ÇINDAN", "SELMAN", "KOYAMA", "YAPTIR", "TAHRIP", "ÇOLAĞI", "HILALI", "BIBILI", "SINIĞI", "SAYILI", "SOLUMA", "DIMILI", "TÜRSÜZ", "YEMSIZ", "MASKOT",
    "ABAKÜS", "ABDEST", "ABESLİ", "ABİDEV", "ABİDİN", "ABİLİK", "ABİSİN", "ABLACI", "ABLALI", "ABLUDA", "ABONEM", "ABSÜRT", "ACAYİP", "ACEMCE", "ACEMLİ", "ACENTİ", "ACIGÖZ", "ACIKLI", "ACIKMA", "ACILIK", "ACIMAK", "ACIMSI", "ACINIŞ", "ACINMA", "ACITIŞ", "ACITMA", "ACIYIŞ", "ACİLEN", "ACİZCİ", "ACİZCE", "AÇIKÇA", "AÇIKÇI", "AÇILIM", "AÇILIŞ", "AÇILMA", "AÇIMLI", "AÇINIM", "AÇINMA", "AÇISAL", "AÇKYLA", "ADACIK", "ADAKLI", "ADALET", "ADALIK", "ADAMAK", "ADAMCA", "ADAPTE", "ADAVET", "ADAYIŞ", "ADCILI", "ADEDİM", "ADEMCİ", "ADENİN", "ADETÇE", "ADIMIZ", "ADIMLA", "ADIMLI", "ADINIZ", "ADLİYE", "AFACAN", "AFERİN", "AFFETİ", "AFFİDİ", "AFGANİ", "AFİŞÇİ", "AFİYET", "AFOROZ", "AFTOSL", "AGAHÇA", "AGAMEM", "AHARLI", "AHESTE", "AHIRCI", "AHIRLI", "AHİRET", "AHİTLİ", "AHİZLİ", "AHLAKA", "AHMACA", "AHRAZİ", "AHŞABI", "AİLECE", "AİLEVİ", "AJANSA", "AJANCI", "AJANDA", "AKADEM", "AKAĞAÇ", "AKAMET", "AKARCA", "AKARSU", "AKARYA", "AKCILİ", "AKÇELİ", "AKDARI", "AKIMCI", "AKIMLI", "AKINCI", "AKINTI", "AKIŞLI", "AKITMA", "AKKAYA", "AKKUŞU", "AKLAMA", "AKLİYE", "AKORLU", "AKÖREN", "AKRABA", "AKRANİ", "AKSAMA", "AKSEPT", "AKSİNE", "AKSONA", "AKŞAMA", "AKŞINI", "AKTİVİ", "AKTÖRE", "AKYAKA", "AKYURT", "ALABAŞ", "ALACAK", "ALADAĞ", "ALAİMİ", "ALAKAZ", "ALAMET", "ALANYA", "ALAPLI", "ALARGI", "ALARYA", "ALAŞIM", "ALATAV", "ALAYCI", "ALAYLI", "ALAZLA", "ALBATR", "ALBEDO", "ALBENİ", "ALBİNO", "ALÇACA", "ALÇICI", "ALÇILI", "ALDANÇ", "ALDIRI", "ALEMCİ", "ALEMDE", "ALENEN", "ALERJİ", "ALESTA", "ALETLİ", "ALEVLİ", "ALFAVİ", "ALGICI", "ALGIDA", "ALGILI", "ALGLER", "ALİCEN", "ALİFAT", "ALİMCE", "ALİNTİ", "ALİYYE", "ALKALI", "ALKIMA", "ALKİLİ", "ALKOLİ", "ALLAMA", "ALMANİ", "ALMARİ", "ALOJİN", "ALPAKA", "ALPAKS", "ALPLIK", "ALSASI", "ALTILI", "ALTINK", "ALTINL", "ALTLIK", "ALTMIŞ", "ALTYAN", "ALUCRA", "ALUMİN", "ALÜFTE", "ALYANS", "AMAÇLI", "AMALIK", "AMANIN", "AMASRA", "AMATÖR", "AMAZON", "AMBALA", "AMBARI", "AMBOLİ", "AMBULS", "AMBÜSİ", "AMCAZİ", "AMELCE", "AMENTÜ", "AMERİK", "AMETAL", "AMETİS", "AMFİBİ", "AMIGDA", "AMİGOİ", "AMİNCİ", "AMİRCE", "AMORAL", "AMORTİ", "AMPERİ", "AMPLİT", "AMPÜTÜ", "AMUDEN", "AMUDİY", "ANACIK", "ANADUT", "ANAERİ", "ANAFOR", "ANAHAT", "ANAKOİ", "ANALIK", "ANALİT", "ANALOG", "ANAMAL", "ANANAS", "ANANEV", "ANANZA", "ANARŞİ", "ANASIL", "ANASIN", "ANATOL", "ANATOM", "ANAVAT", "ANASON", "ANAYOL", "ANCAKA", "ANÇÜEZ", "ANDICI", "ANDİNE", "ANDROP", "ANDYAL", "ANEKDO", "ANEMİK", "ANGARY", "ANGUDİ", "ANİDEN", "ANILCA", "ANILIM", "ANILIŞ", "ANILMA", "ANIMSA", "ANINDA", "ANIRTI", "ANIŞMA", "ANITLI", "ANİDEN", "ANİMAS", "ANİMAT", "ANJENİ", "ANJİNO", "ANKARA", "ANKAST", "ANKETA", "ANLAMA", "ANLAMI", "ANLATI", "ANLAYI", "ANMAKA", "ANOMAL", "ANONİM", "ANORAK", "ANTARİ", "ANTENT", "ANTETL", "ANTİKA", "ANTİKU", "ANTLOP", "ANTREN", "ANTRKO", "ANTSİZ", "ANÜRİS", "ANVANT", "ANZARİ", "APALAK", "APANTA", "APARAT", "APAREY", "APARKO", "APATİT", "APAZLA", "APECİK", "APİKAL", "APLİKE", "APOKAL", "APOKOİ", "APOLET", "APOLLO", "APORTA", "APOTRİ", "APRENE", "APRECİ", "APRELİ", "APRONA", "APSIKI", "APSUVA", "ARABAL", "ARABAN", "ARABAS", "ARABES", "ARACID", "ARADAN", "ARAFTA", "ARALIK", "ARAMAK", "ARANIL", "ARANIŞ", "ARANMA", "ARANTI", "ARAPÇA", "ARAPLİ", "ARASIZ", "ARASTA", "ARASIN", "ARAŞIR", "ARATIŞ", "ARATMA", "ARATOR", "ARAYAN", "ARAYIŞ", "ARAZİB", "ARBALE", "ARBEDE", "ARBİTR", "ARBORE", "ARCAİK", "ARDIŞI", "ARDİYE", "ARGAÇL", "ARGONU", "ARIANI", "ARIDIR", "ARIKÇI", "ARILAR", "ARILIĞ", "ARINIŞ", "ARINMA", "ARITIM", "ARITIŞ", "ARITMA", "ARİYAR", "ARIZLI", "ARKACA", "ARKADA", "ARKALI", "ARKASI", "ARKTİK", "ARLAMA", "ARMADA", "ARMALI", "ARMONİ", "ARMUDİ", "ARMUDU", "AROMAL", "ARPACI", "ARZANİ", "ARZİYE", "ARZULU", "ASALET", "ASANSO", "ASAPLI", "ASAYİŞ", "ASFALT", "ASGARİ", "ASKICI", "ASKILI", "ASLİYE", "ASORTİ", "ASUMAN", "AŞARCI", "AŞCILI", "AŞERME", "AŞHANE", "AŞIKLI", "AŞILMA", "AŞINMA", "AŞINTI", "AŞIRMA", "AŞIRTI", "AŞISIZ", "AŞIYLA", "AŞİKAR", "AŞİRET", "ATALET", "ATAMAŞ", "ATANMA", "ATARKA", "ATEŞÇİ", "ATEŞLİ", "ATIFTA", "ATIĞIN", "ATILIM", "ATILIŞ", "ATILMA", "ATIŞMA", "ATKILI", "ATLAMA", "ATLETA", "ATMACA", "ATOMAL", "ATÖLYE", "ATRUĞI", "AVALCA", "AVAMCA", "AVANAK", "AVANTA", "AVARYA", "AVDETİ", "AVCILI", "AVIZLI", "AVUKAT", "AVUNMA", "AVUNTU", "AVUTMA", "AYAKÇA", "AYAKLI", "AYAKTA", "AYARLI", "AYARTI", "AYAZMA", "AYBAST", "AYDINL", "AYIKMA", "AYILIK", "AYILMA", "AYINGA", "AYIPLI", "AYIRAN", "AYIRIŞ", "AYIRMA", "AYIRTI", "AYLAMA", "AYLICA", "AYLIKL", "AYNACI", "AYNALI", "AYNILI", "AYRICA", "AYRILI", "AYRIMA", "AYVALI", "AYYUKA"
  ];
  
  const WORDS_EN = [
    "ACTION", "ACTIVE", "ACTUAL", "ADVICE", "ADVISE", "AFFECT", "AFFORD", "AFRAID", "AGENCY", "AGENDA", "ALMOST", "ALWAYS", "AMOUNT", "ANIMAL", "ANSWER", "ANYONE", "ANYWAY", "APPEAL", "APPEAR", "AROUND", "ARRIVE", "ARTIST", "ASPECT", "ASSESS", "ASSIST", "ASSUME", "ATTACK", "ATTEND", "AUTHOR", "AVENUE", "BACKED", "BARELY", "BATTLE", "BEAUTY", "BECAME", "BECOME", "BEFORE", "BEHALF", "BEHIND", "BELIEF", "BELONG", "BEYOND", "BISHOP", "BORDER", "BOTTLE", "BOTTOM", "BOUGHT", "BRANCH", "BREATH", "BRIDGE", "BRIGHT", "BROKEN", "BUDGET", "BURDEN", "BUREAU", "BUTTON", "CAMERA", "CANCER", "CANDID", "CANVAS", "CARBON", "CAREER", "CAREFUL", "CARPET", "CASUAL", "CATCHY", "CATTLE", "CAUGHT", "CAUSAL", "CAVITY", "CEMENT", "CENSUS", "CENTER", "CENTRE", "CHANCE", "CHANGE", "CHARGE", "CHEESE", "CHOICE", "CHOOSE", "CHORUS", "CHURCH", "CIRCLE", "CITIZEN", "CLIENT", "CLINIC", "CLOSED", "CLOSET", "COFFEE", "COHORT", "COLLAR", "COLLEAGUE", "COLLECT", "COLLEGE", "COLUMN", "COMBAT", "COMEDY", "COMMIT", "COMMON", "COMPLY", "COPPER", "CORNER", "COSTLY", "COUNTY", "COUPLE", "COURSE", "COUSIN", "COVERS", "CREATE", "CREDIT", "CRISIS", "CUSTOM", "DAMAGE", "DANGER", "DARING", "DARKER", "DEBATE", "DECADE", "DECIDE", "DECREE", "DEFEND", "DEGREE", "DEMAND", "DEPEND", "DEPUTY", "DERIVE", "DESERT", "DESIGN", "DESIRE", "DETAIL", "DETECT", "DEVICE", "DIFFER", "DINNER", "DIRECT", "DIVIDE", "DOCTOR", "DOLLAR", "DOMAIN", "DOUBLE", "DRIVEN", "DRIVER", "DURING", "EASILY", "EATING", "EDITOR", "EFFECT", "EFFORT", "EIGHTH", "EITHER", "ELEVEN", "EMERGE", "EMPIRE", "EMPLOY", "ENABLE", "ENDING", "ENERGY", "ENGAGE", "ENGINE", "ENOUGH", "ENSURE", "ENTIRE", "ENTITY", "EQUITY", "ESCAPE", "ESTATE", "ETHICS", "EVOLVE", "EXCEED", "EXCEPT", "EXCESS", "EXPAND", "EXPECT", "EXPERT", "EXPORT", "EXTEND", "EXTENT", "FABRIC", "FACING", "FACTOR", "FAILED", "FAIRLY", "FALLEN", "FAMILY", "FAMOUS", "FATHER", "FELLOW", "FEMALE", "FIGURE", "FILING", "FINGER", "FINISH", "FLIGHT", "FLYING", "FOLLOW", "FORCED", "FOREST", "FORGET", "FORMAL", "FORMAT", "FORMER", "FOSTER", "FOURTH", "FRENCH", "FRIEND", "FUTURE", "GARDEN", "GATHER", "GENDER", "GENIUS", "GENTLE", "GLOBAL", "GOLDEN", "GROUND", "GROWTH", "GUILTY", "HANDLE", "HAPPEN", "HARDLY", "HEALTH", "HEIGHT", "HEROIC", "HIDDEN", "HOCKEY", "HOLDER", "HONEST", "HONOUR", "HORSES", "HOSPITAL", "HOSTEL", "HUNTER", "IMPACT", "IMPORT", "INCOME", "INDEED", "INDOOR", "INDUCE", "INFANT", "INFORM", "INJURY", "INSIDE", "INTEND", "INTENT", "INVEST", "ISLAND", "ITSELF", "JERSEY", "JOINED", "JOSEPH", "JUNIOR", "KEEPER", "KILLED", "LABOUR", "LATEST", "LAUNCH", "LAWYER", "LEADER", "LEAGUE", "LEAVES", "LEGACY", "LENGTH", "LESSON", "LETTER", "LEVELS", "LIABLE", "LIBERAL", "LIGHTS", "LIKELY", "LITTLE", "LIVING", "LOCATE", "LOSE", "LOSSES", "LOVELY", "MAKING", "MANAGE", "MANNER", "MARGIN", "MARKET", "MARTIN", "MASTER", "MATTER", "MATURE", "MEDIUM", "MEMBER", "MEMORY", "MENTAL", "MERELY", "MERGER", "METHOD", "MIDDLE", "MINING", "MINUTE", "MIRROR", "MOBILE", "MODERN", "MODEST", "MODULE", "MOMENT", "MOTHER", "MOTION", "MOTIVE", "MURDER", "MUSCLE", "MUSEUM", "MUTUAL", "MYSELF", "NARROW", "NATION", "NATIVE", "NATURE", "NEARBY", "NEARLY", "NEATLY", "NEEDED", "NEVER", "NEWLY", "NIGHTS", "NOBODY", "NORMAL", "NOTICE", "NUMBER", "OBJECT", "OBTAIN", "OFFICE", "OFFSET", "ONLINE", "OPPOSE", "OPTION", "ORANGE", "ORIGIN", "OUTPUT", "OXFORD", "PACKED", "PALACE", "PARENT", "PARISH", "PARKED", "PARLOUR", "PATENT", "PATROL", "PATRON", "PAYING", "PEOPLE", "PERIOD", "PERMIT", "PERSON", "PHRASE", "PICKED", "PIECES", "PILLAR", "PLANET", "PLANTS", "PLAQUE", "PLAYED", "PLAYER", "PLEASE", "POCKET", "POETRY", "POLICE", "POLICY", "POORLY", "POSTER", "POTATO", "POWDER", "PREFER", "PRETTY", "PRINCE", "PRISON", "PROFIT", "PROMPT", "PROPER", "PROSEC", "PROVE", "PUBLIC", "PURSUE", "QUARTZ", "QUOTED", "RABBIT", "RADIAL", "RAISED", "RANDOM", "RARELY", "RATHER", "RATING", "READER", "REALLY", "REASON", "RECALL", "RECENT", "RECORD", "REDUCE", "REFORM", "REFUSE", "REGARD", "REGION", "RELATE", "RELIEF", "REMAIN", "REMOTE", "REMOVE", "REPAIR", "REPEAT", "REPLAY", "REPORT", "RESCUE", "RESIGN", "RESIST", "RESORT", "RESULT", "RETAIN", "RETURN", "REVEAL", "REVIEW", "REWARD", "RIDING", "RIGHTS", "ROUTINE", "RUBBER", "RULING", "SACRED", "SAILOR", "SAMPLE", "SAVING", "SAYING", "SCALES", "SCARCE", "SCHEME", "SCHOOL", "SCREEN", "SEARCH", "SEASON", "SECOND", "SECRET", "SECTOR", "SECURE", "SEEING", "SELDOM", "SELECT", "SELLER", "SENIOR", "SERIES", "SERVER", "SETTLE", "SEVERE", "SEXUAL", "SHADOW", "SHARED", "SHEETS", "SHELLS", "SHIELD", "SHIFTS", "SHIRTS", "SHOCKS", "SHOOTS", "SHORES", "SHOWED", "SHREWD", "SHUTTLE", "SIGNAL", "SILENT", "SILVER", "SIMILAR", "SIMPLE", "SINGER", "SINGLE", "SISTER", "SKETCH", "SLIGHT", "SMOOTH", "SOCIAL", "SOCIETY", "SOFTLY", "SOLELY", "SOLVED", "SOURCE", "SOVIET", "SPEECH", "SPIRIT", "SPOKEN", "SPORTS", "SPREAD", "SPRING", "SQUARE", "STABLE", "STATUS", "STAYED", "STEADY", "STOLEN", "STREET", "STRESS", "STRICT", "STRIKE", "STRING", "STRONG", "STRUCK", "STUDIO", "SUBMIT", "SUDDEN", "SUFFER", "SUMMER", "SUMMIT", "SUPPLY", "SURELY", "SURVEY", "SWITCH", "SYMBOL", "SYSTEM", "TABLES", "TAKING", "TALENT", "TARGET", "TAUGHT", "TEACHER", "TEMPLE", "TENNIS", "TENTH", "TERROR", "THEME", "THEORY", "THINGS", "THIRTY", "THOUGH", "THREAT", "THRILL", "TICKET", "TIMBER", "TIMING", "TISSUE", "TITLE", "TODAY", "TOMATO", "TONIGHT", "TOPICS", "TOURIST", "TOWARD", "TOWERS", "TRACED", "TRACKS", "TRADED", "TRAGIC", "TRAILS", "TRAINS", "TRAITS", "TRANCE", "TRAVEL", "TREATY", "TRENDS", "TRIALS", "TRIBAL", "TRICKS", "TROOPS", "TRUCKS", "TRULY", "TURKEY", "TURNED", "TWELVE", "TWENTY", "TYPICAL", "UNABLE", "UNCLE", "UNIQUE", "UNITED", "UNLESS", "UNLIKE", "UPDATE", "UPWARD", "URGENT", "USEFUL", "VALLEY", "VALUES", "VARIED", "VARYING", "VECTOR", "VELVET", "VENDOR", "VERBAL", "VERIFY", "VERSES", "VESSEL", "VICTIM", "VIEWER", "VILLAGE", "VIRGIN", "VIRTUE", "VISION", "VISUAL", "VOLUME", "VOTING", "WALKED", "WALNUT", "WANTED", "WARMED", "WEALTH", "WEAPON", "WEEKLY", "WEIGHT", "WHOLLY", "WIDELY", "WINDOW", "WINTER", "WIRING", "WISDOM", "WITHIN", "WIZARD", "WONDER", "WOODEN", "WORKER", "WRITER", "YELLOW", "ZOMBIE"
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

  // Separate Game states
  const [isGeoworldStarted, setIsGeoworldStarted] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved && saved.includes('isGeoworldStarted') ? JSON.parse(saved).isGeoworldStarted : false;
  });
  const [isGeodokuStarted, setIsGeodokuStarted] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved && saved.includes('isGeodokuStarted') ? JSON.parse(saved).isGeodokuStarted : false;
  });

  const [geoworldStatus, setGeoworldStatus] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved && saved.includes('geoworldStatus') ? JSON.parse(saved).geoworldStatus : 'playing';
  });
  const [geodokuStatus, setGeodokuStatus] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved && saved.includes('geodokuStatus') ? JSON.parse(saved).geodokuStatus : 'playing';
  });

  const [geoworldSpheres, setGeoworldSpheres] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved && saved.includes('geoworldSpheres') ? JSON.parse(saved).geoworldSpheres : [];
  });
  const [geodokuSpheres, setGeodokuSpheres] = useState(() => {
      const saved = localStorage.getItem('gameState');
      return saved && saved.includes('geodokuSpheres') ? JSON.parse(saved).geodokuSpheres : [];
  });


  const newGame = (overrideType = null, overrideMode = null, overrideLanguage = null, overrideDifficulty = null, overrideGeodokuMode = null) => {
      const activeType = overrideType || gameType;
      const activeMode = overrideMode || gameMode;
      const activeLanguage = overrideLanguage || gameLanguage;
      const activeDifficulty = overrideDifficulty || geodokuDifficulty;
      const activeGeodokuMode = overrideGeodokuMode || geodokuMode;

      if (activeType === 'geoworld') {
          if (activeMode === 'unlimited') {
              setDailyWord(getRandomWord(activeLanguage));
          }
          if (geoworldSpheres.length > 0) {
             setGeoworldSpheres(prev => prev.map(s => ({ ...s, found: false })));
          } else {
             setGeoworldSpheres([]); 
          }
          setFoundLetters([]);
          setGuesses([]);
          setCurrentGuess('');
          setGeoworldStatus('playing');
          setIsGeoworldStarted(true);
      } else if (activeType === 'geodoku') {
          localStorage.removeItem('geodokuAnswers');
          localStorage.removeItem('geodokuNotes');
          const sudoku = getSudoku(activeDifficulty);
          setGeodokuBoard(sudoku.puzzle);
          setGeodokuSolution(sudoku.solution);
          
          const allClues = [];
          for(let i = 0; i < sudoku.puzzle.length; i++) {
              if (sudoku.puzzle[i] !== '-') {
                  allClues.push(i);
              }
          }
          
          for (let i = allClues.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [allClues[i], allClues[j]] = [allClues[j], allClues[i]];
          }
          
          let numToReveal = 10;
          if (activeDifficulty === 'easy') numToReveal = 15;
          if (activeDifficulty === 'hard') numToReveal = 5;
          
          const initialRevealed = allClues.slice(0, numToReveal);
          setGeodokuRevealed(initialRevealed);
          
          setGeodokuSpheres([]); 
          setGeodokuStatus('playing');
          setIsGeodokuStarted(true);
          setGeodokuLives(3);
      }
  };

  const resetGame = () => {
      if (gameType === 'geoworld') {
          setGuesses([]);
          setCurrentGuess('');
          setGeoworldStatus('playing');
          setFoundLetters([]);
          setGeoworldSpheres([]);
      } else {
          setGeodokuStatus('playing');
          setGeodokuSpheres([]);
          setGeodokuLives(3);
      }
  };

  // Update daily word at midnight if in daily mode
  useEffect(() => {
      if (gameMode !== 'daily') return;

      const checkMidnight = () => {
          const newWord = getDailyWord(gameLanguage);
          if (newWord !== dailyWord) {
              setDailyWord(newWord);
              setGeoworldSpheres([]); // Reset spheres
              setFoundLetters([]);
              setGuesses([]);
              setCurrentGuess('');
              setGeoworldStatus('playing');
              setIsGeoworldStarted(false); // Clear game started to remove continue button
          }
      };
      
      const interval = setInterval(checkMidnight, 1000);
      return () => clearInterval(interval);
  }, [dailyWord, gameMode, gameLanguage]);

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

  // Validate saved state against current word and reset if needed
  useEffect(() => {
      if (!dailyWord) return;
      
      const saved = localStorage.getItem('gameState');
      if (saved) {
          const parsed = JSON.parse(saved);
          const currentDayIndex = getDailyIndex();
          const isDailyAndDayChanged = gameMode === 'daily' && parsed.savedDayIndex !== undefined && parsed.savedDayIndex !== currentDayIndex;
          
          const isInvalidState = parsed.geoworldStatus !== 'playing' && (!parsed.guesses || parsed.guesses.length === 0);

          if ((parsed.savedWord && parsed.savedWord !== dailyWord) || isDailyAndDayChanged || isInvalidState) {
              setGuesses([]);
              setCurrentGuess('');
              setGeoworldStatus('playing');
              setIsGeoworldStarted(false);
              setGeoworldSpheres([]);
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
          geoworldStatus,
          geodokuStatus,
          isGeoworldStarted,
          isGeodokuStarted,
          savedWord: dailyWord,
          savedDayIndex: getDailyIndex(),
          startTime,
          endTime,
          geoworldSpheres,
          geodokuSpheres,
          foundLetters,
          distanceWalked,
          gameMode,
          gameLanguage,
          gameType,
          geodokuMode,
          geodokuDifficulty,
          geodokuBoard,
          geodokuSolution,
          geodokuRevealed,
          geodokuLives
      }));
  }, [guesses, currentGuess, geoworldStatus, geodokuStatus, isGeoworldStarted, isGeodokuStarted, dailyWord, geoworldSpheres, geodokuSpheres, foundLetters, distanceWalked, gameMode, gameLanguage, endTime, gameType, geodokuMode, geodokuDifficulty, geodokuBoard, geodokuSolution, geodokuRevealed, geodokuLives]);

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

    navigator.geolocation.getCurrentPosition(
        (position) => {
            handleSuccess(position);
        },
        (error) => console.error("Initial position error:", error),
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
    );

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
    }, 3000);

    return () => {
        navigator.geolocation.clearWatch(watchId);
        clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
      const activeStatus = gameType === 'geoworld' ? geoworldStatus : geodokuStatus;
      if (activeStatus !== 'playing') return;

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
  }, [userLocation, gameType, geoworldStatus, geodokuStatus]);

  // Generate spheres or update letters
  useEffect(() => {
    if (userLocation) {
        if (gameType === 'geoworld' && dailyWord) {
            if (geoworldSpheres.length === 0) {
                const newSpheres = generateSpheres(userLocation, 6, 0.5);
                const wordLetters = dailyWord.split('');
                newSpheres.forEach((sphere, index) => {
                    sphere.letter = wordLetters[index] || '?';
                });
                setGeoworldSpheres(newSpheres);
            } else {
                const wordLetters = dailyWord.split('');
                const currentLetters = geoworldSpheres.map(s => s.letter).join('');
                if (currentLetters !== dailyWord && !geoworldSpheres.every(s => s.letter === '?')) {
                     setGeoworldSpheres(prev => prev.map((sphere, index) => ({
                        ...sphere,
                        letter: wordLetters[index] || '?',
                        found: false 
                    })));
                }
            }
        } else if (gameType === 'geodoku' && geodokuStatus === 'playing') {
            const allFound = geodokuSpheres.length > 0 && geodokuSpheres.every(s => s.found);
            if (geodokuSpheres.length === 0 || allFound) {
                const newSpheres = generateSpheres(userLocation, 6, 0.5);
                newSpheres.forEach((sphere) => {
                    sphere.letter = '?';
                });
                setGeodokuSpheres(newSpheres);
            }
        }
    }
  }, [userLocation, dailyWord, gameType, geodokuStatus, geoworldSpheres, geodokuSpheres]);

  // Check distance
  useEffect(() => {
    const currentSpheres = gameType === 'geoworld' ? geoworldSpheres : geodokuSpheres;
    const setSpheresFn = gameType === 'geoworld' ? setGeoworldSpheres : setGeodokuSpheres;

    if (userLocation && currentSpheres.length > 0) {
      const userPoint = turf.point([userLocation[1], userLocation[0]]);
      
      setSpheresFn(prevSpheres => {
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
      const found = geoworldSpheres.filter(s => s.found).map(s => s.letter);
      setFoundLetters(prev => {
          if (prev.length !== found.length) return found;
          return prev;
      });
  }, [geoworldSpheres]);

  return (
    <GameContext.Provider value={{ 
        userLocation, 
        spheres: gameType === 'geoworld' ? geoworldSpheres : geodokuSpheres, 
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
        geodokuMode,
        setGeodokuMode,
        geodokuDifficulty,
        setGeodokuDifficulty,
        geodokuBoard,
        setGeodokuBoard,
        geodokuSolution,
        setGeodokuSolution,
        geodokuRevealed,
        setGeodokuRevealed,
        geodokuLives,
        setGeodokuLives,
        newGame,
        startTime,
        endTime,
        setEndTime,
        distanceWalked,
        guesses,
        setGuesses,
        currentGuess,
        setCurrentGuess,
        gameStatus: gameType === 'geoworld' ? geoworldStatus : geodokuStatus,
        setGameStatus: gameType === 'geoworld' ? setGeoworldStatus : setGeodokuStatus,
        geoworldStatus,
        setGeoworldStatus,
        geodokuStatus,
        setGeodokuStatus,
        isGameStarted: gameType === 'geoworld' ? isGeoworldStarted : isGeodokuStarted,
        setIsGameStarted: gameType === 'geoworld' ? setIsGeoworldStarted : setIsGeodokuStarted,
        isGeoworldStarted,
        isGeodokuStarted,
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
