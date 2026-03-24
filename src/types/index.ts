export enum Plan {
    FREE = 'FREE',
    PRO = 'PRO',
    ELITE = 'ELITE',
}

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            githubUsername?: string | null;
            plan: Plan;
        };
    }

    interface User {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        githubUsername?: string | null;
        plan: Plan;
    }
}
