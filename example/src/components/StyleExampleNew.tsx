import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {
  setStyleTheme,
  PlugPagThemes,
  ThemeUtils,
} from 'react-native-plugpag-nitro';
import type { PlugpagStyleData } from 'react-native-plugpag-nitro';

interface StyleExampleProps {
  onThemeApplied?: (themeName: string) => void;
}

export const StyleExample: React.FC<StyleExampleProps> = ({
  onThemeApplied,
}) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isApplying, setIsApplying] = useState(false);

  const createAppMatchingTheme = (): PlugpagStyleData => {
    return {
      headTextColor: '#1A1A1D',
      contentTextColor: '#FFFFFF',
      contentTextValue1Color: '#00D4FF',
      contentTextValue2Color: '#A1A1AA',
      positiveButtonBackground: '#22C55E',
      positiveButtonTextColor: '#FFFFFF',
      negativeButtonBackground: '#2A2A2F',
      negativeButtonTextColor: '#00D4FF',
      genericButtonBackground: '#22C55E',
      genericButtonTextColor: '#FFFFFF',
      genericSmsEditTextBackground: '#2A2A2F',
      genericSmsEditTextTextColor: '#FFFFFF',
      lineColor: '#71717A',
    };
  };

  const predefinedThemes = [
    { key: 'dark', name: 'Dark Theme', theme: PlugPagThemes.DARK_THEME },
    { key: 'light', name: 'Light Theme', theme: PlugPagThemes.LIGHT_THEME },
    {
      key: 'pagbank',
      name: 'PagBank Official',
      theme: PlugPagThemes.PAGBANK_THEME,
    },
    {
      key: 'high-contrast',
      name: 'High Contrast',
      theme: PlugPagThemes.HIGH_CONTRAST_THEME,
    },
  ];

  const customThemes = [
    {
      key: 'purple',
      name: 'Purple Modern',
      theme: PlugPagThemes.createMonochromaticTheme('#8B5CF6', true),
    },
    {
      key: 'app-matching',
      name: 'App Matching',
      theme: createAppMatchingTheme(),
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
      Alert.alert(
        'Theme Applied',
        `${themeName} has been successfully applied to all PagBank SDK modals.`
      );
      onThemeApplied?.(themeName);
      console.log(`🎨 Applied theme: ${themeName}`, theme);
    } catch (error) {
      Alert.alert('Theme Error', `Failed to apply theme: ${error}`);
      console.error('Theme application failed:', error);
    } finally {
      setIsApplying(false);
    }
  };

  useEffect(() => {
    applyTheme(PlugPagThemes.DARK_THEME, 'dark');
  }, []);

  const ThemeButton = ({
    theme,
    name,
    themeKey,
  }: {
    theme: PlugpagStyleData;
    name: string;
    themeKey: string;
  }) => (
    <TouchableOpacity
      style={[styles.button, currentTheme === themeKey && styles.activeTheme]}
      onPress={() => applyTheme(theme, name)}
      disabled={isApplying}
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎨 Theme Customization</Text>
        <Text style={styles.subtitle}>
          Customize the appearance of PagBank SDK payment modals
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Predefined Themes</Text>
        <Text style={styles.sectionDescription}>
          Choose from ready-to-use themes optimized for different use cases
        </Text>

        <View style={styles.themeGrid}>
          {predefinedThemes.map((item) => (
            <ThemeButton
              key={item.key}
              theme={item.theme}
              name={item.name}
              themeKey={item.key}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Themes</Text>
        <Text style={styles.sectionDescription}>
          Creative themes showcasing the flexibility of the theming system
        </Text>

        <View style={styles.themeGrid}>
          {customThemes.map((item) => (
            <ThemeButton
              key={item.key}
              theme={item.theme}
              name={item.name}
              themeKey={item.key}
            />
          ))}
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>💡 How it Works</Text>
        <Text style={styles.infoText}>
          • Themes are applied globally to all PagBank SDK modals{'\n'}• Colors
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
