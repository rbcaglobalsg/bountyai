import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { Plan, Role } from '@/types';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: 'jwt',
    },
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
                    role: isAdmin ? Role.ADMIN : Role.USER,
                } as any;
            },
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                }) as any;

                if (!user || !user.password) return null;

                const isPasswordValid = await compare(credentials.password, user.password);
                if (!isPasswordValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    plan: user.plan,
                    githubUsername: user.githubUsername,
                } as any;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.plan = user.plan;
                token.githubUsername = user.githubUsername;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.plan = token.plan;
                session.user.githubUsername = token.githubUsername;
            }
            return session;
        },
    },
    pages: {
        signIn: '/',
    },
};
