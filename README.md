# 🚀 React Native PlugPag Nitro

**High-performance PagSeguro PlugPag integration with TypeScript-first enum-based API**

[![npm version](https://img.shields.io/npm/v/react-native-plugpag-nitro?style=for-the-badge&color=brightgreen)](https://www.npmjs.com/package/react-native-plugpag-nitro)
[![npm downloads](https://img.shields.io/npm/dm/react-native-plugpag-nitro?style=for-the-badge&color=blue)](https://www.npmjs.com/package/react-native-plugpag-nitro)
[![license](https://img.shields.io/npm/l/react-native-plugpag-nitro?style=for-the-badge&color=orange)](https://github.com/mCodex/react-native-plugpag-nitro/blob/main/LICENSE)
[![Built with Nitro](https://img.shields.io/badge/Built%20with-Nitro%20Modules-purple?style=for-the-badge)](https://nitro.margelo.com/)

---

## ✨ Features

> **Built with [Nitro Modules](https://nitro.margelo.com/) for **~10x faster** performance than traditional bridges**

- 🔥 **High Performance** - Direct JSI bindings, zero-copy data transfer
- 🎯 **TypeScript Enums** - Type-safe payment types, installment types, and error codes
- 💰 **All Payment Types** - Credit, Debit, PIX, and Voucher support
- 📱 **Real-time Events** - Payment progress monitoring with event hooks
- 🎣 **React Hooks** - Modern hook-based API for seamless integration
- 📱 **Android Focused** - Optimized for PlugPag terminals
- 🛡️ **TypeScript Native** - Full type safety and IntelliSense support
- ⚡ **Simple API** - Clean function-based approach with payment presets

---

## 🚀 Quick Start

```bash
npm install react-native-plugpag-nitro
```

> **Requirements**: React Native ≥ 0.72, Android API ≥ 21

### Simple Enum-Based Approach

```typescript
import {
  PaymentType,
  InstallmentType,
  ErrorCode,
  doPayment,
  initializeAndActivatePinPad,
  PaymentPresets,
  isTransactionSuccessful
} from 'react-native-plugpag-nitro';

// Initialize terminal once
await initializeAndActivatePinPad('your-activation-code');

// Simple credit payment using presets
const result = await doPayment(PaymentPresets.creditCard(2500, 1));

// Or use enum types directly for custom payments
const customPayment = await doPayment({
  amount: 5000, // R$ 50.00
  type: PaymentType.CREDIT,
  installmentType: InstallmentType.BUYER_INSTALLMENT,
  installments: 3,
  printReceipt: true,
  userReference: 'order-123'
});

if (isTransactionSuccessful(result)) {
  console.log('Payment approved!', result);
}
```

### Modern Hook-Based Approach

```typescript
import {
  PaymentType,
  usePaymentFlow,
  useTransactionPaymentEvent,
  PaymentPresets
} from 'react-native-plugpag-nitro';

function PaymentComponent() {
  const paymentFlow = usePaymentFlow();
  const paymentEvent = useTransactionPaymentEvent();

  const handlePayment = async () => {
    try {
      const result = await paymentFlow.executePayment(
        PaymentPresets.creditCard(2500, 1)
      );
      
      if (paymentFlow.isTransactionSuccessful) {
        console.log('Payment successful!', result);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <View>
      <Button 
        title="Pay R$ 25.00" 
        onPress={handlePayment}
        disabled={paymentFlow.isProcessing}
      />
      
      {paymentEvent.code > 0 && (
        <Text>Status: {paymentEvent.eventName}</Text>
      )}
      
      {paymentFlow.isProcessing && <ActivityIndicator />}
    </View>
  );
}
```

---

## 📚 API Reference

### 🔧 Enums

#### PaymentType
```typescript
enum PaymentType {
  CREDIT = 1,   // Credit card
  DEBIT = 2,    // Debit card  
  VOUCHER = 3,  // Voucher/meal card
  PIX = 5       // PIX instant payment
}
```

#### InstallmentType
```typescript
enum InstallmentType {
  NO_INSTALLMENT = 1,        // À vista (no installments)
  SELLER_INSTALLMENT = 2,    // Parcelado pelo vendedor
  BUYER_INSTALLMENT = 3      // Parcelado pelo comprador
}
```

#### ErrorCode
```typescript
enum ErrorCode {
  OK = 0,                    // Success
  OPERATION_ABORTED = -1,    // Operation aborted
  AUTHENTICATION_FAILED = -2, // Authentication failed
  COMMUNICATION_ERROR = -3,   // Communication error
  NO_PRINTER_DEVICE = -4,    // No printer device
  NO_TRANSACTION_DATA = -5   // No transaction data
}
```

#### PaymentEventCode
```typescript
enum PaymentEventCode {
  CARD_INSERTED = 1,         // Card inserted
  CARD_REMOVED = 2,          // Card removed
  WAITING_CARD = 3,          // Waiting for card
  CARD_READ = 4,             // Card read successfully
  PAYMENT_PROCESSING = 5,    // Payment processing
  PAYMENT_COMPLETED = 6,     // Payment completed
  PAYMENT_CANCELLED = 7,     // Payment cancelled
  // ... and more event codes
}
```

### 💳 Core Functions

#### `initializeAndActivatePinPad(activationCode: string)`
Initializes and activates the PlugPag terminal.

```typescript
const result = await initializeAndActivatePinPad('403938');
// Returns: { result: ErrorCode, errorCode?: string, errorMessage?: string }
```

#### `doPayment(options: PaymentOptions)`
Processes a payment transaction.

```typescript
interface PaymentOptions {
  amount: number;                    // Amount in cents
  type: PaymentType;                // Payment type enum
  installmentType?: InstallmentType; // Installment type enum
  installments?: number;            // Number of installments (default: 1)
  printReceipt?: boolean;           // Print receipt (default: true)
  userReference?: string;           // User reference (default: auto-generated)
}

const result = await doPayment({
  amount: 2500,
  type: PaymentType.CREDIT,
  installmentType: InstallmentType.NO_INSTALLMENT,
  installments: 1,
  printReceipt: true,
  userReference: 'payment-001'
});
```

#### `doPaymentWithEvents(options: PaymentOptions)`
Processes a payment with real-time event monitoring.

```typescript
const result = await doPaymentWithEvents({
  amount: 2500,
  type: PaymentType.CREDIT,
  installmentType: InstallmentType.NO_INSTALLMENT
});
// Events are automatically tracked via useTransactionPaymentEvent hook
```

#### `refundPayment(options)`
Refunds a previous payment transaction.

```typescript
const result = await refundPayment({
  transactionCode: 'abc123',
  transactionId: 'def456',
  printReceipt: true
});
```

### 🎣 React Hooks

#### `usePaymentFlow()`
Comprehensive payment hook with built-in state management and event tracking.

```typescript
const {
  isProcessing,           // boolean - payment in progress
  currentTransaction,     // PlugpagTransactionResult | null
  paymentEvent,          // Current payment event
  executePayment,        // Function to execute payment
  resetFlow,            // Reset flow state
  isTransactionSuccessful, // boolean - transaction success status
  transactionError      // string | null - error message
} = usePaymentFlow();

// Usage
const handlePayment = async () => {
  try {
    const result = await executePayment({
      amount: 2500,
      type: PaymentType.CREDIT
    });
    
    if (isTransactionSuccessful) {
      console.log('Payment successful!');
    }
  } catch (error) {
    console.error('Payment failed:', transactionError);
  }
};
```

#### `useTransactionPaymentEvent()`
Real-time payment event monitoring hook.

```typescript
const paymentEvent = useTransactionPaymentEvent();

// paymentEvent contains:
// {
//   code: number,           // PaymentEventCode
//   eventName?: string,     // Human-readable event name
//   userReference?: string, // User reference
//   amount?: string,        // Amount
//   resetEvent?: () => void // Function to reset event
// }

// Usage in component
useEffect(() => {
  if (paymentEvent.code > 0) {
    console.log('Payment event:', paymentEvent.eventName);
  }
}, [paymentEvent]);
```

### 🎯 Payment Presets

Quick payment setup with predefined configurations:

```typescript
// Credit card payments
PaymentPresets.creditCard(amount, installments?)
PaymentPresets.creditCard(10000, 3) // R$ 100.00 in 3x

// Debit card
PaymentPresets.debitCard(2500) // R$ 25.00

// PIX payments  
PaymentPresets.pix(5000) // R$ 50.00

// Voucher
PaymentPresets.voucher(1500) // R$ 15.00
```

### 🔧 Utility Functions

```typescript
// Check if transaction was successful
isTransactionSuccessful(result: PlugpagTransactionResult): boolean

// Get error message from result
getTransactionError(result: PlugpagTransactionResult): string | null

// Get terminal serial number
getTerminalSerialNumber(): string

// Get available constants
getConstants(): PlugpagConstants

// Abort current transaction
doAbort(): Promise<PlugpagAbortResult>

// Print custom receipt from file
print(filePath: string): Promise<void>

// Reprint last customer receipt
reprintCustomerReceipt(): Promise<void>
```

---

## 💡 Usage Examples

### Hook-Based Payment Flow (Recommended)

```typescript
import React, { useState, useEffect } from 'react';
import {
  PaymentType,
  InstallmentType,
  PaymentEventCode,
  usePaymentFlow,
  useTransactionPaymentEvent,
  PaymentPresets,
  initializeAndActivatePinPad
} from 'react-native-plugpag-nitro';

function ModernPaymentScreen() {
  const [isInitialized, setIsInitialized] = useState(false);
  const paymentFlow = usePaymentFlow();
  const paymentEvent = useTransactionPaymentEvent();

  // Initialize terminal on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await initializeAndActivatePinPad('403938');
        if (result.result === 0) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };
    
    initialize();
  }, []);

  // Monitor payment events
  useEffect(() => {
    if (paymentEvent.code > 0) {
      console.log('Payment event:', paymentEvent.eventName);
      
      // Handle specific events
      switch (paymentEvent.code) {
        case PaymentEventCode.CARD_INSERTED:
          console.log('Card inserted, please wait...');
          break;
        case PaymentEventCode.PAYMENT_PROCESSING:
          console.log('Processing payment...');
          break;
        case PaymentEventCode.PAYMENT_COMPLETED:
          console.log('Payment completed!');
          break;
      }
    }
  }, [paymentEvent]);

  const handleCreditPayment = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Terminal not initialized');
      return;
    }

    try {
      const result = await paymentFlow.executePayment({
        amount: 2500, // R$ 25.00
        type: PaymentType.CREDIT,
        installmentType: InstallmentType.NO_INSTALLMENT,
        userReference: `payment-${Date.now()}`
      });

      if (paymentFlow.isTransactionSuccessful) {
        Alert.alert('Success', 'Payment approved!', [
          { text: 'OK', onPress: () => paymentFlow.resetFlow() }
        ]);
      } else {
        Alert.alert('Failed', paymentFlow.transactionError || 'Payment failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePixPayment = async () => {
    try {
      const result = await paymentFlow.executePayment(
        PaymentPresets.pix(5000) // R$ 50.00
      );
      
      if (paymentFlow.isTransactionSuccessful) {
        Alert.alert('PIX Success', 'PIX payment completed!');
      }
    } catch (error) {
      Alert.alert('PIX Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Terminal: {isInitialized ? '✅ Ready' : '❌ Not Ready'}
      </Text>
      
      {/* Payment Event Display */}
      {paymentEvent.code > 0 && (
        <View style={{ padding: 10, backgroundColor: '#e3f2fd', marginBottom: 10 }}>
          <Text>Status: {paymentEvent.eventName}</Text>
        </View>
      )}
      
      {/* Processing Indicator */}
      {paymentFlow.isProcessing && (
        <View style={{ padding: 10, backgroundColor: '#fff3e0', marginBottom: 10 }}>
          <ActivityIndicator size="small" />
          <Text>Processing payment...</Text>
        </View>
      )}
      
      <Button 
        title="Credit Card R$ 25.00"
        onPress={handleCreditPayment}
        disabled={!isInitialized || paymentFlow.isProcessing}
      />
      
      <Button 
        title="PIX R$ 50.00"
        onPress={handlePixPayment}
        disabled={!isInitialized || paymentFlow.isProcessing}
      />
      
      {/* Transaction Result Display */}
      {paymentFlow.currentTransaction && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f5f5f5' }}>
          <Text style={{ fontWeight: 'bold' }}>Last Transaction:</Text>
          <Text>Code: {paymentFlow.currentTransaction.transactionCode}</Text>
          <Text>Amount: R$ {(parseInt(paymentFlow.currentTransaction.amount) / 100).toFixed(2)}</Text>
          <Text>Status: {paymentFlow.isTransactionSuccessful ? '✅ Approved' : '❌ Declined'}</Text>
          <Text>Date: {paymentFlow.currentTransaction.date} {paymentFlow.currentTransaction.time}</Text>
        </View>
      )}
    </View>
  );
}
```

### Basic Payment Flow (Function-Based)

```typescript
import React, { useState } from 'react';
import {
  PaymentType,
  InstallmentType,
  ErrorCode,
  doPayment,
  doPaymentWithEvents,
  initializeAndActivatePinPad,
  isTransactionSuccessful,
  getTransactionError,
  PaymentPresets
} from 'react-native-plugpag-nitro';

function BasicPaymentScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);

  const handleInitialize = async () => {
    try {
      const result = await initializeAndActivatePinPad('403938');
      if (result.result === ErrorCode.OK) {
        Alert.alert('Success', 'Terminal activated successfully!');
      } else {
        Alert.alert('Error', result.errorMessage || 'Failed to activate terminal');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCreditPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Using preset for simplicity
      const result = await doPayment(PaymentPresets.creditCard(2500, 1));
      setLastPayment(result);

      if (isTransactionSuccessful(result)) {
        Alert.alert('Success', 'Payment approved!');
      } else {
        const errorMessage = getTransactionError(result);
        Alert.alert('Payment Failed', errorMessage || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentWithEvents = async () => {
    try {
      setIsProcessing(true);
      
      // Payment with automatic event tracking
      const result = await doPaymentWithEvents({
        amount: 5000, // R$ 50.00
        type: PaymentType.CREDIT,
        installmentType: InstallmentType.BUYER_INSTALLMENT,
        installments: 3
      });

      if (isTransactionSuccessful(result)) {
        Alert.alert('Success', 'Payment with events completed!');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Initialize Terminal" onPress={handleInitialize} />
      
      <Button 
        title={isProcessing ? 'Processing...' : 'Credit Payment R$ 25.00'}
        onPress={handleCreditPayment}
        disabled={isProcessing}
      />
      
      <Button 
        title="Payment with Events R$ 50.00 (3x)"
        onPress={handlePaymentWithEvents}
        disabled={isProcessing}
      />
      
      {lastPayment && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text>Last Transaction:</Text>
          <Text>Code: {lastPayment.transactionCode}</Text>
          <Text>Amount: {lastPayment.amount}</Text>
          <Text>Status: {isTransactionSuccessful(lastPayment) ? 'Approved' : 'Declined'}</Text>
        </View>
      )}
    </View>
  );
}
```

### Real-time Event Monitoring

```typescript
import { useTransactionPaymentEvent, PaymentEventCode } from 'react-native-plugpag-nitro';

function PaymentEventMonitor() {
  const paymentEvent = useTransactionPaymentEvent();

  const getEventColor = (code: number) => {
    if (code >= PaymentEventCode.CARD_INSERTED && code <= PaymentEventCode.WAITING_CARD) {
      return '#007AFF'; // Blue for card events
    } else if (code === PaymentEventCode.PAYMENT_PROCESSING) {
      return '#FF9500'; // Orange for processing
    } else if (code === PaymentEventCode.PAYMENT_COMPLETED) {
      return '#34C759'; // Green for success
    }
    return '#8E8E93'; // Gray for others
  };

  return (
    <View>
      {paymentEvent.code > 0 && (
        <View style={{
          padding: 10,
          backgroundColor: getEventColor(paymentEvent.code),
          borderRadius: 8,
          marginVertical: 5
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {paymentEvent.eventName || `Event Code: ${paymentEvent.code}`}
          </Text>
          {paymentEvent.amount && (
            <Text style={{ color: 'white' }}>Amount: {paymentEvent.amount}</Text>
          )}
        </View>
      )}
    </View>
  );
}
```

### PIX Payment Example

```typescript
const handlePixPayment = async () => {
  try {
    const result = await doPayment({
      amount: 2500,
      type: PaymentType.PIX,
      installmentType: InstallmentType.NO_INSTALLMENT,
      printReceipt: true,
      userReference: 'pix-payment-001'
    });

    if (isTransactionSuccessful(result)) {
      Alert.alert('PIX Success', 'PIX payment completed!');
    }
  } catch (error) {
    Alert.alert('PIX Error', error.message);
  }
};
```

---

## 🚨 Error Handling

```typescript
import { 
  isTransactionSuccessful, 
  getTransactionError, 
  ErrorCode 
} from 'react-native-plugpag-nitro';

try {
  const result = await doPayment(PaymentPresets.creditCard(2500));
  
  if (!isTransactionSuccessful(result)) {
    const errorMessage = getTransactionError(result);
    
    switch (result.result) {
      case ErrorCode.OPERATION_ABORTED:
        Alert.alert('Cancelled', 'Payment was cancelled by user');
        break;
      case ErrorCode.COMMUNICATION_ERROR:
        Alert.alert('Connection Error', 'Check terminal connection');
        break;
      default:
        Alert.alert('Payment Failed', errorMessage || 'Unknown error');
    }
    return;
  }
  
  Alert.alert('Success', 'Payment approved!');
} catch (error) {
  console.error('Payment error:', error);
  Alert.alert('Error', error.message || 'Payment failed');
}
```

---

## 🤝 Contributing

```bash
git clone https://github.com/mCodex/react-native-plugpag-nitro.git
cd react-native-plugpag-nitro
yarn install
yarn prepare
yarn example android
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- [📚 Nitro Modules](https://nitro.margelo.com/)
- [🏢 PagSeguro PlugPag](https://dev.pagseguro.uol.com.br/)
- [🐛 Issues](https://github.com/mCodex/react-native-plugpag-nitro/issues)

---

<div align="center">
  <p><strong>Built with ❤️ using Nitro Modules</strong></p>
  <p><em>Making React Native payment processing faster and more type-safe</em></p>
</div>
