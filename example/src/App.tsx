import { useState, useEffect } from 'react';
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
  initializeAndActivatePinPad,
  refundPayment,
  getTerminalSerialNumber,
  plugPag,
  type PlugpagTransactionResult,
} from 'react-native-plugpag-nitro';

export default function App() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastPayment, setLastPayment] =
    useState<PlugpagTransactionResult | null>(null);
  const [terminalSerial, setTerminalSerial] = useState<string>('');

  const eventPayment = useTransactionPaymentEvent();

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

  async function handleInitializeAndActivatePinPad() {
    try {
      const data = await initializeAndActivatePinPad('403938');

      if (data.result !== 0) {
        Alert.alert(
          'Erro ao ativar terminal',
          data.errorMessage || 'Unknown error'
        );
        return;
      }

      Alert.alert('Terminal ativado com sucesso!');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro ao ativar terminal');
    }
  }

  async function handleDoPaymentCreditType() {
    try {
      setIsModalVisible(true);

      const data = await doPayment({
        amount: 2500,
        type: plugPag.paymentTypes.CREDIT,
        printReceipt: true,
        installments: 1,
        installmentType: plugPag.installmentTypes.BUYER_INSTALLMENT,
        userReference: 'test-credit',
      });

      setLastPayment(data);
      setIsModalVisible(false);

      Alert.alert('Transação concluída com sucesso');
    } catch (error) {
      console.error(error);
      setIsModalVisible(false);
      Alert.alert('Erro ao concluir transação');
    }
  }

  async function handleDoPaymentDebitType() {
    try {
      setIsModalVisible(true);

      const data = await doPayment({
        amount: 2500,
        type: plugPag.paymentTypes.DEBIT,
        printReceipt: true,
        installments: 1,
        installmentType: plugPag.installmentTypes.NO_INSTALLMENT,
        userReference: 'test-debit',
      });

      setLastPayment(data);
      setIsModalVisible(false);

      Alert.alert('Transação concluída com sucesso');
    } catch (error) {
      console.error(error);
      setIsModalVisible(false);
      Alert.alert('Erro ao concluir transação');
    }
  }

  async function handleRefundLastTransaction() {
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

      if (response.result !== 0) {
        Alert.alert('Estorno', 'Ocorreu um erro ao efetuar estorno');
        return;
      }

      Alert.alert('Estorno efetuado com sucesso');
      setLastPayment(null);
    } catch (error) {
      console.error(error);
      setIsModalVisible(false);
      Alert.alert('Estorno', 'Ocorreu um erro ao efetuar estorno');
    }
  }

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

      <TouchableOpacity
        onPress={handleDoPaymentCreditType}
        style={[styles.button, styles.space]}
      >
        <Text style={styles.textButton}>Pagar R$ 25 no crédito</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDoPaymentDebitType}
        style={[styles.button, styles.space]}
      >
        <Text style={styles.textButton}>Pagar R$ 25 no débito</Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={!lastPayment?.transactionId}
        onPress={handleRefundLastTransaction}
        style={[
          styles.button,
          styles.space,
          !lastPayment?.transactionId && styles.disabledButton,
        ]}
      >
        <Text style={styles.textButton}>Estornar última transação</Text>
      </TouchableOpacity>

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
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00DDFC',
  },
  textButton: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#00DDFC',
  },
  space: {
    marginBottom: 12,
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
});
