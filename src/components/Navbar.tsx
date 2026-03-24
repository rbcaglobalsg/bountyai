'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Crosshair, LayoutDashboard, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <Crosshair className="w-6 h-6 text-green-400" />
                            <span className="text-xl font-bold text-white">
                                Bounty<span className="text-green-400">AI</span>
                            </span>
                        </Link>

                        {session && (
                            <div className="flex gap-6">
                                <Link
                                    href="/dashboard"
                                    className="text-gray-300 hover:text-white flex items-center gap-1"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/bounties"
                                    className="text-gray-300 hover:text-white flex items-center gap-1"
                                >
                                    <Crosshair className="w-4 h-4" />
                                    Bounties
                                </Link>
                                <Link
                                    href="/profile"
                                    className="text-gray-300 hover:text-white flex items-center gap-1"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                            </div>
                        )}
                    </div>

                    <div>
                        {session ? (
                            <div className="flex items-center gap-4">
                                <img
                                    src={session.user?.image || ''}
                                    alt=""
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="text-gray-300 text-sm">
                                    {session.user?.name}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn('github')}
                                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg"
                            >
                                Sign in with GitHub
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
