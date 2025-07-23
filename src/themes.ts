import type { PlugpagStyleData } from './PlugpagNitro.nitro';

/**
 * Predefined theme configurations for PagBank SDK UI customization
 */
export class PlugPagThemes {
  /**
   * Dark theme configuration matching the example app's theme
   */
  static readonly DARK_THEME: PlugpagStyleData = {
    headTextColor: '#FFFFFF',
    headBackgroundColor: '#0A0A0B', // Darker header for better contrast
    contentTextColor: '#F3F4F6',
    contentTextValue1Color: '#00D4FF',
    contentTextValue2Color: '#9CA3AF',
    positiveButtonTextColor: '#FFFFFF',
    positiveButtonBackground: '#10B981', // Better green
    negativeButtonTextColor: '#FFFFFF',
    negativeButtonBackground: '#EF4444',
    genericButtonBackground: '#1F2937', // Better contrast for generic buttons
    genericButtonTextColor: '#F3F4F6',
    genericSmsEditTextBackground: '#1F2937',
    genericSmsEditTextTextColor: '#F3F4F6',
    lineColor: '#374151', // Lighter line color for better visibility
  };

  /**
   * Light theme configuration
   */
  static readonly LIGHT_THEME: PlugpagStyleData = {
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

  /**
   * PagBank branded theme
   */
  static readonly PAGBANK_THEME: PlugpagStyleData = {
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

  /**
   * High contrast theme for accessibility
   */
  static readonly HIGH_CONTRAST_THEME: PlugpagStyleData = {
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

  /**
   * Creates a custom theme based on brand colors
   * @param primaryColor Primary brand color (hex)
   * @param backgroundColor Background color (hex)
   * @param textColor Text color (hex)
   * @param isDark Whether to use dark theme as base
   * @returns Custom PlugpagStyleData configuration
   */
  static createCustomTheme(
    primaryColor: string,
    backgroundColor: string = '#FFFFFF',
    textColor: string = '#000000',
    isDark: boolean = false
  ): PlugpagStyleData {
    const baseTheme = isDark ? this.DARK_THEME : this.LIGHT_THEME;

    return {
      ...baseTheme,
      headBackgroundColor: primaryColor,
      contentTextValue1Color: primaryColor,
      positiveButtonBackground: primaryColor,
      headTextColor: textColor,
      contentTextColor: textColor,
      genericButtonTextColor: textColor,
      genericSmsEditTextTextColor: textColor,
      genericButtonBackground: backgroundColor,
      genericSmsEditTextBackground: backgroundColor,
    };
  }

  /**
   * Helper method to create a monochromatic theme
   * @param baseColor Base color for the theme
   * @param isDark Whether to use dark variant
   * @returns Monochromatic PlugpagStyleData configuration
   */
  static createMonochromaticTheme(
    baseColor: string,
    isDark: boolean = false
  ): PlugpagStyleData {
    // Generate lighter and darker variants of the base color
    const lightVariant = this.adjustBrightness(baseColor, 0.3);
    const darkVariant = this.adjustBrightness(baseColor, -0.3);

    return {
      headTextColor: isDark ? '#FFFFFF' : '#000000',
      headBackgroundColor: baseColor,
      contentTextColor: isDark ? '#FFFFFF' : '#000000',
      contentTextValue1Color: baseColor,
      contentTextValue2Color: isDark ? lightVariant : darkVariant,
      positiveButtonTextColor: '#FFFFFF',
      positiveButtonBackground: baseColor,
      negativeButtonTextColor: '#FFFFFF',
      negativeButtonBackground: '#EF4444',
      genericButtonBackground: lightVariant,
      genericButtonTextColor: isDark ? '#FFFFFF' : '#000000',
      genericSmsEditTextBackground: isDark ? darkVariant : lightVariant,
      genericSmsEditTextTextColor: isDark ? '#FFFFFF' : '#000000',
      lineColor: isDark ? lightVariant : darkVariant,
    };
  }

  /**
   * Adjusts the brightness of a hex color
   * @param hex Hex color string
   * @param factor Brightness factor (-1 to 1)
   * @returns Adjusted hex color
   */
  private static adjustBrightness(hex: string, factor: number): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Adjust brightness
    const adjust = (color: number) => {
      const adjusted = Math.round(color + (255 - color) * factor);
      return Math.max(0, Math.min(255, adjusted));
    };

    const newR = adjust(r);
    const newG = adjust(g);
    const newB = adjust(b);

    // Convert back to hex
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }
}

/**
 * Theme utility functions for PagBank SDK styling
 */
export class ThemeUtils {
  /**
   * Validates that all color values in a theme are valid hex colors
   * @param theme PlugpagStyleData to validate
   * @returns Array of validation errors (empty if valid)
   */
  static validateTheme(theme: PlugpagStyleData): string[] {
    const errors: string[] = [];
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    Object.entries(theme).forEach(([key, value]) => {
      if (value && typeof value === 'string' && !hexColorRegex.test(value)) {
        errors.push(`Invalid hex color for ${key}: ${value}`);
      }
    });

    return errors;
  }

  /**
   * Merges a partial theme with a base theme
   * @param baseTheme Base theme to extend
   * @param partialTheme Partial theme with overrides
   * @returns Complete merged theme
   */
  static mergeThemes(
    baseTheme: PlugpagStyleData,
    partialTheme: Partial<PlugpagStyleData>
  ): PlugpagStyleData {
    return {
      ...baseTheme,
      ...partialTheme,
    };
  }

  /**
   * Creates a theme preview object for debugging
   * @param theme Theme to preview
   * @returns Object with color swatches for visualization
   */
  static createThemePreview(theme: PlugpagStyleData): Record<string, string> {
    const preview: Record<string, string> = {};

    Object.entries(theme).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        preview[key] = value;
      }
    });

    return preview;
  }
}
