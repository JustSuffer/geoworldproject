import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X } from 'lucide-react';

export default function AuthModal({ onClose, onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user) {
                    onLogin(data.user);
                    onClose();
                }
            }
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#121213] text-white p-6 rounded-lg shadow-2xl w-full max-w-sm relative border border-gray-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X />
                </button>
                
                <h2 className="text-center font-bold mb-6 text-2xl">{isSignUp ? 'Create Profile' : 'Login'}</h2>
                
                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-green-500 focus:outline-none"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-green-500 focus:outline-none"
                        required
                    />
                    
                    {message && <div className="text-red-400 text-sm text-center">{message}</div>}
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-400">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button 
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="ml-2 text-green-500 hover:underline font-bold"
                    >
                        {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}
