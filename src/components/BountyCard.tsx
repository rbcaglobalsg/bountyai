'use client';

import { 
    Clock, 
    DollarSign, 
    Lock, 
    Users, 
    ArrowUpRight, 
    Zap, 
    BarChart3,
    Sparkles,
    Shield
} from 'lucide-react';
import { Plan } from '@/types';

interface BountyCardProps {
    id: string;
    title: string;
    amount: number;
    languages: string[];
    difficulty: string | null;
    estimatedHours: number | null;
    competitors: number;
    matchScore?: number;
    url: string;
    source: string;
    repoOwner?: string;
    repoName?: string;
    userPlan?: Plan;
    onStartSolving?: (id: string, title: string) => void;
}

export default function BountyCard({
    id,
    title,
    amount,
    languages,
    difficulty,
    estimatedHours,
    competitors,
    matchScore,
    url,
    source,
    repoOwner,
    repoName,
    userPlan = Plan.FREE,
    onStartSolving,
}: BountyCardProps) {
    const isFree = userPlan === Plan.FREE;
    const isElite = userPlan === Plan.ELITE;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all group shadow-sm flex flex-col h-full relative overflow-hidden">
            {/* Glossy Overlay for Premium Look */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-500/10 transition-all" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-wrap gap-1.5">
                    {languages.map((lang) => (
                        <span
                            key={lang}
                            className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-700 uppercase tracking-tighter"
                        >
                            {lang}
                        </span>
                    ))}
                </div>
                <div className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase tracking-widest px-2 py-1 bg-gray-950 rounded-lg border border-gray-800">
                    <BarChart3 className="w-3 h-3" />
                    {source}
                </div>
            </div>

            <h3 className="text-lg font-bold mb-3 text-white line-clamp-2 min-h-[3.5rem] leading-snug group-hover:text-green-400 transition-colors">
                {title}
            </h3>

            <div className="mt-auto pt-6 space-y-4 relative z-10">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-0.5">Reward</div>
                        <div className="text-2xl font-black text-white flex items-center">
                            <span className="text-green-400 mr-1">$</span>
                            {amount.toLocaleString()}
                        </div>
                    </div>
                    {matchScore !== undefined && !isFree && (
                        <div className="text-right">
                            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-0.5">Match Score</div>
                            <div className={`text-xl font-black ${matchScore >= 80 ? 'text-green-400' : 'text-blue-400'}`}>
                                {matchScore}%
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center gap-2 bg-gray-950/50 p-2.5 rounded-xl border border-gray-800/50 ${isFree ? 'blur-[3px] select-none' : ''}`}>
                        <Shield className="w-4 h-4 text-blue-400" />
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Difficulty</div>
                            <div className="text-xs font-bold text-white uppercase">{difficulty || 'Unknown'}</div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 bg-gray-950/50 p-2.5 rounded-xl border border-gray-800/50 ${isFree ? 'blur-[3px] select-none' : ''}`}>
                        <Clock className="w-4 h-4 text-purple-400" />
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Time Est.</div>
                            <div className="text-xs font-bold text-white">{estimatedHours ? `${estimatedHours}h` : 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 text-gray-500 text-xs py-2 px-1">
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {competitors} competing
                    </span>
                    {repoOwner && repoName && (
                        <span className="truncate opacity-50">/ {repoOwner}/{repoName}</span>
                    )}
                </div>

                <div className="flex gap-3">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-center py-2.5 rounded-xl text-sm font-bold transition-all border border-gray-700 flex items-center justify-center gap-1.5"
                    >
                        View <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    <button 
                        onClick={() => onStartSolving?.(id, title)}
                        disabled={isFree}
                        className={`flex-1 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                            isFree 
                            ? 'bg-gray-900 text-gray-700 border border-gray-800 cursor-not-allowed' 
                            : isElite 
                                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                : 'bg-green-500 hover:bg-green-600 text-black shadow-lg shadow-green-500/20'
                        }`}
                    >
                        {isFree ? <Lock className="w-4 h-4" /> : isElite ? <Sparkles className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        {isFree ? 'Pro Req.' : isElite ? 'AI Solution' : 'Solve It'}
                    </button>
                </div>
            </div>
            
            {isFree && (
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-gray-950 text-center pointer-events-none">
                     <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest animate-pulse">Upgrade to Pro to Solve</p>
                </div>
            )}
        </div>
    );
}
