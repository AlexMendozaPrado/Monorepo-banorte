import { ValidationException } from '../../exceptions';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';
export type Theme = 'LIGHT' | 'DARK' | 'AUTO';
export type Language = 'es' | 'en';

export interface UserPreferencesProps {
  userId: string;
  theme: Theme;
  language: Language;
  notificationChannels: NotificationChannel[];
  marketingEmails: boolean;
  transactionAlerts: boolean;
  monthlyReports: boolean;
  updatedAt: Date;
}

export class UserPreferences {
  private constructor(private props: UserPreferencesProps) {
    this.validate();
  }

  static create(props: UserPreferencesProps): UserPreferences {
    return new UserPreferences(props);
  }

  static createDefault(userId: string): UserPreferences {
    return new UserPreferences({
      userId,
      theme: 'AUTO',
      language: 'es',
      notificationChannels: ['EMAIL'],
      marketingEmails: false,
      transactionAlerts: true,
      monthlyReports: true,
      updatedAt: new Date(),
    });
  }

  get userId(): string {
    return this.props.userId;
  }

  get theme(): Theme {
    return this.props.theme;
  }

  get language(): Language {
    return this.props.language;
  }

  get notificationChannels(): NotificationChannel[] {
    return [...this.props.notificationChannels];
  }

  get marketingEmails(): boolean {
    return this.props.marketingEmails;
  }

  get transactionAlerts(): boolean {
    return this.props.transactionAlerts;
  }

  get monthlyReports(): boolean {
    return this.props.monthlyReports;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateTheme(theme: Theme): void {
    this.props.theme = theme;
    this.props.updatedAt = new Date();
  }

  updateLanguage(language: Language): void {
    this.props.language = language;
    this.props.updatedAt = new Date();
  }

  enableNotificationChannel(channel: NotificationChannel): void {
    if (!this.props.notificationChannels.includes(channel)) {
      this.props.notificationChannels.push(channel);
      this.props.updatedAt = new Date();
    }
  }

  disableNotificationChannel(channel: NotificationChannel): void {
    this.props.notificationChannels = this.props.notificationChannels.filter(
      (c) => c !== channel
    );
    this.props.updatedAt = new Date();
  }

  toggleMarketingEmails(): void {
    this.props.marketingEmails = !this.props.marketingEmails;
    this.props.updatedAt = new Date();
  }

  toggleTransactionAlerts(): void {
    this.props.transactionAlerts = !this.props.transactionAlerts;
    this.props.updatedAt = new Date();
  }

  toggleMonthlyReports(): void {
    this.props.monthlyReports = !this.props.monthlyReports;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      userId: this.props.userId,
      theme: this.props.theme,
      language: this.props.language,
      notificationChannels: this.props.notificationChannels,
      marketingEmails: this.props.marketingEmails,
      transactionAlerts: this.props.transactionAlerts,
      monthlyReports: this.props.monthlyReports,
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  private validate(): void {
    if (!this.props.userId || this.props.userId.trim().length === 0) {
      throw new ValidationException('User ID is required', 'userId');
    }
  }
}
