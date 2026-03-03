import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "common": {
        "play": "PLAY",
        "continue": "Continue",
        "statistics": "STATISTICS",
        "settings": "SETTINGS",
        "howToPlay": "HOW TO PLAY",
        "menu": "MENU",
        "back": "BACK",
        "language": "Language",
        "newGame": "NEW GAME",
        "cancel": "Cancel",
        "warning": "Warning!",
        "share": "SHARE",
        "mainMenu": "MAIN MENU",
        "next": "NEXT",
        "daily": "DAILY",
        "unlimited": "UNLIMITED",
        "tryAgain": "TRY AGAIN",
        "won": "YOU WON!",
        "lost": "GAME OVER",
        "gameSaved": "Game Saved", 
        "loading": "Loading..."
      },
      "home": {
        "title": "GEOWORD",
        "subtitle": "QUEST",
        "resetWarning": "Starting a new game will reset your current progress. Are you sure you want to continue?",
        "version": "v1.0.0 • GeoWord Quest"
      },
      "setup": {
        "title": "GAME SETUP",
        "selectMode": "SELECT MODE",
        "selectLanguage": "SELECT LANGUAGE",
        "dailyTitle": "Daily Word",
        "dailyDesc": "One word per day.",
        "unlimitedTitle": "Unlimited",
        "unlimitedDesc": "Play endlessly.",
        "startGame": "START GAME",
        "turkish": "Turkish",
        "english": "English"
      },
      "stats": {
        "title": "Statistics",
        "totalScore": "Total Score",
        "distance": "Distance",
        "streak": "Streak",
        "gamesPlayed": "Games Played",
        "recentGames": "Recent Games",
        "date": "Date",
        "mode": "Mode",
        "score": "Score",
        "today": "Today",
        "win": "WIN",
        "loss": "LOSS"
      },
      "howToPlay": {
        "title": "How to Play",
        "step1Title": "Find Spheres",
        "step1Desc": "Walk around the real world! Your location on the map triggers secret spheres.",
        "step2Title": "Collect Letters",
        "step2Desc": "Walk close (30m) to a sphere to collect it. Each sphere reveals one letter.",
        "step3Title": "Guess the Word",
        "step3Desc": "Use collected clues to guess the 6-letter word in the Wordle interface.",
        "dailyTitle": "Daily Challenge",
        "dailyDesc": "Everyone gets the same word every day. Compete with friends!"
      },
      "settings": {
        "title": "Settings",
        "language": "Language",
        "sound": "Sound Effects",
        "notifications": "Notifications",
        "darkMode": "Dark Mode",
        "about": "About"
      },
      "game": {
        "findSpheres": "Walk to find spheres!",
        "tooFar": "Move closer to collect!",
        "collected": "Letter Collected!",
        "distance": "DIST",
        "time": "TIME"
      }
    }
  },
  tr: {
    translation: {
      "common": {
        "play": "OYNA",
        "continue": "Devam Et",
        "statistics": "İSTATİSTİKLER",
        "settings": "AYARLAR",
        "howToPlay": "NASIL OYNANIR",
        "menu": "MENÜ",
        "back": "GERİ",
        "language": "Dil",
        "newGame": "YENİ OYUN",
        "cancel": "İptal",
        "warning": "Uyarı!",
        "share": "PAYLAŞ",
        "mainMenu": "ANA MENÜ",
        "next": "SONRAKİ",
        "daily": "GÜNLÜK",
        "unlimited": "SINIRSIZ",
        "tryAgain": "TEKRAR DENE",
        "won": "KAZANDIN!",
        "lost": "KAYBETTİN",
        "gameSaved": "Oyun Kaydedildi",
        "loading": "Yükleniyor..."
      },
      "home": {
        "title": "GEOWORD",
        "subtitle": "QUEST",
        "resetWarning": "Yeni bir oyuna başlamak mevcut ilerlemenizi sıfırlayacak. Devam etmek istediğinize emin misiniz?",
        "version": "v1.0.0 • GeoWord Quest"
      },
      "setup": {
        "title": "OYUN KURULUMU",
        "selectMode": "MOD SEÇİN",
        "selectLanguage": "DİL SEÇİN",
        "dailyTitle": "Günlük Kelime",
        "dailyDesc": "Günde bir kelime.",
        "unlimitedTitle": "Sınırsız",
        "unlimitedDesc": "Sınırsız oyna.",
        "startGame": "OYUNU BAŞLAT",
        "turkish": "Türkçe",
        "english": "İngilizce"
      },
      "stats": {
        "title": "İstatistikler",
        "totalScore": "Toplam Puan",
        "distance": "Mesafe",
        "streak": "Seri",
        "gamesPlayed": "Oynanan",
        "recentGames": "Son Oyunlar",
        "date": "Tarih",
        "mode": "Mod",
        "score": "Puan",
        "today": "Bugün",
        "win": "KZN",
        "loss": "KYB"
      },
      "howToPlay": {
        "title": "Nasıl Oynanır",
        "step1Title": "Küreleri Bul",
        "step1Desc": "Gerçek dünyada yürü! Haritadaki konumun gizli küreleri ortaya çıkarır.",
        "step2Title": "Harfleri Topla",
        "step2Desc": "Küreye (30m) yaklaşarak topla. Her küre gizli kelimenin bir harfini açar.",
        "step3Title": "Kelimeyi Tahmin Et",
        "step3Desc": "Topladığın ipuçlarıyla 6 harfli kelimeyi Wordle ekranında tahmin et.",
        "dailyTitle": "Günlük Mücadele",
        "dailyDesc": "Herkes için her gün aynı kelime. Arkadaşlarınla yarış!"
      },
      "settings": {
        "title": "Ayarlar",
        "language": "Dil",
        "sound": "Ses Efektleri",
        "notifications": "Bildirimler",
        "darkMode": "Karanlık Mod",
        "about": "Hakkında"
      },
      "game": {
        "findSpheres": "Küreleri bulmak için yürü!",
        "tooFar": "Toplamak için yaklaş!",
        "collected": "Harf Toplandı!",
        "distance": "MES",
        "time": "SÜRE"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
