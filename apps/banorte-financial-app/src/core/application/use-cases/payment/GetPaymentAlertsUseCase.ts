import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';
import { DebtStatus } from '@/core/domain/entities/debt/Debt';
import {
  PaymentAlert,
  PaymentAlertDTO,
  PaymentAlertsSummary,
  AlertStatus,
} from '@/core/domain/entities/payment/PaymentAlert';

export interface GetPaymentAlertsDTO {
  userId: string;
  days?: number; // Max days to look ahead (default: 30)
  status?: AlertStatus | 'all'; // Filter by status (default: 'all')
}

export interface PaymentAlertsResult {
  alerts: PaymentAlertDTO[];
  summary: PaymentAlertsSummary;
  generatedAt: string;
}

export class GetPaymentAlertsUseCase {
  constructor(private readonly debtRepository: IDebtRepository) {}

  async execute(dto: GetPaymentAlertsDTO): Promise<PaymentAlertsResult> {
    const { userId, days = 30, status = 'all' } = dto;

    // Fetch active debts for user
    const debts = await this.debtRepository.findByUserAndStatus(userId, DebtStatus.ACTIVE);

    // Convert debts to payment alerts
    const referenceDate = new Date();
    const alerts: PaymentAlert[] = [];

    for (const debt of debts) {
      const alert = PaymentAlert.fromDebt(debt, referenceDate);
      if (alert && alert.isRelevant(days)) {
        alerts.push(alert);
      }
    }

    // Sort by priority and urgency
    alerts.sort(PaymentAlert.compare);

    // Filter by status if specified
    const filteredAlerts =
      status === 'all'
        ? alerts
        : alerts.filter((alert) => alert.status === status);

    // Calculate summary
    const summary = this.calculateSummary(alerts);

    return {
      alerts: filteredAlerts.map((alert) => alert.toDTO()),
      summary,
      generatedAt: referenceDate.toISOString(),
    };
  }

  private calculateSummary(alerts: PaymentAlert[]): PaymentAlertsSummary {
    const summary: PaymentAlertsSummary = {
      total: alerts.length,
      overdue: 0,
      urgent: 0,
      upcoming: 0,
      totalAmountDue: 0,
    };

    for (const alert of alerts) {
      summary.totalAmountDue += alert.minimumPayment;

      switch (alert.status) {
        case 'overdue':
          summary.overdue++;
          break;
        case 'urgent':
          summary.urgent++;
          break;
        case 'upcoming':
          summary.upcoming++;
          break;
      }
    }

    return summary;
  }
}
