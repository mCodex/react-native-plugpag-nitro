import { useState, useEffect, useCallback } from 'react';
import {
  type PlugpagTransactionResult,
  initializeAndActivatePinPad,
  doPayment,
  refundPayment,
  getTerminalSerialNumber,
  PaymentType,
  ErrorCode,
  InstallmentType,
} from 'react-native-plugpag-nitro';
import {
  TERMINAL_ACTIVATION_CODE,
  PAYMENT_AMOUNTS,
  formatCurrency,
  getPaymentTypeText,
  showAlert,
  withAsyncOperation,
} from '../utils';

export interface PaymentOptions {
  amount: number;
  type: PaymentType;
  installmentType?: InstallmentType;
  installments?: number;
}

export const usePaymentOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [terminalSerial, setTerminalSerial] = useState<string>('N/A');
  const [lastPayment, setLastPayment] =
    useState<PlugpagTransactionResult | null>(null);

  // Get terminal serial on mount
  useEffect(() => {
    try {
      setTerminalSerial(getTerminalSerialNumber());
    } catch (e) {
      console.warn('Failed to get terminal serial:', e);
    }
  }, []);

  const handleInitialize = useCallback(async (): Promise<void> => {
    await withAsyncOperation(
      async () => {
        const result = await initializeAndActivatePinPad(
          TERMINAL_ACTIVATION_CODE
        );
        if (result.result === ErrorCode.OK) {
          setIsInitialized(true);
          showAlert.success('Sucesso', 'Terminal inicializado com sucesso');
        } else {
          showAlert.error(
            'Erro',
            result.errorMessage || 'Falha ao inicializar'
          );
        }
        return result;
      },
      setIsProcessing,
      (error) => showAlert.error('Error', error.message)
    );
  }, []);

  const handlePayment = async (options: PaymentOptions): Promise<void> => {
    if (!isInitialized) {
      showAlert.warning('Aviso', 'Por favor, inicialize o terminal primeiro');
      return;
    }

    await withAsyncOperation(
      async () => {
        const result = await doPayment(options);
        setLastPayment(result);

        if (result.result === ErrorCode.OK) {
          const paymentTypeText = getPaymentTypeText(options.type);
          const amountText = formatCurrency(options.amount);
          const installmentText = options.installments
            ? ` (${options.installments}x)`
            : '';

          showAlert.success(
            'Pagamento Aprovado',
            `${paymentTypeText} realizado com sucesso!\nCódigo: ${result.transactionCode}\nValor: ${amountText}${installmentText}`
          );
        } else {
          showAlert.error(
            'Pagamento Negado',
            result.message || 'Transação falhou'
          );
        }
        return result;
      },
      setIsProcessing,
      (error) => showAlert.error('Erro', error.message)
    );
  };

  const handleCreditPayment = (): Promise<void> => {
    return handlePayment({
      amount: PAYMENT_AMOUNTS.credit,
      type: PaymentType.CREDIT,
    });
  };

  const handleDebitPayment = (): Promise<void> => {
    return handlePayment({
      amount: PAYMENT_AMOUNTS.debit,
      type: PaymentType.DEBIT,
    });
  };

  const handlePIXPayment = (): Promise<void> => {
    return handlePayment({
      amount: PAYMENT_AMOUNTS.pix,
      type: PaymentType.PIX,
    });
  };

  const handleInstallmentPayment = (): Promise<void> => {
    return handlePayment({
      amount: PAYMENT_AMOUNTS.installment,
      type: PaymentType.CREDIT,
      installmentType: InstallmentType.BUYER_INSTALLMENT,
      installments: 3,
    });
  };

  const handleRefund = async (): Promise<void> => {
    if (!lastPayment?.transactionCode || !lastPayment.transactionId) {
      showAlert.warning('Aviso', 'Nenhuma transação para estornar');
      return;
    }

    await withAsyncOperation(
      async () => {
        const result = await refundPayment({
          transactionCode: lastPayment.transactionCode!,
          transactionId: lastPayment.transactionId!,
        });

        if (result.result === ErrorCode.OK) {
          showAlert.success(
            'Estorno Realizado',
            `Código: ${result.transactionCode}`
          );
          setLastPayment(null);
        } else {
          showAlert.error('Estorno Falhou', result.message || 'Estorno falhou');
        }
        return result;
      },
      setIsProcessing,
      (error) => showAlert.error('Erro', error.message)
    );
  };

  return {
    // State
    isProcessing,
    isInitialized,
    terminalSerial,
    lastPayment,

    // Actions
    handleInitialize,
    handlePayment,
    handleCreditPayment,
    handleDebitPayment,
    handlePIXPayment,
    handleInstallmentPayment,
    handleRefund,
  };
};
