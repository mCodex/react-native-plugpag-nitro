import type { HybridObject } from 'react-native-nitro-modules';

// Enum definitions for type safety
export enum PaymentType {
  CREDIT = 1,
  DEBIT = 2,
  VOUCHER = 3,
  PIX = 5,
}

export enum InstallmentType {
  NO_INSTALLMENT = 1,
  SELLER_INSTALLMENT = 2,
  BUYER_INSTALLMENT = 3,
}

export enum ErrorCode {
  OK = 0,
  OPERATION_ABORTED = -1,
  AUTHENTICATION_FAILED = -2,
  COMMUNICATION_ERROR = -3,
  NO_PRINTER_DEVICE = -4,
  NO_TRANSACTION_DATA = -5,
}

export enum ActionType {
  POST_OPERATION = 1,
  PRE_OPERATION = 2,
  UPDATE = 3,
}

export interface PlugpagInitializationResult {
  result: ErrorCode;
  errorCode?: string;
  errorMessage?: string;
}

export interface PlugpagPaymentData {
  amount: number;
  type: PaymentType;
  installmentType: InstallmentType;
  installments: number;
  printReceipt: boolean;
  userReference?: string;
}

export interface PlugpagTransactionResult {
  result: ErrorCode;
  errorCode?: string;
  message?: string;
  transactionCode?: string;
  transactionId?: string;
  hostNsu?: string;
  date?: string;
  time?: string;
  cardBrand?: string;
  bin?: string;
  holder?: string;
  userReference?: string;
  terminalSerialNumber?: string;
  amount?: string;
  availableBalance?: string;
  cardApplication?: string;
  label?: string;
  holderName?: string;
  extendedHolderName?: string;
}

export interface PlugpagVoidData {
  transactionCode: string;
  transactionId: string;
  printReceipt: boolean;
}

export interface PlugpagAbortResult {
  result: boolean;
}

export interface PlugpagConstants {
  // Payment Types
  PAYMENT_CREDITO: number;
  PAYMENT_DEBITO: number;
  PAYMENT_VOUCHER: number;
  PAYMENT_PIX: number;

  // Installment Types
  INSTALLMENT_TYPE_A_VISTA: number;
  INSTALLMENT_TYPE_PARC_VENDEDOR: number;
  INSTALLMENT_TYPE_PARC_COMPRADOR: number;

  // Error Codes
  ERROR_CODE_OK: number;
  OPERATION_ABORTED: number;
  AUTHENTICATION_FAILED: number;
  COMMUNICATION_ERROR: number;
  NO_PRINTER_DEVICE: number;
  NO_TRANSACTION_DATA: number;

  // Actions
  ACTION_POST_OPERATION: number;
  ACTION_PRE_OPERATION: number;
  ACTION_UPDATE: number;
}

export interface PlugpagNitro extends HybridObject<{ android: 'kotlin' }> {
  /**
   * Get constants for payment types, installment types, and error codes
   *
   */
  getConstants(): PlugpagConstants;

  /**
   * Get the terminal's serial number (Build.SERIAL)
   *
   */
  getTerminalSerialNumber(): string;

  /**
   * Initialize and activate the pin pad terminal
   *
   * @param activationCode The activation code for the terminal
   */
  initializeAndActivatePinPad(
    activationCode: string
  ): Promise<PlugpagInitializationResult>;

  /**
   * Process a payment transaction
   * @param amount Payment amount in cents
   * @param type Payment type (PaymentType.CREDIT, PaymentType.DEBIT, etc.)
   * @param installmentType Installment type (InstallmentType.NO_INSTALLMENT, etc.)
   * @param installments Number of installments
   * @param printReceipt Whether to print receipt
   * @param userReference Optional user reference
   */
  doPayment(
    amount: number,
    type: PaymentType,
    installmentType: InstallmentType,
    installments: number,
    printReceipt: boolean,
    userReference: string
  ): Promise<PlugpagTransactionResult>;

  /**
   * Refund a previous payment transaction
   * @param transactionCode Transaction code to refund
   * @param transactionId Transaction ID to refund
   * @param printReceipt Whether to print receipt
   */
  refundPayment(
    transactionCode: string,
    transactionId: string,
    printReceipt: boolean
  ): Promise<PlugpagTransactionResult>;

  /**
   * Abort the current ongoing transaction
   */
  doAbort(): Promise<PlugpagAbortResult>;

  /**
   * Print a custom receipt from file path
   * @param filePath Path to the image file (PNG/JPEG)
   */
  print(filePath: string): Promise<void>;

  /**
   * Reprint the last customer receipt
   */
  reprintCustomerReceipt(): Promise<void>;
}
