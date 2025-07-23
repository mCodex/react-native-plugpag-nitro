import { useEffect } from 'react';
import { ScrollView, StyleSheet, StatusBar } from 'react-native';
import {
  useTransactionEvent,
  setStyleTheme,
  PlugPagThemes,
} from 'react-native-plugpag-nitro';
import { theme } from './constants/theme';
import { usePaymentOperations } from './hooks/usePaymentOperations';
import {
  Header,
  PaymentEvent,
  LoadingIndicator,
  PaymentButtons,
  TransactionInfo,
  StyleExample,
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

  // Apply dark theme to match app design on startup
  useEffect(() => {
    const applyAppTheme = async () => {
      try {
        await setStyleTheme(PlugPagThemes.DARK_THEME);
      } catch (error) {
        console.warn('Failed to apply theme:', error);
      }
    };

    applyAppTheme();
  }, []);

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

        <StyleExample
          onThemeApplied={(themeName) =>
            console.log(`Applied theme: ${themeName}`)
          }
        />
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
