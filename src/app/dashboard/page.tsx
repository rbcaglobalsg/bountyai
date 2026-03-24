'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    DollarSign,
    Crosshair,
    CheckCircle,
    TrendingUp,
    Loader2,
} from 'lucide-react';
import BountyCard from '@/components/BountyCard';

interface Bounty {
    id: string;
    title: string;
    amount: number;
    languages: string[];
    difficulty: string | null;
    estimatedHours: number | null;
    competitors: number;
    url: string;
    source: string;
    repoOwner: string | null;
    repoName: string | null;
    linkedPrCount?: number;
    lastActivityAt?: string | null;
    matchScore?: number;
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated' && !fetched) {
            setFetched(true);
            fetch('/api/bounties')
                .then((res) => res.json())
                .then((data) => {
                    setBounties(data.bounties || []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [status, fetched]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-400" />
            </div>
        );
    }

    if (!session) return null;

    const userPlan = (session.user as any).plan;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8 text-white">
                Welcome back, {session.user?.name} 👋
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="text-gray-400 text-sm">Total Earned</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">$0</div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Crosshair className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-400 text-sm">Available</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{bounties.length}</div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-400 text-sm">Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-white">0</div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-400 text-sm">In Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-white">0</div>
                </div>
            </div>

            {/* Bounties */}
            <h2 className="text-xl font-bold mb-4 text-white">🎯 Latest Bounties</h2>

            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-4" />
                    <p className="text-gray-400">Loading bounties...</p>
                </div>
            ) : bounties.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-xl">
                    <p className="text-gray-400 text-lg mb-4">No bounties yet</p>
                    <button
                        onClick={() => router.push('/bounties')}
                        className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-xl transition"
                    >
                        Go to Bounties
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bounties.map((bounty) => (
                        <BountyCard
                            key={bounty.id}
                            id={bounty.id}
                            title={bounty.title}
                            amount={bounty.amount / 100}
                            languages={bounty.languages}
                            difficulty={bounty.difficulty ?? null}
                            estimatedHours={bounty.estimatedHours ?? null}
                            competitors={bounty.competitors}
                            matchScore={bounty.matchScore}
                            url={bounty.url}
                            source={bounty.source}
                            userPlan={userPlan}
                            linkedPrCount={bounty.linkedPrCount}
                            lastActivityAt={bounty.lastActivityAt}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
