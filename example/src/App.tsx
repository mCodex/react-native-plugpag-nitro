import { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import {
  PaymentType,
  InstallmentType,
  ErrorCode,
  initializeAndActivatePinPad,
  doPayment,
  refundPayment,
  getTerminalSerialNumber,
  isTransactionSuccessful,
  getTransactionError,
  PaymentPresets,
  type PlugpagTransactionResult,
} from 'react-native-plugpag-nitro';

export default function App() {
  const [lastPayment, setLastPayment] =
    useState<PlugpagTransactionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Format currency helper
  const formatCurrency = (amountInCents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amountInCents / 100);
  };

  // Get terminal serial number
  const terminalSerial = getTerminalSerialNumber();

  // Error handler
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`${operation} error:`, error);
    Alert.alert(
      'Erro',
      `Erro ao ${operation.toLowerCase()}: ${error.message || 'Erro desconhecido'}`
    );
  }, []);

  // Terminal initialization
  const handleInitializeAndActivatePinPad = useCallback(async () => {
    try {
      setIsProcessing(true);
      const data = await initializeAndActivatePinPad('403938');

      if (data.result !== ErrorCode.OK) {
        Alert.alert(
          'Erro ao ativar terminal',
          data.errorMessage || 'Unknown error'
        );
        return;
      }

      Alert.alert('Sucesso', 'Terminal ativado com sucesso!');
    } catch (error) {
      handleError(error, 'Ativar terminal');
    } finally {
      setIsProcessing(false);
    }
  }, [handleError]);

  // Generic payment handler
  const handlePayment = useCallback(
    async (paymentOptions: any, operationName: string) => {
      try {
        setIsProcessing(true);
        const result = await doPayment(paymentOptions);
        setLastPayment(result);

        if (!isTransactionSuccessful(result)) {
          const errorMessage = getTransactionError(result);
          Alert.alert(
            'Erro na transação',
            errorMessage || 'Transação não aprovada'
          );
          return;
        }

        Alert.alert('Sucesso', `${operationName} concluído com sucesso`);
      } catch (error) {
        handleError(error, operationName);
      } finally {
        setIsProcessing(false);
      }
    },
    [handleError]
  );

  // Credit card payment
  const handleCreditPayment = useCallback(() => {
    const paymentOptions = PaymentPresets.creditCard(2500, 1);
    handlePayment(
      {
        ...paymentOptions,
        userReference: 'test-credit-25',
      },
      'Pagamento no crédito'
    );
  }, [handlePayment]);

  // Debit card payment
  const handleDebitPayment = useCallback(() => {
    const paymentOptions = PaymentPresets.debitCard(2500);
    handlePayment(
      {
        ...paymentOptions,
        userReference: 'test-debit-25',
      },
      'Pagamento no débito'
    );
  }, [handlePayment]);

  // PIX payment
  const handlePixPayment = useCallback(() => {
    const paymentOptions = PaymentPresets.pix(2500);
    handlePayment(
      {
        ...paymentOptions,
        userReference: 'test-pix-25',
      },
      'Pagamento PIX'
    );
  }, [handlePayment]);

  // Custom payment with enum types
  const handleCustomPayment = useCallback(() => {
    const customPayment = {
      amount: 5000, // R$ 50,00
      type: PaymentType.CREDIT,
      installmentType: InstallmentType.BUYER_INSTALLMENT,
      installments: 3,
      printReceipt: true,
      userReference: 'custom-payment-3x',
    };
    handlePayment(customPayment, 'Pagamento customizado 3x');
  }, [handlePayment]);

  // Refund handler
  const handleRefundLastTransaction = useCallback(async () => {
    if (!lastPayment?.transactionCode || !lastPayment?.transactionId) {
      Alert.alert('Erro', 'Não há transação para estornar');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await refundPayment({
        transactionCode: lastPayment.transactionCode,
        transactionId: lastPayment.transactionId,
        printReceipt: true,
      });

      if (!isTransactionSuccessful(response)) {
        const errorMessage = getTransactionError(response);
        Alert.alert(
          'Estorno',
          errorMessage || 'Ocorreu um erro ao efetuar estorno'
        );
        return;
      }

      Alert.alert('Sucesso', 'Estorno efetuado com sucesso');
      setLastPayment(null);
    } catch (error) {
      handleError(error, 'Estornar transação');
    } finally {
      setIsProcessing(false);
    }
  }, [lastPayment, handleError]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.titleHeader, styles.space]}>
          React Native PlugPag Nitro
        </Text>
        <Text style={[styles.subtitle, styles.space]}>Enum-based API Demo</Text>
        <Text style={[styles.serialText, styles.space]}>
          Terminal Serial: {terminalSerial}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleInitializeAndActivatePinPad}
        style={[styles.button, styles.space]}
        disabled={isProcessing}
      >
        <Text style={styles.textButton}>
          {isProcessing ? 'Inicializando...' : 'Inicializar e ativar o Pin Pad'}
        </Text>
      </TouchableOpacity>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Pagamentos com Presets</Text>

        <TouchableOpacity
          onPress={handleCreditPayment}
          style={[styles.button, styles.space]}
          disabled={isProcessing}
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
          disabled={isProcessing}
        >
          <Text style={[styles.textButton, styles.debitText]}>
            💰 Débito - {formatCurrency(2500)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePixPayment}
          style={[styles.button, styles.space, styles.pixButton]}
          disabled={isProcessing}
        >
          <Text style={[styles.textButton, styles.pixText]}>
            📱 PIX - {formatCurrency(2500)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.customSection}>
        <Text style={styles.sectionTitle}>Pagamento Customizado com Enums</Text>

        <TouchableOpacity
          onPress={handleCustomPayment}
          style={[styles.button, styles.space, styles.customButton]}
          disabled={isProcessing}
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
            🔄 Estornar última transação
          </Text>
        </TouchableOpacity>
      </View>

      {lastPayment && (
        <View style={styles.lastPaymentSection}>
          <Text style={styles.sectionTitle}>📋 Última Transação</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentInfoText}>
              💰 Valor: {lastPayment.amount}
            </Text>
            <Text style={styles.paymentInfoText}>
              🔢 Código: {lastPayment.transactionCode}
            </Text>
            <Text style={styles.paymentInfoText}>
              🆔 ID: {lastPayment.transactionId}
            </Text>
            <Text style={styles.paymentInfoText}>
              🏦 Bandeira: {lastPayment.cardBrand}
            </Text>
            <Text style={styles.paymentInfoText}>
              📄 NSU: {lastPayment.hostNsu}
            </Text>
            <Text style={styles.paymentInfoText}>
              ✅ Status:{' '}
              {isTransactionSuccessful(lastPayment) ? 'Aprovado' : 'Negado'}
            </Text>
            <Text style={styles.paymentInfoText}>
              📅 Data/Hora: {lastPayment.date} {lastPayment.time}
            </Text>
          </View>
        </View>
      )}
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
    marginBottom: 2,
  },
});
