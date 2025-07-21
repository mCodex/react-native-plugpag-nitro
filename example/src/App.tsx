import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PlugpagNitro, {
  type PlugpagTransactionResult,
  InstallmentType,
  PaymentType,
  PaymentEventCode,
  useTransactionPaymentEvent,
  usePaymentFlow,
} from 'react-native-plugpag-nitro';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalSerial, setTerminalSerial] = useState<string>('N/A');
  const [lastPayment, setLastPayment] =
    useState<PlugpagTransactionResult | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Enhanced payment hooks
  const paymentEvent = useTransactionPaymentEvent();
  const paymentFlow = usePaymentFlow();

  const formatCurrency = (amountInCents: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amountInCents / 100);
  };

  const isTransactionSuccessful = (
    transaction: PlugpagTransactionResult
  ): boolean => {
    return PlugpagNitro.isTransactionSuccessful(transaction);
  };

  const getEventStatusColor = (eventCode: number): string => {
    if (
      eventCode >= PaymentEventCode.CARD_INSERTED &&
      eventCode <= PaymentEventCode.WAITING_CARD
    ) {
      return '#007AFF'; // Blue for card reading
    }
    if (
      eventCode >= PaymentEventCode.DIGIT_PASSWORD &&
      eventCode <= PaymentEventCode.LAST_PASSWORD_TRY
    ) {
      return '#FF9500'; // Orange for password
    }
    if (
      eventCode >= PaymentEventCode.PROCESSING_TRANSACTION &&
      eventCode <= PaymentEventCode.WAITING_HOST_RESPONSE
    ) {
      return '#FFCC02'; // Yellow for processing
    }
    if (
      eventCode >= PaymentEventCode.REMOVE_CARD &&
      eventCode <= PaymentEventCode.TRANSACTION_DENIED
    ) {
      return '#32D74B'; // Green for terminal responses
    }
    if (
      eventCode >= PaymentEventCode.COMMUNICATION_ERROR &&
      eventCode <= PaymentEventCode.INSUFFICIENT_FUNDS
    ) {
      return '#FF3B30'; // Red for errors
    }
    return '#8E8E93'; // Gray for unknown
  };

  // Fetch terminal serial on mount
  useEffect(() => {
    const getSerial = async () => {
      try {
        const serial = PlugpagNitro.getTerminalSerialNumber();
        setTerminalSerial(serial);
      } catch (error) {
        console.log('Error fetching serial:', error);
      }
    };
    getSerial();
  }, []);

  const handleInitializeAndActivatePinPad = async () => {
    setIsProcessing(true);
    try {
      await PlugpagNitro.initializeAndActivatePinPad('403938');
      Alert.alert('✅ Sucesso', 'PinPad inicializado e ativado com sucesso!');
    } catch (error: any) {
      Alert.alert('❌ Erro', `Falha na inicialização: ${error.message}`);
    }
    setIsProcessing(false);
  };

  const handleCreditPayment = async () => {
    setIsProcessing(true);
    try {
      const result = await PlugpagNitro.doPayment(
        PlugpagNitro.PaymentPresets.creditCard(2500)
      );
      setLastPayment(result);

      if (isTransactionSuccessful(result)) {
        Alert.alert(
          '✅ Pagamento Aprovado',
          `Transação realizada com sucesso!\n\nValor: ${formatCurrency(2500)}\nCódigo: ${result.transactionCode}\nNSU: ${result.hostNsu}`
        );
      } else {
        Alert.alert(
          '❌ Pagamento Negado',
          `Transação negada.\n\nCódigo: ${result.transactionCode}\nMensagem: ${result.message}`
        );
      }
    } catch (error: any) {
      Alert.alert('❌ Erro', `Falha no pagamento: ${error.message}`);
    }
    setIsProcessing(false);
  };

  const handleDebitPayment = async () => {
    setIsProcessing(true);
    try {
      const result = await PlugpagNitro.doPayment(
        PlugpagNitro.PaymentPresets.debitCard(2500)
      );
      setLastPayment(result);

      if (isTransactionSuccessful(result)) {
        Alert.alert(
          '✅ Pagamento Aprovado',
          `Transação realizada com sucesso!\n\nValor: ${formatCurrency(2500)}\nCódigo: ${result.transactionCode}\nNSU: ${result.hostNsu}`
        );
      } else {
        Alert.alert(
          '❌ Pagamento Negado',
          `Transação negada.\n\nCódigo: ${result.transactionCode}\nMensagem: ${result.message}`
        );
      }
    } catch (error: any) {
      Alert.alert('❌ Erro', `Falha no pagamento: ${error.message}`);
    }
    setIsProcessing(false);
  };

  const handlePixPayment = async () => {
    setIsProcessing(true);
    try {
      const result = await PlugpagNitro.doPayment(
        PlugpagNitro.PaymentPresets.pix(2500)
      );
      setLastPayment(result);

      if (isTransactionSuccessful(result)) {
        Alert.alert(
          '✅ Pagamento Aprovado',
          `Transação PIX realizada com sucesso!\n\nValor: ${formatCurrency(2500)}\nCódigo: ${result.transactionCode}\nNSU: ${result.hostNsu}`
        );
      } else {
        Alert.alert(
          '❌ Pagamento Negado',
          `Transação PIX negada.\n\nCódigo: ${result.transactionCode}\nMensagem: ${result.message}`
        );
      }
    } catch (error: any) {
      Alert.alert('❌ Erro', `Falha no pagamento PIX: ${error.message}`);
    }
    setIsProcessing(false);
  };

  const handleCustomPayment = async () => {
    setIsProcessing(true);
    try {
      const result = await PlugpagNitro.doPayment({
        amount: 5000,
        type: PaymentType.CREDIT,
        installmentType: InstallmentType.BUYER_INSTALLMENT,
        installments: 3,
      });
      setLastPayment(result);

      if (isTransactionSuccessful(result)) {
        Alert.alert(
          '✅ Pagamento Aprovado',
          `Transação parcelada realizada com sucesso!\n\nValor: ${formatCurrency(5000)}\nParcelas: 3x\nCódigo: ${result.transactionCode}\nNSU: ${result.hostNsu}`
        );
      } else {
        Alert.alert(
          '❌ Pagamento Negado',
          `Transação parcelada negada.\n\nCódigo: ${result.transactionCode}\nMensagem: ${result.message}`
        );
      }
    } catch (error: any) {
      Alert.alert('❌ Erro', `Falha no pagamento: ${error.message}`);
    }
    setIsProcessing(false);
  };

  const handleCreditPaymentWithEvents = async () => {
    try {
      setShowEventModal(true);
      const result = await paymentFlow.executePayment({
        amount: 2500,
        type: PaymentType.CREDIT,
      });

      setShowEventModal(false);

      if (result && isTransactionSuccessful(result)) {
        Alert.alert(
          '✅ Pagamento Aprovado',
          `Transação com eventos realizada com sucesso!\n\nValor: ${formatCurrency(2500)}\nCódigo: ${result.transactionCode}\nNSU: ${result.hostNsu}`
        );
      } else {
        Alert.alert(
          '❌ Pagamento Negado',
          `Transação com eventos negada.\n\nCódigo: ${result?.transactionCode}\nMensagem: ${result?.message}`
        );
      }
    } catch (error: any) {
      setShowEventModal(false);
      Alert.alert(
        '❌ Erro',
        `Falha no pagamento com eventos: ${error.message}`
      );
    }
  };

  const handleHighValuePayment = async () => {
    try {
      setShowEventModal(true);
      const result = await paymentFlow.executePayment({
        amount: 50000, // R$ 500
        type: PaymentType.CREDIT,
      });

      setShowEventModal(false);

      if (result && isTransactionSuccessful(result)) {
        Alert.alert(
          '💎 Alto Valor Aprovado',
          `Transação de alto valor realizada com sucesso!\n\nValor: ${formatCurrency(50000)}\nCódigo: ${result.transactionCode}\nNSU: ${result.hostNsu}`
        );
      } else {
        Alert.alert(
          '❌ Alto Valor Negado',
          `Transação de alto valor negada.\n\nCódigo: ${result?.transactionCode}\nMensagem: ${result?.message}`
        );
      }
    } catch (error: any) {
      setShowEventModal(false);
      Alert.alert(
        '❌ Erro',
        `Falha no pagamento de alto valor: ${error.message}`
      );
    }
  };

  const handleRefundLastTransaction = async () => {
    if (!lastPayment?.transactionId || !lastPayment?.transactionCode) {
      Alert.alert('⚠️ Aviso', 'Nenhuma transação encontrada para estorno.');
      return;
    }

    Alert.alert(
      '🔄 Confirmar Estorno',
      `Deseja estornar a transação?\n\nValor: ${lastPayment.amount}\nID: ${lastPayment.transactionId}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Estornar',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const result = await PlugpagNitro.refundPayment({
                transactionCode: lastPayment.transactionCode!,
                transactionId: lastPayment.transactionId!,
              });
              if (isTransactionSuccessful(result)) {
                Alert.alert(
                  '✅ Estorno Aprovado',
                  `Estorno realizado com sucesso!\n\nValor: ${lastPayment.amount}\nCódigo: ${result.transactionCode}`
                );
                setLastPayment(null); // Clear last payment after successful refund
              } else {
                Alert.alert(
                  '❌ Estorno Negado',
                  `Estorno negado.\n\nCódigo: ${result.transactionCode}\nMensagem: ${result.message}`
                );
              }
            } catch (error: any) {
              Alert.alert('❌ Erro', `Falha no estorno: ${error.message}`);
            }
            setIsProcessing(false);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.titleHeader, styles.space]}>
          React Native PlugPag Nitro
        </Text>
        <Text style={[styles.subtitle, styles.space]}>
          Enhanced Payment Events Demo
        </Text>
        <Text style={[styles.serialText, styles.space]}>
          Terminal Serial: {terminalSerial}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleInitializeAndActivatePinPad}
        style={[styles.button, styles.space]}
        disabled={isProcessing || paymentFlow.isProcessing}
      >
        <Text style={styles.textButton}>
          {isProcessing ? 'Inicializando...' : 'Inicializar e ativar o Pin Pad'}
        </Text>
      </TouchableOpacity>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>💳 Pagamentos Básicos</Text>

        <TouchableOpacity
          onPress={handleCreditPayment}
          style={[styles.button, styles.space]}
          disabled={isProcessing || paymentFlow.isProcessing}
        >
          <Text style={styles.textButton}>
            {isProcessing
              ? 'Processando...'
              : `💳 Crédito à vista - ${formatCurrency(2500)}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDebitPayment}
          style={[styles.button, styles.space, styles.debitButton]}
          disabled={isProcessing || paymentFlow.isProcessing}
        >
          <Text style={[styles.textButton, styles.debitText]}>
            💰 Débito - {formatCurrency(2500)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePixPayment}
          style={[styles.button, styles.space, styles.pixButton]}
          disabled={isProcessing || paymentFlow.isProcessing}
        >
          <Text style={[styles.textButton, styles.pixText]}>
            📱 PIX - {formatCurrency(2500)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>
          ⚡ Pagamentos com Eventos em Tempo Real
        </Text>

        <TouchableOpacity
          onPress={handleCreditPaymentWithEvents}
          style={[styles.button, styles.space, styles.eventsButton]}
          disabled={isProcessing || paymentFlow.isProcessing}
        >
          <Text style={[styles.textButton, styles.eventsText]}>
            {paymentFlow.isProcessing
              ? 'Processando com eventos...'
              : `⚡ Crédito com eventos - ${formatCurrency(2500)}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleHighValuePayment}
          style={[styles.button, styles.space, styles.highValueButton]}
          disabled={isProcessing || paymentFlow.isProcessing}
        >
          <Text style={[styles.textButton, styles.highValueText]}>
            {paymentFlow.isProcessing
              ? 'Processando...'
              : `💎 Alto Valor com eventos - ${formatCurrency(50000)}`}
          </Text>
        </TouchableOpacity>

        {/* Real-time event display */}
        {paymentFlow.isProcessing && (
          <View style={styles.eventStatusContainer}>
            <View
              style={[
                styles.eventStatusIndicator,
                { backgroundColor: getEventStatusColor(paymentEvent.code) },
              ]}
            />
            <Text style={styles.eventStatusText}>{paymentEvent.message}</Text>
          </View>
        )}
      </View>

      <View style={styles.customSection}>
        <Text style={styles.sectionTitle}>
          🔧 Pagamento Customizado com Enums
        </Text>

        <TouchableOpacity
          onPress={handleCustomPayment}
          style={[styles.button, styles.space, styles.customButton]}
          disabled={isProcessing || paymentFlow.isProcessing}
        >
          <Text style={[styles.textButton, styles.customText]}>
            ⚡ Crédito 3x - {formatCurrency(5000)}
          </Text>
        </TouchableOpacity>

        <View style={styles.enumInfo}>
          <Text style={styles.enumTitle}>🔧 Configuração:</Text>
          <Text style={styles.enumText}>• PaymentType.CREDIT</Text>
          <Text style={styles.enumText}>
            • InstallmentType.BUYER_INSTALLMENT
          </Text>
          <Text style={styles.enumText}>• 3 parcelas</Text>
        </View>
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>🔄 Ações</Text>

        <TouchableOpacity
          disabled={
            !lastPayment?.transactionId ||
            isProcessing ||
            paymentFlow.isProcessing
          }
          onPress={handleRefundLastTransaction}
          style={[
            styles.button,
            styles.space,
            styles.refundButton,
            (!lastPayment?.transactionId ||
              isProcessing ||
              paymentFlow.isProcessing) &&
              styles.disabledButton,
          ]}
        >
          <Text style={[styles.textButton, styles.refundText]}>
            🔄 Estornar última transação
          </Text>
        </TouchableOpacity>
      </View>

      {(lastPayment || paymentFlow.currentTransaction) && (
        <View style={styles.lastPaymentSection}>
          <Text style={styles.sectionTitle}>📋 Última Transação</Text>
          <View style={styles.paymentInfo}>
            {(() => {
              const transaction = paymentFlow.currentTransaction || lastPayment;
              return (
                <>
                  <Text style={styles.paymentInfoText}>
                    💰 Valor: {transaction?.amount}
                  </Text>
                  <Text style={styles.paymentInfoText}>
                    🔢 Código: {transaction?.transactionCode}
                  </Text>
                  <Text style={styles.paymentInfoText}>
                    🆔 ID: {transaction?.transactionId}
                  </Text>
                  <Text style={styles.paymentInfoText}>
                    🏦 Bandeira: {transaction?.cardBrand}
                  </Text>
                  <Text style={styles.paymentInfoText}>
                    📄 NSU: {transaction?.hostNsu}
                  </Text>
                  <Text style={styles.paymentInfoText}>
                    ✅ Status:{' '}
                    {isTransactionSuccessful(transaction!)
                      ? 'Aprovado'
                      : 'Negado'}
                  </Text>
                  <Text style={styles.paymentInfoText}>
                    📅 Data/Hora: {transaction?.date} {transaction?.time}
                  </Text>
                  {paymentFlow.isTransactionSuccessful && (
                    <Text style={[styles.paymentInfoText, styles.successText]}>
                      🎉 Transação processada com eventos em tempo real!
                    </Text>
                  )}
                </>
              );
            })()}
          </View>
        </View>
      )}

      {/* Event Modal */}
      <Modal transparent visible={showEventModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Processando Pagamento</Text>
            </View>

            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="#007AFF" />

              <View style={styles.eventDisplay}>
                <View
                  style={[
                    styles.eventIndicator,
                    { backgroundColor: getEventStatusColor(paymentEvent.code) },
                  ]}
                />
                <Text style={styles.eventMessage}>{paymentEvent.message}</Text>
              </View>

              <Text style={styles.eventCode}>
                Código do evento: {paymentEvent.code}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEventModal(false)}
            >
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#007AFF',
  },
  serialText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  paymentSection: {
    marginBottom: 20,
  },
  eventsSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  customSection: {
    marginBottom: 20,
  },
  actionSection: {
    marginBottom: 20,
  },
  lastPaymentSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'white',
  },
  debitButton: {
    borderColor: '#FF9500',
  },
  pixButton: {
    borderColor: '#32D74B',
  },
  customButton: {
    borderColor: '#AF52DE',
  },
  refundButton: {
    borderColor: '#FF3B30',
  },
  eventsButton: {
    borderColor: '#28a745',
  },
  highValueButton: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  textButton: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#007AFF',
  },
  debitText: {
    color: '#FF9500',
  },
  pixText: {
    color: '#32D74B',
  },
  customText: {
    color: '#AF52DE',
  },
  refundText: {
    color: '#FF3B30',
  },
  eventsText: {
    color: '#28a745',
  },
  highValueText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  successText: {
    color: '#28a745',
    fontWeight: 'bold',
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
    marginBottom: 6,
    color: '#444',
    lineHeight: 20,
  },
  disabledButton: {
    opacity: 0.3,
  },
  enumInfo: {
    backgroundColor: '#f0f0f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  enumTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  enumText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Courier New, monospace',
    marginBottom: 4,
  },
  eventStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
  },
  eventStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  eventStatusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  modalContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  eventDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    width: '100%',
  },
  eventIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  eventMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  eventCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
