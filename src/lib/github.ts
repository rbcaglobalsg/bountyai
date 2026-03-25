export interface RepoContext {
    readme: string;
    fileTree: string;
    issueComments?: string;
    error?: string;
}

export async function getRepositoryContext(issueUrl: string): Promise<RepoContext> {
    try {
        // Parse "https://github.com/owner/repo/issues/123"
        const match = issueUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            return { readme: '', fileTree: '', error: 'Not a GitHub URL' };
        }
        
        const [, owner, repo] = match;
        
        // Fetch all context in parallel for maximum speed
        const [repoDataRes, readmeRes, commentsRes] = await Promise.all([
            // 1. Repo Info & Default Branch
            fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: { 
                    'User-Agent': 'BountyAI-Agent',
                    ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
                },
                signal: AbortSignal.timeout(8000)
            }),
            // 2. README (Raw)
            fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
                headers: { 
                    'User-Agent': 'BountyAI-Agent',
                    'Accept': 'application/vnd.github.v3.raw',
                    ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
                },
                signal: AbortSignal.timeout(10000)
            }),
            // 3. Issue Comments
            (async () => {
                const issueMatch = issueUrl.match(/\/issues\/(\d+)/);
                const issueNumber = issueMatch ? issueMatch[1] : null;
                if (!issueNumber) return null;
                return fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=15&sort=updated&direction=desc`, {
                    headers: { 
                        'User-Agent': 'BountyAI-Agent',
                        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
                    },
                    signal: AbortSignal.timeout(8000)
                });
            })()
        ]);

        let fileTree = 'File tree not available.';
        let readme = 'README not found or empty.';
        let issueComments = 'No recent comments.';

        // Process Repo Data & Fetch Tree
        if (repoDataRes.ok) {
            const repoData = await repoDataRes.json();
            const defaultBranch = repoData.default_branch || 'main';
            
            try {
                const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, {
                    headers: { 
                        'User-Agent': 'BountyAI-Agent',
                        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
                    },
                    signal: AbortSignal.timeout(12000)
                });
                
                if (treeRes.ok) {
                    const treeData = await treeRes.json();
                    if (treeData.tree && Array.isArray(treeData.tree)) {
                        const ignoreMap = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__', 'public/assets'];
                        fileTree = treeData.tree
                            .filter((item: any) => item.type === 'blob')
                            .map((item: any) => item.path)
                            .filter((path: string) => !ignoreMap.some(ignored => path.includes(ignored)))
                            .slice(0, 800)
                            .join('\n');
                    }
                }
            } catch (e) {
                console.warn(`Failed to fetch tree for ${owner}/${repo}`);
            }
        }

        // Process README
        if (readmeRes.ok) {
            readme = await readmeRes.text();
            if (readme.length > 5000) readme = readme.substring(0, 5000) + '...[TRUNCATED]';
        }

        // Process Comments
        if (commentsRes && commentsRes.ok) {
            const commentsData = await commentsRes.json();
            if (Array.isArray(commentsData)) {
                issueComments = commentsData.map(c => `[${c.user.login}]: ${c.body.replace(/\n+/g, ' ').slice(0, 300)}`).join('\n');
            }
        }

        return { readme, fileTree, issueComments };

    } catch (error: any) {
        return { readme: '', fileTree: '', error: error.message };
    }
}
