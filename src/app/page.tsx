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
  Check,
  Crown,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/bounties');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (session) return null;

  const pricing = [
    {
      name: 'Free',
      price: '$0',
      desc: 'Perfect for beginners',
      features: ['5 Bounties per day', 'Basic skill matching', 'Community support'],
      button: 'Start for Free',
      accent: 'gray'
    },
    {
      name: 'Pro',
      price: '$19',
      desc: 'For serious earners',
      features: ['Unlimited Bounties', 'AI Match Scores (92% accuracy)', 'Difficulty Analysis', 'Email Alerts'],
      button: 'Get Started Pro',
      bestValue: true,
      accent: 'green'
    },
    {
      name: 'Elite',
      price: '$49',
      desc: 'Maximum performance',
      features: ['Everything in Pro', 'AI Solution Hints', 'AI Code Proposals', 'Priority Support'],
      button: 'Go Elite',
      accent: 'blue'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 pt-32 pb-40 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2 mb-10 animate-fade-in">
          <Zap className="w-4 h-4 text-green-400 fill-green-400/20" />
          <span className="text-green-400 text-sm font-bold tracking-tight">
            NEW: GPT-4o Powered Matching
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.05] font-display">
          Find Bounties.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-blue-500">Earn Money.</span><br />
          <span className="relative">
            With AI.
            <Sparkles className="absolute -top-6 -right-10 w-8 h-8 text-yellow-500 animate-bounce" />
          </span>
        </h1>

        <p className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
          The ultimate platform for open-source hunters. AI scans GitHub to find bounties matching your skill set and helps you solve them.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => signIn('github')}
            className="group bg-green-500 hover:bg-green-400 text-black font-black px-10 py-5 rounded-2xl text-xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-green-500/30 scale-100 hover:scale-105 active:scale-95"
          >
            <GitBranch className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Start Earning with GitHub
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 text-gray-500">
           <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800" />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-black bg-green-600 flex items-center justify-center text-[10px] font-bold text-white">+2k</div>
           </div>
           <p className="text-sm font-medium">Join 2,000+ developers earning daily</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-10 rounded-[40px] shadow-2xl">
          {[
            { label: 'Available Bounties', val: '$2.4M+' },
            { label: 'Active Issues', val: '5,000+' },
            { label: 'Match Accuracy', val: '92%' },
            { label: 'Avg. Earnings', val: '$500/mo' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
               <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.val}</div>
               <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-display">Predictable Pricing</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From side-proejcts to full-time bounty hunting, we have a plan for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch pt-10">
          {pricing.map((plan, i) => (
            <div 
              key={i} 
              className={`relative flex flex-col bg-gray-900 border-2 rounded-[32px] p-8 transition-all hover:scale-[1.02] ${
                plan.bestValue 
                  ? 'border-green-500 shadow-2xl shadow-green-500/10' 
                  : 'border-gray-800'
              }`}
            >
              {plan.bestValue && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-black text-xs font-black uppercase px-4 py-1.5 rounded-full tracking-widest">
                  Best Value
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-400 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-500 font-bold">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mt-2 font-medium">{plan.desc}</p>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feat, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.accent === 'green' ? 'bg-green-500/20 text-green-400' : plan.accent === 'blue' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => signIn('github')}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  plan.accent === 'green' 
                    ? 'bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/20' 
                    : plan.accent === 'blue' 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                }`}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-16 bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-gray-500 mb-12">
           <div className="col-span-2">
              <div className="flex items-center gap-2 text-white font-black text-2xl mb-6 font-display">
                 <Zap className="w-6 h-6 text-green-400 fill-green-400/20" />
                 BountyAI
              </div>
              <p className="max-w-sm text-sm leading-relaxed">
                The AI-powered bounty hunter hub. We help developers find and solve open-source rewards faster than anyone else.
              </p>
           </div>
           <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-green-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-green-400 transition">GitHub Crawler</a></li>
              </ul>
           </div>
           <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-green-400 transition">About</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Terms</a></li>
              </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center text-xs tracking-widest uppercase border-t border-gray-900 pt-8">
          © 2026 BountyAI. Built for hunters.
        </div>
      </footer>
    </div>
  );
}
