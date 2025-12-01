import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import MapView from './components/MapView';
import WordPanel from './components/WordPanel';
import GuessInput from './components/GuessInput';
import WordleGame from './components/WordleGame';
import { Gamepad2 } from 'lucide-react';

function App() {
  const [showWordle, setShowWordle] = useState(false);

  return (
    <GameProvider>
      <div className="relative h-screen w-full overflow-hidden bg-gray-900">
        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          <MapView />
        </div>

        {/* UI Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 pb-8">
          {/* Top Panel */}
          <div className="pointer-events-auto pt-safe w-full flex justify-center relative">
            <WordPanel />
            <button 
              onClick={() => setShowWordle(true)}
              className="absolute right-0 top-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
              title="Open Wordle"
            >
              <Gamepad2 />
            </button>
          </div>

          {/* Bottom Panel */}
          <div className="pointer-events-auto pb-safe w-full flex justify-center">
            <GuessInput />
          </div>
        </div>

        {/* Wordle Game Overlay */}
        {showWordle && (
          <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center">
            <div className="relative w-full h-full max-w-lg mx-auto">
                <button 
                    onClick={() => setShowWordle(false)}
                    className="absolute top-4 right-4 z-50 text-white/50 hover:text-white"
                >
                    Close
                </button>
                <WordleGame />
            </div>
          </div>
        )}
      </div>
    </GameProvider>
  );
}

export default App;
