'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, FileCode, CheckCircle2, AlertCircle, History, Languages } from 'lucide-react';

interface AiHintsModalProps {
    bountyId: string;
    bountyTitle: string;
    onClose: () => void;
}

export default function AiHintsModal({ bountyId, bountyTitle, onClose }: AiHintsModalProps) {
    const [hints, setHints] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<'en' | 'ko'>('ko');

    useEffect(() => {
        const fetchHints = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s timeout
                
                const res = await fetch(`/api/bounties/${bountyId}/hints?lang=${language}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
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
    }, [bountyId, language]); // Add language to dependency array

    const toggleLanguage = () => {
        const nextLang = language === 'en' ? 'ko' : 'en';
        setLanguage(nextLang);
        // fetchHints will be called by useEffect due to language change
    };

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
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white font-display">Elite AI Solution</h2>
                                <button 
                                    onClick={toggleLanguage}
                                    disabled={loading}
                                    className="bg-purple-500/10 text-purple-400 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30 font-black hover:bg-purple-500/20 transition-all flex items-center gap-1 group"
                                >
                                    <Languages className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                                    {language === 'en' ? 'ENGLISH' : '한국어'}
                                </button>
                            </div>
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
                                            {/* Success Guarantee Box */}
                                            <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl flex gap-3 items-start">
                                                <Sparkles className="w-5 h-5 text-green-400 mt-0.5" />
                                                <div>
                                                    <div className="text-[10px] text-green-400 font-black uppercase tracking-[0.2em] mb-1">Reward Success Guarantee</div>
                                                    <p className="text-xs text-gray-400 m-0 leading-relaxed">
                                                        제시된 **5-7개의 단계를 토씨 하나 틀리지 않고 그대로 수행**하시면 리워드를 받을 확률이 99% 이상으로 극대화됩니다. 깃허브를 몰라도 명령어 복사/붙여넣기만으로 충분합니다!
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                                                    <History className="w-3 h-3" />
                                                    실시간 경쟁 분석 (KOR)
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
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between pt-8 border-t border-gray-800/50">
                                            <h3 className="text-xl font-extrabold text-white flex items-center gap-2 m-0">
                                                <History className="w-5 h-5 text-purple-400" />
                                                Implementation Roadmap
                                            </h3>
                                            <div className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded-lg border border-purple-500/20 font-black uppercase tracking-widest">
                                                {hints?.stepByStepGuide?.length || 0} Steps
                                            </div>
                                        </div>

                                        <div className="space-y-12 relative before:absolute before:inset-0 before:left-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-purple-500/50 before:via-blue-500/20 before:to-transparent">
                                            {hints?.stepByStepGuide?.map((step: any, idx: number) => {
                                                const isLast = idx === (hints.stepByStepGuide.length - 1);
                                                const hasCommand = !!step.command;
                                                const hasCode = !!step.codeSnippet;

                                                return (
                                                    <div key={idx} className="relative pl-14 transition-all group">
                                                        {/* Step Number Badge */}
                                                        <div className="absolute left-0 top-0 w-10 h-10 rounded-2xl bg-gray-900 border-2 border-purple-500/50 flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
                                                            {idx + 1}
                                                        </div>

                                                        {/* Step Card */}
                                                        <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 transition-all group-hover:border-purple-500/30 group-hover:bg-gray-800/60 shadow-xl">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <h4 className="text-lg font-bold text-white !m-0 group-hover:text-purple-300 transition-colors uppercase tracking-tight">
                                                                    {step.title}
                                                                </h4>
                                                                {(hasCommand || hasCode) && (
                                                                    <div className="flex gap-2">
                                                                        <span className="text-[10px] bg-gray-900 px-2 py-0.5 rounded border border-gray-700 text-gray-500 font-bold uppercase">
                                                                            {hasCommand ? 'CMD' : ''} {hasCode ? 'CODE' : ''}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <p className="text-gray-400 text-sm leading-relaxed mb-6 m-0">
                                                                {step.description}
                                                            </p>

                                                            {/* Terminal Command Visualization */}
                                                            {step.command && (
                                                                <div className="mb-6 group/code relative">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] flex items-center gap-1.5 px-1">
                                                                            <Loader2 className="w-3 h-3 text-green-500" />
                                                                            Run Command
                                                                        </span>
                                                                        <button 
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(step.command);
                                                                                // Optional: change icon to check
                                                                            }}
                                                                            className="text-[10px] text-purple-400 hover:text-white font-bold flex items-center gap-1 transition-colors"
                                                                        >
                                                                            Copy
                                                                        </button>
                                                                    </div>
                                                                    <div className="bg-black/80 rounded-xl p-4 border border-gray-700/50 font-mono text-xs text-green-400 shadow-inner flex justify-between items-center group-hover/code:border-green-500/30 transition-all">
                                                                        <code className="break-all whitespace-pre-wrap">$ {step.command}</code>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Code Snippet Visualization */}
                                                            {step.codeSnippet && (
                                                                <div className="group/code relative">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] flex items-center gap-1.5 px-1">
                                                                            <FileCode className="w-3 h-3 text-blue-400" />
                                                                            Update Logic
                                                                        </span>
                                                                        <button 
                                                                             onClick={() => navigator.clipboard.writeText(step.codeSnippet)}
                                                                             className="text-[10px] text-blue-400 hover:text-white font-bold flex items-center gap-1 transition-colors"
                                                                        >
                                                                            Copy
                                                                        </button>
                                                                    </div>
                                                                    <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 font-mono text-xs text-gray-300 shadow-inner overflow-hidden group-hover/code:border-blue-500/30 transition-all">
                                                                        <pre className="custom-scrollbar overflow-x-auto whitespace-pre !m-0">
                                                                            <code>{step.codeSnippet}</code>
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
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
