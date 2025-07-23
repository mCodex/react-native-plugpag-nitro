import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { setStyleTheme, ThemeUtils } from 'react-native-plugpag-nitro';
import type { PlugpagStyleData } from 'react-native-plugpag-nitro';

interface StyleExampleProps {
  onThemeApplied?: (themeName: string) => void;
}

interface ThemeButtonProps {
  theme: PlugpagStyleData;
  name: string;
  themeKey: string;
  currentTheme: string;
  onPress: (theme: PlugpagStyleData, name: string) => void;
  disabled: boolean;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({
  theme,
  name,
  themeKey,
  currentTheme,
  onPress,
  disabled,
}) => (
  <TouchableOpacity
    style={[styles.button, currentTheme === themeKey && styles.activeTheme]}
    onPress={() => onPress(theme, name)}
    disabled={disabled}
  >
    <View style={styles.themePreview}>
      <View
        style={[
          styles.previewColor,
          { backgroundColor: theme.headBackgroundColor || '#000' },
        ]}
      />
      <View
        style={[
          styles.previewColor,
          { backgroundColor: theme.positiveButtonBackground || '#007AFF' },
        ]}
      />
      <View
        style={[
          styles.previewColor,
          { backgroundColor: theme.negativeButtonBackground || '#FF3B30' },
        ]}
      />
    </View>
    <Text style={styles.buttonText}>{name}</Text>
    {currentTheme === themeKey && (
      <Text style={styles.activeIndicator}>✓ Active</Text>
    )}
  </TouchableOpacity>
);

export const StyleExample: React.FC<StyleExampleProps> = ({
  onThemeApplied,
}) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isApplying, setIsApplying] = useState(false);

  const createAppMatchingTheme = (): PlugpagStyleData => {
    return {
      headBackgroundColor: '#0A0A0B', // Match app's darker background
      headTextColor: '#FFFFFF',
      contentTextColor: '#F3F4F6',
      contentTextValue1Color: '#00D4FF', // App's primary blue
      contentTextValue2Color: '#9CA3AF', // Secondary text
      positiveButtonBackground: '#10B981', // Improved green
      positiveButtonTextColor: '#FFFFFF',
      negativeButtonBackground: '#EF4444', // Clean red
      negativeButtonTextColor: '#FFFFFF',
      genericButtonBackground: '#1F2937', // Better contrast
      genericButtonTextColor: '#F3F4F6',
      genericSmsEditTextBackground: '#1F2937',
      genericSmsEditTextTextColor: '#F3F4F6',
      lineColor: '#374151', // Visible but subtle lines
    };
  };

  const createLightTheme = (): PlugpagStyleData => {
    return {
      headTextColor: '#1F2937',
      headBackgroundColor: '#FFFFFF',
      contentTextColor: '#1F2937',
      contentTextValue1Color: '#0EA5E9',
      contentTextValue2Color: '#6B7280',
      positiveButtonTextColor: '#FFFFFF',
      positiveButtonBackground: '#10B981',
      negativeButtonTextColor: '#FFFFFF',
      negativeButtonBackground: '#EF4444',
      genericButtonBackground: '#F3F4F6',
      genericButtonTextColor: '#1F2937',
      genericSmsEditTextBackground: '#F9FAFB',
      genericSmsEditTextTextColor: '#1F2937',
      lineColor: '#E5E7EB',
    };
  };

  const createPagBankTheme = (): PlugpagStyleData => {
    return {
      headTextColor: '#FFFFFF',
      headBackgroundColor: '#00A859',
      contentTextColor: '#1F2937',
      contentTextValue1Color: '#00A859',
      contentTextValue2Color: '#6B7280',
      positiveButtonTextColor: '#FFFFFF',
      positiveButtonBackground: '#00A859',
      negativeButtonTextColor: '#6B7280',
      negativeButtonBackground: '#F3F4F6',
      genericButtonBackground: '#E5E7EB',
      genericButtonTextColor: '#1F2937',
      genericSmsEditTextBackground: '#F9FAFB',
      genericSmsEditTextTextColor: '#1F2937',
      lineColor: '#D1D5DB',
    };
  };

  const createHighContrastTheme = (): PlugpagStyleData => {
    return {
      headTextColor: '#FFFFFF',
      headBackgroundColor: '#000000',
      contentTextColor: '#000000',
      contentTextValue1Color: '#0066CC',
      contentTextValue2Color: '#333333',
      positiveButtonTextColor: '#FFFFFF',
      positiveButtonBackground: '#006600',
      negativeButtonTextColor: '#FFFFFF',
      negativeButtonBackground: '#CC0000',
      genericButtonBackground: '#F0F0F0',
      genericButtonTextColor: '#000000',
      genericSmsEditTextBackground: '#FFFFFF',
      genericSmsEditTextTextColor: '#000000',
      lineColor: '#000000',
    };
  };

  const createPurpleTheme = (): PlugpagStyleData => {
    return {
      headTextColor: '#FFFFFF',
      headBackgroundColor: '#8B5CF6',
      contentTextColor: '#1F2937',
      contentTextValue1Color: '#8B5CF6',
      contentTextValue2Color: '#6B7280',
      positiveButtonTextColor: '#FFFFFF',
      positiveButtonBackground: '#8B5CF6',
      negativeButtonTextColor: '#FFFFFF',
      negativeButtonBackground: '#EF4444',
      genericButtonBackground: '#F3F4F6',
      genericButtonTextColor: '#1F2937',
      genericSmsEditTextBackground: '#F9FAFB',
      genericSmsEditTextTextColor: '#1F2937',
      lineColor: '#E5E7EB',
    };
  };

  const createPremiumTheme = (): PlugpagStyleData => {
    return {
      headBackgroundColor: '#111827', // Rich dark background
      headTextColor: '#F9FAFB',
      contentTextColor: '#F3F4F6',
      contentTextValue1Color: '#3B82F6', // Premium blue
      contentTextValue2Color: '#9CA3AF',
      positiveButtonBackground: '#059669', // Premium emerald
      positiveButtonTextColor: '#FFFFFF',
      negativeButtonBackground: '#DC2626', // Premium red
      negativeButtonTextColor: '#FFFFFF',
      genericButtonBackground: '#374151', // Elevated surface
      genericButtonTextColor: '#F9FAFB',
      genericSmsEditTextBackground: '#374151',
      genericSmsEditTextTextColor: '#F9FAFB',
      lineColor: '#4B5563', // Subtle borders
    };
  };

  const predefinedThemes = [
    { key: 'dark', name: 'Dark Theme', theme: createAppMatchingTheme() },
    { key: 'light', name: 'Light Theme', theme: createLightTheme() },
    {
      key: 'pagbank',
      name: 'PagBank Official',
      theme: createPagBankTheme(),
    },
    {
      key: 'high-contrast',
      name: 'High Contrast',
      theme: createHighContrastTheme(),
    },
  ];

  const customThemes = [
    {
      key: 'purple',
      name: 'Purple Modern',
      theme: createPurpleTheme(),
    },
    {
      key: 'app-matching',
      name: 'App Matching',
      theme: createAppMatchingTheme(),
    },
    {
      key: 'premium',
      name: 'Premium Dark',
      theme: createPremiumTheme(),
    },
  ];

  const applyTheme = async (theme: PlugpagStyleData, themeName: string) => {
    if (isApplying) return;

    setIsApplying(true);
    try {
      const errors = ThemeUtils.validateTheme(theme);
      if (errors.length > 0) {
        Alert.alert(
          'Invalid Theme',
          `Theme validation failed: ${errors.join(', ')}`
        );
        return;
      }

      await setStyleTheme(theme);
      setCurrentTheme(themeName);
      Alert.alert('Theme Applied', `${themeName} theme applied successfully!`);
      onThemeApplied?.(themeName);
    } catch (error) {
      Alert.alert('Theme Error', `Failed to apply theme: ${error}`);
      console.error('Theme application failed:', error);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎨 Theme Customization</Text>
        <Text style={styles.subtitle}>
          Customize the appearance of PagBank SDK payment modals
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Themes</Text>
        <Text style={styles.sectionDescription}>
          Common theme configurations for different app styles
        </Text>

        <View style={styles.themeGrid}>
          {predefinedThemes.map((item) => (
            <ThemeButton
              key={item.key}
              theme={item.theme}
              name={item.name}
              themeKey={item.key}
              currentTheme={currentTheme}
              onPress={applyTheme}
              disabled={isApplying}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Creative Themes</Text>
        <Text style={styles.sectionDescription}>
          Advanced theme configurations showcasing customization possibilities
        </Text>

        <View style={styles.themeGrid}>
          {customThemes.map((item) => (
            <ThemeButton
              key={item.key}
              theme={item.theme}
              name={item.name}
              themeKey={item.key}
              currentTheme={currentTheme}
              onPress={applyTheme}
              disabled={isApplying}
            />
          ))}
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>💡 How it Works</Text>
        <Text style={styles.infoText}>
          • All themes are created within this app, not from the library{'\n'}•
          Themes are applied globally to all PagBank SDK modals{'\n'}• Colors
          automatically adapt to modal components{'\n'}• Validation ensures
          theme compatibility{'\n'}• Changes take effect immediately for new
          modals
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isApplying ? 'Applying theme...' : `Current theme: ${currentTheme}`}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: 150,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTheme: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A8A',
  },
  themePreview: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  previewColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  activeIndicator: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  infoSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
