import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useTransactionEvent, setStyleTheme } from 'react-native-plugpag-nitro';
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

  // Track if initialization has been attempted to prevent loops
  const initializationAttempted = useRef(false);

  // Auto-initialize terminal and apply theme on startup
  useEffect(() => {
    // Only initialize once and if not already initialized
    if (initializationAttempted.current || isInitialized) {
      return;
    }

    initializationAttempted.current = true;

    const initializeApp = async () => {
      console.log('🚀 Initializing PlugPag Example App...');

      try {
        // First, initialize the terminal
        console.log('📱 Activating terminal...');
        await handleInitialize();

        // After successful activation, apply the custom theme
        console.log('🎨 Applying custom theme...');
        const appDarkTheme = {
          headBackgroundColor: '#0A0A0B',
          headTextColor: '#FFFFFF',
          contentTextColor: '#F3F4F6',
          contentTextValue1Color: '#00D4FF',
          contentTextValue2Color: '#9CA3AF',
          positiveButtonBackground: '#10B981',
          positiveButtonTextColor: '#FFFFFF',
          negativeButtonBackground: '#EF4444',
          negativeButtonTextColor: '#FFFFFF',
          genericButtonBackground: '#1F2937',
          genericButtonTextColor: '#F3F4F6',
          genericSmsEditTextBackground: '#1F2937',
          genericSmsEditTextTextColor: '#F3F4F6',
          lineColor: '#374151',
        };

        await setStyleTheme(appDarkTheme);
        console.log('✅ App initialization complete!');
      } catch (error) {
        console.warn('⚠️ App initialization failed:', error);
        // Reset the flag so user can try manual initialization if needed
        initializationAttempted.current = false;
      }
    };

    initializeApp();
  }, [handleInitialize, isInitialized]); // Include dependencies

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
