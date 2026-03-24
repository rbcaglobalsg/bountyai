'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

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
  'Shell',
  'HTML',
  'Makefile',
];

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);
  const [minBounty, setMinBounty] = useState(50);
  const [maxHours, setMaxHours] = useState(10);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // 기존 프로필 로드
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.skills) setSkills(data.skills);
          if (data.minBounty) setMinBounty(data.minBounty);
          if (data.maxHours) setMaxHours(data.maxHours);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
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
    setSaving(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-400" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

      {/* Skills */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-2">Your Skills</h2>
        <p className="text-gray-400 text-sm mb-4">
          Select your skills to get better bounty matches. ({skills.length} selected)
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_SKILLS.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${skills.includes(skill)
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">
              Minimum Bounty Amount: <span className="text-green-400 font-bold">${minBounty}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={minBounty}
              onChange={(e) => setMinBounty(Number(e.target.value))}
              className="w-full accent-green-500"
            />
            <div className="flex justify-between text-gray-500 text-xs">
              <span>$0</span>
              <span>$1,000</span>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">
              Maximum Hours per Bounty: <span className="text-green-400 font-bold">{maxHours}h</span>
            </label>
            <input
              type="range"
              min="1"
              max="40"
              value={maxHours}
              onChange={(e) => setMaxHours(Number(e.target.value))}
              className="w-full accent-green-500"
            />
            <div className="flex justify-between text-gray-500 text-xs">
              <span>1h</span>
              <span>40h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-green-500 hover:bg-green-600 disabled:bg-green-800 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition"
      >
        {saving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
