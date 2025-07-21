<div align="center">
  <h1>🚀 React Native PlugPag Nitro</h1>
  
  <p>
    <strong>High-performance PagSeguro PlugPag integration for React Native</strong>
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

## 🚀 Performance

This library leverages [Nitro Modules](https://nitro.margelo.com/) for optimal performance:

- **🔥 Zero-copy ArrayBuffers** for large data transfers
- **⚡ Flattened function parameters** to avoid object allocation
- **🔄 Asynchronous Promise-based API** prevents UI blocking
- **🧵 Thread-safe Kotlin implementation** with proper coroutines
- **💾 Memory-efficient** with automatic resource management

---

## ✨ Features

<table>
<tr>
<td>

### 💳 **Payment Processing**
- Credit, Debit, Voucher & PIX payments
- Installment support (buyer/seller)
- Real-time transaction events
- Automatic receipt printing

</td>
<td>

### 🔄 **Transaction Management**
- Void/refund transactions
- Abort ongoing operations
- Transaction history tracking
- Error handling & recovery

</td>
</tr>
<tr>
<td>

### 🖨️ **Printing & NFC**
- Custom receipt printing
- Reprint customer receipts
- NFC card reading
- Image-based printing

</td>
<td>

### ⚡ **Performance**
- Built with Nitro Modules
- Zero-copy data transfer
- Thread-safe operations
- Memory efficient

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Installation

```bash
# npm
npm install react-native-plugpag-nitro react-native-nitro-modules

# yarn
yarn add react-native-plugpag-nitro react-native-nitro-modules

# bun
bun add react-native-plugpag-nitro react-native-nitro-modules
```

> **Note**: The PlugPag wrapper dependency is automatically included with this library - no additional setup required!

### Basic Usage

```typescript
import {
  initializeAndActivatePinPad,
  doPayment,
  plugPag,
  useTransactionPaymentEvent
} from 'react-native-plugpag-nitro';

// Initialize terminal
const result = await initializeAndActivatePinPad('403938');

// Process payment
const payment = await doPayment({
  amount: 2500, // R$ 25.00 in cents
  type: plugPag.paymentTypes.CREDIT,
  installmentType: plugPag.installmentTypes.BUYER_INSTALLMENT,
  installments: 1,
  printReceipt: true,
});
```

---

## 📋 Requirements

| Requirement | Version |
|-------------|---------|
| React Native | >= 0.72 |
| Android API Level | >= 21 |
| Kotlin | >= 1.9.0 |
| **Platform Support** | **Android Only** |

> ⚠️ **iOS Note**: PlugPag is only available for Android devices. iOS is not supported by PagSeguro.

---

## 🛠️ Setup

### Android Configuration

The library automatically includes the PlugPag wrapper, but you need to ensure proper repository access:

#### 1. Add PlugPag repository to `android/build.gradle`:

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url 'https://github.com/pagseguro/PlugPagServiceWrapper/raw/master'
        }
    }
}
```

#### 2. That's it! 🎉

The PlugPag wrapper (`br.com.uol.pagseguro.plugpagservice.wrapper:wrapper:1.30.51`) is automatically included as a dependency.

---

## 📚 Documentation

### Payment Processing

<details>
<summary><strong>💳 Initialize Terminal</strong></summary>

```typescript
import { initializeAndActivatePinPad } from 'react-native-plugpag-nitro';

async function activateTerminal() {
  try {
    const result = await initializeAndActivatePinPad('403938'); // Dev code
    
    if (result.result === 0) {
      console.log('✅ Terminal activated successfully!');
    } else {
      console.error('❌ Activation failed:', result.errorMessage);
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}
```
</details>

<details>
<summary><strong>💰 Process Payment</strong></summary>

```typescript
import { doPayment, plugPag } from 'react-native-plugpag-nitro';

async function processPayment() {
  try {
    const result = await doPayment({
      amount: 1000,           // R$ 10.00 in cents
      type: plugPag.paymentTypes.CREDIT,
      installmentType: plugPag.installmentTypes.BUYER_INSTALLMENT,
      installments: 1,
      printReceipt: true,
      userReference: 'order-123',
    });
    
    if (result.result === 0) {
      console.log('✅ Payment successful!');
      console.log('Transaction ID:', result.transactionId);
      console.log('Transaction Code:', result.transactionCode);
    }
  } catch (error) {
    console.error('💥 Payment failed:', error);
  }
}
```
</details>

<details>
<summary><strong>🔄 Void/Refund Payment</strong></summary>

```typescript
import { refundPayment } from 'react-native-plugpag-nitro';

async function voidTransaction(transactionCode: string, transactionId: string) {
  try {
    const result = await refundPayment({
      transactionCode,
      transactionId,
      printReceipt: true,
    });
    
    if (result.result === 0) {
      console.log('✅ Refund successful!');
    }
  } catch (error) {
    console.error('💥 Refund failed:', error);
  }
}
```
</details>

### Real-time Events

<details>
<summary><strong>📡 Payment Events Hook</strong></summary>

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useTransactionPaymentEvent } from 'react-native-plugpag-nitro';

function PaymentScreen() {
  const event = useTransactionPaymentEvent();
  
  return (
    <View>
      <Text>Status: {event.message || 'Ready'}</Text>
      <Text>Code: {event.code}</Text>
    </View>
  );
}
```
</details>

### Utility Functions

<details>
<summary><strong>📱 Terminal Information</strong></summary>

```typescript
import { getTerminalSerialNumber } from 'react-native-plugpag-nitro';

function TerminalInfo() {
  const serialNumber = getTerminalSerialNumber();
  
  return (
    <Text>Terminal: {serialNumber}</Text>
  );
}
```
</details>

<details>
<summary><strong>📄 NFC & Printing</strong></summary>

```typescript
import { readNFCCard, print, reprintCustomerReceipt } from 'react-native-plugpag-nitro';

// Read NFC card
const nfcResult = await readNFCCard();
console.log('NFC UID:', nfcResult.uid);

// Print custom receipt
await print('/path/to/receipt.png');

// Reprint last receipt
await reprintCustomerReceipt();
```
</details>

---

## 🎯 API Reference

### Payment Types

```typescript
plugPag.paymentTypes.CREDIT    // 1 - Credit Card
plugPag.paymentTypes.DEBIT     // 2 - Debit Card  
plugPag.paymentTypes.VOUCHER   // 3 - Voucher
plugPag.paymentTypes.PIX       // 5 - PIX
```

### Installment Types

```typescript
plugPag.installmentTypes.NO_INSTALLMENT      // 1 - À vista
plugPag.installmentTypes.SELLER_INSTALLMENT  // 2 - Seller pays fees
plugPag.installmentTypes.BUYER_INSTALLMENT   // 3 - Buyer pays fees
```

### Complete Function List

| Function | Description | Return Type |
|----------|-------------|-------------|
| `initializeAndActivatePinPad(code)` | Initialize terminal | `Promise<PlugpagInitializationResult>` |
| `doPayment(request)` | Process payment | `Promise<PlugpagTransactionResult>` |
| `refundPayment(request)` | Void transaction | `Promise<PlugpagTransactionResult>` |
| `doAbort()` | Abort current operation | `Promise<PlugpagAbortResult>` |
| `readNFCCard()` | Read NFC card | `Promise<PlugpagNFCResult>` |
| `print(filePath)` | Print custom receipt | `Promise<void>` |
| `reprintCustomerReceipt()` | Reprint last receipt | `Promise<void>` |
| `getTerminalSerialNumber()` | Get device serial | `string` |
| `useTransactionPaymentEvent()` | Payment events hook | `TransactionPaymentEvent` |

---

## 🔧 Development

### Running the Example

```bash
# Install dependencies
yarn

# Start Metro
yarn example start

# Run on Android
yarn example android
```

### Code Generation

```bash
# Generate Nitro bindings
yarn nitrogen

# Build library
yarn prepare
```

### Testing

```bash
# Type checking
yarn typecheck

# Linting
yarn lint

# Tests
yarn test
```

---

## 🎭 Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `0` | Success | ✅ Operation completed |
| `-1` | Generic error | Check error message |
| `-2` | Communication error | Check device connection |
| `-3` | Authentication failed | Verify activation code |

### Best Practices

```typescript
try {
  const result = await doPayment(paymentData);
  
  if (result.result === 0) {
    // Success handling
    handleSuccess(result);
  } else {
    // Error handling
    handleError(result.errorCode, result.message);
  }
} catch (error) {
  // Exception handling
  console.error('Unexpected error:', error);
}
```

---

## 🤝 Contributing

We love your input! Check out our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork & clone the repository
2. Install dependencies: `yarn`
3. Make your changes
4. Test: `yarn test`
5. Build: `yarn prepare`
6. Submit a PR! 🎉

---

## 📄 License

MIT © [Mateus Andrade](https://github.com/mCodex)

---

### PagSeguro Support

- **Development Code**: `403938` (commonly used for testing)
- **Production**: Contact PagSeguro support for activation codes
- **Documentation**: [PagSeguro PlugPag Wrapper](https://pagseguro.github.io/pagseguro-sdk-plugpagservicewrapper/)

---

<div align="center">
  <p>
    <strong>Made with ❤️ using <a href="https://nitro.margelo.com/">Nitro Modules</a></strong>
  </p>
  
  <p>
    <a href="https://github.com/mCodex/react-native-plugpag-nitro">⭐ Star us on GitHub</a> •
    <a href="https://www.npmjs.com/package/react-native-plugpag-nitro">📦 View on NPM</a> •
    <a href="https://nitro.margelo.com/">🚀 Learn about Nitro</a>
  </p>
</div>
