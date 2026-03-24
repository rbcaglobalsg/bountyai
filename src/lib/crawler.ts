interface GitHubIssue {
    title: string;
    body: string;
    html_url: string;
    labels: { name: string }[];
    repository_url: string;
    number: number;
    created_at: string;
    updated_at: string;
    comments: number;
}

interface CrawledBounty {
    title: string;
    description: string;
    url: string;
    amount: number;
    source: string;
    repoOwner: string;
    repoName: string;
    issueNumber: number;
    labels: string[];
    languages: string[];
    postedAt: Date;
    linkedPrCount: number;
    lastActivityAt: Date;
}

export async function crawlAllBounties(): Promise<CrawledBounty[]> {
    const [github, algora, issuehunt] = await Promise.all([
        safeCrawl(crawlGitHubBounties),
        safeCrawl(crawlAlgoraBounties),
        safeCrawl(crawlIssueHuntBounties),
    ]);

    const all = [...github, ...algora, ...issuehunt];
    
    // Global deduplication by URL
    return all.filter(
        (b, i, arr) => arr.findIndex((x) => x.url === b.url) === i
    );
}

async function safeCrawl(fn: () => Promise<CrawledBounty[]>): Promise<CrawledBounty[]> {
    try {
        return await fn();
    } catch (error) {
        console.error(`Crawl provider failed: ${fn.name}`, error);
        return [];
    }
}

export async function crawlGitHubBounties(): Promise<CrawledBounty[]> {
    const bounties: CrawledBounty[] = [];

    // 바운티 관련 라벨로 검색
    const queries = [
        'label:bounty state:open',
        'label:💰 state:open',
        'label:"help wanted" label:bounty state:open',
        '"bounty" "$" in:body state:open is:issue',
    ];

    for (const query of queries) {
        try {
            const response = await fetch(
                `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=created&order=desc&per_page=30`,
                {
                    headers: {
                        Accept: 'application/vnd.github.v3+json',
                        ...(process.env.GITHUB_TOKEN
                            ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
                            : {}),
                    },
                }
            );

            if (!response.ok) continue;

            const data = await response.json();
            const issues: GitHubIssue[] = data.items || [];

            for (const issue of issues) {
                const amount = extractAmount(issue.body || '');
                if (amount <= 0) continue;

                // repo 정보 파싱
                const repoMatch = issue.repository_url?.match(
                    /repos\/(.+?)\/(.+?)$/
                );
                const repoOwner = repoMatch?.[1] || '';
                const repoName = repoMatch?.[2] || '';

                // 언어 가져오기
                const languages = await getRepoLanguages(repoOwner, repoName);
                
                // 연결된 PR 개수 가져오기 (실제 보상 진행도를 알 수 있는 핵심 지표)
                const linkedPrCount = await getLinkedPrCount(repoOwner, repoName, issue.number);

                bounties.push({
                    title: issue.title,
                    description: (issue.body || '').slice(0, 2000),
                    url: issue.html_url,
                    amount: amount * 100, // 센트 단위
                    source: 'github',
                    repoOwner,
                    repoName,
                    issueNumber: issue.number,
                    labels: issue.labels.map((l) => l.name),
                    languages,
                    postedAt: new Date(issue.created_at),
                    linkedPrCount,
                    lastActivityAt: new Date(issue.updated_at),
                });
            }
        } catch (error) {
            console.error(`Crawl error for query: ${query}`, error);
        }
    }

    // 중복 제거
    const unique = bounties.filter(
        (b, i, arr) => arr.findIndex((x) => x.url === b.url) === i
    );

    return unique;
}

export async function crawlAlgoraBounties(): Promise<CrawledBounty[]> {
    try {
        const response = await fetch('https://algora.io/api/bounties?status=active&limit=50');
        if (!response.ok) return [];
        
        const data = await response.json();
        const items = data.items || data.bounties || [];
        
        return items.map((item: any) => ({
            title: item.title || item.issue?.title,
            description: item.description || item.issue?.body || '',
            url: item.url || `https://algora.io/bounties/${item.id}`,
            amount: (item.reward_amount || item.amount || 0) * 100,
            source: 'algora',
            repoOwner: item.issue?.repository?.owner?.login || '',
            repoName: item.issue?.repository?.name || '',
            issueNumber: item.issue?.number || 0,
            labels: item.labels || [],
            languages: item.languages || [],
            postedAt: new Date(item.created_at || Date.now()),
            linkedPrCount: item.linked_pr_count || 0,
            lastActivityAt: new Date(item.updated_at || Date.now()),
        }));
    } catch (error) {
        console.error('Algora crawl failed:', error);
        return [];
    }
}

export async function crawlIssueHuntBounties(): Promise<CrawledBounty[]> {
    try {
        // IssueHunt often requires some specific headers or uses a different endpoint structure
        const response = await fetch('https://issuehunt.io/api/v1/issues?status=open&limit=30');
        if (!response.ok) return [];
        
        const data = await response.json();
        const items = data.issues || data.items || [];
        
        return items.map((item: any) => ({
            title: item.title,
            description: item.description || '',
            url: `https://issuehunt.io/issues/${item.id}`,
            amount: (item.bounty_amount || 0) * 100,
            source: 'issuehunt',
            repoOwner: item.repository?.owner?.login || '',
            repoName: item.repository?.name || '',
            issueNumber: item.number || 0,
            labels: item.labels || [],
            languages: item.languages || [],
            postedAt: new Date(item.created_at || Date.now()),
            linkedPrCount: 0, // Not easily available via this API
            lastActivityAt: new Date(item.updated_at || Date.now()),
        }));
    } catch (error) {
        console.error('IssueHunt crawl failed:', error);
        return [];
    }
}

function extractAmount(text: string): number {
    const patterns = [
        /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
        /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)/gi,
        /bounty[:\s]*\$?(\d{1,3}(?:,\d{3})*)/gi,
    ];

    let maxAmount = 0;

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            if (amount > maxAmount && amount <= 50000) {
                maxAmount = amount;
            }
        }
    }

    return maxAmount;
}

async function getRepoLanguages(
    owner: string,
    name: string
): Promise<string[]> {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${name}/languages`,
            {
                headers: {
                    Accept: 'application/vnd.github.v3+json',
                    ...(process.env.GITHUB_TOKEN
                        ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
                        : {}),
                },
            }
        );

        if (!response.ok) return [];

        const data = await response.json();
        return Object.keys(data).slice(0, 5);
    } catch {
        return [];
    }
}

async function getLinkedPrCount(
    owner: string,
    name: string,
    issueNumber: number
): Promise<number> {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${name}/issues/${issueNumber}/timeline`,
            {
                headers: {
                    Accept: 'application/vnd.github.mockingbird-preview+json',
                    ...(process.env.GITHUB_TOKEN
                        ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
                        : {}),
                },
            }
        );

        if (!response.ok) return 0;

        const data = await response.json();
        const prEvents = data.filter((e: any) => 
            e.event === 'cross-referenced' && 
            e.source?.type === 'issue' && 
            e.source?.issue?.pull_request
        );

        return prEvents.length;
    } catch {
        return 0;
    }
}
