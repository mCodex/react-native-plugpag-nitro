import { ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useTransactionEvent } from 'react-native-plugpag-nitro';
import { theme } from './constants/theme';
import { usePaymentOperations } from './hooks/usePaymentOperations';
import {
  Header,
  PaymentEvent,
  LoadingIndicator,
  PaymentButtons,
  TransactionInfo,
} from './components';

export default function App() {
  const {
    isProcessing,
    isInitialized,
    terminalSerial,
    lastPayment,
    handleInitialize,
    handlePayment,
    handleRefund,
  } = usePaymentOperations();

  // Real-time payment events
  const paymentEvent = useTransactionEvent();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Header terminalSerial={terminalSerial} isInitialized={isInitialized} />

        <PaymentEvent
          code={paymentEvent.code}
          message={paymentEvent.message}
          customMessage={paymentEvent.customMessage}
        />

        <LoadingIndicator visible={isProcessing} />

        <PaymentButtons
          isInitialized={isInitialized}
          isProcessing={isProcessing}
          hasLastPayment={!!lastPayment}
          onInitialize={handleInitialize}
          onPayment={handlePayment}
          onRefund={handleRefund}
        />

        <TransactionInfo transaction={lastPayment} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});
