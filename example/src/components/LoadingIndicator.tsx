import React from 'react';
import { Text, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { Card } from './Card';

interface LoadingIndicatorProps {
  visible: boolean;
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  visible,
  message = 'Processando...',
}) => {
  if (!visible) return null;

  return (
    <Card elevated style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
});
