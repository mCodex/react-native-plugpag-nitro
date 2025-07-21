/**
 * Utility functions for PlugPag Nitro
 */

import {
  PaymentType,
  InstallmentType,
  ErrorCode,
  type PaymentOptions,
} from './index';

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
  type: PaymentType,
  options: {
    installments?: number;
    installmentType?: InstallmentType;
    printReceipt?: boolean;
    userReference?: string;
  } = {}
): PaymentOptions {
  const defaultInstallmentType =
    type === PaymentType.DEBIT
      ? InstallmentType.NO_INSTALLMENT
      : InstallmentType.BUYER_INSTALLMENT;

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
    createPaymentOptions(amountInCents, PaymentType.CREDIT, {
      installments,
      installmentType:
        installments > 1
          ? InstallmentType.BUYER_INSTALLMENT
          : InstallmentType.NO_INSTALLMENT,
      userReference,
    }),

  /**
   * Create debit card payment options
   */
  debit: (amountInCents: number, userReference?: string): PaymentOptions =>
    createPaymentOptions(amountInCents, PaymentType.DEBIT, {
      installmentType: InstallmentType.NO_INSTALLMENT,
      userReference,
    }),

  /**
   * Create PIX payment options
   */
  pix: (amountInCents: number, userReference?: string): PaymentOptions =>
    createPaymentOptions(amountInCents, PaymentType.PIX, {
      installmentType: InstallmentType.NO_INSTALLMENT,
      userReference,
    }),

  /**
   * Create voucher payment options
   */
  voucher: (amountInCents: number, userReference?: string): PaymentOptions =>
    createPaymentOptions(amountInCents, PaymentType.VOUCHER, {
      installmentType: InstallmentType.NO_INSTALLMENT,
      userReference,
    }),
};

/**
 * Validate payment result
 * @param result Transaction result
 * @returns true if payment was successful
 */
export function isPaymentSuccessful(result: { result?: ErrorCode }): boolean {
  return result.result === ErrorCode.OK;
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
