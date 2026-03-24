const { crawlGitHubBounties, crawlAlgoraBounties, crawlIssueHuntBounties } = require('./src/lib/crawler');

async function test() {
    console.log('Testing GitHub...');
    const gh = await crawlGitHubBounties();
    console.log(`GitHub: found ${gh.length} bounties`);

    console.log('Testing Algora...');
    const algora = await crawlAlgoraBounties();
    console.log(`Algora: found ${algora.length} bounties`);
    if (algora.length > 0) console.log('Sample Algora:', algora[0].url);

    console.log('Testing IssueHunt...');
    const ih = await crawlIssueHuntBounties();
    console.log(`IssueHunt: found ${ih.length} bounties`);
    if (ih.length > 0) console.log('Sample IssueHunt:', ih[0].url);
}

test();
