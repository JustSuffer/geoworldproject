import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function BackgroundMusic() {
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    // Royalty-free ambient music URL (Nature/Calm)
    // Using a reliable source or placeholder. 
    // For this demo, I'll use a direct link to a copyright-free ambient track from a CDN or similar if available.
    // Alternatively, I can use a local file path and ask the user to add it.
    // Let's use a sample URL that is likely to work for demo purposes.
    const MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"; 

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3; // Low volume for background
            
            // Try to play automatically
            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Auto-play was prevented
                    console.log("Autoplay prevented. User interaction needed.");
                });
            }
        }
    }, []);

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.play();
                setIsMuted(false);
            } else {
                audioRef.current.pause();
                setIsMuted(true);
            }
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[100]">
            <button 
                onClick={toggleMute}
                className="p-3 bg-gray-900/80 hover:bg-gray-800 text-white rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all hover:scale-110 group"
                title={isMuted ? "Play Music" : "Mute Music"}
            >
                {isMuted ? (
                    <VolumeX className="w-6 h-6 text-gray-400 group-hover:text-white" />
                ) : (
                    <div className="relative">
                        <Volume2 className="w-6 h-6 text-primary group-hover:text-white" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    </div>
                )}
            </button>
            <audio ref={audioRef} src={MUSIC_URL} loop />
        </div>
    );
}
