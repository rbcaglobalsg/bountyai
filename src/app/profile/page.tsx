'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Save, Zap, Crown, Loader2, Check } from 'lucide-react';
import { Plan } from '@/types';

const ALL_SKILLS = [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Vue.js',
    'Angular',
    'Node.js',
    'Python',
    'Django',
    'FastAPI',
    'Go',
    'Rust',
    'Java',
    'Spring',
    'C#',
    '.NET',
    'PHP',
    'Laravel',
    'Ruby',
    'Rails',
    'Swift',
    'Kotlin',
    'Flutter',
    'React Native',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Redis',
    'Docker',
    'Kubernetes',
    'AWS',
    'GCP',
    'Terraform',
    'GraphQL',
    'REST API',
    'CSS',
    'Tailwind',
];

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [skills, setSkills] = useState<string[]>([]);
    const [minBounty, setMinBounty] = useState(50);
    const [maxHours, setMaxHours] = useState(10);
    const [userPlan, setUserPlan] = useState<Plan>(Plan.FREE);
    const [saved, setSaved] = useState(false);
    const [upgrading, setUpgrading] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const data = await res.json();
                    setSkills(data.skills || []);
                    setMinBounty(data.minBounty || 50);
                    setMaxHours(data.maxHours || 10);
                    setUserPlan(data.plan || Plan.FREE);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };
        if (session) fetchProfile();
    }, [session]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
        );
    }

    if (!session) {
        router.push('/');
        return null;
    }

    const toggleSkill = (skill: string) => {
        setSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill]
        );
    };

    const handleSave = async () => {
        try {
            await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills, minBounty, maxHours }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save profile:', error);
        }
    };

    const handleUpgrade = async (tier: 'PRO' | 'ELITE') => {
        setUpgrading(tier);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Failed to start checkout');
                setUpgrading(null);
            }
        } catch (error) {
            console.error('Upgrade error:', error);
            setUpgrading(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-10 font-display text-white">Profile Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Skills */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                            <Check className="w-5 h-5 text-green-500" />
                            Your Skills
                        </h2>
                        <p className="text-gray-400 text-sm mb-6">
                            AI uses these to match you with the best bounties.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {ALL_SKILLS.map((skill) => (
                                <button
                                    key={skill}
                                    onClick={() => toggleSkill(skill)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${skills.includes(skill)
                                            ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                                            : 'bg-gray-800 text-gray-400 border border-transparent hover:border-gray-700'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Bounty Preferences
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-gray-300 text-sm font-medium">Minimum Reward</label>
                                    <span className="text-green-400 font-bold">${minBounty}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    step="50"
                                    value={minBounty}
                                    onChange={(e) => setMinBounty(Number(e.target.value))}
                                    className="w-full accent-green-500 bg-gray-800 h-2 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-gray-300 text-sm font-medium">Max Time Commitment</label>
                                    <span className="text-blue-400 font-bold">{maxHours}h / bounty</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="40"
                                    value={maxHours}
                                    onChange={(e) => setMaxHours(Number(e.target.value))}
                                    className="w-full accent-blue-500 bg-gray-800 h-2 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end text-white">
                        <button
                            onClick={handleSave}
                            className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-green-500/20 active:scale-95"
                        >
                            <Save className="w-5 h-5" />
                            {saved ? 'Changes Saved!' : 'Save All Changes'}
                        </button>
                    </div>
                </div>

                {/* Subscription Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <Crown className={`w-6 h-6 ${userPlan === Plan.FREE ? 'text-gray-700' : 'text-yellow-500 animate-pulse'}`} />
                        </div>
                        
                        <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-2">Current Plan</h2>
                        <div className="text-3xl font-black mb-6 font-display text-white">
                            {userPlan === Plan.FREE && 'FREE'}
                            {userPlan === Plan.PRO && <span className="text-blue-400">PRO</span>}
                            {userPlan === Plan.ELITE && <span className="text-purple-400">ELITE</span>}
                        </div>

                        <div className="space-y-4 mb-8">
                            {userPlan === Plan.FREE ? (
                                <>
                                    <p className="text-gray-400 text-sm leading-relaxed">You are currently previewing 5 bounties daily with no AI analysis.</p>
                                    <button 
                                        onClick={() => handleUpgrade('PRO')}
                                        disabled={upgrading !== null}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                    >
                                        {upgrading === 'PRO' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                        Upgrade to Pro
                                    </button>
                                    <button 
                                        onClick={() => handleUpgrade('ELITE')}
                                        disabled={upgrading !== null}
                                        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all border border-gray-700 mt-2"
                                    >
                                        Go Elite
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-xs mb-4">
                                        ✓ Unlimited Bounties<br/>
                                        ✓ AI Match Scores<br/>
                                        {userPlan === Plan.ELITE && '✓ AI Code Proposals'}
                                    </div>
                                    <button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold py-3 rounded-xl border border-gray-700">
                                        Manage Subscription
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                        <h3 className="text-blue-400 font-bold text-sm mb-2">Did you know?</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Pro users earn an average of 12x more by focusing on bounties with high match scores.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
