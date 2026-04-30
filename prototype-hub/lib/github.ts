import { Octokit } from '@octokit/rest';

/**
 * Commits a file to the configured GitHub repo. Vercel's GitHub
 * integration auto-deploys on push, so the file becomes live within
 * 30-90 seconds of this function returning.
 */

function getClient(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN env var is missing');
  return new Octokit({ auth: token });
}

function getRepoConfig() {
  const repoEnv = process.env.GITHUB_REPO;
  if (!repoEnv) throw new Error('GITHUB_REPO env var is missing');
  const [owner, repo] = repoEnv.split('/');
  if (!owner || !repo) {
    throw new Error('GITHUB_REPO must be in the format "owner/repo"');
  }
  const branch = process.env.GITHUB_BRANCH || 'main';
  return { owner, repo, branch };
}

/**
 * Check whether a path already exists on the configured branch.
 * Returns true if a file or directory exists at that path.
 */
export async function pathExists(path: string): Promise<boolean> {
  const octokit = getClient();
  const { owner, repo, branch } = getRepoConfig();

  try {
    await octokit.repos.getContent({ owner, repo, path, ref: branch });
    return true;
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      (err as { status?: number }).status === 404
    ) {
      return false;
    }
    throw err;
  }
}

/**
 * Create a new file at the given path. Throws if the file already
 * exists — caller is responsible for slug collision handling.
 */
export async function createFile(args: {
  path: string;
  content: string;
  commitMessage: string;
}): Promise<void> {
  const octokit = getClient();
  const { owner, repo, branch } = getRepoConfig();

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: args.path,
    message: args.commitMessage,
    content: Buffer.from(args.content, 'utf-8').toString('base64'),
    branch,
  });
}
