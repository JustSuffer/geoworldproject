import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import MapView from './components/MapView';
import WordleGame from './components/WordleGame';
import MainMenu from './components/MainMenu';
import AuthModal from './components/AuthModal';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import HowToPlay from './components/HowToPlay';

function App() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <GameProvider>
      <Router>
        <div className="relative h-screen w-full overflow-hidden bg-gray-900">
          {/* Map Background - Persistent across all routes */}
          <div className="absolute inset-0 z-0">
            <MapView />
          </div>

          <Routes>
            <Route path="/" element={<MainMenu onAuth={() => setAuthOpen(true)} />} />
            
            <Route path="/play" element={
              <div className="absolute inset-0 z-10 pointer-events-none">
                  <Link 
                      to="/"
                      className="pointer-events-auto absolute top-4 left-4 text-white/50 hover:text-white z-50 font-bold"
                  >
                      ← MENU
                  </Link>
                  <WordleGame onStats={() => {}} /> 
              </div>
            } />

            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/howtoplay" element={<HowToPlay />} />
          </Routes>

          {/* Global Modals */}
          {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={() => {}} />}
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;
