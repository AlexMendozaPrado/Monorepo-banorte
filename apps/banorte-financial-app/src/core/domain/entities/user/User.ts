import { ValidationException } from '../../exceptions';

export interface UserProps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private props: UserProps) {
    this.validate();
  }

  static create(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateEmail(email: string): void {
    this.validateEmail(email);
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  updateName(firstName: string, lastName: string): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new ValidationException('First name is required', 'firstName');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new ValidationException('Last name is required', 'lastName');
    }
    this.props.firstName = firstName;
    this.props.lastName = lastName;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      email: this.props.email,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      fullName: this.fullName,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  private validate(): void {
    if (!this.props.id || this.props.id.trim().length === 0) {
      throw new ValidationException('User ID is required', 'id');
    }
    this.validateEmail(this.props.email);
    if (!this.props.firstName || this.props.firstName.trim().length === 0) {
      throw new ValidationException('First name is required', 'firstName');
    }
    if (!this.props.lastName || this.props.lastName.trim().length === 0) {
      throw new ValidationException('Last name is required', 'lastName');
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new ValidationException('Invalid email format', 'email');
    }
  }
}
