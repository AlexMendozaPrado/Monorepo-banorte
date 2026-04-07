export interface LogRetrievalPort {
  getServletLog(server: string, date: Date): Promise<string>;
  getProsaLog(server: string, date: Date): Promise<string>;
}
