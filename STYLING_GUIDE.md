# PagBank SDK UI Customization

This document explains how to customize the appearance of PagBank SDK modal dialogs, buttons, and text using the new styling API.

## Overview

The PagBank SDK displays modal dialogs during payment transactions (like the one shown in your screenshot). You can now customize the colors and appearance of these dialogs to match your app's design.

## Quick Start

```typescript
import PlugpagNitro, { PlugPagThemes, setStyleTheme } from 'react-native-plugpag-nitro';

// Apply a predefined dark theme
await setStyleTheme(PlugPagThemes.DARK_THEME);

// Or create a custom theme
await setStyleTheme({
  headBackgroundColor: '#1A1A1D',
  headTextColor: '#FFFFFF',
  positiveButtonBackground: '#22C55E',
  positiveButtonTextColor: '#FFFFFF',
  negativeButtonBackground: '#EF4444',
  negativeButtonTextColor: '#FFFFFF',
});
```

## Available Style Properties

### Header Styling
- `headTextColor` - Color for header text
- `headBackgroundColor` - Background color for header area

### Content Styling
- `contentTextColor` - General content text color
- `contentTextValue1Color` - Primary monetary values color
- `contentTextValue2Color` - Secondary monetary values color

### Button Styling
- `positiveButtonTextColor` - Text color for confirmation buttons (e.g., "Imprimir")
- `positiveButtonBackground` - Background color for confirmation buttons
- `negativeButtonTextColor` - Text color for cancel buttons (e.g., "Cancelar")
- `negativeButtonBackground` - Background color for cancel buttons
- `genericButtonBackground` - Background for generic buttons (e.g., "Enviar SMS")
- `genericButtonTextColor` - Text color for generic buttons

### Input Fields
- `genericSmsEditTextBackground` - Background for SMS input fields
- `genericSmsEditTextTextColor` - Text color for SMS input fields

### Interface Elements
- `lineColor` - Color for lines, borders, and dividers

## Predefined Themes

### Dark Theme (Matching Your App)
```typescript
import { PlugPagThemes } from 'react-native-plugpag-nitro';

await setStyleTheme(PlugPagThemes.DARK_THEME);
```

### Light Theme
```typescript
await setStyleTheme(PlugPagThemes.LIGHT_THEME);
```

### PagBank Official Theme
```typescript
await setStyleTheme(PlugPagThemes.PAGBANK_THEME);
```

### High Contrast Theme (Accessibility)
```typescript
await setStyleTheme(PlugPagThemes.HIGH_CONTRAST_THEME);
```

## Custom Theme Creation

### Brand-Based Theme
```typescript
import { PlugPagThemes } from 'react-native-plugpag-nitro';

const customTheme = PlugPagThemes.createCustomTheme(
  '#00D4FF', // Primary brand color
  '#1A1A1D', // Background color
  '#FFFFFF', // Text color
  true       // Use dark theme as base
);

await setStyleTheme(customTheme);
```

### Monochromatic Theme
```typescript
const monoTheme = PlugPagThemes.createMonochromaticTheme(
  '#7C3AED', // Base purple color
  true       // Dark variant
);

await setStyleTheme(monoTheme);
```

## Usage in Your App

### Apply Theme on App Initialization
```typescript
import { useEffect } from 'react';
import { setStyleTheme, PlugPagThemes } from 'react-native-plugpag-nitro';

export default function App() {
  useEffect(() => {
    // Apply dark theme to match your app
    setStyleTheme(PlugPagThemes.DARK_THEME)
      .then(() => console.log('Theme applied successfully'))
      .catch(error => console.error('Failed to apply theme:', error));
  }, []);

  // ... rest of your app
}
```

### Dynamic Theme Switching
```typescript
import { useState } from 'react';
import { setStyleTheme, PlugPagThemes } from 'react-native-plugpag-nitro';

function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState('dark');

  const switchTheme = async (themeName: string) => {
    try {
      switch (themeName) {
        case 'dark':
          await setStyleTheme(PlugPagThemes.DARK_THEME);
          break;
        case 'light':
          await setStyleTheme(PlugPagThemes.LIGHT_THEME);
          break;
        case 'pagbank':
          await setStyleTheme(PlugPagThemes.PAGBANK_THEME);
          break;
      }
      setCurrentTheme(themeName);
    } catch (error) {
      console.error('Failed to switch theme:', error);
    }
  };

  return (
    <View>
      <Button title="Dark Theme" onPress={() => switchTheme('dark')} />
      <Button title="Light Theme" onPress={() => switchTheme('light')} />
      <Button title="PagBank Theme" onPress={() => switchTheme('pagbank')} />
    </View>
  );
}
```

## Theme Validation

Validate your theme before applying it:

```typescript
import { ThemeUtils } from 'react-native-plugpag-nitro';

const myTheme = {
  headBackgroundColor: '#1A1A1D',
  positiveButtonBackground: '#22C55E',
  // ... other properties
};

const errors = ThemeUtils.validateTheme(myTheme);
if (errors.length > 0) {
  console.error('Theme validation errors:', errors);
} else {
  await setStyleTheme(myTheme);
}
```

## Merging Themes

Extend existing themes with custom overrides:

```typescript
import { ThemeUtils, PlugPagThemes } from 'react-native-plugpag-nitro';

const customizedDarkTheme = ThemeUtils.mergeThemes(
  PlugPagThemes.DARK_THEME,
  {
    positiveButtonBackground: '#FF6B6B', // Custom red for confirm buttons
    negativeButtonBackground: '#4ECDC4', // Custom teal for cancel buttons
  }
);

await setStyleTheme(customizedDarkTheme);
```

## Color Format

All colors should be provided as hex strings:
- 6-digit hex: `#FFFFFF` (white)
- 3-digit hex: `#FFF` (white, shorthand)
- With alpha: `#FFFFFF80` (white with 50% opacity)

Invalid formats will be ignored and default colors will be used.

## Best Practices

1. **Apply themes early**: Set your theme during app initialization, before any payment operations.

2. **Match your app's design**: Use colors that complement your existing UI for a cohesive experience.

3. **Consider accessibility**: Ensure sufficient contrast between text and background colors.

4. **Test on real devices**: Colors may appear differently on various screens.

5. **Handle errors gracefully**: Always wrap theme application in try-catch blocks.

## Example: Matching Your Current App Theme

Based on your app's dark theme, here's a configuration that would match:

```typescript
const appMatchingTheme = {
  // Header
  headBackgroundColor: '#1A1A1D',
  headTextColor: '#FFFFFF',
  
  // Content
  contentTextColor: '#FFFFFF',
  contentTextValue1Color: '#00D4FF', // Your primary blue
  contentTextValue2Color: '#A1A1AA',
  
  // Buttons (matching the modal in your screenshot)
  positiveButtonBackground: '#22C55E', // Green for "Imprimir"
  positiveButtonTextColor: '#FFFFFF',
  negativeButtonBackground: '#2A2A2F', // Dark for "Cancelar" 
  negativeButtonTextColor: '#00D4FF',  // Blue text
  genericButtonBackground: '#22C55E',  // Green for "Enviar SMS"
  genericButtonTextColor: '#FFFFFF',
  
  // SMS input
  genericSmsEditTextBackground: '#2A2A2F',
  genericSmsEditTextTextColor: '#FFFFFF',
  
  // Lines and borders
  lineColor: '#71717A',
};

await setStyleTheme(appMatchingTheme);
```

This configuration will make the PagBank modal dialogs blend seamlessly with your app's existing dark theme design.
