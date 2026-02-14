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

    // Paleta principal - Modern Coral & Purple
    primary: '#FF6B6B',           // Coral vibrante
    primaryContainer: '#FFE5E5',  // Fondo suave para primary
    onPrimaryContainer: '#A01C1C',
    secondary: '#7B68EE',         // Morado sofisticado
    secondaryContainer: '#EBE0FF', // Fondo suave para secondary
    onSecondaryContainer: '#3D1F6B',
    tertiary: '#FFA800',          // Naranja cálido
    tertiaryContainer: '#FFEBCC', // Fondo suave para tertiary
    onTertiaryContainer: '#8B5A00',

    // Text & Surface
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onError: '#FFFFFF',

    // Header
    header: '#FF6B6B',
    headerEdge: '#FF5555',
    headerCutout: baseLight.colors.background,
    onHeader: '#FFFFFF',

    // Semantic colors
    success: '#22C55E',      // Verde moderno
    onSuccess: '#FFFFFF',
    error: '#E74C3C',        // Rojo profundo para errores
    urgent: '#E74C3C',
    onUrgent: '#FFFFFF',
  },
};
export const darkTheme: AppTheme = {
  ...baseDark,
  roundness: 12,
  colors: {
    ...baseDark.colors,

    // Paleta principal - Modern Coral & Purple (Dark Mode)
    primary: '#FF8080',           // Coral más claro para dark
    primaryContainer: '#A01C1C',  // Fondo oscuro para primary
    onPrimaryContainer: '#FFE5E5',
    secondary: '#9B8FFF',         // Morado más claro
    secondaryContainer: '#3D1F6B', // Fondo oscuro
    onSecondaryContainer: '#EBE0FF',
    tertiary: '#FFB923',          // Naranja más brillante
    tertiaryContainer: '#8B5A00', // Fondo oscuro
    onTertiaryContainer: '#FFEBCC',

    // Text & Surface
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onError: '#FFFFFF',

    // Header
    header: '#FF8080',
    headerEdge: '#FF6B6B',
    headerCutout: baseDark.colors.background,
    onHeader: '#FFFFFF',

    // Semantic colors
    success: '#22C55E',      // Verde brillante para dark
    onSuccess: '#FFFFFF',
    error: '#FF6B6B',        // Rojo coral para dark
    urgent: '#FF6B6B',
    onUrgent: '#FFFFFF',
  },
};

// Mantener export antiguo para evitar romper imports
export const theme = lightTheme;





