import { LogRetrievalPort } from '@/core/domain/ports/LogRetrievalPort';

/**
 * Adaptador para modo semi-automático: mantiene el contenido de los LOGs
 * subidos por el analista en memoria durante la corrida.
 *
 * Soporta las cuatro capas que el bot puede validar: Servlet + PROSA
 * (base) y 3DS + Cybersource (transversales). Para las capas
 * transversales, `get*Log()` retorna `''` cuando no hubo upload — el
 * caller decide si tratar eso como "capa ausente" o error.
 */
export class FileUploadLogRetrieval implements LogRetrievalPort {
  private servletLogContent: string = '';
  private prosaLogContent: string = '';
  private threeDSLogContent: string = '';
  private cybersourceLogContent: string = '';

  setServletLog(content: string): void {
    this.servletLogContent = content;
  }

  setProsaLog(content: string): void {
    this.prosaLogContent = content;
  }

  setThreeDSLog(content: string): void {
    this.threeDSLogContent = content;
  }

  setCybersourceLog(content: string): void {
    this.cybersourceLogContent = content;
  }

  hasThreeDSLog(): boolean {
    return this.threeDSLogContent.trim().length > 0;
  }

  hasCybersourceLog(): boolean {
    return this.cybersourceLogContent.trim().length > 0;
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

  async getThreeDSLog(_date: Date): Promise<string> {
    return this.threeDSLogContent;
  }

  async getCybersourceLog(_date: Date): Promise<string> {
    return this.cybersourceLogContent;
  }
}
