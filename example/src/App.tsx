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
  doPayment,
  usePaymentWithCancellation,
  initializeAndActivatePinPad,
  refundPayment,
  getTerminalSerialNumber,
  PlugpagError,
  PaymentPresets,
  formatCurrency,
  isPaymentSuccessful,
  getPaymentErrorMessage,
  type PlugpagTransactionResult,
  type PaymentRequest,
  type PlugpagUIConfiguration,
  type UIState,
  type UIStateEvent,
} from 'react-native-plugpag-nitro';

export default function App() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastPayment, setLastPayment] =
    useState<PlugpagTransactionResult | null>(null);
  const [terminalSerial, setTerminalSerial] = useState<string>('');

  const eventPayment = useTransactionPaymentEvent();

  // Enhanced payment hook with cancellation support
  const {
    startPayment,
    cancelCurrentPayment,
    isProcessing,
    canCancel,
    uiState,
    lastEvent,
  } = usePaymentWithCancellation((state: UIState, event: UIStateEvent) => {
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

    // Configure global UI settings
    const setupGlobalUI = async () => {
      try {
        const { configureUI } = await import('react-native-plugpag-nitro');
        await configureUI({
          messages: {
            insertCard: 'Insira ou aproxime seu cartão',
            processing: 'Processando transação...',
            approved: 'Transação aprovada!',
            declined: 'Transação recusada',
          },
          behavior: {
            showDefaultUI: true,
            allowCancellation: true,
            timeoutSeconds: 120,
          },
        });
        console.log('Global UI configuration applied');
      } catch (error) {
        console.warn('Failed to configure global UI:', error);
      }
    };

    setupGlobalUI();
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

  // Enhanced payment handler with UI control and cancellation
  const handlePaymentWithUI = useCallback(
    async (paymentRequest: PaymentRequest, operationName: string) => {
      try {
        const uiConfig: PlugpagUIConfiguration = {
          messages: {
            insertCard: 'Por favor, insira ou aproxime o cartão',
            processing: 'Processando pagamento...',
            approved: 'Pagamento aprovado!',
            declined: 'Pagamento recusado',
          },
          behavior: {
            showDefaultUI: true,
            allowCancellation: true,
            timeoutSeconds: 120,
          },
        };

        const result = await startPayment({
          ...paymentRequest,
          uiConfiguration: uiConfig,
        });

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
    [startPayment, handleError]
  );

  // Handle cancellation
  const handleCancelPayment = useCallback(async () => {
    try {
      const result = await cancelCurrentPayment();
      if (result?.success) {
        Alert.alert('Cancelado', 'Pagamento cancelado com sucesso');
      }
    } catch (error) {
      handleError(error, 'Cancelar pagamento');
    }
  }, [cancelCurrentPayment, handleError]);

  // Reusable payment handler with improved error handling
  const handlePayment = useCallback(
    async (paymentRequest: PaymentRequest, operationName: string) => {
      try {
        setIsModalVisible(true);

        const data = await doPayment(paymentRequest);
        setLastPayment(data);
        setIsModalVisible(false);

        if (!isPaymentSuccessful(data)) {
          const errorMessage = getPaymentErrorMessage(data);
          Alert.alert(
            'Erro na transação',
            errorMessage || 'Transação não aprovada'
          );
          return;
        }

        Alert.alert('Sucesso', `${operationName} concluído com sucesso`);
      } catch (error) {
        setIsModalVisible(false);
        handleError(error, operationName);
      }
    },
    [handleError]
  );

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

  const handleDoPaymentCredit = useCallback(() => {
    const paymentRequest = PaymentPresets.credit(2500, 1, 'test-credit-25');
    handlePayment(paymentRequest, 'Pagamento no crédito');
  }, [handlePayment]);

  const handleDoPaymentDebit = useCallback(() => {
    const paymentRequest = PaymentPresets.debit(2500, 'test-debit-25');
    handlePayment(paymentRequest, 'Pagamento no débito');
  }, [handlePayment]);

  const handleDoPaymentCreditHighValue = useCallback(() => {
    const paymentRequest = PaymentPresets.credit(100000, 1, 'test-credit-1000');
    handlePayment(paymentRequest, 'Pagamento R$ 1.000 no crédito');
  }, [handlePayment]);

  const handleDoPaymentPix = useCallback(() => {
    const paymentRequest = PaymentPresets.pix(2500, 'test-pix-25');
    handlePayment(paymentRequest, 'Pagamento PIX');
  }, [handlePayment]);

  const handleRefundLastTransaction = useCallback(async () => {
    if (!lastPayment?.transactionCode || !lastPayment?.transactionId) {
      Alert.alert('Erro', 'Não há transação para estornar');
      return;
    }

    try {
      setIsModalVisible(true);

      const response = await refundPayment({
        transactionCode: lastPayment.transactionCode,
        transactionId: lastPayment.transactionId,
        printReceipt: true,
      });

      setIsModalVisible(false);

      if (!isPaymentSuccessful(response)) {
        Alert.alert('Estorno', 'Ocorreu um erro ao efetuar estorno');
        return;
      }

      Alert.alert('Sucesso', 'Estorno efetuado com sucesso');
      setLastPayment(null);
    } catch (error) {
      setIsModalVisible(false);
      handleError(error, 'Estornar transação');
    }
  }, [lastPayment, handleError]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.titleHeader, styles.space]}>
          React Native PlugPag Nitro
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
        <Text style={styles.sectionTitle}>Pagamentos</Text>

        <TouchableOpacity
          onPress={handleDoPaymentCredit}
          style={[styles.button, styles.space]}
        >
          <Text style={styles.textButton}>
            Pagar {formatCurrency(2500)} no crédito
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDoPaymentDebit}
          style={[styles.button, styles.space]}
        >
          <Text style={styles.textButton}>
            Pagar {formatCurrency(2500)} no débito
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDoPaymentCreditHighValue}
          style={[styles.button, styles.space, styles.highValueButton]}
        >
          <Text style={[styles.textButton, styles.highValueText]}>
            Pagar {formatCurrency(100000)} no crédito
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDoPaymentPix}
          style={[styles.button, styles.space, styles.pixButton]}
        >
          <Text style={[styles.textButton, styles.pixText]}>
            Pagar {formatCurrency(2500)} via PIX
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>UI Avançada com Cancelamento</Text>

        {/* UI State Display */}
        {uiState && (
          <View style={styles.uiStateContainer}>
            <Text style={styles.uiStateTitle}>Estado do UI:</Text>
            <Text style={styles.uiStateText}>{uiState}</Text>
            {lastEvent?.message && (
              <Text style={styles.uiStateMessage}>{lastEvent.message}</Text>
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={() =>
            handlePaymentWithUI(PaymentPresets.credit(2500), 'Pagamento com UI')
          }
          style={[styles.button, styles.space, styles.uiButton]}
          disabled={isProcessing}
        >
          <Text style={[styles.textButton, styles.uiText]}>
            {isProcessing
              ? 'Processando...'
              : `Pagar ${formatCurrency(2500)} com UI Customizada`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            handlePaymentWithUI(PaymentPresets.debit(2500), 'Débito com UI')
          }
          style={[styles.button, styles.space, styles.uiButton]}
          disabled={isProcessing}
        >
          <Text style={[styles.textButton, styles.uiText]}>
            Pagar {formatCurrency(2500)} no débito com UI
          </Text>
        </TouchableOpacity>

        {canCancel && (
          <TouchableOpacity
            onPress={handleCancelPayment}
            style={[styles.button, styles.space, styles.cancelButton]}
          >
            <Text style={[styles.textButton, styles.cancelText]}>
              Cancelar Pagamento
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Ações</Text>

        <TouchableOpacity
          disabled={!lastPayment?.transactionId}
          onPress={handleRefundLastTransaction}
          style={[
            styles.button,
            styles.space,
            styles.refundButton,
            !lastPayment?.transactionId && styles.disabledButton,
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
          </View>
        </View>
      )}

      <Modal transparent visible={isModalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {eventPayment.message || 'PROCESSANDO'}
            </Text>

            <View style={styles.modalBox}>
              <ActivityIndicator size="large" color="#00DDFC" />
            </View>
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
});
