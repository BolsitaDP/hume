import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

export type AppTheme = MD3Theme & {
  colors: MD3Theme[ 'colors' ] & {
    header: string;
    headerEdge: string;
    headerCutout: string;
    onHeader: string;
    success: string;
    onSuccess: string;
    urgent: string;
    onUrgent: string;
  };
};

const baseLight = MD3LightTheme;
const baseDark = MD3DarkTheme;

export const lightTheme: AppTheme = {
  ...baseLight,
  roundness: 12,
  colors: {
    ...baseLight.colors,

    // Paleta principal
    primary: '#FF5B5B',      // Base
    secondary: '#E64545',    // Más oscuro para hover / acciones secundarias

    // Variantes útiles (opcional pero recomendado)
    onPrimary: '#FFFFFF',
    onError: '#FFFFFF',

    // Header
    header: '#FF5B5B',
    headerEdge: '#E64545',
    headerCutout: baseLight.colors.background,
    onHeader: '#FFFFFF',

    // Semantic
    success: '#4CAF50',
    onSuccess: '#FFFFFF',

    // Urgent (intense red, same in light/dark)
    error: '#D32F2F',
    urgent: '#D32F2F',
    onUrgent: '#FFFFFF',
  },
};
export const darkTheme: AppTheme = {
  ...baseDark,
  roundness: 12,
  colors: {
    ...baseDark.colors,

    // Paleta principal
    primary: '#FF6B6B',      // Un pelín más claro para contraste en dark
    secondary: '#E25555',    // Controlado, no tan oscuro

    // Variantes útiles
    onPrimary: '#FFFFFF',
    onError: '#FFFFFF',

    // Header
    header: '#FF6B6B',
    headerEdge: '#E25555',
    headerCutout: baseDark.colors.background,
    onHeader: '#FFFFFF',

    // Semantic
    success: '#22C55E',
    onSuccess: '#FFFFFF',

    // Urgent (intense red, same in light/dark)
    error: '#D32F2F',
    urgent: '#D32F2F',
    onUrgent: '#FFFFFF',
  },
};

// Mantener export antiguo para evitar romper imports
export const theme = lightTheme;





