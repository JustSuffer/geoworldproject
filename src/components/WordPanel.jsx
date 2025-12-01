import { useGame } from '../context/GameContext';

export default function WordPanel() {
    const { dailyWord, foundLetters } = useGame();
    const wordLength = dailyWord.length;

    return (
        <div className="bg-secondary/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-light/20 w-full max-w-md mx-auto mb-4">
            <h2 className="text-light text-center mb-2 text-sm uppercase tracking-wider font-bold">Daily Word Hunt</h2>
            <div className="flex justify-center gap-2">
                {dailyWord.split('').map((char, index) => {
                    // Check if this specific instance of the letter is found
                    // This logic is a bit simplified; if word has two 'E's and we found one 'E', we should ideally know which one.
                    // But for now, let's assume if we found 'E', all 'E's are revealed or we track counts.
                    // The context logic `foundLetters` is an array of found chars.
                    // If we want to be precise, we need to track indices.
                    // But the prompt says "Each sphere gives one letter".
                    // Let's assume if you find a sphere with 'E', you get an 'E'.
                    // If the word is "BEE", and you find one sphere with 'E', do you get one 'E' or both?
                    // Typically in these games, you find specific spheres for specific slots.
                    // My generation logic assigned letters to spheres by index.
                    // So we should check if the sphere for this index is found.
                    // But `WordPanel` doesn't have access to spheres directly easily mapped to this index unless we look at spheres.
                    
                    // Let's use the spheres from context to determine if THIS index is found.
                    // We need to access spheres in this component.
                    return <LetterSlot key={index} char={char} index={index} />;
                })}
            </div>
            <div className="text-center mt-2 text-xs text-light/70">
                {foundLetters.length} / {wordLength} letters found
            </div>
        </div>
    );
}

function LetterSlot({ char, index }) {
    const { spheres } = useGame();
    // Find the sphere corresponding to this index
    const sphere = spheres.find(s => s.id === index); // We assigned id=index in generation
    const isFound = sphere ? sphere.found : false;

    return (
        <div 
            className={`w-10 h-12 flex items-center justify-center rounded-lg text-xl font-bold transition-all duration-500 ${
                isFound 
                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(178,11,11,0.6)] scale-110' 
                    : 'bg-black/30 text-white/20 border border-white/10'
            }`}
        >
            {isFound ? char : '?'}
        </div>
    );
}
