import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { getEventColor } from '../utils/payment';
import { Card } from './Card';

interface PaymentEventProps {
  code: number;
  message: string;
  customMessage?: string;
}

export const PaymentEvent: React.FC<PaymentEventProps> = ({
  code,
  message,
  customMessage,
}) => {
  if (code <= 0) return null;

  const eventColor = getEventColor(code);

  return (
    <Card style={[styles.container, { backgroundColor: eventColor }]}>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.code}>Código: {code}</Text>
      {customMessage && (
        <Text style={styles.customMessage}>{customMessage}</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  code: {
    ...theme.typography.small,
    color: theme.colors.textPrimary,
    opacity: 0.9,
  },
  customMessage: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
});
