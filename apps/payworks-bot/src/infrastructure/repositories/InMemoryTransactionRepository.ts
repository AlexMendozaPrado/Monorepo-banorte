import { TransactionRepositoryPort } from '@/core/domain/ports/TransactionRepositoryPort';
import { Transaction, TransactionEntity } from '@/core/domain/entities/Transaction';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { TransactionTypeValueObject } from '@/core/domain/value-objects/TransactionType';
import { CardBrandValueObject } from '@/core/domain/value-objects/CardBrand';

/**
 * Repositorio InMemory para Alternativa A (semi-automatico)
 * Parsea CSV exportado de Toad/SQLDeveloper
 */
export class InMemoryTransactionRepository implements TransactionRepositoryPort {
  private store = new Map<string, Transaction>();

  async findByReferencia(referencia: string): Promise<Transaction | null> {
    return this.store.get(referencia) || null;
  }

  async findByReferences(referencias: string[]): Promise<Transaction[]> {
    return referencias
      .map(ref => this.store.get(ref))
      .filter((t): t is Transaction => t !== null);
  }

  loadFromCSV(csvContent: string): void {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim().toUpperCase());

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.trim() || '';
      });

      try {
        const tipoTrans = this.mapTipoTrans(row['TIPO_TRANS'] || row['CMD_TRANS'] || 'VTA');
        const cardBrand = this.detectCardBrand(row['NUMERO_TARJETA'] || row['NUMERO TARJETA'] || '');

        const entity = new TransactionEntity(
          row['NUMERO'] || '',
          row['NOMBRE'] || '',
          row['REFERENCIA'] || '',
          row['NUMERO_CONTROL'] || row['NUMERO CONTROL'] || '',
          tipoTrans,
          row['MODO'] || 'PRD',
          parseFloat(row['MONTO'] || '0'),
          row['CODIGO_ERROR_PAYW'] || row['CODIGO ERROR PAYW'] || '',
          row['COD_RESULT_AUT'] || row['COD RESULT AUT'] || '',
          row['TEXTO_APROBACION'] || row['TEXTO APROBACION'] || '',
          row['PAYW_ENTRADA'] || row['PAYW ENTRADA'] || '',
          row['PAYW_AUTORIZADOR'] || row['PAYW AUTORIZADOR'] || '',
          new Date(row['FECHA_RECEP_CTE'] || row['FECHA RECEP CTE'] || Date.now()),
          row['HORA_RECEP_CTE'] || row['HORA RECEP CTE'] || '',
          cardBrand,
        );

        this.store.set(entity.referencia, entity);
      } catch (error) {
        console.warn(`Fila ${i + 1} del CSV ignorada:`, error);
      }
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  private mapTipoTrans(tipo: string): TransactionType {
    try {
      return TransactionTypeValueObject.fromCmdTrans(tipo).getValue();
    } catch {
      return TransactionType.AUTH;
    }
  }

  private detectCardBrand(cardNumber: string): CardBrand {
    const cleaned = cardNumber.replace(/\*/g, '');
    const firstDigit = cleaned.charAt(0);
    const firstTwo = cleaned.substring(0, 2);
    if (firstDigit === '4') return CardBrand.VISA;
    if (firstDigit === '5' || firstDigit === '2') return CardBrand.MASTERCARD;
    if (firstTwo === '34' || firstTwo === '37') return CardBrand.AMEX;
    return CardBrand.VISA;
  }

  clear(): void {
    this.store.clear();
  }

  count(): number {
    return this.store.size;
  }
}
