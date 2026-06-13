import { logAuditEvent } from "@/server/audit";

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

interface GitHubFileUpdate {
  path: string;
  content: string;
  message: string;
  branch?: string;
}

interface GitHubWorkflowDispatch {
  workflowId: string;
  branch?: string;
  inputs?: Record<string, string>;
}

export class GitHubService {
  private config: GitHubConfig;
  private baseUrl = "https://api.github.com";

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.config.token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`GitHub API error ${response.status}: ${errorBody}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  async getFile(path: string, branch?: string): Promise<{ content: string; sha: string }> {
    const ref = branch ? `?ref=${encodeURIComponent(branch)}` : "";
    const data = await this.request<{
      content: string;
      sha: string;
      encoding: string;
    }>(`/repos/${this.config.owner}/${this.config.repo}/contents/${path}${ref}`);

    const decoded = data.encoding === "base64"
      ? Buffer.from(data.content, "base64").toString("utf-8")
      : data.content;

    return { content: decoded, sha: data.sha };
  }

  async updateFile(update: GitHubFileUpdate): Promise<{ commitSha: string }> {
    const branch = update.branch || "main";

    let existingSha: string | undefined;
    try {
      const existing = await this.getFile(update.path, branch);
      existingSha = existing.sha;
    } catch {
      // File does not exist, will create new
    }

    const encodedContent = Buffer.from(update.content).toString("base64");

    const payload: Record<string, string> = {
      message: update.message,
      content: encodedContent,
      branch,
    };

    if (existingSha) {
      payload.sha = existingSha;
    }

    const result = await this.request<{ commit: { sha: string } }>(
      `/repos/${this.config.owner}/${this.config.repo}/contents/${update.path}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    return { commitSha: result.commit.sha };
  }

  async createBranch(newBranch: string, fromBranch = "main"): Promise<void> {
    const baseRef = await this.request<{ object: { sha: string } }>(
      `/repos/${this.config.owner}/${this.config.repo}/git/refs/heads/${fromBranch}`
    );

    await this.request(`/repos/${this.config.owner}/${this.config.repo}/git/refs`, {
      method: "POST",
      body: JSON.stringify({
        ref: `refs/heads/${newBranch}`,
        sha: baseRef.object.sha,
      }),
    });
  }

  async createPullRequest(title: string, body: string, head: string, base = "main"): Promise<{ number: number; html_url: string }> {
    return this.request(`/repos/${this.config.owner}/${this.config.repo}/pulls`, {
      method: "POST",
      body: JSON.stringify({ title, body, head, base }),
    });
  }

  async dispatchWorkflow(dispatch: GitHubWorkflowDispatch): Promise<void> {
    const branch = dispatch.branch || "main";
    await this.request(
      `/repos/${this.config.owner}/${this.config.repo}/actions/workflows/${dispatch.workflowId}/dispatches`,
      {
        method: "POST",
        body: JSON.stringify({
          ref: branch,
          inputs: dispatch.inputs || {},
        }),
      }
    );
  }

  async getLatestCommit(branch = "main"): Promise<{ sha: string; message: string; date: string }> {
    const data = await this.request<{
      commit: { sha: string; message: string; committer: { date: string } };
    }[]>(`/repos/${this.config.owner}/${this.config.repo}/commits?sha=${branch}&per_page=1`);

    const latest = data[0];
    return {
      sha: latest.commit.sha,
      message: latest.commit.message,
      date: latest.commit.committer.date,
    };
  }

  async listWorkflows(): Promise<{ id: number; name: string; path: string; state: string }[]> {
    const data = await this.request<{ workflows: { id: number; name: string; path: string; state: string }[] }>(
      `/repos/${this.config.owner}/${this.config.repo}/actions/workflows`
    );
    return data.workflows || [];
  }
}

export function createGitHubService(): GitHubService {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;

  if (!token || !owner || !repo) {
    throw new Error("GitHub token, owner, and repo name are not configured");
  }

  return new GitHubService({ token, owner, repo });
}

export async function updateCodeViaTelegram(
  filePath: string,
  newContent: string,
  commitMessage: string,
  userId: string,
  organizationId: string,
  branch?: string
): Promise<{ commitSha: string; branch: string }> {
  const service = createGitHubService();
  const targetBranch = branch || `telegram-update-${Date.now()}`;

  if (!branch) {
    await service.createBranch(targetBranch, "main");
  }

  const result = await service.updateFile({
    path: filePath,
    content: newContent,
    message: commitMessage,
    branch: targetBranch,
  });

  await logAuditEvent({
    action: "code_update_via_telegram",
    category: "admin",
    userId,
    resourceType: "code",
    resourceId: filePath,
    organizationId,
    metadata: { commitSha: result.commitSha, branch: targetBranch },
  });

  return { commitSha: result.commitSha, branch: targetBranch };
}

export async function createDeploymentPullRequest(
  branch: string,
  userId: string,
  organizationId: string
): Promise<{ number: number; url: string }> {
  const service = createGitHubService();

  const pr = await service.createPullRequest(
    `Telegram update: ${branch}`,
    `This update was triggered via Telegram by user ${userId}. Please review before merging.`,
    branch
  );

  await logAuditEvent({
    action: "create_deployment_pr",
    category: "admin",
    userId,
    resourceType: "pull_request",
    resourceId: String(pr.number),
    organizationId,
    metadata: { branch, prUrl: pr.html_url },
  });

  return { number: pr.number, url: pr.html_url };
}
