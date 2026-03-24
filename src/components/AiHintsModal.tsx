'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

interface AiHintsModalProps {
    bountyId: string;
    bountyTitle: string;
    onClose: () => void;
}

export default function AiHintsModal({ bountyId, bountyTitle, onClose }: AiHintsModalProps) {
    const [hints, setHints] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHints = async () => {
            try {
                const res = await fetch(`/api/bounties/${bountyId}/hints`);
                const data = await res.json();
                if (res.ok) {
                    setHints(data.hints);
                } else {
                    setError(data.error || 'Failed to fetch AI hints');
                }
            } catch (err) {
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchHints();
    }, [bountyId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white font-display">AI Solution Hints</h2>
                            <p className="text-gray-400 text-xs truncate max-w-[300px]">{bountyTitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-6" />
                            <h3 className="text-lg font-bold text-white mb-2">Analyzing Repo & Issue...</h3>
                            <p className="text-gray-400 text-sm">GPT-4o is generating your custom solution path.</p>
                        </div>
                    ) : error ? (
                        <div className="py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Analysis Failed</h3>
                            <p className="text-red-400 text-sm mb-6">{error}</p>
                            <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition">Close</button>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm">
                                {hints}
                            </div>
                            
                            <div className="mt-10 pt-8 border-t border-gray-800">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <FileCode className="w-4 h-4 text-blue-400" />
                                    Next Steps
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm text-gray-400">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        Clone the repository and create a new branch.
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-400">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        Implement the suggested changes based on AI hints.
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-400">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        Verify your solution with local tests.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-950/50 border-t border-gray-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                    >
                        Got it, Start Solving
                    </button>
                </div>
            </div>
        </div>
    );
}
