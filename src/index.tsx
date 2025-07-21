import React from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import { DeviceEventEmitter } from 'react-native';
import type {
  PlugpagNitro,
  PlugpagInitializationResult,
  PlugpagPaymentData,
  PlugpagTransactionResult,
  PlugpagVoidData,
  PlugpagAbortResult,
  PlugpagNFCResult,
  PlugpagConstants,
} from './PlugpagNitro.nitro';

const PlugpagNitroModule =
  NitroModules.createHybridObject<PlugpagNitro>('PlugpagNitro');

// Export types
export type {
  PlugpagInitializationResult,
  PlugpagPaymentData,
  PlugpagTransactionResult,
  PlugpagVoidData,
  PlugpagAbortResult,
  PlugpagNFCResult,
  PlugpagConstants,
};

// Payment Types enum
export enum PaymentTypes {
  CREDIT = 1,
  DEBIT = 2,
  VOUCHER = 3,
  PIX = 5,
}

// Installment Types enum
export enum InstallmentTypes {
  NO_INSTALLMENT = 1,
  SELLER_INSTALLMENT = 2,
  BUYER_INSTALLMENT = 3,
}

// Event data for payment events
export interface TransactionPaymentEvent {
  code: number;
  message: string;
}

// Simplified payment data interface for end users
export interface PaymentRequest {
  amount: number;
  type: PaymentTypes;
  installmentType: InstallmentTypes;
  installments: number;
  printReceipt: boolean;
  userReference?: string;
}

// Refund request interface
export interface RefundRequest {
  transactionCode: string;
  transactionId: string;
  printReceipt: boolean;
}

// Get constants from native module
let constants: PlugpagConstants | null = null;

function getConstants(): PlugpagConstants {
  if (!constants) {
    constants = PlugpagNitroModule.getConstants();
  }
  return constants;
}

// Create plugPag object with constants for compatibility
export const plugPag = {
  get paymentTypes() {
    return PaymentTypes;
  },
  get installmentTypes() {
    return InstallmentTypes;
  },
  get constants() {
    return getConstants();
  },
};

/**
 * Initialize and activate the pin pad terminal
 * @param activationCode The activation code for the terminal (e.g., '403938' for development)
 */
export async function initializeAndActivatePinPad(
  activationCode: string
): Promise<PlugpagInitializationResult> {
  try {
    return await PlugpagNitroModule.initializeAndActivatePinPad(activationCode);
  } catch (error) {
    console.error('Error initializing pin pad:', error);
    throw error;
  }
}

/**
 * Get the terminal's serial number
 * @returns The device's serial number (Build.SERIAL)
 */
export function getTerminalSerialNumber(): string {
  try {
    return PlugpagNitroModule.getTerminalSerialNumber();
  } catch (error) {
    console.error('Error getting terminal serial number:', error);
    throw error;
  }
}

/**
 * Process a payment transaction
 * @param paymentRequest The payment request data
 */
export async function doPayment(
  paymentRequest: PaymentRequest
): Promise<PlugpagTransactionResult> {
  try {
    // Use flattened parameters for better performance (following Nitro performance tips)
    return await PlugpagNitroModule.doPayment(
      paymentRequest.amount,
      paymentRequest.type,
      paymentRequest.installmentType,
      paymentRequest.installments,
      paymentRequest.printReceipt,
      paymentRequest.userReference || ''
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

/**
 * Void/refund a previous payment transaction
 * @param refundRequest The refund request data
 */
export async function refundPayment(
  refundRequest: RefundRequest
): Promise<PlugpagTransactionResult> {
  try {
    // Use flattened parameters for better performance (following Nitro performance tips)
    return await PlugpagNitroModule.voidPayment(
      refundRequest.transactionCode,
      refundRequest.transactionId,
      refundRequest.printReceipt
    );
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}

/**
 * Abort the current ongoing transaction
 */
export async function doAbort(): Promise<PlugpagAbortResult> {
  try {
    return await PlugpagNitroModule.doAbort();
  } catch (error) {
    console.error('Error aborting transaction:', error);
    throw error;
  }
}

/**
 * Read an NFC card
 */
export async function readNFCCard(): Promise<PlugpagNFCResult> {
  try {
    return await PlugpagNitroModule.readNFCCard();
  } catch (error) {
    console.error('Error reading NFC card:', error);
    throw error;
  }
}

/**
 * Print a custom receipt from file path
 * @param filePath Path to the image file (PNG/JPEG)
 */
export async function print(filePath: string): Promise<void> {
  try {
    return await PlugpagNitroModule.print(filePath);
  } catch (error) {
    console.error('Error printing:', error);
    throw error;
  }
}

/**
 * Reprint the last customer receipt
 */
export async function reprintCustomerReceipt(): Promise<void> {
  try {
    return await PlugpagNitroModule.reprintCustomerReceipt();
  } catch (error) {
    console.error('Error reprinting receipt:', error);
    throw error;
  }
}

/**
 * Hook to listen to transaction payment events
 * @returns Object with current event data and cleanup function
 */
export function useTransactionPaymentEvent(): TransactionPaymentEvent {
  const [event, setEvent] = React.useState<TransactionPaymentEvent>({
    code: 0,
    message: '',
  });

  React.useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'eventPayments',
      (eventData: TransactionPaymentEvent) => {
        setEvent(eventData);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return event;
}

// Export the main module for advanced usage
export { PlugpagNitroModule };

// Default export
export default plugPag;
