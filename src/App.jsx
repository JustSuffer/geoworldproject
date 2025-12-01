import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import MapView from './components/MapView';
import WordleGame from './components/WordleGame';
import MainMenu from './components/MainMenu';
import AuthModal from './components/AuthModal';
import { supabase } from './supabaseClient';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false); // We can pass this to WordleGame if needed, or handle stats in MainMenu

  return (
    <GameProvider>
      <div className="relative h-screen w-full overflow-hidden bg-gray-900">
        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          <MapView />
        </div>

        {/* Main Menu Overlay */}
        {!gameStarted && (
            <MainMenu 
                onPlay={() => setGameStarted(true)} 
                onStats={() => setStatsOpen(true)}
                onAuth={() => setAuthOpen(true)}
            />
        )}

        {/* Game Overlay */}
        {gameStarted && (
            <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Back Button (Optional, or use browser back/reload for now as per "embedded" request) */}
                <button 
                    onClick={() => setGameStarted(false)}
                    className="pointer-events-auto absolute top-4 left-4 text-white/50 hover:text-white z-50 font-bold"
                >
                    ← MENU
                </button>
                <WordleGame onStats={() => setStatsOpen(true)} />
            </div>
        )}

        {/* Global Modals */}
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={() => {}} />}
        {/* Stats modal is currently internal to WordleGame, but we might want to lift it up if accessed from Menu. 
            For now, let's keep it simple. If user clicks Stats in Menu, we can show a placeholder or lift state.
            Refactoring WordleGame to accept `statsOpen` prop would be best, but for now let's just let the game handle it internally 
            and maybe mount a separate stats modal for the menu.
        */}
      </div>
    </GameProvider>
  );
}

export default App;
