import { NitroModules } from 'react-native-nitro-modules';
import type {
  PlugpagNitro,
  PlugpagInitializationResult,
  PlugpagTransactionResult,
  PlugpagAbortResult,
  PlugpagConstants,
} from './PlugpagNitro.nitro';

const PlugpagNitroModule =
  NitroModules.createHybridObject<PlugpagNitro>('PlugpagNitro');

// Export types
export type {
  PlugpagInitializationResult,
  PlugpagTransactionResult,
  PlugpagAbortResult,
  PlugpagConstants,
};

// Payment options interface
export interface PaymentOptions {
  amount: number;
  type: number;
  installmentType?: number;
  installments?: number;
  printReceipt?: boolean;
  userReference?: string;
}

// Payment type constants from PagBank SDK
export const PaymentTypes = {
  CREDIT: 1,
  DEBIT: 2,
  VOUCHER: 3,
  PIX: 5,
} as const;

// Installment type constants
export const InstallmentTypes = {
  NO_INSTALLMENT: 1,
  SELLER_INSTALLMENT: 2,
  BUYER_INSTALLMENT: 3,
} as const;

// Simple error handling wrapper
function safeModuleCall<T>(methodName: string, fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    console.error(`[PlugpagNitro] Error in ${methodName}:`, error);
    throw error;
  }
}

/**
 * Get payment constants from the native module
 */
export function getConstants(): PlugpagConstants {
  try {
    return PlugpagNitroModule.getConstants();
  } catch (error) {
    console.error('[PlugpagNitro] Error getting constants:', error);
    throw error;
  }
}

/**
 * Get the terminal's serial number
 */
export function getTerminalSerialNumber(): string {
  try {
    return PlugpagNitroModule.getTerminalSerialNumber();
  } catch (error) {
    console.error('[PlugpagNitro] Error getting terminal serial:', error);
    throw error;
  }
}

/**
 * Initialize and activate the pin pad terminal
 */
export async function initializeAndActivatePinPad(
  activationCode: string
): Promise<PlugpagInitializationResult> {
  return safeModuleCall('initializeAndActivatePinPad', () =>
    PlugpagNitroModule.initializeAndActivatePinPad(activationCode)
  );
}

/**
 * Process a payment transaction
 */
export async function doPayment(options: {
  amount: number;
  type: number;
  installmentType?: number;
  installments?: number;
  printReceipt?: boolean;
  userReference?: string;
}): Promise<PlugpagTransactionResult> {
  const paymentOptions = {
    installmentType: options.installmentType ?? InstallmentTypes.NO_INSTALLMENT,
    installments: options.installments ?? 1,
    printReceipt: options.printReceipt ?? true,
    userReference: options.userReference ?? `payment-${Date.now()}`,
    ...options,
  };

  return safeModuleCall('doPayment', () =>
    PlugpagNitroModule.doPayment(
      paymentOptions.amount,
      paymentOptions.type,
      paymentOptions.installmentType,
      paymentOptions.installments,
      paymentOptions.printReceipt,
      paymentOptions.userReference
    )
  );
}

/**
 * Void/refund a previous payment transaction
 */
export async function voidPayment(options: {
  transactionCode: string;
  transactionId: string;
  printReceipt?: boolean;
}): Promise<PlugpagTransactionResult> {
  return safeModuleCall('voidPayment', () =>
    PlugpagNitroModule.voidPayment(
      options.transactionCode,
      options.transactionId,
      options.printReceipt ?? true
    )
  );
}

/**
 * Abort the current ongoing transaction
 */
export async function doAbort(): Promise<PlugpagAbortResult> {
  return safeModuleCall('doAbort', () => PlugpagNitroModule.doAbort());
}

/**
 * Print a custom receipt from file path
 */
export async function print(filePath: string): Promise<void> {
  return safeModuleCall('print', () => PlugpagNitroModule.print(filePath));
}

/**
 * Reprint the last customer receipt
 */
export async function reprintCustomerReceipt(): Promise<void> {
  return safeModuleCall('reprintCustomerReceipt', () =>
    PlugpagNitroModule.reprintCustomerReceipt()
  );
}

/**
 * Simple transaction status checker
 * Helper function to check if a transaction result indicates success
 */
export function isTransactionSuccessful(
  result: PlugpagTransactionResult
): boolean {
  return result.result === 0; // PlugPag.RET_OK = 0
}

/**
 * Simple transaction error checker
 * Helper function to get a human-readable error message
 */
export function getTransactionError(
  result: PlugpagTransactionResult
): string | null {
  if (isTransactionSuccessful(result)) {
    return null;
  }

  return result.message || result.errorCode || 'Unknown transaction error';
}

// Export presets for common payment scenarios
export const PaymentPresets = {
  creditCard: (amount: number, installments: number = 1) => ({
    amount,
    type: PaymentTypes.CREDIT,
    installmentType:
      installments > 1
        ? InstallmentTypes.BUYER_INSTALLMENT
        : InstallmentTypes.NO_INSTALLMENT,
    installments,
  }),

  debitCard: (amount: number) => ({
    amount,
    type: PaymentTypes.DEBIT,
    installmentType: InstallmentTypes.NO_INSTALLMENT,
    installments: 1,
  }),

  pix: (amount: number) => ({
    amount,
    type: PaymentTypes.PIX,
    installmentType: InstallmentTypes.NO_INSTALLMENT,
    installments: 1,
  }),

  voucher: (amount: number) => ({
    amount,
    type: PaymentTypes.VOUCHER,
    installmentType: InstallmentTypes.NO_INSTALLMENT,
    installments: 1,
  }),
} as const;

// Default export
export default {
  getConstants,
  getTerminalSerialNumber,
  initializeAndActivatePinPad,
  doPayment,
  voidPayment,
  doAbort,
  print,
  reprintCustomerReceipt,
  isTransactionSuccessful,
  getTransactionError,
  PaymentTypes,
  InstallmentTypes,
  PaymentPresets,
};
