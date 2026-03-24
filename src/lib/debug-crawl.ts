import { crawlAllBounties } from './crawler';
import { prisma } from './prisma';

async function debug() {
    try {
        console.log('Starting debug crawl...');
        const bounties = await crawlAllBounties();
        console.log(`Found ${bounties.length} bounties`);
        
        for (const bounty of bounties) {
            console.log(`Bounty from ${bounty.source}: ${bounty.title} (${bounty.amount})`);
            // Test detection
            if (bounty.source !== 'github') {
                console.log('Found non-github source!');
            }
        }
    } catch (error: any) {
        console.error('Crawl failed with error:', error);
        if (error.stack) console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
