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
    competitors: number;
    lastActivityAt: Date;
}

export async function crawlAllBounties(): Promise<CrawledBounty[]> {
    return crawlGitHubBounties();
}

export async function crawlGitHubBounties(): Promise<CrawledBounty[]> {
    const bounties: CrawledBounty[] = [];

    // 필터: 최근 30일 이내에 업데이트된 것들만 (유효성 확보)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateQuery = `updated:>=${thirtyDaysAgo.toISOString().split('T')[0]}`;

    const queries = [
        `label:bounty state:open ${dateQuery}`,
        `label:algora state:open ${dateQuery}`,
        `"managed by algora" state:open ${dateQuery}`,
        `"issued on issuehunt" state:open ${dateQuery}`,
        `"algora.io" state:open ${dateQuery}`,
        `"issuehunt.io" state:open ${dateQuery}`,
        `"managed by @algora-io" state:open ${dateQuery}`,
        `"issued on @issuehunt" state:open ${dateQuery}`,
        `"bounty" "$" state:open is:issue ${dateQuery}`,
    ];

    for (const query of queries) {
        try {
            const response = await fetch(
                `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=15`,
                {
                    cache: 'no-store',
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

                // 언어 가져오기 및 연결된 PR 개수 가져오기를 병렬로 실행하여 시간 단축
                const [languages, metrics] = await Promise.all([
                    getRepoLanguages(repoOwner, repoName),
                    getIssueMetrics(repoOwner, repoName, issue.number, (issue as any).user?.login)
                ]);

                // 소스 분석 (GitHub 이슈더라도 Algora/IssueHunt 라벨이 있으면 해당 소스로 표시)
                const source = detectSource(issue);

                bounties.push({
                    title: issue.title,
                    description: (issue.body || '').slice(0, 2000),
                    url: issue.html_url,
                    amount: amount * 100, // 센트 단위
                    source,
                    repoOwner,
                    repoName,
                    issueNumber: issue.number,
                    labels: issue.labels.map((l) => l.name),
                    languages,
                    postedAt: new Date(issue.created_at),
                    linkedPrCount: metrics.linkedPrCount,
                    competitors: metrics.competitors,
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

function detectSource(issue: GitHubIssue): string {
    const labels = issue.labels.map((l) => l.name.toLowerCase());
    const body = (issue.body || '').toLowerCase();

    if (labels.includes('algora') || body.includes('managed by algora')) {
        return 'algora';
    }
    if (labels.includes('issuehunt') || body.includes('issued on issuehunt') || body.includes('issuehunt.io')) {
        return 'issuehunt';
    }
    return 'github';
}

async function getRepoLanguages(
    owner: string,
    name: string
): Promise<string[]> {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${name}/languages`,
            {
                cache: 'no-store',
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

async function getIssueMetrics(
    owner: string,
    name: string,
    issueNumber: number,
    authorLogin?: string
): Promise<{ linkedPrCount: number, competitors: number }> {
    try {
        const [timelineRes, commentsRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${name}/issues/${issueNumber}/timeline`, {
                cache: 'no-store',
                headers: {
                    Accept: 'application/vnd.github.mockingbird-preview+json',
                    ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
                },
                signal: AbortSignal.timeout(8000)
            }),
            fetch(`https://api.github.com/repos/${owner}/${name}/issues/${issueNumber}/comments?per_page=100`, {
                cache: 'no-store',
                headers: {
                    Accept: 'application/vnd.github.v3+json',
                    ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
                },
                signal: AbortSignal.timeout(8000)
            })
        ]);

        let linkedPrCount = 0;
        if (timelineRes.ok) {
            const data = await timelineRes.json();
            const prEvents = data.filter((e: any) => 
                e.event === 'cross-referenced' && 
                e.source?.type === 'issue' && 
                e.source?.issue?.pull_request
            );
            linkedPrCount = prEvents.length;
        }

        let competitors = 0;
        if (commentsRes.ok) {
            const commentsData = await commentsRes.json();
            const attemptingUsers = new Set<string>();
            const uniqueCommenters = new Set<string>();
            
            for (const c of commentsData) {
                const body = (c.body || '').toLowerCase();
                const actor = c.user?.login || '';
                
                if (actor && actor !== authorLogin) {
                    if (!actor.includes('bot')) {
                        uniqueCommenters.add(actor);
                        if (
                            body.includes('/attempt') || 
                            body.includes('work on this') || 
                            body.includes('working on it') || 
                            body.includes('take a shot') ||
                            body.includes('created a pr') ||
                            body.includes('fix this')
                        ) {
                            attemptingUsers.add(actor);
                        }
                    } else {
                        // Check bot messages for assignment confirmations
                        if (
                            body.includes('started working') || 
                            body.includes('attempting this') || 
                            body.includes('opened a pull request') || 
                            body.includes('submitted a pull') || 
                            body.includes('rewarded')
                        ) {
                            attemptingUsers.add(`bot-reported-${c.id}`);
                        }
                    }
                }
            }
            
            competitors = attemptingUsers.size > 0 
                ? attemptingUsers.size 
                : (uniqueCommenters.size > 0 ? Math.min(1, Math.floor(uniqueCommenters.size / 2) || 1) : 0);
        }

        // Ensure competitors is at least the number of linked PRs
        competitors = Math.max(competitors, linkedPrCount);

        return { linkedPrCount, competitors };
    } catch {
        return { linkedPrCount: 0, competitors: 0 };
    }
}
