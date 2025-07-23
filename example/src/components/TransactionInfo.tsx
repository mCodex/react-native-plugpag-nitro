import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { Card } from './Card';
import {
  ErrorCode,
  type PlugpagTransactionResult,
} from 'react-native-plugpag-nitro';

interface TransactionInfoProps {
  transaction: PlugpagTransactionResult | null;
}

export const TransactionInfo: React.FC<TransactionInfoProps> = ({
  transaction,
}) => {
  if (!transaction) return null;

  const isApproved = transaction.result === ErrorCode.OK;
  const statusColor = isApproved ? theme.colors.success : theme.colors.error;
  const statusText = isApproved ? '✅ Aprovado' : '❌ Negado';

  return (
    <Card elevated>
      <Text style={styles.title}>Última Transação</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Código:</Text>
        <Text style={styles.value}>{transaction.transactionCode}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{transaction.transactionId}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, { color: statusColor }]}>{statusText}</Text>
      </View>
      {transaction.hostNsu && (
        <View style={styles.row}>
          <Text style={styles.label}>NSU:</Text>
          <Text style={styles.value}>{transaction.hostNsu}</Text>
        </View>
      )}
      {transaction.cardBrand && (
        <View style={styles.row}>
          <Text style={styles.label}>Bandeira:</Text>
          <Text style={styles.value}>{transaction.cardBrand}</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});
