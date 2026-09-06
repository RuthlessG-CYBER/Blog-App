import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    primary: '#005c55',
    onPrimary: '#ffffff',
    onSurface: '#131b2e',
    outline: '#6e7977',
    outlineVariant: '#a0aba9',
    error: '#ba1a1a',
    secondary: '#545f73',
    white: '#ffffff',
    primaryContainer: '#0f766e',
    background: '#faf8ff',
    surfaceContainer: '#eaedff',
  },
  dark: {
    primary: '#ffffff',
    onPrimary: '#000000',
    onSurface: '#ffffff',
    outline: '#404040',
    outlineVariant: '#262626',
    error: '#ff5555',
    secondary: '#a3a3a3',
    white: '#000000',
    primaryContainer: '#262626',
    background: '#000000',
    surfaceContainer: '#121212',
  }
};

export const useTheme = () => {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
};
