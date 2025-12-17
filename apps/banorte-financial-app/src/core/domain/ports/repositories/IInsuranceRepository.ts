import { Insurance, InsuranceType, InsuranceStatus } from '../../entities/insurance/Insurance';

export interface IInsuranceRepository {
  save(insurance: Insurance): Promise<void>;
  findById(id: string): Promise<Insurance | null>;
  findByUser(userId: string): Promise<Insurance[]>;
  findByUserAndType(userId: string, type: InsuranceType): Promise<Insurance[]>;
  findByUserAndStatus(userId: string, status: InsuranceStatus): Promise<Insurance[]>;
  delete(id: string): Promise<void>;
  countByUser(userId: string): Promise<number>;
}

