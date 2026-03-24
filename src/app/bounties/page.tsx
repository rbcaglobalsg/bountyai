'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, RefreshCw, Loader2 } from 'lucide-react';
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

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    // 바운티 목록 가져오기
    const fetchBounties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (filterLang !== 'All') params.set('language', filterLang);

            const res = await fetch(`/api/bounties?${params.toString()}`);
            const data = await res.json();
            setBounties(data.bounties || []);
        } catch (error) {
            console.error('Failed to fetch bounties:', error);
        }
        setLoading(false);
    };

    // 크롤링 실행
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

    // 검색 디바운스
    useEffect(() => {
        const timer = setTimeout(() => {
            if (status === 'authenticated') {
                fetchBounties();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    const languages = [
        'All',
        'TypeScript',
        'JavaScript',
        'React',
        'Python',
        'Go',
        'Rust',
        'Java',
        'Ruby',
        'CSS',
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">🎯 All Bounties</h1>
                <button
                    onClick={runCrawl}
                    disabled={crawling}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition"
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
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-6 text-green-400 text-sm">
                    ✓ {crawlResult}
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Search bounties..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {languages.map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setFilterLang(lang)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterLang === lang
                                ? 'bg-green-500 text-black'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {lang}
                    </button>
                ))}
            </div>

            {/* Results */}
            <p className="text-gray-400 text-sm mb-4">
                Showing {bounties.length} bounties
            </p>

            {loading ? (
                <div className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-4" />
                    <p className="text-gray-400">Loading bounties...</p>
                </div>
            ) : bounties.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-400 text-lg mb-4">No bounties found yet</p>
                    <button
                        onClick={runCrawl}
                        disabled={crawling}
                        className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-xl transition"
                    >
                        Scan for Bounties Now
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bounties.map((bounty) => (
                        <BountyCard
                            key={bounty.id}
                            id={bounty.id}
                            title={bounty.title}
                            amount={bounty.amount}
                            languages={bounty.languages}
                            difficulty={bounty.difficulty || undefined}
                            estimatedHours={bounty.estimatedHours || undefined}
                            competitors={bounty.competitors}
                            url={bounty.url}
                            source={bounty.source}
                            repoOwner={bounty.repoOwner || undefined}
                            repoName={bounty.repoName || undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
