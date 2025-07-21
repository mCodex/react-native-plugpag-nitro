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
- 🎨 **Flexible UI** - Complete payment UI customization with real-time state updates
- 💰 **PIX Optimized** - Dedicated PIX payments with instant feedback
- ⏹️ **Cancellation Support** - Real-time operation cancellation
- ⚛️ **React Hooks** - Modern React patterns with TypeScript support
- 📱 **Android Focused** - Optimized for PlugPag terminals

---

## 🚀 Quick Start

```bash
npm install react-native-plugpag-nitro
```

> **Requirements**: React Native ≥ 0.72, Android API ≥ 21, Kotlin ≥ 1.9

```typescript
import { initializeAndActivatePinPad, doPayment, PaymentPresets } from 'react-native-plugpag-nitro';

// Initialize terminal
await initializeAndActivatePinPad('your-activation-code');

// Process payment
const result = await doPayment(PaymentPresets.credit(2500)); // R$ 25,00
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
<summary><b>💳 Payment Processing</b></summary>

#### `doPayment(request: PaymentRequest)`
Standard payment processing.

```typescript
interface PaymentRequest {
  amount: number;           // Amount in cents
  type: number;            // 1=Credit, 2=Debit, 3=Voucher, 5=PIX
  installmentType: number; // 1=None, 2=Seller, 3=Buyer
  installments: number;    // 1-99
  printReceipt: boolean;
  userReference?: string;
}

const result = await doPayment({
  amount: 2500,
  type: 1, // Credit
  installmentType: 1,
  installments: 1,
  printReceipt: true
});
```

#### `doPaymentWithUI(request: EnhancedPaymentRequest)`
Payment with advanced UI control and cancellation support.

```typescript
const result = await doPaymentWithUI({
  ...PaymentPresets.credit(5000),
  uiConfiguration: {
    messages: {
      insertCard: 'Insira seu cartão',
      processing: 'Processando...',
      approved: 'Aprovado!',
      declined: 'Recusado'
    },
    behavior: {
      showDefaultUI: true,
      allowCancellation: true,
      timeoutSeconds: 120
    },
    styling: {
      primaryColor: '#007AFF',
      backgroundColor: '#F2F2F7',
      textColor: '#000000'
    }
  }
});
```

#### `doPixPaymentWithUI(amount: number, uiConfig?: PlugpagUIConfiguration, userRef?: string)`
PIX-optimized payment with enhanced UI.

```typescript
const result = await doPixPaymentWithUI(
  2500, // R$ 25,00
  {
    messages: {
      insertCard: '📱 Aproxime para PIX',
      processing: '⚡ PIX instantâneo...'
    }
  },
  'pix-order-123'
);
```

</details>

<details>
<summary><b>⏹️ Cancellation & Control</b></summary>

#### `cancelPayment(token: string)`
Cancels an ongoing payment operation.

```typescript
const result = await cancelPayment('payment_token_123');
// Returns: { success: boolean, message?: string }
```

#### `configureUI(configuration: PlugpagUIConfiguration)`
Sets global UI configuration.

```typescript
await configureUI({
  messages: { /* global messages */ },
  behavior: { /* global behavior */ },
  styling: { /* global styling */ }
});
```

</details>

### React Hooks

<details>
<summary><b>⚛️ React Integration</b></summary>

#### `usePaymentWithCancellation(onStateChange?)`
Complete payment lifecycle with cancellation support.

```typescript
const {
  startPayment,           // Start payment with UI
  cancelCurrentPayment,   // Cancel active payment
  isProcessing,          // Processing state
  canCancel,             // Can cancel current operation
  uiState,               // Current UI state
  lastEvent,             // Last UI event
  clearState             // Reset state
} = usePaymentWithCancellation();
```

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
<summary><b>💳 Basic Payment Flow</b></summary>

```typescript
import { doPayment, PaymentPresets, formatCurrency } from 'react-native-plugpag-nitro';

async function processPayment() {
  try {
    const result = await doPayment(PaymentPresets.credit(2500));
    
    if (isPaymentSuccessful(result)) {
      console.log(`Payment approved: ${formatCurrency(result.amount)}`);
    } else {
      console.log(`Payment failed: ${getPaymentErrorMessage(result)}`);
    }
  } catch (error) {
    console.error('Payment error:', error.message);
  }
}
```

</details>

<details>
<summary><b>🎨 Custom UI Payment</b></summary>

```typescript
import React from 'react';
import { usePaymentWithCancellation, PaymentPresets } from 'react-native-plugpag-nitro';

function PaymentScreen() {
  const { startPayment, cancelCurrentPayment, isProcessing, canCancel, uiState } = 
    usePaymentWithCancellation();

  const handlePayment = async () => {
    await startPayment({
      ...PaymentPresets.credit(5000),
      uiConfiguration: {
        messages: {
          insertCard: 'Insira seu cartão de crédito',
          processing: 'Processando pagamento...'
        },
        behavior: { allowCancellation: true },
        styling: { primaryColor: '#007AFF' }
      }
    });
  };

  return (
    <View>
      {uiState && <Text>Status: {uiState}</Text>}
      
      <Button 
        title={isProcessing ? 'Processando...' : 'Pagar'} 
        onPress={handlePayment}
        disabled={isProcessing}
      />
      
      {canCancel && (
        <Button title="Cancelar" onPress={cancelCurrentPayment} color="red" />
      )}
    </View>
  );
}
```

</details>

<details>
<summary><b>📱 PIX Payment with Custom UI</b></summary>

```typescript
import { doPixPaymentWithUI } from 'react-native-plugpag-nitro';

async function pixPayment() {
  const result = await doPixPaymentWithUI(
    2500, // R$ 25,00
    {
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
    },
    'pix-order-123'
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
