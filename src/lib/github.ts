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
        
        // 1. Fetch File Tree (Default Branch)
        let fileTree = '';
        try {
            // Get default branch
            const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: { 
                    'User-Agent': 'BountyAI-Agent',
                    ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
                },
                signal: AbortSignal.timeout(8000)
            });
            
            if (repoRes.ok) {
                const repoData = await repoRes.json();
                const defaultBranch = repoData.default_branch || 'main';
                
                // Get tree (recursive up to a certain depth/size)
                const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, {
                    headers: { 
                        'User-Agent': 'BountyAI-Agent',
                        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
                    },
                    signal: AbortSignal.timeout(10000) // Slightly longer for the massive tree
                });
                
                if (treeRes.ok) {
                    const treeData = await treeRes.json();
                    if (treeData.tree && Array.isArray(treeData.tree)) {
                        // Filter out large/binary/unnecessary dirs to save tokens
                        const ignoreMap = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__', 'public/assets'];
                        
                        fileTree = treeData.tree
                            .filter((item: any) => item.type === 'blob') // Only files
                            .map((item: any) => item.path)
                            .filter((path: string) => !ignoreMap.some(ignored => path.includes(ignored)))
                            .slice(0, 800) // Hard limit to prevent token overflow on massive repos
                            .join('\n');
                    }
                }
            }
        } catch (e) {
            console.warn(`Failed to fetch tree for ${owner}/${repo}`);
        }

        // 2. Fetch README
        let readme = '';
        try {
            const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
                headers: { 
                    'User-Agent': 'BountyAI-Agent',
                    'Accept': 'application/vnd.github.v3.raw',
                    ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
                },
                signal: AbortSignal.timeout(8000)
            });
            if (readmeRes.ok) {
                readme = await readmeRes.text();
                // Truncate README if it's too long
                if (readme.length > 5000) {
                    readme = readme.substring(0, 5000) + '\n...[TRUNCATED]';
                }
            }
        } catch (e) {
            console.warn(`Failed to fetch README for ${owner}/${repo}`);
        }

        // 3. Fetch Issue Comments
        let issueComments = '';
        const issueMatch = issueUrl.match(/\/issues\/(\d+)/);
        const issueNumber = issueMatch ? issueMatch[1] : null;

        if (issueNumber) {
            try {
                const commentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=15&sort=updated&direction=desc`, {
                    headers: { 
                        'User-Agent': 'BountyAI-Agent',
                        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
                    },
                    signal: AbortSignal.timeout(8000)
                });
                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json();
                    if (Array.isArray(commentsData)) {
                        issueComments = commentsData.map(c => `[${c.user.login}]: ${c.body.replace(/\n+/g, ' ').slice(0, 300)}`).join('\n');
                    }
                }
            } catch (e) {
                console.warn(`Failed to fetch comments for ${owner}/${repo}#${issueNumber}`);
            }
        }

        return {
            readme: readme || 'README not found or empty.',
            fileTree: fileTree || 'File tree not available.',
            issueComments: issueComments || 'No recent comments.',
        };

    } catch (error: any) {
        return { readme: '', fileTree: '', error: error.message };
    }
}
