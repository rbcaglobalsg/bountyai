'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, FileCode, CheckCircle2, AlertCircle, History } from 'lucide-react';

interface AiHintsModalProps {
    bountyId: string;
    bountyTitle: string;
    onClose: () => void;
}

export default function AiHintsModal({ bountyId, bountyTitle, onClose }: AiHintsModalProps) {
    const [hints, setHints] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHints = async () => {
            try {
                const res = await fetch(`/api/bounties/${bountyId}/hints`);
                
                if (!res.ok) {
                    let errorMsg = 'Failed to fetch AI hints';
                    try {
                        const data = await res.json();
                        errorMsg = data.error || errorMsg;
                    } catch (e) {
                        errorMsg = `Server Timeout or Proxy Error (${res.status})`;
                    }
                    setError(errorMsg);
                    return;
                }

                const data = await res.json();
                
                let parsedHints;
                try {
                    const cleaned = data.hints.replace(/```json/gi, '').replace(/```/g, '').trim();
                    parsedHints = JSON.parse(cleaned);
                } catch (e) {
                    parsedHints = data.hints;
                }
                setHints(parsedHints);
            } catch (err: any) {
                setError(`Connection Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchHints();
    }, [bountyId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative bg-gray-900 border border-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center shadow-inner shadow-purple-500/20">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white font-display">Elite AI Solution</h2>
                            <p className="text-gray-400 text-xs truncate max-w-[400px]">{bountyTitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="py-24 text-center">
                            <Loader2 className="w-14 h-14 animate-spin text-purple-500 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-white mb-2">Analyzing Repo & Comments...</h3>
                            <p className="text-gray-400 text-sm">Reviewing active competition and generating your custom solution path.</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center">
                            <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
                            <p className="text-red-400 text-sm mb-8">{error}</p>
                            <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl transition font-medium">Close</button>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            {typeof hints === 'string' ? (
                                <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm">
                                    {hints}
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {/* 1. Competition Analysis */}
                                    <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${hints?.competition?.isRecommended ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                                        <div className="flex gap-4">
                                            <div className="mt-1">
                                                {hints?.competition?.isRecommended ? (
                                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-6 h-6 text-orange-500" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-2 !mt-0">
                                                    {hints?.competition?.isRecommended ? 'Recommended to Proceed' : 'High Competition / Proceed with Caution'}
                                                </h3>
                                                <p className="text-gray-300 text-sm m-0 leading-relaxed font-bold">{hints?.competition?.statusSummary}</p>
                                            </div>
                                        </div>

                                        <div className="mt-2 space-y-4 pt-4 border-t border-gray-800/50">
                                            <div>
                                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                                                    <History className="w-3 h-3" />
                                                    Strategic Gap Analysis
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed italic m-0">"{hints?.competition?.competitorGapAnalysis}"</p>
                                            </div>
                                            
                                            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                                                <div className="text-[10px] text-purple-400 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-1.5">
                                                    <Sparkles className="w-3 h-3" />
                                                    BountyAI Winning Strategy
                                                </div>
                                                <p className="text-sm text-white font-medium leading-relaxed m-0">{hints?.competition?.winningStrategy}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 2. Architecture Approach */}
                                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800/50">
                                        <h3 className="text-lg font-bold text-white mb-3 !mt-0">Architecture Approach</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed m-0">{hints?.architectureApproach}</p>
                                    </div>

                                    {/* 3. Files to Modify */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <FileCode className="w-5 h-5 text-blue-400" />
                                            Target Files
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {hints?.filesToModify?.map((file: string, idx: number) => (
                                                <span key={idx} className="bg-gray-800 text-blue-400 px-4 py-2 rounded-xl text-xs font-mono border border-gray-700/50 shadow-inner">
                                                    {file}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 4. Step by Step Guide */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-6 pt-4 border-t border-gray-800/50">Implementation Steps</h3>
                                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
                                            {hints?.stepByStepGuide?.map((step: any, idx: number) => (
                                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-gray-800 text-gray-400 group-[.is-active]:bg-purple-600 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl bg-gray-800/50 border border-gray-700/50 shadow-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-bold text-white !m-0">{step.title}</h4>
                                                        </div>
                                                        <p className="text-sm text-gray-400 m-0 mb-4">{step.description}</p>
                                                        
                                                        {step.command && (
                                                            <div className="mb-4">
                                                                <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-widest font-bold">Terminal</p>
                                                                <pre className="bg-gray-950 p-4 rounded-xl border border-gray-800 font-mono text-xs text-green-400 overflow-x-auto !m-0 shadow-inner">
                                                                    <code>$ {step.command}</code>
                                                                </pre>
                                                            </div>
                                                        )}

                                                        {step.codeSnippet && (
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-widest font-bold">Code</p>
                                                                <pre className="!bg-black/60 p-4 rounded-xl border border-gray-800/50 text-xs text-gray-300 overflow-x-auto !m-0 custom-scrollbar shadow-inner">
                                                                    <code>{step.codeSnippet}</code>
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
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
