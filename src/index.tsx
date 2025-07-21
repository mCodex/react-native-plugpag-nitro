import React, { useEffect, useState, useCallback } from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import { DeviceEventEmitter } from 'react-native';
import type {
  PlugpagNitro,
  PlugpagInitializationResult,
  PlugpagTransactionResult,
  PlugpagAbortResult,
  PlugpagNFCResult,
  PlugpagConstants,
  PlugpagUIConfiguration,
  PlugpagCancellationResult,
  UIState,
  UIStateEvent,
} from './PlugpagNitro.nitro';

const PlugpagNitroModule =
  NitroModules.createHybridObject<PlugpagNitro>('PlugpagNitro');

// Export types
export type {
  PlugpagInitializationResult,
  PlugpagTransactionResult,
  PlugpagAbortResult,
  PlugpagNFCResult,
  PlugpagConstants,
  PlugpagUIConfiguration,
  PlugpagCancellationResult,
  UIState,
  UIStateEvent,
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

// Error types for better error handling
export class PlugpagError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'PlugpagError';
  }
}

// Event data for payment events
export interface TransactionPaymentEvent {
  code: number;
  message: string;
}

// Unified payment options interface
export interface PaymentOptions {
  amount: number;
  type: PaymentTypes;
  installmentType?: InstallmentTypes;
  installments?: number;
  printReceipt?: boolean;
  userReference?: string;
  uiConfiguration?: PlugpagUIConfiguration;
}

// Refund request interface
export interface RefundRequest {
  transactionCode: string;
  transactionId: string;
  printReceipt?: boolean;
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

// Generic error handler for consistent error handling
function handleError(operation: string, error: any): never {
  console.error(`Error in ${operation}:`, error);

  if (error instanceof Error) {
    throw new PlugpagError(
      `${operation} failed: ${error.message}`,
      'OPERATION_ERROR',
      error
    );
  }

  throw new PlugpagError(
    `${operation} failed with unknown error`,
    'UNKNOWN_ERROR',
    error
  );
}

// Generic async wrapper for module calls
async function safeModuleCall<T>(
  operation: string,
  moduleCall: () => Promise<T>
): Promise<T> {
  try {
    return await moduleCall();
  } catch (error) {
    handleError(operation, error);
  }
}

/**
 * Initialize and activate the pin pad terminal
 * @param activationCode The activation code for the terminal (e.g., '403938' for development)
 */
export async function initializeAndActivatePinPad(
  activationCode: string
): Promise<PlugpagInitializationResult> {
  return safeModuleCall('initializeAndActivatePinPad', () =>
    PlugpagNitroModule.initializeAndActivatePinPad(activationCode)
  );
}

/**
 * Get the terminal's serial number
 * @returns The device's serial number
 */
export function getTerminalSerialNumber(): string {
  try {
    return PlugpagNitroModule.getTerminalSerialNumber();
  } catch (error) {
    handleError('getTerminalSerialNumber', error);
  }
}

/**
 * Void/refund a previous payment transaction
 * @param refundRequest The refund request data
 */
export async function refundPayment(
  refundRequest: RefundRequest
): Promise<PlugpagTransactionResult> {
  return safeModuleCall('voidPayment', () =>
    PlugpagNitroModule.voidPayment(
      refundRequest.transactionCode,
      refundRequest.transactionId,
      refundRequest.printReceipt ?? true
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
 * Read an NFC card
 */
export async function readNFCCard(): Promise<PlugpagNFCResult> {
  return safeModuleCall('readNFCCard', () => PlugpagNitroModule.readNFCCard());
}

/**
 * Print a custom receipt from file path
 * @param filePath Path to the image file (PNG/JPEG)
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

/**
 * Hook to monitor UI state events during payment operations
 * @param cancellationToken Optional token to filter events for specific operation
 */
export function useUIStateEvent(cancellationToken?: string) {
  const [uiState, setUIState] = useState<UIState | null>(null);
  const [lastEvent, setLastEvent] = useState<UIStateEvent | null>(null);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'PlugpagUIStateEvent',
      (event: UIStateEvent) => {
        if (
          !cancellationToken ||
          event.cancellationToken === cancellationToken
        ) {
          setLastEvent(event);
          setUIState(event.state);
        }
      }
    );

    return () => subscription.remove();
  }, [cancellationToken]);

  const clearState = useCallback(() => {
    setUIState(null);
    setLastEvent(null);
  }, []);

  return {
    uiState,
    lastEvent,
    clearState,
    isWaitingForCard: uiState === 'WAITING_FOR_CARD',
    isProcessing: uiState === 'PROCESSING',
    isCompleted: uiState === 'COMPLETED',
    hasError: uiState === 'ERROR',
  };
}

/**
 * Unified payment hook with cancellation support and flexible payment options
 * This is the main hook for handling all payment operations
 */
export function usePayment(
  onStateChange?: (state: UIState, event: UIStateEvent) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancellationToken, setCancellationToken] = useState<string | null>(
    null
  );
  const { uiState, lastEvent, clearState } = useUIStateEvent(
    cancellationToken || undefined
  );

  useEffect(() => {
    if (lastEvent && onStateChange) {
      onStateChange(lastEvent.state, lastEvent);
    }
  }, [lastEvent, onStateChange]);

  const doPayment = useCallback(
    async (options: PaymentOptions): Promise<PlugpagTransactionResult> => {
      // Set default values for optional properties
      const paymentOptions = {
        installmentType:
          options.installmentType ??
          (options.type === PaymentTypes.DEBIT
            ? InstallmentTypes.NO_INSTALLMENT
            : InstallmentTypes.BUYER_INSTALLMENT),
        installments: options.installments ?? 1,
        printReceipt: options.printReceipt ?? true,
        userReference: options.userReference ?? `payment-${Date.now()}`,
        ...options,
      };

      const token = `payment_${Date.now()}`;
      setCancellationToken(token);
      setIsProcessing(true);

      try {
        const config = paymentOptions.uiConfiguration || {};

        const result = await safeModuleCall('doPaymentWithUI', () =>
          PlugpagNitroModule.doPaymentWithUI(
            paymentOptions.amount,
            paymentOptions.type,
            paymentOptions.installmentType,
            paymentOptions.installments,
            paymentOptions.printReceipt,
            paymentOptions.userReference,
            config.behavior?.showDefaultUI ?? true,
            config.behavior?.allowCancellation ?? true,
            config.behavior?.timeoutSeconds ?? 60,
            token
          )
        );

        return result;
      } finally {
        setIsProcessing(false);
        setCancellationToken(null);
      }
    },
    []
  );

  const cancelPayment =
    useCallback(async (): Promise<PlugpagCancellationResult | null> => {
      if (!cancellationToken) return null;

      try {
        const result = await safeModuleCall('cancelPayment', () =>
          PlugpagNitroModule.cancelPayment(cancellationToken)
        );
        setIsProcessing(false);
        setCancellationToken(null);
        clearState();
        return result;
      } catch (error) {
        console.warn('Failed to cancel payment:', error);
        return null;
      }
    }, [cancellationToken, clearState]);

  return {
    doPayment,
    cancelPayment,
    isProcessing,
    canCancel: Boolean(cancellationToken),
    uiState,
    lastEvent,
    clearState,
  };
}

// Export the main module for advanced usage
export { PlugpagNitroModule };

// Export utilities
export * from './utils';

// Default export
export default plugPag;
