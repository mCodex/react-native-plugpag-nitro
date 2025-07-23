````markdown
# PagBank SDK UI Customization

This document explains how to customize the appearance of PagBank SDK modal dialogs, buttons, and text using the new styling API.

## Overview

The PagBank SDK displays modal dialogs during payment transactions. You can customize the colors and appearance of these dialogs to match your app's design by creating custom themes within your application.

## Quick Start

```typescript
import { setStyleTheme } from 'react-native-plugpag-nitro';

// Create and apply a custom theme
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

## Creating Custom Themes

All themes are created within your application. The library provides utilities to help validate and manage themes, but no predefined themes are included.

### Example: Dark Theme
```typescript
const darkTheme = {
  headTextColor: '#FFFFFF',
  headBackgroundColor: '#0A0A0B',
  contentTextColor: '#F3F4F6',
  contentTextValue1Color: '#00D4FF',
  contentTextValue2Color: '#9CA3AF',
  positiveButtonBackground: '#10B981',
  positiveButtonTextColor: '#FFFFFF',
  negativeButtonBackground: '#EF4444',
  negativeButtonTextColor: '#FFFFFF',
  genericButtonBackground: '#1F2937',
  genericButtonTextColor: '#F3F4F6',
  genericSmsEditTextBackground: '#1F2937',
  genericSmsEditTextTextColor: '#F3F4F6',
  lineColor: '#374151',
};

await setStyleTheme(darkTheme);
```

### Example: Light Theme
```typescript
const lightTheme = {
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

await setStyleTheme(lightTheme);
```

### Example: Brand-Based Theme
```typescript
const brandTheme = {
  headTextColor: '#FFFFFF',
  headBackgroundColor: '#7C3AED', // Your brand purple
  contentTextColor: '#1F2937',
  contentTextValue1Color: '#7C3AED',
  contentTextValue2Color: '#6B7280',
  positiveButtonTextColor: '#FFFFFF',
  positiveButtonBackground: '#7C3AED',
  negativeButtonTextColor: '#FFFFFF',
  negativeButtonBackground: '#EF4444',
  genericButtonBackground: '#F3F4F6',
  genericButtonTextColor: '#1F2937',
  genericSmsEditTextBackground: '#F9FAFB',
  genericSmsEditTextTextColor: '#1F2937',
  lineColor: '#E5E7EB',
};

await setStyleTheme(brandTheme);
```

## Usage in Your App

### Apply Theme on App Initialization
```typescript
import { useEffect } from 'react';
import { setStyleTheme } from 'react-native-plugpag-nitro';

export default function App() {
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const customTheme = {
          headBackgroundColor: '#1A1A1D',
          headTextColor: '#FFFFFF',
          positiveButtonBackground: '#22C55E',
          // ... other properties
        };
        
        await setStyleTheme(customTheme);
        console.log('Theme applied successfully');
      } catch (error) {
        console.error('Failed to apply theme:', error);
      }
    };

    initializeTheme();
  }, []);

  // ... rest of your app
}
```

### Dynamic Theme Switching
```typescript
import { useState } from 'react';
import { setStyleTheme } from 'react-native-plugpag-nitro';

function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState('dark');

  const createDarkTheme = () => ({
    headBackgroundColor: '#0A0A0B',
    headTextColor: '#FFFFFF',
    positiveButtonBackground: '#10B981',
    // ... other properties
  });

  const createLightTheme = () => ({
    headBackgroundColor: '#FFFFFF',
    headTextColor: '#1F2937',
    positiveButtonBackground: '#10B981',
    // ... other properties
  });

  const switchTheme = async (themeName: string) => {
    try {
      let theme;
      switch (themeName) {
        case 'dark':
          theme = createDarkTheme();
          break;
        case 'light':
          theme = createLightTheme();
          break;
        default:
          return;
      }
      
      await setStyleTheme(theme);
      setCurrentTheme(themeName);
    } catch (error) {
      console.error('Failed to switch theme:', error);
    }
  };

  return (
    <View>
      <Button title="Dark Theme" onPress={() => switchTheme('dark')} />
      <Button title="Light Theme" onPress={() => switchTheme('light')} />
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

Extend base themes with custom overrides:

```typescript
import { ThemeUtils } from 'react-native-plugpag-nitro';

const baseTheme = {
  headBackgroundColor: '#0A0A0B',
  headTextColor: '#FFFFFF',
  positiveButtonBackground: '#10B981',
  // ... other properties
};

const customizedTheme = ThemeUtils.mergeThemes(baseTheme, {
  positiveButtonBackground: '#FF6B6B', // Custom red for confirm buttons
  negativeButtonBackground: '#4ECDC4', // Custom teal for cancel buttons
});

await setStyleTheme(customizedTheme);
```

## Theme Utility Functions

The library provides utility functions to help with theme management:

```typescript
import { ThemeUtils } from 'react-native-plugpag-nitro';

// Validate theme colors
const errors = ThemeUtils.validateTheme(myTheme);

// Merge themes safely
const mergedTheme = ThemeUtils.mergeThemes(baseTheme, overrides);

// Create theme preview (for debugging)
const preview = ThemeUtils.createThemePreview(myTheme);
console.log(preview); // Shows all color values
```

## Color Format

All colors should be provided as hex strings:
- 6-digit hex: `#FFFFFF` (white)
- 3-digit hex: `#FFF` (white, shorthand)

Invalid formats will be ignored and default colors will be used.

## Best Practices

1. **Apply themes early**: Set your theme during app initialization, before any payment operations.

2. **Match your app's design**: Use colors that complement your existing UI for a cohesive experience.

3. **Consider accessibility**: Ensure sufficient contrast between text and background colors.

4. **Test on real devices**: Colors may appear differently on various screens.

5. **Handle errors gracefully**: Always wrap theme application in try-catch blocks.

6. **Create theme factories**: Use functions to generate consistent themes across your app.

## Example: App-Matching Theme Factory

Create reusable theme generators in your app:

```typescript
// themes.ts
export const createAppTheme = (isDark: boolean = true) => {
  if (isDark) {
    return {
      headBackgroundColor: '#0A0A0B',
      headTextColor: '#FFFFFF',
      contentTextColor: '#F3F4F6',
      contentTextValue1Color: '#00D4FF',
      contentTextValue2Color: '#9CA3AF',
      positiveButtonBackground: '#10B981',
      positiveButtonTextColor: '#FFFFFF',
      negativeButtonBackground: '#EF4444',
      negativeButtonTextColor: '#FFFFFF',
      genericButtonBackground: '#1F2937',
      genericButtonTextColor: '#F3F4F6',
      genericSmsEditTextBackground: '#1F2937',
      genericSmsEditTextTextColor: '#F3F4F6',
      lineColor: '#374151',
    };
  }
  
  return {
    headBackgroundColor: '#FFFFFF',
    headTextColor: '#1F2937',
    contentTextColor: '#1F2937',
    contentTextValue1Color: '#0EA5E9',
    contentTextValue2Color: '#6B7280',
    positiveButtonBackground: '#10B981',
    positiveButtonTextColor: '#FFFFFF',
    negativeButtonBackground: '#EF4444',
    negativeButtonTextColor: '#FFFFFF',
    genericButtonBackground: '#F3F4F6',
    genericButtonTextColor: '#1F2937',
    genericSmsEditTextBackground: '#F9FAFB',
    genericSmsEditTextTextColor: '#1F2937',
    lineColor: '#E5E7EB',
  };
};

// Usage
await setStyleTheme(createAppTheme(true)); // Dark theme
await setStyleTheme(createAppTheme(false)); // Light theme
```

This approach gives you complete control over your app's payment modal styling while maintaining consistency with your app's design system.

````
