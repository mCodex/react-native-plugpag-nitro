/**
 * Utility functions for PlugPag Nitro
 */

import { PaymentTypes, InstallmentTypes, type PaymentOptions } from './index';

/**
 * Format amount from cents to currency string
 * @param amountInCents Amount in cents (e.g., 2500 = R$ 25,00)
 * @param locale Locale for formatting (default: pt-BR)
 * @param currency Currency code (default: BRL)
 */
export function formatCurrency(
  amountInCents: number,
  locale: string = 'pt-BR',
  currency: string = 'BRL'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
}

/**
 * Convert currency string to cents
 * @param currencyString Currency string (e.g., "R$ 25,00")
 * @returns Amount in cents
 */
export function parseCurrency(currencyString: string): number {
  const numericString = currencyString
    .replace(/[^\d,.-]/g, '')
    .replace(',', '.');
  return Math.round(parseFloat(numericString) * 100);
}

/**
 * Create a standardized payment options object
 * @param amount Amount in cents
 * @param type Payment type
 * @param options Additional options
 */
export function createPaymentOptions(
  amount: number,
  type: PaymentTypes,
  options: {
    installments?: number;
    installmentType?: InstallmentTypes;
    printReceipt?: boolean;
    userReference?: string;
  } = {}
): PaymentOptions {
  const defaultInstallmentType =
    type === PaymentTypes.DEBIT
      ? InstallmentTypes.NO_INSTALLMENT
      : InstallmentTypes.BUYER_INSTALLMENT;

  return {
    amount,
    type,
    installments: options.installments ?? 1,
    installmentType: options.installmentType ?? defaultInstallmentType,
    printReceipt: options.printReceipt ?? true,
    userReference: options.userReference ?? `payment-${Date.now()}`,
  };
}

/**
 * Predefined payment options for common scenarios
 */
export const PaymentPresets = {
  /**
   * Create credit card payment options
   */
  credit: (
    amountInCents: number,
    installments: number = 1,
    userReference?: string
  ): PaymentOptions =>
    createPaymentOptions(amountInCents, PaymentTypes.CREDIT, {
      installments,
      installmentType:
        installments > 1
          ? InstallmentTypes.BUYER_INSTALLMENT
          : InstallmentTypes.NO_INSTALLMENT,
      userReference,
    }),

  /**
   * Create debit card payment options
   */
  debit: (amountInCents: number, userReference?: string): PaymentOptions =>
    createPaymentOptions(amountInCents, PaymentTypes.DEBIT, {
      installmentType: InstallmentTypes.NO_INSTALLMENT,
      userReference,
    }),

  /**
   * Create PIX payment options
   */
  pix: (amountInCents: number, userReference?: string): PaymentOptions =>
    createPaymentOptions(amountInCents, PaymentTypes.PIX, {
      installmentType: InstallmentTypes.NO_INSTALLMENT,
      userReference,
    }),

  /**
   * Create voucher payment options
   */
  voucher: (amountInCents: number, userReference?: string): PaymentOptions =>
    createPaymentOptions(amountInCents, PaymentTypes.VOUCHER, {
      installmentType: InstallmentTypes.NO_INSTALLMENT,
      userReference,
    }),
};

/**
 * Validate payment result
 * @param result Transaction result
 * @returns true if payment was successful
 */
export function isPaymentSuccessful(result: { result?: number }): boolean {
  return result.result === 0;
}

/**
 * Get human-readable error message from result
 * @param result Transaction result
 * @returns Error message or null if successful
 */
export function getPaymentErrorMessage(result: {
  result?: number;
  message?: string;
  errorMessage?: string;
}): string | null {
  if (isPaymentSuccessful(result)) {
    return null;
  }

  return (
    result.message || result.errorMessage || 'Erro desconhecido na transação'
  );
}
