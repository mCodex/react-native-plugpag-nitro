<div align="center">
  <h1>🚀 React Native PlugPag Nitro</h1>
  
  <p>
    <strong>High-performance PagSeguro PlugPag integration with flexible UI controls</strong>
  </p>
  
  <p>
    <a href="https://www.npmjs.com/package/react-native-plugpag-nitro">
      <img src="https://img.shields.io/npm/v/react-native-plugpag-nitro?style=for-the-badge&color=brightgreen" alt="npm version" />
    </a>
    <a href="https://www.npmjs.com/package/react-native-plugpag-nitro">
      <img src="https://img.shields.io/npm/dm/react-native-plugpag-nitro?style=for-the-badge&color=blue" alt="npm downloads" />
    </a>
    <a href="https://github.com/mCodex/react-native-plugpag-nitro/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/react-native-plugpag-nitro?style=for-the-badge&color=orange" alt="license" />
    </a>
    <a href="https://nitro.margelo.com/">
      <img src="https://img.shields.io/badge/Built%20with-Nitro%20Modules-purple?style=for-the-badge" alt="Built with Nitro" />
    </a>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/platform-android-brightgreen?style=for-the-badge" alt="Android" />
    <img src="https://img.shields.io/badge/React%20Native-0.72+-blue?style=for-the-badge" alt="React Native" />
    <img src="https://img.shields.io/badge/API%20Level-21+-green?style=for-the-badge" alt="API Level" />
  </p>
</div>

---

## ✨ Features

> **Note**: Built with [Nitro Modules](https://nitro.margelo.com/) for **~10x faster** performance than traditional bridges

- 🔥 **High Performance** - Direct JSI bindings, zero-copy data transfer
- ⚛️ **Hook-First Design** - Modern React patterns with unified `usePayment` hook
- 🎨 **Flexible UI** - Complete payment UI customization with real-time state updates
- 💰 **All Payment Types** - Credit, Debit, PIX, and Voucher support
- ⏹️ **Cancellation Support** - Real-time operation cancellation
- 📱 **Android Focused** - Optimized for PlugPag terminals
- 🛡️ **TypeScript Native** - Full type safety and IntelliSense support

---

## 🚀 Quick Start

```bash
npm install react-native-plugpag-nitro
```

> **Requirements**: React Native ≥ 0.72, Android API ≥ 21, Kotlin ≥ 1.9

### Hook-Based Approach (Recommended)

```typescript
import { usePayment, PaymentPresets, initializeAndActivatePinPad } from 'react-native-plugpag-nitro';

function PaymentComponent() {
  const { doPayment, isProcessing, cancelPayment, canCancel } = usePayment();

  // Initialize terminal once
  await initializeAndActivatePinPad('your-activation-code');

  // Process payment with automatic UI handling
  const handlePayment = async () => {
    const result = await doPayment({
      ...PaymentPresets.credit(2500), // R$ 25,00
      uiConfiguration: {
        messages: { insertCard: 'Insira seu cartão' },
        behavior: { allowCancellation: true }
      }
    });
  };

  return (
    <View>
      <Button title="Pay" onPress={handlePayment} disabled={isProcessing} />
      {canCancel && <Button title="Cancel" onPress={cancelPayment} />}
    </View>
  );
}
```

---

## 📚 API Reference

### Core Functions

<details>
<summary><b>🔧 Terminal Management</b></summary>

#### `initializeAndActivatePinPad(activationCode: string)`
Initializes and activates the PlugPag terminal.

```typescript
const result = await initializeAndActivatePinPad('403938');
// Returns: { result: number, message: string, errorCode?: string }
```

#### `getTerminalSerialNumber()`
Gets the terminal's serial number.

```typescript
const serial = getTerminalSerialNumber(); // Returns: string
```

</details>

<details>
<summary><b>💳 Payment Processing (Hook Approach)</b></summary>

The modern, recommended approach using the `usePayment` hook handles all payment types with unified interface.

```typescript
// All payment types supported
PaymentTypes.CREDIT   // Credit card
PaymentTypes.DEBIT    // Debit card  
PaymentTypes.PIX      // PIX instant payment
PaymentTypes.VOUCHER  // Voucher/meal card

// Example with custom UI
const result = await doPayment({
  ...PaymentPresets.credit(5000, 3), // R$ 50,00 in 3 installments
  uiConfiguration: {
    messages: {
      insertCard: 'Insira seu cartão de crédito',
      processing: 'Processando pagamento...',
      approved: 'Pagamento aprovado!',
      declined: 'Pagamento recusado'
    },
    behavior: {
      showDefaultUI: true,
      allowCancellation: true,
      timeoutSeconds: 120
    },
    styling: {
      primaryColor: '#007AFF',
      backgroundColor: '#F2F2F7'
    }
  }
});
```

#### PIX Payment Example
```typescript
// PIX with optimized UI
const result = await doPayment({
  ...PaymentPresets.pix(2500, 'order-123'),
  uiConfiguration: {
    messages: {
      insertCard: '📱 Aproxime seu celular para PIX',
      processing: '⚡ PIX instantâneo...'
    },
    behavior: { timeoutSeconds: 90 }, // PIX-optimized
    styling: { primaryColor: '#32D74B' } // PIX green
  }
});
```

</details>

<details>
<summary><b>⏹️ Cancellation & Control</b></summary>

Built into the `usePayment` hook - no separate functions needed.

```typescript
const { doPayment, cancelPayment, canCancel, isProcessing } = usePayment();

// Cancel active payment
if (canCancel) {
  const result = await cancelPayment();
  // Returns: { success: boolean, message?: string }
}
```

</details>

### React Hooks

<details>
<summary><b>⚛️ usePayment Hook (Primary API)</b></summary>

The main hook for all payment operations with built-in UI state management and cancellation support.

```typescript
const {
  doPayment,             // Process payment with options
  cancelPayment,         // Cancel active payment
  isProcessing,          // Current processing state
  canCancel,             // Can cancel current operation
  uiState,               // Current UI state
  lastEvent,             // Last UI event
  clearState             // Reset state
} = usePayment((state, event) => {
  console.log('Payment state changed:', state, event);
});

// Usage
const paymentOptions: PaymentOptions = {
  amount: 2500,
  type: PaymentTypes.CREDIT,
  uiConfiguration: {
    messages: { insertCard: 'Insert your card' },
    behavior: { allowCancellation: true }
  }
};

const result = await doPayment(paymentOptions);
```

#### PaymentOptions Interface
```typescript
interface PaymentOptions {
  amount: number;                    // Amount in cents
  type: PaymentTypes;               // CREDIT, DEBIT, PIX, VOUCHER
  installmentType?: InstallmentTypes; // Optional, auto-detected
  installments?: number;            // Default: 1
  printReceipt?: boolean;           // Default: true
  userReference?: string;           // Default: auto-generated
  uiConfiguration?: PlugpagUIConfiguration; // Optional UI config
}
```

</details>

<details>
<summary><b>📊 Additional Hooks</b></summary>

#### `useUIStateEvent(cancellationToken?)`
Monitor UI state changes in real-time.

```typescript
const {
  uiState,               // Current state
  lastEvent,             // Last event
  isWaitingForCard,      // Waiting for card
  isProcessing,          // Processing payment
  isCompleted,           // Payment completed
  hasError               // Error occurred
} = useUIStateEvent();
```

#### `useTransactionPaymentEvent()`
Listen to low-level payment events.

```typescript
const eventPayment = useTransactionPaymentEvent();
// Returns: { code: number, message: string }
```

</details>

### Payment Presets

<details>
<summary><b>💰 Quick Payment Setup</b></summary>

```typescript
// Credit card payments
PaymentPresets.credit(amount, installments?)
PaymentPresets.credit(10000, 3) // R$ 100,00 in 3x

// Debit card
PaymentPresets.debit(2500) // R$ 25,00

// PIX payments
PaymentPresets.pix(5000, 'order-123') // R$ 50,00

// Voucher
PaymentPresets.voucher(1500) // R$ 15,00
```

</details>

### Utilities

<details>
<summary><b>🔧 Helper Functions</b></summary>

```typescript
// Format currency
formatCurrency(2500); // "R$ 25,00"

// Validate payment
isPaymentSuccessful(result); // boolean

// Extract error message
getPaymentErrorMessage(result); // string | null
```

</details>

---

## 💡 Usage Examples

<details>
<summary><b>💳 Modern Hook-Based Payment</b></summary>

```typescript
import React from 'react';
import { usePayment, PaymentPresets, formatCurrency } from 'react-native-plugpag-nitro';

function PaymentScreen() {
  const { doPayment, isProcessing, cancelPayment, canCancel, uiState } = usePayment();

  const handleCreditPayment = async () => {
    try {
      const result = await doPayment({
        ...PaymentPresets.credit(2500), // R$ 25,00
        uiConfiguration: {
          messages: {
            insertCard: 'Insira seu cartão de crédito',
            processing: 'Processando pagamento...'
          }
        }
      });
      
      if (isPaymentSuccessful(result)) {
        Alert.alert('Sucesso', `Pagamento aprovado: ${formatCurrency(result.amount)}`);
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View>
      {uiState && <Text>Status: {uiState}</Text>}
      
      <Button 
        title={isProcessing ? 'Processando...' : 'Pagar R$ 25,00'} 
        onPress={handleCreditPayment}
        disabled={isProcessing}
      />
      
      {canCancel && (
        <Button title="Cancelar" onPress={cancelPayment} color="red" />
      )}
    </View>
  );
}
```

</details>

<details>
<summary><b>📱 PIX Payment with Custom UI</b></summary>

```typescript
const handlePixPayment = async () => {
  const result = await doPayment({
    ...PaymentPresets.pix(2500, 'order-123'),
    uiConfiguration: {
      messages: {
        insertCard: '📱 Aproxime seu celular para PIX',
        processing: '⚡ PIX instantâneo em andamento...',
        approved: '🎉 PIX realizado com sucesso!'
      },
      behavior: {
        timeoutSeconds: 90, // PIX-optimized timeout
        allowCancellation: true
      },
      styling: {
        primaryColor: '#32D74B', // PIX green
        backgroundColor: '#F8F9FA'
      }
    }
  });
};
```

</details>

<details>
<summary><b>🎯 Multiple Payment Types</b></summary>

```typescript
function PaymentOptions() {
  const { doPayment, isProcessing } = usePayment();

  const payments = [
    { 
      title: 'Crédito', 
      preset: PaymentPresets.credit(5000, 1),
      color: '#007AFF' 
    },
    { 
      title: 'Débito', 
      preset: PaymentPresets.debit(5000),
      color: '#34C759' 
    },
    { 
      title: 'PIX', 
      preset: PaymentPresets.pix(5000),
      color: '#32D74B' 
    }
  ];

  const handlePayment = (preset, title) => async () => {
    const result = await doPayment({
      ...preset,
      uiConfiguration: {
        styling: { primaryColor: preset.color }
      }
    });
  };

  return (
    <View>
      {payments.map(payment => (
        <Button
          key={payment.title}
          title={`${payment.title} - R$ 50,00`}
          onPress={handlePayment(payment.preset, payment.title)}
          disabled={isProcessing}
        />
      ))}
    </View>
  );
}
```

</details>

---

## 🚨 Error Handling

> **Tip**: Use the built-in error utilities for better error handling

```typescript
import { PlugpagError, isPaymentSuccessful, getPaymentErrorMessage } from 'react-native-plugpag-nitro';

try {
  const result = await doPayment(PaymentPresets.credit(2500));
  
  if (!isPaymentSuccessful(result)) {
    const errorMessage = getPaymentErrorMessage(result);
    Alert.alert('Payment Failed', errorMessage);
    return;
  }
  
  Alert.alert('Success', 'Payment approved!');
} catch (error) {
  if (error instanceof PlugpagError) {
    Alert.alert('PlugPag Error', `${error.code}: ${error.message}`);
  } else {
    Alert.alert('Error', error.message);
  }
}
```

<details>
<summary><b>🔍 Common Error Codes</b></summary>

| Code | Description | Solution |
|------|-------------|----------|
| `-1001` | Terminal not initialized | Call `initializeAndActivatePinPad()` |
| `-1002` | Invalid activation code | Check code with PagSeguro |
| `-1003` | Connection timeout | Check terminal connection |
| `-1004` | Transaction cancelled | User cancelled |
| `-1005` | Invalid amount | Check amount > 0 |

</details>

---

## 🧪 Testing

```bash
# Run tests
yarn test

# Run with coverage
yarn test:coverage

# Build and test example
yarn example android
```

---

## 🤝 Contributing

> **Note**: This project uses modern development practices with TypeScript, ESLint, and Conventional Commits

<details>
<summary><b>Development Setup</b></summary>

```bash
git clone https://github.com/mCodex/react-native-plugpag-nitro.git
cd react-native-plugpag-nitro
yarn install
yarn prepare
yarn example android
```

</details>

<details>
<summary><b>Code Standards</b></summary>

- **TypeScript**: Full type safety required
- **ESLint + Prettier**: Automated formatting
- **Conventional Commits**: Structured messages
- **Tests**: Unit tests for new features
- **Documentation**: JSDoc for public APIs

</details>

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- [📚 Nitro Modules](https://nitro.margelo.com/)
- [🏢 PagSeguro PlugPag](https://dev.pagseguro.uol.com.br/)
- [🐛 Issues](https://github.com/mCodex/react-native-plugpag-nitro/issues)
- [💬 Discussions](https://github.com/mCodex/react-native-plugpag-nitro/discussions)

---

<div align="center">
  <p><strong>Built with ❤️ using Nitro Modules</strong></p>
  <p><em>Making React Native payment processing faster and more flexible</em></p>
</div>
