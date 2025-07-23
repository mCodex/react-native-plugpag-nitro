import type { PlugpagStyleData } from './PlugpagNitro.nitro';

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
