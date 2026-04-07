import { LogRetrievalPort } from '@/core/domain/ports/LogRetrievalPort';

/**
 * Adaptador para Alternativa A (semi-automatico)
 * Retorna el contenido de LOGs subidos por el analista
 */
export class FileUploadLogRetrieval implements LogRetrievalPort {
  private servletLogContent: string = '';
  private prosaLogContent: string = '';

  setServletLog(content: string): void {
    this.servletLogContent = content;
  }

  setProsaLog(content: string): void {
    this.prosaLogContent = content;
  }

  async getServletLog(_server: string, _date: Date): Promise<string> {
    if (!this.servletLogContent) {
      throw new Error('No se ha cargado el LOG Servlet. Sube el archivo Http.log del servidor Servlet.');
    }
    return this.servletLogContent;
  }

  async getProsaLog(_server: string, _date: Date): Promise<string> {
    if (!this.prosaLogContent) {
      throw new Error('No se ha cargado el LOG PROSA. Sube el archivo Http.log del servidor PROSA.');
    }
    return this.prosaLogContent;
  }
}
