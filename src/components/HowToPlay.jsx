import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map, CheckCircle, AlertCircle } from 'lucide-react';

export default function HowToPlay() {
    const { t } = useTranslation();

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm text-white p-4">
             <Link to="/" className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md text-white">
                <ArrowLeft className="w-6 h-6" />
            </Link>

            <div className="bg-gray-800/50 p-8 rounded-2xl border border-white/10 backdrop-blur-md max-w-md w-full">
                <h2 className="text-3xl font-bold text-center mb-8">{t('howToPlayTitle')}</h2>
                
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-xl h-fit">
                            <Map className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-gray-300">{t('rule1')}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-red-500/20 p-3 rounded-xl h-fit">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <p className="text-gray-300">{t('rule2')}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-green-500/20 p-3 rounded-xl h-fit">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-gray-300">{t('rule3')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
