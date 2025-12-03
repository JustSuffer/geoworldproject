import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "play": "PLAY",
      "statistics": "STATISTICS",
      "settings": "SETTINGS",
      "howToPlay": "HOW TO PLAY",
      "menu": "MENU",
      "back": "BACK",
      "language": "Language",
      "statsTitle": "Statistics",
      "gamesPlayed": "Games Played",
      "winRate": "Win Rate",
      "currentStreak": "Current Streak",
      "maxStreak": "Max Streak",
      "settingsTitle": "Settings",
      "audio": "Audio",
      "graphics": "Graphics",
      "howToPlayTitle": "How To Play",
      "rule1": "Guess the country based on the map.",
      "rule2": "You have 6 attempts.",
      "rule3": "Green means correct, Yellow means close.",
      "login": "Login",
      "signup": "Sign Up"
    }
  },
  tr: {
    translation: {
      "play": "OYNA",
      "statistics": "İSTATİSTİKLER",
      "settings": "AYARLAR",
      "howToPlay": "NASIL OYNANIR",
      "menu": "MENÜ",
      "back": "GERİ",
      "language": "Dil",
      "statsTitle": "İstatistikler",
      "gamesPlayed": "Oynanan Oyun",
      "winRate": "Kazanma Oranı",
      "currentStreak": "Mevcut Seri",
      "maxStreak": "Maksimum Seri",
      "settingsTitle": "Ayarlar",
      "audio": "Ses",
      "graphics": "Grafikler",
      "howToPlayTitle": "Nasıl Oynanır",
      "rule1": "Haritaya bakarak ülkeyi tahmin et.",
      "rule2": "6 hakkın var.",
      "rule3": "Yeşil doğru, Sarı yakın demek.",
      "login": "Giriş Yap",
      "signup": "Kayıt Ol"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
