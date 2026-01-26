/**
 * Configuración para la integración con GitHub API
 */
export interface GitHubConfig {
  /** Token de acceso personal de GitHub */
  token: string;
  /** Owner del repositorio (usuario u organización) */
  owner: string;
  /** Nombre del repositorio */
  repo: string;
  /** Branch para persistencia */
  branch: string;
  /** Ruta al archivo de configuración en el repo */
  configPath: string;
  /** Nombre del committer */
  committerName: string;
  /** Email del committer */
  committerEmail: string;
}

/**
 * Obtiene la configuración de GitHub desde variables de entorno
 */
export function getGitHubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    throw new Error(
      'GitHub configuration is incomplete. Please set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables.'
    );
  }

  return {
    token,
    owner,
    repo,
    branch: process.env.GITHUB_BRANCH || 'main',
    configPath:
      process.env.GITHUB_CONFIG_PATH ||
      'apps/sdk-version-control/src/infrastructure/config/services.config.json',
    committerName: process.env.GITHUB_COMMITTER_NAME || 'SDK Version Control Bot',
    committerEmail: process.env.GITHUB_COMMITTER_EMAIL || 'sdk-bot@banorte.com',
  };
}

/**
 * Verifica si la configuración de GitHub está disponible
 */
export function isGitHubConfigured(): boolean {
  return !!(
    process.env.GITHUB_TOKEN &&
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_REPO
  );
}

/**
 * Tipo de repositorio configurado
 */
export type RepositoryType = 'memory' | 'github';

/**
 * Obtiene el tipo de repositorio configurado
 */
export function getRepositoryType(): RepositoryType {
  const type = process.env.REPOSITORY_TYPE as RepositoryType;
  return type === 'github' ? 'github' : 'memory';
}
