# 🚀 React Native PlugPag Nitro

High-performance PagSeguro PlugPag integration for React Native with TypeScript support and real-time events.

[![npm](https://img.shields.io/npm/v/react-native-plugpag-nitro)](https://www.npmjs.com/package/react-native-plugpag-nitro)
[![license](https://img.shields.io/npm/l/react-native-plugpag-nitro)](LICENSE)
[![Built with Nitro](https://img.shields.io/badge/Built%20with-Nitro%20Modules-purple)](https://nitro.margelo.com/)

**Features**: TypeScript-first • Real-time Events • High Performance JSI • Credit/Debit/PIX Support

## Installation

```bash
npm install react-native-plugpag-nitro react-native-nitro-modules
```

> Requires React Native ≥ 0.72, Android API ≥ 21

## Quick Start

```typescript
import {
  initializeAndActivatePinPad,
  doPayment,
  generatePixQRCode,
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

## API Reference

### Core Functions

#### `doPayment(options)`
Process payments with type-safe enums.

```typescript
const result = await doPayment({
  amount: 2500,                    // Amount in cents
  type: PaymentType.CREDIT,        // CREDIT | DEBIT | VOUCHER | PIX
  installmentType?: InstallmentType.BUYER_INSTALLMENT, // Optional
  installments?: 3,                // Optional
  printReceipt?: true             // Optional
});
```

#### `generatePixQRCode(amount, userReference?)`
Generate PIX QR code string.

```typescript
const qrString = await generatePixQRCode(2500); // R$ 25.00
```

#### `useTransactionEvent()`
Real-time payment event monitoring hook.

```typescript
const paymentEvent = useTransactionEvent();
// Returns: { code: number, message: string, customMessage?: string }
```

### Enums

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
```

### Other Functions

- `initializeAndActivatePinPad(code)` - Initialize terminal
- `refundPayment({ transactionCode, transactionId })` - Refund transaction
- `getTerminalSerialNumber()` - Get terminal serial
- `doAbort()` - Abort current transaction
- `print(filePath)` - Print receipt from file
```

## Error Handling

```typescript
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

## Contributing

```bash
git clone https://github.com/mCodex/react-native-plugpag-nitro.git
cd react-native-plugpag-nitro
yarn install
yarn example android
```

## License

MIT - see [LICENSE](LICENSE) for details.

## Links

- [📚 Nitro Modules](https://nitro.margelo.com/)
- [🏢 PagSeguro PlugPag](https://dev.pagseguro.uol.com.br/)
- [🐛 Issues](https://github.com/mCodex/react-native-plugpag-nitro/issues)

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

#### `generatePixQRCode(amount: number, userReference?: string)`
Generates a PIX QR code string for payment.

```typescript
const qrString = await generatePixQRCode(2500); // R$ 25.00
// Returns the PIX QR code string to display/use
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
#### `useTransactionEvent()`
Real-time payment event monitoring hook to track status updates during transactions.

```typescript
const paymentEvent = useTransactionEvent();

useEffect(() => {
  if (paymentEvent.code > 0) {
    console.log('Payment event:', paymentEvent.eventName);
  }
}, [paymentEvent]);
```

### 🎣 React Hooks
#### `useTransactionEvent()`
Real-time payment event monitoring hook to track status updates during transactions.

```typescript
const paymentEvent = useTransactionEvent();

// paymentEvent contains:
// {
//   code: PaymentEventCode,    // Event code
//   message: string,           // Event message
//   customMessage?: string     // Custom message if any
// }

useEffect(() => {
  if (paymentEvent.code > 0) {
    console.log('Payment event:', paymentEvent.message);
  }
}, [paymentEvent]);
```

### 🔧 Utility Functions

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

---

## 💡 Usage Examples

### Real-time Event Monitoring with Payment

```typescript
import React, { useState, useEffect } from 'react';
import {
  PaymentType,
  ErrorCode,
  doPayment,
  useTransactionEvent,
  initializeAndActivatePinPad,
  generatePixQRCode
} from 'react-native-plugpag-nitro';

function PaymentScreen() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentEvent = useTransactionEvent();

  // Initialize terminal on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await initializeAndActivatePinPad('403938');
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

  const handlePixPayment = async () => {
    try {
      const qrString = await generatePixQRCode(5000); // R$ 50.00
      Alert.alert('PIX QR Code', qrString);
    } catch (error) {
      Alert.alert('PIX Error', error.message);
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
      
      <Button 
        title="Generate PIX QR R$ 50.00"
        onPress={handlePixPayment}
        disabled={!isInitialized}
      />
    </View>
  );
}
```

### Error Handling

```typescript
import { ErrorCode, doPayment, PaymentType } from 'react-native-plugpag-nitro';

try {
  const result = await doPayment({ amount: 2500, type: PaymentType.CREDIT });
  
  if (result.result !== ErrorCode.OK) {
    switch (result.result) {
      case ErrorCode.OPERATION_ABORTED:
        Alert.alert('Cancelled', 'Payment was cancelled by user');
        break;
      case ErrorCode.COMMUNICATION_ERROR:
        Alert.alert('Connection Error', 'Check terminal connection');
        break;
      default:
        Alert.alert('Payment Failed', result.message || 'Unknown error');
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
