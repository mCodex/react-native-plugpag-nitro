import { NitroModules } from 'react-native-nitro-modules';
import { useState, useEffect, useCallback } from 'react';
import { DeviceEventEmitter } from 'react-native';
import type {
  PlugpagNitro,
  PlugpagInitializationResult,
  PlugpagTransactionResult,
  PlugpagAbortResult,
  PlugpagConstants,
  PaymentEvent,
} from './PlugpagNitro.nitro';
import {
  PaymentType,
  InstallmentType,
  ErrorCode,
  PaymentEventCode,
} from './PlugpagNitro.nitro';

// Re-export enums and types for easy access
export {
  PaymentType,
  InstallmentType,
  ErrorCode,
  ActionType,
  PaymentEventCode,
} from './PlugpagNitro.nitro';

export type {
  PlugpagInitializationResult,
  PlugpagTransactionResult,
  PlugpagAbortResult,
  PlugpagConstants,
  PlugpagPaymentData,
  PlugpagVoidData,
  PaymentEvent,
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
    // Use native doPayment (with built-in events)
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
 * Hook for listening to transaction payment events
 * Provides real-time updates during payment flow including:
 * - Card insertion/removal events
 * - Password entry progress
 * - Processing status updates
 * - Error notifications
 * - Transaction completion status
 */
export function useTransactionEvent(): PaymentEvent & {
  resetEvent: () => void;
} {
  const [paymentEvent, setPaymentEvent] = useState<PaymentEvent>({
    code: PaymentEventCode.WAITING_CARD,
    message: 'Aguardando cartão...',
  });

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'paymentEvent',
      (event: PaymentEvent) => {
        setPaymentEvent(event);
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const resetEvent = useCallback(() => {
    setPaymentEvent({
      code: PaymentEventCode.WAITING_CARD,
      message: 'Aguardando cartão...',
    });
  }, []);

  return {
    ...paymentEvent,
    resetEvent,
  };
}

/**
 * Enhanced payment flow manager
 * Combines payment execution with event monitoring
 */

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
 * Generate a PIX QR code string for custom UI
 * @param amount Payment amount in cents
 * @param userReference Optional reference for transaction
 * @returns QR code string from transaction result message
 */
export async function generatePixQRCode(
  amount: number,
  userReference?: string
): Promise<string> {
  const result = await doPayment({
    amount,
    type: PaymentType.PIX,
    userReference,
  });
  return result.message ?? '';
}

/**
 * Simple transaction status checker
 * Helper function to check if a transaction result indicates success
 */
/**
 * Simple transaction error checker
 * Helper function to get a human-readable error message
 */

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

  // Enhanced payment event listener
  useTransactionEvent,

  // Enums
  PaymentType,
  InstallmentType,
  ErrorCode,
  PaymentEventCode,
};
