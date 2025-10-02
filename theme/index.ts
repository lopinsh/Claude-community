import { createTheme, MantineColorsTuple } from '@mantine/core';

// Custom color palette based on current design
const indigo: MantineColorsTuple = [
  '#eef2ff',
  '#e0e7ff',
  '#c7d2fe',
  '#a5b4fc',
  '#818cf8',
  '#6366f1', // Primary color used throughout app
  '#4f46e5',
  '#4338ca',
  '#3730a6',
  '#312e81',
];

const purple: MantineColorsTuple = [
  '#faf5ff',
  '#f3e8ff',
  '#e9d5ff',
  '#d8b4fe',
  '#c084fc',
  '#a855f7',
  '#9333ea',
  '#7e22ce',
  '#6b21a8',
  '#581c87',
];

const cyan: MantineColorsTuple = [
  '#ecfeff',
  '#cffafe',
  '#a5f3fc',
  '#67e8f9',
  '#22d3ee',
  '#06b6d4',
  '#0891b2',
  '#0e7490',
  '#155e75',
  '#164e63',
];

// Coolors Palette - https://coolors.co/palette/f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1
// Updated vibrant color scheme for categories

const categoryRed: MantineColorsTuple = [
  '#fef2f2',
  '#fee2e2',
  '#fecaca',
  '#fca5a7',
  '#fb7375',
  '#f94144', // Base color (shade 5)
  '#e03a3d',
  '#c73336',
  '#ae2c2f',
  '#952528',
];

const categoryOrange: MantineColorsTuple = [
  '#fff7ed',
  '#ffedd5',
  '#fed7aa',
  '#fdba74',
  '#fb923c',
  '#f3722c', // Base color (shade 5)
  '#da671f',
  '#c15c1b',
  '#a85117',
  '#8f4613',
];

const categoryLightOrange: MantineColorsTuple = [
  '#fffbeb',
  '#fef3c7',
  '#fde68a',
  '#fcd34d',
  '#fbbf24',
  '#f8961e', // Base color (shade 5)
  '#df861b',
  '#c67618',
  '#ad6615',
  '#945612',
];

const categoryPeach: MantineColorsTuple = [
  '#fffbf5',
  '#fef4e8',
  '#fde8ca',
  '#fcd8a1',
  '#fbc478',
  '#f9844a', // Base color (shade 5)
  '#e07742',
  '#c76a3a',
  '#ae5d32',
  '#95502a',
];

const categoryYellow: MantineColorsTuple = [
  '#fefce8',
  '#fef9c3',
  '#fef08a',
  '#fde047',
  '#facc15',
  '#f9c74f', // Base color (shade 5)
  '#e0b347',
  '#c79f3f',
  '#ae8b37',
  '#95772f',
];

const categoryGreen: MantineColorsTuple = [
  '#f1f8f4',
  '#e3f1e9',
  '#c7e3d3',
  '#abd5bd',
  '#8fc7a7',
  '#90be6d', // Base color (shade 5)
  '#82ab62',
  '#749857',
  '#66854c',
  '#587241',
];

const categoryTeal: MantineColorsTuple = [
  '#f0faf8',
  '#d9f3ee',
  '#b3e7dd',
  '#8ddbcc',
  '#67cfbb',
  '#43aa8b', // Base color (shade 5)
  '#3c997d',
  '#35886f',
  '#2e7761',
  '#276653',
];

const categoryBlueGreen: MantineColorsTuple = [
  '#f2f8f8',
  '#d9eeee',
  '#b3dddd',
  '#8dcccc',
  '#67bbbb',
  '#4d908e', // Base color (shade 5)
  '#458280',
  '#3d7472',
  '#356664',
  '#2d5856',
];

const categoryBlue: MantineColorsTuple = [
  '#f3f5f9',
  '#e7ebf3',
  '#cfd7e7',
  '#b7c3db',
  '#9fafcf',
  '#577590', // Base color (shade 5)
  '#4f6982',
  '#475d74',
  '#3f5166',
  '#374558',
];

const categoryDarkBlue: MantineColorsTuple = [
  '#f0f7fa',
  '#d9edf4',
  '#b3dbe9',
  '#8dc9de',
  '#67b7d3',
  '#277da1', // Base color (shade 5)
  '#237191',
  '#1f6581',
  '#1b5971',
  '#174d61',
];

export const theme = createTheme({
  // Primary brand color
  primaryColor: 'categoryBlue',
  primaryShade: { light: 5, dark: 5 },

  // Auto contrast for Badge text colors
  autoContrast: true,
  luminanceThreshold: 0.4,

  // Color palette
  colors: {
    indigo,
    purple,
    cyan,
    categoryRed,
    categoryOrange,
    categoryLightOrange,
    categoryPeach,
    categoryYellow,
    categoryGreen,
    categoryTeal,
    categoryBlueGreen,
    categoryBlue,
    categoryDarkBlue,
    // Dracula dark mode specific colors
    dark: [
      '#f8f8f2', // 0 - Foreground
      '#f8f8f2', // 1 - Foreground
      '#6272a4', // 2 - Comment
      '#6272a4', // 3 - Comment
      '#44475a', // 4 - Current Line
      '#44475a', // 5 - Selection
      '#282a36', // 6 - Background
      '#21222c', // 7 - Darker Background
      '#191a21', // 8 - Even Darker
      '#0f1014', // 9 - Darkest
    ],
  },

  // Typography
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '32px', lineHeight: '1.2', fontWeight: '800' },
      h2: { fontSize: '24px', lineHeight: '1.3', fontWeight: '700' },
      h3: { fontSize: '20px', lineHeight: '1.4', fontWeight: '600' },
      h4: { fontSize: '18px', lineHeight: '1.4', fontWeight: '600' },
      h5: { fontSize: '16px', lineHeight: '1.5', fontWeight: '600' },
      h6: { fontSize: '14px', lineHeight: '1.5', fontWeight: '600' },
    },
  },

  // Spacing
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  // Border radius
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.12)',
  },

  // Breakpoints
  breakpoints: {
    xs: '36em', // 576px
    sm: '48em', // 768px
    md: '62em', // 992px
    lg: '75em', // 1200px
    xl: '88em', // 1408px
  },

  // Component defaults
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'xl',
        shadow: 'sm',
        withBorder: true,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
      styles: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
      },
    },
  },

  // Other settings
  defaultRadius: 'md',
  cursorType: 'pointer',
  focusRing: 'auto',

  // White and black colors (used for backgrounds, borders, etc.)
  white: '#ffffff',
  black: '#282a36', // Dracula background for dark mode

  // Additional theme properties
  other: {
    // Light mode colors
    bodyBackground: '#fafafa',
    cardBackground: '#ffffff',
    sidebarBackground: '#fafafa',
    borderColor: '#f1f5f9',
    borderColorHover: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textDimmed: '#94a3b8',

    // Dark mode colors (Dracula)
    bodyBackgroundDark: '#282a36',
    cardBackgroundDark: '#44475a',
    sidebarBackgroundDark: '#21222c',
    borderColorDark: '#44475a',
    borderColorHoverDark: '#6272a4',
    textPrimaryDark: '#f8f8f2',
    textSecondaryDark: '#f8f8f2',
    textDimmedDark: '#6272a4',

    // Gradient (works in both modes)
    brandGradient: 'linear-gradient(135deg, #f94144 0%, #f9c74f 50%, #43aa8b 100%)', // Coolors palette

    // Transitions
    transition: 'all 0.2s ease',
    transitionSlow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
});

// Export type for theme access in components
export type AppTheme = typeof theme;