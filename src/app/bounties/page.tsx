'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, RefreshCw, Loader2, Lock } from 'lucide-react';
import { Plan } from '@/types';
import BountyCard from '@/components/BountyCard';
import AiHintsModal from '@/components/AiHintsModal';

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
}

export default function Bounties() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [search, setSearch] = useState('');
    const [filterLang, setFilterLang] = useState('All');
    const [loading, setLoading] = useState(true);
    const [crawling, setCrawling] = useState(false);
    const [crawlResult, setCrawlResult] = useState('');
    const [userPlan, setUserPlan] = useState<Plan>(Plan.FREE);
    const [showHintsId, setShowHintsId] = useState<string | null>(null);
    const [hintTitle, setHintTitle] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    const fetchBounties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (filterLang !== 'All') params.set('language', filterLang);

            const res = await fetch(`/api/bounties?${params.toString()}`);
            const data = await res.json();
            setBounties(data.bounties || []);
            if (data.userPlan) setUserPlan(data.userPlan);
        } catch (error) {
            console.error('Failed to fetch bounties:', error);
        }
        setLoading(false);
    };

    const runCrawl = async () => {
        setCrawling(true);
        setCrawlResult('');
        try {
            const res = await fetch('/api/crawl', { method: 'POST' });
            const data = await res.json();
            setCrawlResult(
                `Found ${data.totalFound} bounties, ${data.newAdded} new added (${data.duration})`
            );
            fetchBounties();
        } catch (error) {
            setCrawlResult('Crawl failed');
        }
        setCrawling(false);
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchBounties();
        }
    }, [status, filterLang]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (status === 'authenticated') {
                fetchBounties();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleStartSolving = (id: string, title: string) => {
        if (userPlan === Plan.ELITE) {
            setHintTitle(title);
            setShowHintsId(id);
        } else {
            // For PRO users, just redirect to the issue URL
            const bounty = bounties.find(b => b.id === id);
            if (bounty) window.open(bounty.url, '_blank');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    const languages = [
        'All', 'TypeScript', 'JavaScript', 'React', 'Python', 'Go', 'Rust', 'Java', 'Ruby', 'CSS',
    ];

    const isFree = userPlan === Plan.FREE;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold font-display">🎯 All Bounties</h1>
                <button
                    onClick={runCrawl}
                    disabled={crawling}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                    {crawling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    {crawling ? 'Crawling...' : 'Scan for Bounties'}
                </button>
            </div>

            {crawlResult && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-6 text-green-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    ✓ {crawlResult}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    <input
                        type="text"
                        placeholder="Search bounties by title or keyword..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 focus:outline-none transition-all shadow-inner"
                    />
                </div>
                {isFree && (
                    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-gray-800 rounded-xl px-6 py-3 flex items-center gap-4">
                        <div className="hidden sm:block text-sm">
                            <span className="text-gray-400">Unlock</span>{' '}
                            <span className="text-green-400 font-bold">5,000+</span>{' '}
                            <span className="text-gray-400">more rewards</span>
                        </div>
                        <button 
                            onClick={() => router.push('/profile')}
                            className="bg-green-500 hover:bg-green-600 text-black text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-green-500/20"
                        >
                            Get PRO
                        </button>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mb-8 flex-wrap">
                {languages.map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setFilterLang(lang)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterLang === lang
                                ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
                            }`}
                    >
                        {lang}
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-400 text-sm">
                    Showing <span className="text-white font-medium">{bounties.length}</span> bounties {isFree && '(Free Tier)'}
                </p>
                {!isFree && (
                     <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700">
                        Tier: <span className="text-green-400 font-bold">{userPlan}</span>
                     </span>
                )}
            </div>

            {loading ? (
                <div className="text-center py-32">
                    <Loader2 className="w-10 h-10 animate-spin text-green-500 mx-auto mb-4" />
                    <p className="text-gray-400 animate-pulse">Fetching fresh bounties for you...</p>
                </div>
            ) : bounties.length === 0 ? (
                <div className="text-center py-32 bg-gray-900/30 border border-dashed border-gray-800 rounded-3xl">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                         <Search className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-lg mb-6">No bounties matching your search found</p>
                    <button
                        onClick={() => { setSearch(''); setFilterLang('All'); }}
                        className="text-green-500 font-semibold hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {bounties.map((bounty) => (
                            <BountyCard
                                key={bounty.id}
                                id={bounty.id}
                                title={bounty.title}
                                amount={bounty.amount}
                                languages={bounty.languages}
                                difficulty={bounty.difficulty}
                                estimatedHours={bounty.estimatedHours}
                                competitors={bounty.competitors}
                                url={bounty.url}
                                source={bounty.source}
                                repoOwner={bounty.repoOwner || undefined}
                                repoName={bounty.repoName || undefined}
                                userPlan={userPlan}
                                onStartSolving={handleStartSolving}
                            />
                        ))}
                    </div>
                    
                    {isFree && bounties.length >= 5 && (
                        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-16 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-green-500/10">
                                    <Lock className="w-10 h-10 text-green-400" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4 font-display">Unlock <span className="text-green-400">5,000+</span> More Bounties</h3>
                                <p className="text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                                    Upgrade to <b>PRO</b> to see thousands of open bounties, get AI matching scores, difficulty analysis, and start earning today.
                                </p>
                                <button 
                                    onClick={() => router.push('/profile')}
                                    className="bg-green-500 hover:bg-green-600 text-black font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-green-500/20 scale-100 hover:scale-105"
                                >
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showHintsId && (
                <AiHintsModal 
                    bountyId={showHintsId} 
                    bountyTitle={hintTitle} 
                    onClose={() => setShowHintsId(null)} 
                />
            )}
        </div>
    );
}
