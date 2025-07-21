import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  useTransactionPaymentEvent,
  usePayment,
  initializeAndActivatePinPad,
  refundPayment,
  getTerminalSerialNumber,
  PlugpagError,
  PaymentPresets,
  formatCurrency,
  isPaymentSuccessful,
  getPaymentErrorMessage,
  type PlugpagTransactionResult,
  type PaymentOptions,
  type UIState,
  type UIStateEvent,
} from 'react-native-plugpag-nitro';

export default function App() {
  const [lastPayment, setLastPayment] =
    useState<PlugpagTransactionResult | null>(null);
  const [terminalSerial, setTerminalSerial] = useState<string>('');

  const eventPayment = useTransactionPaymentEvent();

  // Use the simplified payment hook
  const {
    doPayment,
    cancelPayment,
    isProcessing,
    canCancel,
    uiState,
    lastEvent,
  } = usePayment((state: UIState, event: UIStateEvent) => {
    console.log('UI State changed:', state, event);
  });

  useEffect(() => {
    // Get terminal serial number on component mount
    try {
      const serial = getTerminalSerialNumber();
      setTerminalSerial(serial);
    } catch (error) {
      console.error('Error getting terminal serial:', error);
      setTerminalSerial('Error getting serial');
    }
  }, []);

  // Reusable error handler
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`${operation} error:`, error);

    if (error instanceof PlugpagError) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Erro', `Erro ao ${operation.toLowerCase()}`);
    }
  }, []);

  // Unified payment handler using the new hook
  const handlePayment = useCallback(
    async (paymentOptions: PaymentOptions, operationName: string) => {
      try {
        const result = await doPayment(paymentOptions);
        setLastPayment(result);

        if (!isPaymentSuccessful(result)) {
          const errorMessage = getPaymentErrorMessage(result);
          Alert.alert(
            'Erro na transação',
            errorMessage || 'Transação não aprovada'
          );
          return;
        }

        Alert.alert('Sucesso', `${operationName} concluído com sucesso`);
      } catch (error) {
        handleError(error, operationName);
      }
    },
    [doPayment, handleError]
  );

  // Handle cancellation
  const handleCancelPayment = useCallback(async () => {
    try {
      const result = await cancelPayment();
      if (result?.success) {
        Alert.alert('Cancelado', 'Pagamento cancelado com sucesso');
      }
    } catch (error) {
      handleError(error, 'Cancelar pagamento');
    }
  }, [cancelPayment, handleError]);

  // Terminal initialization
  const handleInitializeAndActivatePinPad = useCallback(async () => {
    try {
      const data = await initializeAndActivatePinPad('403938');

      if (data.result !== 0) {
        Alert.alert(
          'Erro ao ativar terminal',
          data.errorMessage || 'Unknown error'
        );
        return;
      }

      Alert.alert('Sucesso', 'Terminal ativado com sucesso!');
    } catch (error) {
      handleError(error, 'Ativar terminal');
    }
  }, [handleError]);

  // Payment handlers using presets
  const handleCreditPayment = useCallback(() => {
    const paymentOptions = PaymentPresets.credit(2500, 1, 'test-credit-25');
    handlePayment(paymentOptions, 'Pagamento no crédito');
  }, [handlePayment]);

  const handleDebitPayment = useCallback(() => {
    const paymentOptions = PaymentPresets.debit(2500, 'test-debit-25');
    handlePayment(paymentOptions, 'Pagamento no débito');
  }, [handlePayment]);

  const handlePixPayment = useCallback(() => {
    const paymentOptions = PaymentPresets.pix(2500, 'test-pix-25');
    handlePayment(paymentOptions, 'Pagamento PIX');
  }, [handlePayment]);

  // PIX payment with custom UI
  const handlePixPaymentWithCustomUI = useCallback(() => {
    const pixOptions = {
      ...PaymentPresets.pix(2500, 'pix-ui-demo'),
      uiConfiguration: {
        messages: {
          insertCard: '📱 Aproxime seu celular ou cartão para PIX',
          processing: '⏳ Processando PIX...',
          approved: '✅ PIX aprovado! Transação concluída',
          declined: '❌ PIX não autorizado',
        },
        behavior: {
          showDefaultUI: true,
          allowCancellation: true,
          timeoutSeconds: 90,
        },
        styling: {
          primaryColor: '#32D74B',
          backgroundColor: '#F8F9FA',
          textColor: '#212529',
        },
      },
    };
    handlePayment(pixOptions, 'Pagamento PIX com UI customizada');
  }, [handlePayment]);

  // Refund handler
  const handleRefundLastTransaction = useCallback(async () => {
    if (!lastPayment?.transactionCode || !lastPayment?.transactionId) {
      Alert.alert('Erro', 'Não há transação para estornar');
      return;
    }

    try {
      const response = await refundPayment({
        transactionCode: lastPayment.transactionCode,
        transactionId: lastPayment.transactionId,
        printReceipt: true,
      });

      if (!isPaymentSuccessful(response)) {
        Alert.alert('Estorno', 'Ocorreu um erro ao efetuar estorno');
        return;
      }

      Alert.alert('Sucesso', 'Estorno efetuado com sucesso');
      setLastPayment(null);
    } catch (error) {
      handleError(error, 'Estornar transação');
    }
  }, [lastPayment, handleError]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.titleHeader, styles.space]}>
          React Native PlugPag Nitro - Hook Style
        </Text>
        <Text style={[styles.serialText, styles.space]}>
          Terminal Serial: {terminalSerial}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleInitializeAndActivatePinPad}
        style={[styles.button, styles.space]}
      >
        <Text style={styles.textButton}>Inicializar e ativar o Pin Pad</Text>
      </TouchableOpacity>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Pagamentos com Hook</Text>

        {/* UI State Display */}
        {uiState && (
          <View style={styles.uiStateContainer}>
            <Text style={styles.uiStateTitle}>Estado do Pagamento:</Text>
            <Text style={styles.uiStateText}>{uiState}</Text>
            {lastEvent?.message && (
              <Text style={styles.uiStateMessage}>{lastEvent.message}</Text>
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={handleCreditPayment}
          style={[styles.button, styles.space]}
          disabled={isProcessing}
        >
          <Text style={styles.textButton}>
            {isProcessing
              ? 'Processando...'
              : `Pagar ${formatCurrency(2500)} no crédito`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDebitPayment}
          style={[styles.button, styles.space]}
          disabled={isProcessing}
        >
          <Text style={styles.textButton}>
            Pagar {formatCurrency(2500)} no débito
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePixPayment}
          style={[styles.button, styles.space, styles.pixButton]}
          disabled={isProcessing}
        >
          <Text style={[styles.textButton, styles.pixText]}>
            Pagar {formatCurrency(2500)} via PIX
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePixPaymentWithCustomUI}
          style={[styles.button, styles.space, styles.pixUIButton]}
          disabled={isProcessing}
        >
          <Text style={[styles.textButton, styles.pixUIText]}>
            💰 PIX com UI Customizada
          </Text>
        </TouchableOpacity>

        {canCancel && (
          <TouchableOpacity
            onPress={handleCancelPayment}
            style={[styles.button, styles.space, styles.cancelButton]}
          >
            <Text style={[styles.textButton, styles.cancelText]}>
              ❌ Cancelar Pagamento
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Ações</Text>

        <TouchableOpacity
          disabled={!lastPayment?.transactionId || isProcessing}
          onPress={handleRefundLastTransaction}
          style={[
            styles.button,
            styles.space,
            styles.refundButton,
            (!lastPayment?.transactionId || isProcessing) &&
              styles.disabledButton,
          ]}
        >
          <Text style={[styles.textButton, styles.refundText]}>
            Estornar última transação
          </Text>
        </TouchableOpacity>
      </View>

      {lastPayment && (
        <View style={styles.lastPaymentSection}>
          <Text style={styles.sectionTitle}>Última Transação</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentInfoText}>
              Valor: {lastPayment.amount}
            </Text>
            <Text style={styles.paymentInfoText}>
              Código: {lastPayment.transactionCode}
            </Text>
            <Text style={styles.paymentInfoText}>
              ID: {lastPayment.transactionId}
            </Text>
            <Text style={styles.paymentInfoText}>
              Bandeira: {lastPayment.cardBrand}
            </Text>
            <Text style={styles.paymentInfoText}>
              Resultado:{' '}
              {isPaymentSuccessful(lastPayment) ? '✅ Aprovado' : '❌ Negado'}
            </Text>
          </View>
        </View>
      )}

      <Modal transparent visible={isProcessing}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {uiState === 'PROCESSING'
                ? 'PROCESSANDO'
                : uiState === 'WAITING_FOR_CARD'
                  ? 'AGUARDANDO CARTÃO'
                  : eventPayment.message || 'PROCESSANDO'}
            </Text>

            <View style={styles.modalBox}>
              <ActivityIndicator size="large" color="#00DDFC" />
            </View>

            {canCancel && (
              <TouchableOpacity
                onPress={handleCancelPayment}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={[styles.textButton, styles.cancelText]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  serialText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  paymentSection: {
    marginBottom: 20,
  },
  actionSection: {
    marginBottom: 20,
  },
  lastPaymentSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00DDFC',
  },
  highValueButton: {
    borderColor: '#FF6B35',
  },
  pixButton: {
    borderColor: '#32D74B',
  },
  refundButton: {
    borderColor: '#FF3B30',
  },
  textButton: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#00DDFC',
  },
  highValueText: {
    color: '#FF6B35',
  },
  pixText: {
    color: '#32D74B',
  },
  refundText: {
    color: '#FF3B30',
  },
  space: {
    marginBottom: 12,
  },
  paymentInfo: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  paymentInfoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  disabledButton: {
    opacity: 0.3,
  },
  uiStateContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  uiStateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  uiStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
  uiStateMessage: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  uiButton: {
    borderColor: '#007AFF',
  },
  uiText: {
    color: '#007AFF',
  },
  cancelButton: {
    borderColor: '#FF3B30',
    backgroundColor: '#FF3B30',
  },
  cancelText: {
    color: '#FFFFFF',
  },
  pixUIButton: {
    borderColor: '#32D74B',
    backgroundColor: '#32D74B',
  },
  pixUIText: {
    color: '#FFFFFF',
  },
});
