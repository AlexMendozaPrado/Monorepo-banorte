import { ValidationException } from '../../exceptions';
import { CreditScore } from '../../value-objects/financial/CreditScore';
import { Money } from '../../value-objects/financial/Money';

export interface UserProfileProps {
  userId: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  occupation?: string;
  monthlyIncome?: Money;
  creditScore?: CreditScore;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  updatedAt: Date;
}

export class UserProfile {
  private constructor(private props: UserProfileProps) {
    this.validate();
  }

  static create(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get phoneNumber(): string | undefined {
    return this.props.phoneNumber;
  }

  get dateOfBirth(): Date | undefined {
    return this.props.dateOfBirth;
  }

  get occupation(): string | undefined {
    return this.props.occupation;
  }

  get monthlyIncome(): Money | undefined {
    return this.props.monthlyIncome;
  }

  get creditScore(): CreditScore | undefined {
    return this.props.creditScore;
  }

  get address() {
    return this.props.address;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updatePhoneNumber(phoneNumber: string): void {
    this.props.phoneNumber = phoneNumber;
    this.props.updatedAt = new Date();
  }

  updateOccupation(occupation: string): void {
    this.props.occupation = occupation;
    this.props.updatedAt = new Date();
  }

  updateMonthlyIncome(income: Money): void {
    this.props.monthlyIncome = income;
    this.props.updatedAt = new Date();
  }

  updateCreditScore(score: CreditScore): void {
    this.props.creditScore = score;
    this.props.updatedAt = new Date();
  }

  updateAddress(address: UserProfileProps['address']): void {
    this.props.address = address;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      userId: this.props.userId,
      phoneNumber: this.props.phoneNumber,
      dateOfBirth: this.props.dateOfBirth?.toISOString(),
      occupation: this.props.occupation,
      monthlyIncome: this.props.monthlyIncome?.toJSON(),
      creditScore: this.props.creditScore?.toJSON(),
      address: this.props.address,
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  private validate(): void {
    if (!this.props.userId || this.props.userId.trim().length === 0) {
      throw new ValidationException('User ID is required', 'userId');
    }
  }
}
