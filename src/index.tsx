import React, { useEffect, useState, useCallback } from 'react';
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
  PlugpagUIConfiguration,
  PlugpagPaymentOptions,
  PlugpagCancellationResult,
  UIState,
  UIStateEvent,
} from './PlugpagNitro.nitro';
import { PaymentPresets } from './utils';

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
  PlugpagUIConfiguration,
  PlugpagPaymentOptions,
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

// Enhanced payment request with UI options
export interface EnhancedPaymentRequest extends PaymentRequest {
  uiConfiguration?: PlugpagUIConfiguration;
  cancellationToken?: string;
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
 * Process a payment transaction
 * @param paymentRequest The payment request data
 */
export async function doPayment(
  paymentRequest: PaymentRequest
): Promise<PlugpagTransactionResult> {
  return safeModuleCall('doPayment', () =>
    PlugpagNitroModule.doPayment(
      paymentRequest.amount,
      paymentRequest.type,
      paymentRequest.installmentType,
      paymentRequest.installments,
      paymentRequest.printReceipt,
      paymentRequest.userReference || ''
    )
  );
}

/**
 * Process a PIX payment with enhanced UI control
 * @param amount Amount in cents
 * @param uiConfiguration Optional UI configuration for PIX-specific experience
 * @param userReference Optional user reference
 */
export async function doPixPaymentWithUI(
  amount: number,
  uiConfiguration?: PlugpagUIConfiguration,
  userReference?: string
): Promise<PlugpagTransactionResult> {
  const pixUIConfig: PlugpagUIConfiguration = {
    messages: {
      insertCard: 'Aproxime seu celular ou cartão para PIX',
      processing: 'Processando pagamento PIX...',
      approved: 'PIX aprovado com sucesso!',
      declined: 'PIX não autorizado',
      ...uiConfiguration?.messages,
    },
    behavior: {
      showDefaultUI: true,
      allowCancellation: true,
      timeoutSeconds: 90, // PIX typically has shorter timeout
      ...uiConfiguration?.behavior,
    },
    styling: {
      primaryColor: '#32D74B', // PIX green
      backgroundColor: '#F2F2F7',
      textColor: '#000000',
      ...uiConfiguration?.styling,
    },
  };

  return doPaymentWithUI({
    ...PaymentPresets.pix(amount, userReference),
    uiConfiguration: pixUIConfig,
  });
}

/**
 * Process a payment transaction with enhanced UI control
 * @param paymentRequest The payment request data with UI configuration
 */
export async function doPaymentWithUI(
  paymentRequest: EnhancedPaymentRequest
): Promise<PlugpagTransactionResult> {
  const config = paymentRequest.uiConfiguration || {};
  const token = paymentRequest.cancellationToken || `payment_${Date.now()}`;

  return safeModuleCall('doPaymentWithUI', () =>
    PlugpagNitroModule.doPaymentWithUI(
      paymentRequest.amount,
      paymentRequest.type,
      paymentRequest.installmentType,
      paymentRequest.installments,
      paymentRequest.printReceipt,
      paymentRequest.userReference || '',
      config.behavior?.showDefaultUI ?? true,
      config.behavior?.allowCancellation ?? true,
      config.behavior?.timeoutSeconds ?? 60,
      token
    )
  );
} /**
 * Cancel an ongoing payment operation
 * @param cancellationToken Token identifying the operation to cancel
 */
export async function cancelPayment(
  cancellationToken: string
): Promise<PlugpagCancellationResult> {
  return safeModuleCall('cancelPayment', () =>
    PlugpagNitroModule.cancelPayment(cancellationToken)
  );
}

/**
 * Configure global UI settings
 * @param configuration UI configuration object
 */
export async function configureUI(
  configuration: PlugpagUIConfiguration
): Promise<boolean> {
  const customMessages = JSON.stringify(configuration.messages || {});

  return safeModuleCall('configureUI', () =>
    PlugpagNitroModule.configureUI(
      configuration.behavior?.showDefaultUI ?? true,
      customMessages,
      configuration.behavior?.allowCancellation ?? true,
      configuration.behavior?.timeoutSeconds ?? 60
    )
  );
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
      refundRequest.printReceipt
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

// React Hooks for UI State Management

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
 * Hook for payment operations with cancellation support
 * @param onStateChange Optional callback for UI state changes
 */
export function usePaymentWithCancellation(
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

  const startPayment = useCallback(
    async (
      paymentRequest: Omit<EnhancedPaymentRequest, 'cancellationToken'>
    ): Promise<PlugpagTransactionResult> => {
      const token = `payment_${Date.now()}`;
      setCancellationToken(token);
      setIsProcessing(true);

      try {
        const result = await doPaymentWithUI({
          ...paymentRequest,
          cancellationToken: token,
        });
        return result;
      } finally {
        setIsProcessing(false);
        setCancellationToken(null);
      }
    },
    []
  );

  const cancelCurrentPayment =
    useCallback(async (): Promise<PlugpagCancellationResult | null> => {
      if (!cancellationToken) return null;

      try {
        const result = await cancelPayment(cancellationToken);
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
    startPayment,
    cancelCurrentPayment,
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
