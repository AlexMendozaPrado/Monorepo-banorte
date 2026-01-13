import { DIContainer } from '../container';
import { GetPaymentAlertsUseCase } from '@/core/application/use-cases/payment/GetPaymentAlertsUseCase';

export function registerPaymentAlertsModule(container: DIContainer): void {
  console.log('📦 Registering Payment Alerts Module...');

  // Use Cases - IDebtRepository is registered by debtModule
  container.register('GetPaymentAlertsUseCase', () => {
    return new GetPaymentAlertsUseCase(container.resolve('IDebtRepository'));
  });

  console.log('✅ Payment Alerts Module registered');
}
