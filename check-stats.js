const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const stats = await prisma.bounty.groupBy({
        by: ['source'],
        _count: {
            id: true
        }
    });
    console.log('Bounty stats by source:', stats);
    await prisma.$disconnect();
}

check();
