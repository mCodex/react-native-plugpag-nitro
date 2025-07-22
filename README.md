# react-native-plugpag-nitro

<div align="center">
  <h3>🚀 High-performance PagSeguro PlugPag integration for React Native</h3>
  <p>TypeScript-first payment processing with real-time events and JSI performance</p>
  
  [![npm version](https://img.shields.io/npm/v/react-native-plugpag-nitro)](https://www.npmjs.com/package/react-native-plugpag-nitro)
  [![npm downloads](https://img.shields.io/npm/dm/react-native-plugpag-nitro)](https://www.npmjs.com/package/react-native-plugpag-nitro)
  [![license](https://img.shields.io/npm/l/react-native-plugpag-nitro)](LICENSE)
  [![Built with Nitro](https://img.shields.io/badge/Built%20with-Nitro%20Modules-purple)](https://nitro.margelo.com/)
</div>

## ✨ Features

- 🚀 **High Performance** - Built with Nitro Modules for JSI performance
- 📘 **TypeScript First** - Complete type safety and IntelliSense support
- ⚡ **Real-time Events** - Monitor payment status with React hooks
- 💳 **Multiple Payment Types** - Credit, Debit, Voucher, and PIX support
- 🔄 **Transaction Management** - Payment, refund, and cancellation support
- 🖨️ **Receipt Printing** - Integrated thermal receipt printing
- 🛡️ **Error Handling** - Comprehensive error codes and messages

## 📦 Installation

```bash
npm install react-native-plugpag-nitro react-native-nitro-modules
```

### Requirements

- React Native ≥ 0.72
- Android API ≥ 21
- PagSeguro PlugPag terminal

## 🚀 Quick Start

```typescript
import {
  initializeAndActivatePinPad,
  doPayment,
  useTransactionEvent,
  PaymentType,
  ErrorCode
} from 'react-native-plugpag-nitro';

function PaymentScreen() {
  const paymentEvent = useTransactionEvent();

  const handlePayment = async () => {
    // Initialize terminal
    await initializeAndActivatePinPad('YOUR_ACTIVATION_CODE');
    
    // Process payment
    const result = await doPayment({
      amount: 2500, // R$ 25.00 in cents
      type: PaymentType.CREDIT
    });

    if (result.result === ErrorCode.OK) {
      console.log('Payment approved!', result);
    }
  };

  return (
    <View>
      {/* Real-time payment events */}
      {paymentEvent.code > 0 && (
        <Text>Status: {paymentEvent.message}</Text>
      )}
      
      <Button title="Pay R$ 25.00" onPress={handlePayment} />
    </View>
  );
}
```

## 📚 API Reference

### Core Functions

#### `initializeAndActivatePinPad(activationCode: string)`

Initializes and activates the PlugPag terminal.

```typescript
const result = await initializeAndActivatePinPad('YOUR_ACTIVATION_CODE');
// Returns: { result: ErrorCode, errorCode?: string, errorMessage?: string }
```

#### `doPayment(options: PaymentOptions)`

Process payments with type-safe enums.

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
  amount: 2500,                    // Amount in cents
  type: PaymentType.CREDIT,        // CREDIT | DEBIT | VOUCHER | PIX
  installmentType: InstallmentType.BUYER_INSTALLMENT, // Optional
  installments: 3,                 // Optional
  printReceipt: true              // Optional
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

### React Hooks

#### `useTransactionEvent()`

Real-time payment event monitoring hook.

```typescript
const paymentEvent = useTransactionEvent();
// Returns: { code: number, message: string, customMessage?: string }

useEffect(() => {
  if (paymentEvent.code > 0) {
    console.log('Payment event:', paymentEvent.message);
  }
}, [paymentEvent]);
```

### Utility Functions

```typescript
// Get terminal serial number
getTerminalSerialNumber(): string

// Get available constants
getConstants(): PlugpagConstants

// Abort current transaction
doAbort(): Promise<PlugpagAbortResult>

// Print custom receipt from file
print(filePath: string): Promise<void>
```

### Type Definitions

```typescript
enum PaymentType {
  CREDIT = 1,   // Credit card
  DEBIT = 2,    // Debit card
  VOUCHER = 3,  // Voucher/meal card
  PIX = 5       // PIX instant payment
}

enum ErrorCode {
  OK = 0,                    // Success
  OPERATION_ABORTED = -1,    // Operation aborted
  COMMUNICATION_ERROR = -3,  // Connection error
  // ... more error codes
}

enum InstallmentType {
  NO_INSTALLMENT = 1,        // No installment
  BUYER_INSTALLMENT = 2,     // Buyer pays installment fee
  SELLER_INSTALLMENT = 3     // Seller pays installment fee
}
```

## 💡 Usage Examples

### Complete Payment Flow

```typescript
import React, { useState, useEffect } from 'react';
import {
  PaymentType,
  ErrorCode,
  doPayment,
  useTransactionEvent,
  initializeAndActivatePinPad
} from 'react-native-plugpag-nitro';

function PaymentScreen() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentEvent = useTransactionEvent();

  // Initialize terminal on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await initializeAndActivatePinPad('YOUR_ACTIVATION_CODE');
        if (result.result === ErrorCode.OK) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };
    
    initialize();
  }, []);

  const handleCreditPayment = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Terminal not initialized');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await doPayment({ 
        amount: 2500, 
        type: PaymentType.CREDIT 
      });

      if (result.result === ErrorCode.OK) {
        Alert.alert('Success', 'Payment approved!');
      } else {
        Alert.alert('Failed', result.message || 'Payment failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Terminal: {isInitialized ? '✅ Ready' : '❌ Not Ready'}</Text>
      
      {/* Real-time Event Display */}
      {paymentEvent.code > 0 && (
        <View style={{ padding: 10, backgroundColor: '#e3f2fd', marginVertical: 10 }}>
          <Text>Status: {paymentEvent.message}</Text>
          <Text>Code: {paymentEvent.code}</Text>
        </View>
      )}
      
      <Button 
        title="Credit Card R$ 25.00"
        onPress={handleCreditPayment}
        disabled={!isInitialized || isProcessing}
      />
    </View>
  );
}
```

## ⚠️ Error Handling

```typescript
import { ErrorCode, doPayment, PaymentType } from 'react-native-plugpag-nitro';

try {
  const result = await doPayment({ amount: 2500, type: PaymentType.CREDIT });
  
  if (result.result !== ErrorCode.OK) {
    // Handle specific errors
    switch (result.result) {
      case ErrorCode.OPERATION_ABORTED:
        console.log('Payment cancelled by user');
        break;
      case ErrorCode.COMMUNICATION_ERROR:
        console.log('Connection error - check terminal');
        break;
      default:
        console.log('Payment failed:', result.message);
    }
    return;
  }
  
  console.log('Payment successful!', result);
} catch (error) {
  console.error('Payment error:', error.message);
}
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/mCodex/react-native-plugpag-nitro.git
cd react-native-plugpag-nitro

# Install dependencies
yarn install

# Setup the example project
yarn example android
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [📚 Nitro Modules Documentation](https://nitro.margelo.com/)
- [🏢 PagSeguro PlugPag Official Docs](https://dev.pagseguro.uol.com.br/)
- [🐛 Report Issues](https://github.com/mCodex/react-native-plugpag-nitro/issues)
- [� Discussions](https://github.com/mCodex/react-native-plugpag-nitro/discussions)

---

<div align="center">
  <p><strong>Built with ❤️ using Nitro Modules</strong></p>
  <p><em>Making React Native payment processing faster and more type-safe</em></p>
</div>
