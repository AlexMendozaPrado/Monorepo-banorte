import { ValidationException } from '../../exceptions';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export class Priority {
  private constructor(public readonly level: PriorityLevel) {}

  static create(level: PriorityLevel): Priority {
    return new Priority(level);
  }

  static low(): Priority {
    return new Priority('LOW');
  }

  static medium(): Priority {
    return new Priority('MEDIUM');
  }

  static high(): Priority {
    return new Priority('HIGH');
  }

  static urgent(): Priority {
    return new Priority('URGENT');
  }

  getNumericValue(): number {
    switch (this.level) {
      case 'LOW':
        return 1;
      case 'MEDIUM':
        return 2;
      case 'HIGH':
        return 3;
      case 'URGENT':
        return 4;
    }
  }

  getDescription(): string {
    switch (this.level) {
      case 'LOW':
        return 'Baja';
      case 'MEDIUM':
        return 'Media';
      case 'HIGH':
        return 'Alta';
      case 'URGENT':
        return 'Urgente';
    }
  }

  getColor(): string {
    switch (this.level) {
      case 'LOW':
        return '#6CC04A';
      case 'MEDIUM':
        return '#FFA400';
      case 'HIGH':
        return '#FF671B';
      case 'URGENT':
        return '#EB0029';
    }
  }

  isHigherThan(other: Priority): boolean {
    return this.getNumericValue() > other.getNumericValue();
  }

  isLowerThan(other: Priority): boolean {
    return this.getNumericValue() < other.getNumericValue();
  }

  equals(other: Priority): boolean {
    return this.level === other.level;
  }

  toJSON() {
    return {
      level: this.level,
      description: this.getDescription(),
      value: this.getNumericValue(),
      color: this.getColor(),
    };
  }

  toString(): string {
    return this.getDescription();
  }
}
