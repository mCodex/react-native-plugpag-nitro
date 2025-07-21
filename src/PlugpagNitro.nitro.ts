import type { HybridObject } from 'react-native-nitro-modules';

export interface PlugpagInitializationResult {
  result: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface PlugpagPaymentData {
  amount: number;
  type: number;
  installmentType: number;
  installments: number;
  printReceipt: boolean;
  userReference?: string;
}

export interface PlugpagTransactionResult {
  result: number;
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

export interface PlugpagNFCResult {
  uid: string;
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
   */
  getConstants(): PlugpagConstants;

  /**
   * Get the terminal's serial number (Build.SERIAL)
   */
  getTerminalSerialNumber(): string;

  /**
   * Initialize and activate the pin pad terminal
   * @param activationCode The activation code for the terminal
   */
  initializeAndActivatePinPad(
    activationCode: string
  ): Promise<PlugpagInitializationResult>;

  /**
   * Process a payment transaction - optimized with flattened parameters
   * @param amount Payment amount in cents
   * @param type Payment type (1=Credit, 2=Debit, 3=Voucher, 5=PIX)
   * @param installmentType Installment type (1=No installment, 2=Seller, 3=Buyer)
   * @param installments Number of installments
   * @param printReceipt Whether to print receipt
   * @param userReference Optional user reference
   */
  doPayment(
    amount: number,
    type: number,
    installmentType: number,
    installments: number,
    printReceipt: boolean,
    userReference: string
  ): Promise<PlugpagTransactionResult>;

  /**
   * Void/refund a previous payment transaction - optimized with flattened parameters
   * @param transactionCode Transaction code to void
   * @param transactionId Transaction ID to void
   * @param printReceipt Whether to print receipt
   */
  voidPayment(
    transactionCode: string,
    transactionId: string,
    printReceipt: boolean
  ): Promise<PlugpagTransactionResult>;

  /**
   * Abort the current ongoing transaction
   */
  doAbort(): Promise<PlugpagAbortResult>;

  /**
   * Read an NFC card
   */
  readNFCCard(): Promise<PlugpagNFCResult>;

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
