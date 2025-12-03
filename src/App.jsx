import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GameProvider } from './context/GameContext';
import MapView from './components/MapView';
import WordleGame from './components/WordleGame';
import MainMenu from './components/MainMenu';
import AuthModal from './components/AuthModal';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import HowToPlay from './components/HowToPlay';
import BackgroundMusic from './components/BackgroundMusic';

function AppContent() {
  const [authOpen, setAuthOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* Map Background - Persistent across all routes */}
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      <Routes>
        <Route path="/" element={<MainMenu onAuth={() => setAuthOpen(true)} />} />
        
        <Route path="/play" element={
          <div className="relative z-10 w-full h-full flex flex-col">
            {/* Top Navigation */}
            <div className="absolute top-4 left-4 z-50">
              <Link 
                to="/" 
                className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
                MENU
              </Link>
            </div>
            <WordleGame onStats={() => {}} /> 
          </div>
        } />

        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/howtoplay" element={<HowToPlay />} />
      </Routes>

      {/* Global Modals */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={() => {}} />}
      
      {/* Global Background Music */}
      <BackgroundMusic />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <Router>
        <AppContent />
      </Router>
    </GameProvider>
  );
}

export default App;
