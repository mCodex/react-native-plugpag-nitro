import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { theme } from '../constants/theme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  children,
  style,
  ...props
}) => {
  const cardStyle = [styles.card, elevated && styles.elevated, style];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  elevated: {
    backgroundColor: theme.colors.surfaceElevated,
    ...theme.shadows.medium,
  },
});
