import { NitroModules } from 'react-native-nitro-modules';
import type {
  PlugpagNitro,
  PlugpagInitializationResult,
  PlugpagTransactionResult,
  PlugpagAbortResult,
  PlugpagConstants,
} from './PlugpagNitro.nitro';
import { PaymentType, InstallmentType, ErrorCode } from './PlugpagNitro.nitro';

// Re-export enums and types for easy access
export {
  PaymentType,
  InstallmentType,
  ErrorCode,
  ActionType,
} from './PlugpagNitro.nitro';

export type {
  PlugpagInitializationResult,
  PlugpagTransactionResult,
  PlugpagAbortResult,
  PlugpagConstants,
  PlugpagPaymentData,
  PlugpagVoidData,
} from './PlugpagNitro.nitro';

const PlugpagNitroModule =
  NitroModules.createHybridObject<PlugpagNitro>('PlugpagNitro');

// Payment options interface using enum types
export interface PaymentOptions {
  amount: number;
  type: PaymentType;
  installmentType?: InstallmentType;
  installments?: number;
  printReceipt?: boolean;
  userReference?: string;
}

// Payment type constants (deprecated - use PaymentType enum instead)
/** @deprecated Use PaymentType enum instead */
export const PaymentTypes = {
  CREDIT: PaymentType.CREDIT,
  DEBIT: PaymentType.DEBIT,
  VOUCHER: PaymentType.VOUCHER,
  PIX: PaymentType.PIX,
} as const;

// Installment type constants (deprecated - use InstallmentType enum instead)
/** @deprecated Use InstallmentType enum instead */
export const InstallmentTypes = {
  NO_INSTALLMENT: InstallmentType.NO_INSTALLMENT,
  SELLER_INSTALLMENT: InstallmentType.SELLER_INSTALLMENT,
  BUYER_INSTALLMENT: InstallmentType.BUYER_INSTALLMENT,
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
  type: PaymentType;
  installmentType?: InstallmentType;
  installments?: number;
  printReceipt?: boolean;
  userReference?: string;
}): Promise<PlugpagTransactionResult> {
  const paymentOptions = {
    installmentType: options.installmentType ?? InstallmentType.NO_INSTALLMENT,
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
 * Refund a previous payment transaction
 */
export async function refundPayment(options: {
  transactionCode: string;
  transactionId: string;
  printReceipt?: boolean;
}): Promise<PlugpagTransactionResult> {
  return safeModuleCall('refundPayment', () =>
    PlugpagNitroModule.refundPayment(
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
  return result.result === ErrorCode.OK;
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
    type: PaymentType.CREDIT,
    installmentType:
      installments > 1
        ? InstallmentType.BUYER_INSTALLMENT
        : InstallmentType.NO_INSTALLMENT,
    installments,
  }),

  debitCard: (amount: number) => ({
    amount,
    type: PaymentType.DEBIT,
    installmentType: InstallmentType.NO_INSTALLMENT,
    installments: 1,
  }),

  pix: (amount: number) => ({
    amount,
    type: PaymentType.PIX,
    installmentType: InstallmentType.NO_INSTALLMENT,
    installments: 1,
  }),

  voucher: (amount: number) => ({
    amount,
    type: PaymentType.VOUCHER,
    installmentType: InstallmentType.NO_INSTALLMENT,
    installments: 1,
  }),
} as const;

// Default export
export default {
  // Core functions
  getConstants,
  getTerminalSerialNumber,
  initializeAndActivatePinPad,
  doPayment,
  refundPayment,
  doAbort,
  print,
  reprintCustomerReceipt,

  // Helper functions
  isTransactionSuccessful,
  getTransactionError,

  // Enums (recommended)
  PaymentType,
  InstallmentType,
  ErrorCode,

  // Legacy constants (deprecated)
  PaymentTypes,
  InstallmentTypes,

  // Presets
  PaymentPresets,
};
