'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Crosshair,
  Zap,
  DollarSign,
  Shield,
  TrendingUp,
  GitBranch,
} from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-8">
          <Zap className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">
            AI-Powered Bounty Matching
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Find Bounties.
          <br />
          <span className="text-green-400">Earn Money.</span>
          <br />
          With AI.
        </h1>

        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
          BountyAI scans thousands of open source bounties, matches them to your
          skills, and helps you solve them with AI assistance.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => signIn('github')}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-xl text-lg flex items-center gap-2 transition"
          >
            <GitBranch className="w-5 h-5" />
            Start Earning with GitHub
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-4">
          Free to start. No credit card required.
        </p>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-green-400">$2.4M+</div>
            <div className="text-gray-400 mt-1">Bounties Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">5,000+</div>
            <div className="text-gray-400 mt-1">Open Issues</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">92%</div>
            <div className="text-gray-400 mt-1">Match Accuracy</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <Crosshair className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. AI Scans Bounties</h3>
            <p className="text-gray-400">
              We scan GitHub, Algora, and more every hour to find bounties with
              real rewards.
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. Smart Matching</h3>
            <p className="text-gray-400">
              AI matches bounties to your skills, experience, and preferences.
              Only see what you can actually solve.
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Solve & Earn</h3>
            <p className="text-gray-400">
              Get AI-powered hints, code suggestions, and PR templates. Submit
              your solution and get paid.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-gray-700 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Start Earning from Open Source
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Developers on BountyAI earn an average of $500/month from bounties.
          </p>
          <button
            onClick={() => signIn('github')}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-xl text-lg flex items-center gap-2 mx-auto transition"
          >
            <GitBranch className="w-5 h-5" />
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2026 BountyAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
