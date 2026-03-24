import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { Plan } from '@/types';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            profile(profile) {
                const isAdmin = profile.email === process.env.ADMIN_EMAIL;
                return {
                    id: profile.id.toString(),
                    name: profile.name || profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                    githubId: profile.id.toString(),
                    githubUsername: profile.login,
                    plan: Plan.FREE,
                    role: isAdmin ? 'ADMIN' : 'USER',
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                (session.user as any).id = user.id;
                (session.user as any).githubUsername = (user as any).githubUsername;
                (session.user as any).plan = (user as any).plan;
                (session.user as any).role = (user as any).role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/',
    },
};
