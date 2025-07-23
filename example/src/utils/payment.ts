import { theme } from '../constants/theme';
import { PaymentType } from 'react-native-plugpag-nitro';
import type { ButtonVariant } from '../components/Button';

/**
 * Formats currency value from cents to BRL format
 */
export const formatCurrency = (amountInCents: number): string => {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

/**
 * Gets the appropriate color for payment event codes
 */
export const getEventColor = (code: number): string => {
  if (code >= 1001 && code <= 1004) return theme.colors.cardEvent; // Card events
  if (code >= 1010 && code <= 1012) return theme.colors.passwordEvent; // Password events
  if (code >= 1020 && code <= 1023) return theme.colors.processing; // Processing
  if (code >= 1030 && code <= 1032) return theme.colors.terminalResponse; // Terminal response
  if (code >= 1040 && code <= 1043) return theme.colors.errorEvent; // Errors
  return theme.colors.default; // Default
};

/**
 * Gets status color based on initialization state
 */
export const getStatusColor = (isInitialized: boolean): string => {
  return isInitialized ? theme.colors.ready : theme.colors.notInitialized;
};

/**
 * Gets status text based on initialization state
 */
export const getStatusText = (isInitialized: boolean): string => {
  return isInitialized ? '✅ Pronto' : '❌ Não Inicializado';
};

/**
 * Gets payment type display text
 */
export const getPaymentTypeText = (type: PaymentType): string => {
  switch (type) {
    case PaymentType.CREDIT:
      return 'Pagamento de crédito';
    case PaymentType.DEBIT:
      return 'Pagamento de débito';
    case PaymentType.PIX:
      return 'Pagamento PIX';
    default:
      return 'Transação';
  }
};

/**
 * Payment amounts configuration
 */
export const PAYMENT_AMOUNTS = {
  credit: 2500, // R$ 25.00
  debit: 1500, // R$ 15.00
  pix: 1500, // R$ 15.00
  installment: 10000, // R$ 100.00
} as const;

/**
 * Payment button configurations
 */
export const PAYMENT_BUTTONS = [
  {
    id: 'credit',
    title: `Pagamento Crédito - ${formatCurrency(PAYMENT_AMOUNTS.credit)}`,
    variant: 'primary' as ButtonVariant,
    paymentType: PaymentType.CREDIT,
    amount: PAYMENT_AMOUNTS.credit,
  },
  {
    id: 'debit',
    title: `Pagamento Débito - ${formatCurrency(PAYMENT_AMOUNTS.debit)}`,
    variant: 'primary' as ButtonVariant,
    paymentType: PaymentType.DEBIT,
    amount: PAYMENT_AMOUNTS.debit,
  },
  {
    id: 'pix',
    title: `PIX - ${formatCurrency(PAYMENT_AMOUNTS.pix)}`,
    variant: 'secondary' as ButtonVariant,
    paymentType: PaymentType.PIX,
    amount: PAYMENT_AMOUNTS.pix,
  },
  {
    id: 'installment',
    title: `Pagamento Parcelado - ${formatCurrency(PAYMENT_AMOUNTS.installment)} (3x)`,
    variant: 'primary' as ButtonVariant,
    paymentType: PaymentType.CREDIT,
    amount: PAYMENT_AMOUNTS.installment,
    installments: 3,
  },
] as const;

/**
 * Terminal activation code
 */
export const TERMINAL_ACTIVATION_CODE = '403938';
