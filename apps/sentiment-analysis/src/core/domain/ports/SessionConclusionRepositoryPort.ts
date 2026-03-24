import { SessionConclusion } from '../value-objects/SessionConclusion';

export interface SessionConclusionRepositoryPort {
  /**
   * Guarda la conclusión de sesión en el repositorio
   * @param conclusion La conclusión de sesión a guardar
   * @returns Promesa con la conclusión guardada
   */
  save(conclusion: SessionConclusion): Promise<SessionConclusion>;

  /**
   * Busca la conclusión de sesión por su ID
   * @param id El ID de la conclusión
   * @returns Promesa con la conclusión o null si no se encuentra
   */
  findById(id: string): Promise<SessionConclusion | null>;

  /**
   * Busca la conclusión de sesión por ID de análisis
   * @param analysisId El ID del análisis
   * @returns Promesa con la conclusión o null si no se encuentra
   */
  findByAnalysisId(analysisId: string): Promise<SessionConclusion | null>;

  /**
   * Busca todas las conclusiones de sesión
   * @returns Promesa con arreglo de conclusiones
   */
  findAll(): Promise<SessionConclusion[]>;

  /**
   * Elimina la conclusión de sesión por ID
   * @param id El ID de la conclusión
   * @returns Promise<boolean> que indica éxito
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Actualiza una conclusión de sesión existente
   * @param id El ID de la conclusión
   * @param updates Datos parciales de la conclusión a actualizar
   * @returns Promesa con la conclusión actualizada o null si no se encuentra
   */
  update(id: string, updates: Partial<SessionConclusion>): Promise<SessionConclusion | null>;
}
