export interface LogRetrievalPort {
  getServletLog(server: string, date: Date): Promise<string>;
  getProsaLog(server: string, date: Date): Promise<string>;
  /**
   * Optional transversal-layer retrieval. Implementations return an empty
   * string when no log has been uploaded (rather than throwing) so the
   * caller can skip the layer silently when it's not required.
   */
  getThreeDSLog?(date: Date): Promise<string>;
  getCybersourceLog?(date: Date): Promise<string>;
}
