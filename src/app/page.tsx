'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Zap,
  GitBranch,
  Check,
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  Loader2
} from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      router.push('/bounties');
    }
  }, [session, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });
      
      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/bounties');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
    setLoading(false);
  };

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
        
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2 mb-10">
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

        <div className="flex flex-col items-center gap-6">
          {!showEmailLogin ? (
            <>
              <button
                onClick={() => signIn('github')}
                className="group bg-green-500 hover:bg-green-400 text-black font-black px-10 py-5 rounded-2xl text-xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-green-500/30 scale-100 hover:scale-105 active:scale-95"
              >
                <GitBranch className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Start Earning with GitHub
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setShowEmailLogin(true)}
                className="text-gray-500 hover:text-gray-300 text-sm font-bold transition-colors"
              >
                Or sign in with email
              </button>
            </>
          ) : (
            <div className="w-full max-w-md bg-gray-900/50 border border-gray-800 p-8 rounded-[32px] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Email Login</h3>
                <button 
                  onClick={() => setShowEmailLogin(false)}
                  className="text-gray-500 hover:text-white"
                >
                  Back
                </button>
              </div>
              
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input 
                      type="email" 
                      placeholder="admin@rbcaglobal.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 focus:border-green-500 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 focus:border-green-500 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:bg-green-900"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                </button>
              </form>
            </div>
          )}
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

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-display">Predictable Pricing</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From side-projects to full-time bounty hunting, we have a plan for you.
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
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-400 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-500 font-bold">/mo</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feat, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 text-gray-500">
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
        <div className="max-w-7xl mx-auto px-4 text-center text-xs tracking-widest uppercase py-8">
          © 2026 BountyAI. Built for hunters.
        </div>
      </footer>
    </div>
  );
}
