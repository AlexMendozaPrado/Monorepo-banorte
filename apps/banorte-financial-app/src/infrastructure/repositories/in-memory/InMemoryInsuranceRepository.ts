import { IInsuranceRepository } from '@/core/domain/ports/repositories/IInsuranceRepository';
import { Insurance, InsuranceType, InsuranceStatus } from '@/core/domain/entities/insurance/Insurance';

export class InMemoryInsuranceRepository implements IInsuranceRepository {
  private insurances: Map<string, Insurance> = new Map();

  async save(insurance: Insurance): Promise<void> {
    this.insurances.set(insurance.id, insurance);
  }

  async findById(id: string): Promise<Insurance | null> {
    return this.insurances.get(id) || null;
  }

  async findByUser(userId: string): Promise<Insurance[]> {
    return Array.from(this.insurances.values())
      .filter(i => i.userId === userId)
      .sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === InsuranceStatus.ACTIVE ? -1 : 1;
        }
        return a.type.localeCompare(b.type);
      });
  }

  async findByUserAndType(userId: string, type: InsuranceType): Promise<Insurance[]> {
    return Array.from(this.insurances.values())
      .filter(i => i.userId === userId && i.type === type);
  }

  async findByUserAndStatus(userId: string, status: InsuranceStatus): Promise<Insurance[]> {
    return Array.from(this.insurances.values())
      .filter(i => i.userId === userId && i.status === status);
  }

  async delete(id: string): Promise<void> {
    this.insurances.delete(id);
  }

  async countByUser(userId: string): Promise<number> {
    return Array.from(this.insurances.values())
      .filter(i => i.userId === userId).length;
  }

  clear(): void {
    this.insurances.clear();
  }
}

