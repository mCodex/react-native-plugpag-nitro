import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { getStatusColor, getStatusText } from '../utils/payment';
import { Card } from './Card';

interface HeaderProps {
  terminalSerial: string;
  isInitialized: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  terminalSerial,
  isInitialized,
}) => {
  const statusColor = getStatusColor(isInitialized);
  const statusText = getStatusText(isInitialized);

  return (
    <Card elevated>
      <View style={styles.container}>
        <Text style={styles.title}>Demo PlugPag Nitro</Text>
        <Text style={styles.subtitle}>Terminal: {terminalSerial}</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          Status: {statusText}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  status: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
});
