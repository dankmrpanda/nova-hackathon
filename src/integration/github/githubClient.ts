import { Octokit } from '@octokit/rest';

export function getGithubClient(token = process.env.GITHUB_TOKEN) {
  if (!token) throw new Error('GITHUB_TOKEN is required for GitHub API access');
  return new Octokit({ auth: token });
}

export async function fetchRecentCommits(owner: string, repo: string, perPage = 20) {
  const gh = getGithubClient();
  const res = await gh.repos.listCommits({ owner, repo, per_page: perPage });
  return res.data.map((c) => ({ sha: c.sha, message: c.commit.message, author: c.commit.author?.name }));
}
