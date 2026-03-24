async function testApis() {
    const sources = [
        { name: 'Algora', url: 'https://algora.io/api/bounties?status=active&limit=50' },
        { name: 'IssueHunt', url: 'https://issuehunt.io/api/v1/issues?status=open&limit=30' }
    ];

    for (const source of sources) {
        console.log(`Testing ${source.name}...`);
        try {
            const res = await fetch(source.url);
            console.log(`${source.name} status: ${res.status}`);
            if (res.ok) {
                const text = await res.text();
                console.log(`${source.name} response sample: ${text.slice(0, 500)}`);
            } else {
                console.log(`${source.name} failed with ${res.statusText}`);
            }
        } catch (e) {
            console.log(`${source.name} error: ${e.message}`);
        }
    }
}

testApis();
