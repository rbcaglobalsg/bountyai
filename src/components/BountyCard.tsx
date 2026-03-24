'use client';

import { Crosshair, Clock, Users, Zap } from 'lucide-react';

interface BountyCardProps {
    id: string;
    title: string;
    amount: number;
    languages: string[];
    difficulty?: string;
    estimatedHours?: number;
    competitors: number;
    matchScore?: number;
    url: string;
    source: string;
    repoOwner?: string;
    repoName?: string;
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
}: BountyCardProps) {
    const difficultyColor: Record<string, string> = {
        EASY: 'bg-green-500/20 text-green-400',
        MEDIUM: 'bg-yellow-500/20 text-yellow-400',
        HARD: 'bg-orange-500/20 text-orange-400',
        EXPERT: 'bg-red-500/20 text-red-400',
    };

    const scoreColor =
        matchScore && matchScore >= 80
            ? 'text-green-400'
            : matchScore && matchScore >= 60
                ? 'text-yellow-400'
                : 'text-gray-400';

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {repoOwner && repoName && (
                            <span className="text-gray-500 text-sm">
                                {repoOwner}/{repoName}
                            </span>
                        )}
                        <span className="text-white text-xs px-2 py-1 bg-purple-600 rounded font-medium">
                            {source}
                        </span>
                    </div>
                    <h3 className="text-white font-semibold text-lg">{title}</h3>
                </div>
                <div className="text-right">
                    <div className="text-green-400 font-bold text-2xl">
                        ${(amount / 100).toLocaleString()}
                    </div>
                    {matchScore && (
                        <div className={`text-sm font-medium ${scoreColor}`}>
                            {matchScore}% match
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {languages.map((lang) => (
                    <span
                        key={lang}
                        className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                    >
                        {lang}
                    </span>
                ))}
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                {difficulty && (
                    <span
                        className={`px-2 py-1 rounded text-xs font-medium ${difficultyColor[difficulty] || 'bg-gray-700 text-gray-300'}`}
                    >
                        {difficulty}
                    </span>
                )}
                {estimatedHours && (
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {estimatedHours}h
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {competitors} competing
                </span>
            </div>

            <div className="flex gap-3">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-center py-2 rounded-lg text-sm transition"
                >
                    View Issue
                </a>
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-1 transition">
                    <Zap className="w-4 h-4" />
                    Start Solving
                </button>
            </div>
        </div>
    );
}
