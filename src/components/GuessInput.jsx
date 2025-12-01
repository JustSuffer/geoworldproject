import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function GuessInput() {
    const { dailyWord } = useGame();
    const [guess, setGuess] = useState('');
    const [message, setMessage] = useState('');

    const handleGuess = (e) => {
        e.preventDefault();
        if (!guess) return;
        
        if (guess.toUpperCase() === dailyWord) {
            setMessage('🎉 Correct! You found the word!');
        } else {
            setMessage('❌ Try again!');
            setTimeout(() => setMessage(''), 2000);
        }
        setGuess('');
    };

    return (
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-t-2xl w-full max-w-md mx-auto pointer-events-auto">
            <form onSubmit={handleGuess} className="flex gap-2">
                <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Guess the word..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-primary"
                    maxLength={6}
                />
                <button 
                    type="submit"
                    className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg"
                >
                    Guess
                </button>
            </form>
            {message && <div className="text-center mt-2 font-bold text-light animate-bounce">{message}</div>}
        </div>
    );
}
