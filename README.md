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

#### `refundPayment(options)`
Refunds a previous payment transaction.

```typescript
const result = await refundPayment({
  transactionCode: 'abc123',
  transactionId: 'def456',
  printReceipt: true
});
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
```

---

## 💡 Usage Examples

### Basic Payment Flow

```typescript
import React, { useState } from 'react';
import {
  PaymentType,
  InstallmentType,
  ErrorCode,
  doPayment,
  initializeAndActivatePinPad,
  isTransactionSuccessful,
  getTransactionError,
  PaymentPresets
} from 'react-native-plugpag-nitro';

function PaymentScreen() {
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
      const paymentOptions = PaymentPresets.creditCard(2500, 1);
      const result = await doPayment({
        ...paymentOptions,
        userReference: 'order-12345'
      });

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

  const handleCustomPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Custom payment with enum types
      const result = await doPayment({
        amount: 5000, // R$ 50.00
        type: PaymentType.CREDIT,
        installmentType: InstallmentType.BUYER_INSTALLMENT,
        installments: 3,
        printReceipt: true,
        userReference: 'custom-payment-3x'
      });

      if (isTransactionSuccessful(result)) {
        Alert.alert('Success', 'Custom payment approved!');
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
        title="Custom 3x Payment R$ 50.00"
        onPress={handleCustomPayment}
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

### Multiple Payment Types

```typescript
const paymentTypes = [
  {
    title: '💳 Credit Card',
    preset: PaymentPresets.creditCard(2500, 1),
    color: '#007AFF'
  },
  {
    title: '💰 Debit Card', 
    preset: PaymentPresets.debitCard(2500),
    color: '#34C759'
  },
  {
    title: '📱 PIX',
    preset: PaymentPresets.pix(2500),
    color: '#32D74B'
  }
];

const handlePayment = (preset, title) => async () => {
  const result = await doPayment({
    ...preset,
    userReference: `payment-${Date.now()}`
  });
  
  if (isTransactionSuccessful(result)) {
    Alert.alert('Success', `${title} payment approved!`);
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

## 🏗️ Migration from Old API

### Before (number-based)
```typescript
// Old approach with magic numbers
const result = await doPayment({
  amount: 2500,
  type: 1, // What does 1 mean?
  installmentType: 3, // What does 3 mean?
  installments: 1
});
```

### After (enum-based)
```typescript
// New approach with type-safe enums
const result = await doPayment({
  amount: 2500,
  type: PaymentType.CREDIT, // Clear and type-safe
  installmentType: InstallmentType.BUYER_INSTALLMENT, // Self-documenting
  installments: 1
});

// Or use presets for common scenarios
const result = await doPayment(PaymentPresets.creditCard(2500, 1));
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
