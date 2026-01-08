/**
 * Cliente para interactuar con GitHub API (Contents API)
 *
 * Permite leer y escribir archivos en un repositorio de GitHub.
 */
export interface GitHubFileContent {
  content: string;
  sha: string;
  path: string;
}

export interface GitHubCommitResult {
  sha: string;
  url: string;
}

export class GitHubApiClient {
  private readonly baseUrl = 'https://api.github.com';
  private readonly token: string;
  private readonly owner: string;
  private readonly repo: string;
  private readonly branch: string;

  constructor(config: {
    token: string;
    owner: string;
    repo: string;
    branch?: string;
  }) {
    this.token = config.token;
    this.owner = config.owner;
    this.repo = config.repo;
    this.branch = config.branch || 'main';
  }

  /**
   * Obtiene el contenido de un archivo del repositorio
   */
  async getFileContent(path: string): Promise<GitHubFileContent> {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${response.status} - ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // El contenido viene en base64
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return {
      content,
      sha: data.sha,
      path: data.path,
    };
  }

  /**
   * Actualiza o crea un archivo en el repositorio
   */
  async updateFile(
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<GitHubCommitResult> {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;

    // Convertir contenido a base64
    const contentBase64 = Buffer.from(content, 'utf-8').toString('base64');

    const body: Record<string, string> = {
      message,
      content: contentBase64,
      branch: this.branch,
    };

    // SHA es requerido para actualizar un archivo existente
    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${response.status} - ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();

    return {
      sha: data.commit.sha,
      url: data.commit.html_url,
    };
  }

  /**
   * Verifica si la conexión a GitHub es válida
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
