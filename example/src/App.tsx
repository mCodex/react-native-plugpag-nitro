import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  type PlugpagTransactionResult,
  initializeAndActivatePinPad,
  doPayment,
  refundPayment,
  generatePixQRCode,
  useTransactionEvent,
  getTerminalSerialNumber,
  PaymentType,
  ErrorCode,
  InstallmentType,
} from 'react-native-plugpag-nitro';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);

  const [terminalSerial, setTerminalSerial] = useState<string>('N/A');

  const [lastPayment, setLastPayment] =
    useState<PlugpagTransactionResult | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  // Real-time payment events
  const paymentEvent = useTransactionEvent();

  // Get terminal serial on mount
  useEffect(() => {
    try {
      setTerminalSerial(getTerminalSerialNumber());
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Initialize terminal
  const handleInitialize = async () => {
    setIsProcessing(true);
    try {
      const result = await initializeAndActivatePinPad('403938');
      if (result.result === ErrorCode.OK) {
        setIsInitialized(true);
        Alert.alert('✅ Sucesso', 'Terminal inicializado com sucesso');
      } else {
        Alert.alert('❌ Erro', result.errorMessage || 'Falha ao inicializar');
      }
    } catch (e: any) {
      Alert.alert('❌ Error', e.message);
    }
    setIsProcessing(false);
  };

  // Credit payment
  const handleCreditPayment = async () => {
    if (!isInitialized) {
      Alert.alert('⚠️ Aviso', 'Por favor, inicialize o terminal primeiro');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await doPayment({
        amount: 2500, // R$ 25.00
        type: PaymentType.CREDIT,
      });
      setLastPayment(result);

      if (result.result === ErrorCode.OK) {
        Alert.alert(
          '✅ Pagamento Aprovado',
          `Transação realizada com sucesso!\nCódigo: ${result.transactionCode}\nValor: R$ 25,00`
        );
      } else {
        Alert.alert(
          '❌ Pagamento Negado',
          result.message || 'Transação falhou'
        );
      }
    } catch (e: any) {
      Alert.alert('❌ Erro', e.message);
    }
    setIsProcessing(false);
  };

  // Debit payment
  const handleDebitPayment = async () => {
    if (!isInitialized) {
      Alert.alert('⚠️ Aviso', 'Por favor, inicialize o terminal primeiro');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await doPayment({
        amount: 1500, // R$ 15.00
        type: PaymentType.DEBIT,
      });
      setLastPayment(result);

      if (result.result === ErrorCode.OK) {
        Alert.alert(
          '✅ Pagamento Aprovado',
          `Transação de débito realizada com sucesso!\nCódigo: ${result.transactionCode}\nValor: R$ 15,00`
        );
      } else {
        Alert.alert(
          '❌ Pagamento Negado',
          result.message || 'Transação falhou'
        );
      }
    } catch (e: any) {
      Alert.alert('❌ Erro', e.message);
    }
    setIsProcessing(false);
  };

  // Installment payment
  const handleInstallmentPayment = async () => {
    if (!isInitialized) {
      Alert.alert('⚠️ Aviso', 'Por favor, inicialize o terminal primeiro');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await doPayment({
        amount: 10000, // R$ 100.00
        type: PaymentType.CREDIT,
        installmentType: InstallmentType.BUYER_INSTALLMENT,
        installments: 3,
      });
      setLastPayment(result);

      if (result.result === ErrorCode.OK) {
        Alert.alert(
          '✅ Pagamento Aprovado',
          `Pagamento parcelado realizado com sucesso!\nCódigo: ${result.transactionCode}\nValor: R$ 100,00 (3x)`
        );
      } else {
        Alert.alert(
          '❌ Pagamento Negado',
          result.message || 'Transação falhou'
        );
      }
    } catch (e: any) {
      Alert.alert('❌ Erro', e.message);
    }
    setIsProcessing(false);
  };

  // Generate PIX QR code
  const handleGeneratePix = async () => {
    try {
      const qrString = await generatePixQRCode(5000); // R$ 50.00
      Alert.alert('Código QR PIX', qrString);
    } catch (e: any) {
      Alert.alert('❌ Erro PIX', e.message);
    }
  };

  // Refund last payment
  const handleRefund = async () => {
    if (!lastPayment?.transactionCode || !lastPayment.transactionId) {
      Alert.alert('⚠️ Aviso', 'Nenhuma transação para estornar');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await refundPayment({
        transactionCode: lastPayment.transactionCode,
        transactionId: lastPayment.transactionId,
      });

      if (result.result === ErrorCode.OK) {
        Alert.alert(
          '✅ Estorno Realizado',
          `Código: ${result.transactionCode}`
        );
        setLastPayment(null);
      } else {
        Alert.alert('❌ Estorno Falhou', result.message || 'Estorno falhou');
      }
    } catch (e: any) {
      Alert.alert('❌ Erro', e.message);
    }
    setIsProcessing(false);
  };

  const getEventColor = (code: number) => {
    if (code >= 1001 && code <= 1004) return '#007AFF'; // Card events - Blue
    if (code >= 1010 && code <= 1012) return '#FF9500'; // Password events - Orange
    if (code >= 1020 && code <= 1023) return '#FFCC02'; // Processing - Yellow
    if (code >= 1030 && code <= 1032) return '#34C759'; // Terminal response - Green
    if (code >= 1040 && code <= 1043) return '#FF3B30'; // Errors - Red
    return '#8E8E93'; // Default - Gray
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Demo PlugPag Nitro</Text>
        <Text style={styles.subtitle}>Terminal: {terminalSerial}</Text>
        <Text style={styles.status}>
          Status: {isInitialized ? '✅ Pronto' : '❌ Não Inicializado'}
        </Text>
      </View>

      {paymentEvent.code > 0 && (
        <View
          style={[
            styles.eventContainer,
            { backgroundColor: getEventColor(paymentEvent.code) },
          ]}
        >
          <Text style={styles.eventText}>{paymentEvent.message}</Text>
          <Text style={styles.eventCode}>Code: {paymentEvent.code}</Text>
          {paymentEvent.customMessage && (
            <Text style={styles.eventCustom}>{paymentEvent.customMessage}</Text>
          )}
        </View>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>Processando...</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, !isInitialized && styles.primaryButton]}
        onPress={handleInitialize}
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>Inicializar Terminal</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreditPayment}
        disabled={isProcessing || !isInitialized}
      >
        <Text style={styles.buttonText}>Pagamento Crédito - R$ 25,00</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleDebitPayment}
        disabled={isProcessing || !isInitialized}
      >
        <Text style={styles.buttonText}>Pagamento Débito - R$ 15,00</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleInstallmentPayment}
        disabled={isProcessing || !isInitialized}
      >
        <Text style={styles.buttonText}>
          Pagamento Parcelado - R$ 100,00 (3x)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleGeneratePix}>
        <Text style={styles.buttonText}>Gerar QR PIX - R$ 50,00</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.refundButton]}
        onPress={handleRefund}
        disabled={isProcessing || !lastPayment}
      >
        <Text style={styles.buttonText}>Estornar Última Transação</Text>
      </TouchableOpacity>

      {lastPayment && (
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>Última Transação</Text>
          <Text>Código: {lastPayment.transactionCode}</Text>
          <Text>ID: {lastPayment.transactionId}</Text>
          <Text>
            Status:{' '}
            {lastPayment.result === ErrorCode.OK ? '✅ Aprovado' : '❌ Negado'}
          </Text>
          {lastPayment.hostNsu && <Text>NSU: {lastPayment.hostNsu}</Text>}
          {lastPayment.cardBrand && (
            <Text>Bandeira: {lastPayment.cardBrand}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  eventText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventCode: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  eventCustom: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
    fontStyle: 'italic',
  },
  processingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#34C759',
  },
  refundButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
