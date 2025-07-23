// Dark theme constants and colors
export const theme = {
  colors: {
    primary: '#00D4FF',
    secondary: '#7C3AED',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',

    // Background colors
    background: '#0A0A0B',
    surface: '#1A1A1D',
    surfaceElevated: '#2A2A2F',

    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',

    // Event colors
    cardEvent: '#0EA5E9',
    passwordEvent: '#F97316',
    processing: '#EAB308',
    terminalResponse: '#22C55E',
    errorEvent: '#EF4444',
    default: '#6B7280',

    // Status colors
    ready: '#22C55E',
    notInitialized: '#EF4444',
    processingStatus: '#F59E0B',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },

  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
    },
    h2: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },

  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
} as const;
