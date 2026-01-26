import { GitHubConfig } from '../config/github.config';

/**
 * Cliente para interactuar con GitHub API (Contents API)
 *
 * Permite leer y escribir archivos en un repositorio de GitHub,
 * creando commits automáticos para cada operación CRUD.
 */
export interface GitHubFileContent {
  content: string;
  sha: string;
  path: string;
}

export interface GitHubCommitResult {
  sha: string;
  url: string;
  message: string;
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export class GitHubConflictError extends GitHubApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'GitHubConflictError';
  }
}

export class GitHubApiClient {
  private readonly baseUrl = 'https://api.github.com';
  private readonly token: string;
  private readonly owner: string;
  private readonly repo: string;
  private readonly branch: string;
  private readonly committerName: string;
  private readonly committerEmail: string;

  constructor(config: GitHubConfig) {
    this.token = config.token;
    this.owner = config.owner;
    this.repo = config.repo;
    this.branch = config.branch || 'main';
    this.committerName = config.committerName;
    this.committerEmail = config.committerEmail;
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
      cache: 'no-store', // Evitar caché para siempre obtener datos frescos
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 404) {
        throw new GitHubApiError(
          `File not found: ${path}`,
          404,
          'NOT_FOUND'
        );
      }
      throw new GitHubApiError(
        `GitHub API error: ${error.message || 'Unknown error'}`,
        response.status,
        'API_ERROR'
      );
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
   *
   * @param path - Ruta del archivo en el repositorio
   * @param content - Contenido del archivo
   * @param message - Mensaje del commit
   * @param sha - SHA del archivo actual (requerido para updates, previene conflictos)
   * @throws GitHubConflictError si el SHA no coincide (archivo modificado externamente)
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

    const body: Record<string, unknown> = {
      message,
      content: contentBase64,
      branch: this.branch,
      committer: {
        name: this.committerName,
        email: this.committerEmail,
      },
    };

    // SHA es requerido para actualizar un archivo existente (optimistic locking)
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

      // 409 Conflict significa que el SHA no coincide (archivo modificado por otro)
      if (response.status === 409) {
        throw new GitHubConflictError(
          'El archivo fue modificado por otro usuario. Por favor, recarga y vuelve a intentar.'
        );
      }

      throw new GitHubApiError(
        `GitHub API error: ${error.message || 'Unknown error'}`,
        response.status,
        'API_ERROR'
      );
    }

    const data = await response.json();

    console.log(`[GitHubApiClient] Commit created: ${data.commit.sha.substring(0, 7)} - ${message}`);

    return {
      sha: data.commit.sha,
      url: data.commit.html_url,
      message,
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
