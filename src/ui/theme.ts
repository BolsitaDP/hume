import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';

export type AppTheme = MD3Theme & {
  colors: MD3Theme['colors'] & {
    header: string;
    headerEdge: string;
    headerCutout: string;
    onHeader: string;
    success: string;
    onSuccess: string;
    urgent: string;
    onUrgent: string;
    glass: string;
    glassStrong: string;
    glassBorder: string;
    glassGlow: string;
  };
};

const baseLight = MD3LightTheme;
const baseDark = MD3DarkTheme;

export const lightTheme: AppTheme = {
  ...baseLight,
  roundness: 16,
  colors: {
    ...baseLight.colors,
    primary: '#415F91',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D6E3FF',
    onPrimaryContainer: '#001B3F',
    secondary: '#565E71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#DAE2F9',
    onSecondaryContainer: '#131C2B',
    tertiary: '#705575',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FAD8FD',
    onTertiaryContainer: '#28132E',
    error: '#BA1A1A',
    onError: '#FFFFFF',
    background: '#F8F9FF',
    onBackground: '#191C20',
    surface: '#F8F9FF',
    onSurface: '#191C20',
    surfaceVariant: '#E0E2EC',
    onSurfaceVariant: '#44474F',
    outline: '#74777F',
    outlineVariant: '#C4C6D0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#2E3036',
    inverseOnSurface: '#F0F0F7',
    inversePrimary: '#ADC6FF',
    elevation: {
      ...baseLight.colors.elevation,
      level0: '#F8F9FF',
      level1: '#F0F3FC',
      level2: '#E9EDF7',
      level3: '#E3E8F3',
      level4: '#E1E6F1',
      level5: '#DBE1ED',
    },
    header: '#EEF2FC',
    headerEdge: '#C8CCD8',
    headerCutout: '#F8F9FF',
    onHeader: '#1B1E24',
    success: '#1E8E5A',
    onSuccess: '#FFFFFF',
    urgent: '#B3261E',
    onUrgent: '#FFFFFF',
    glass: '#F3F4FA',
    glassStrong: '#EBEDF5',
    glassBorder: '#C4C6D0',
    glassGlow: '#000000',
  },
};

export const darkTheme: AppTheme = {
  ...baseDark,
  roundness: 16,
  colors: {
    ...baseDark.colors,
    primary: '#ADC6FF',
    onPrimary: '#002E69',
    primaryContainer: '#284777',
    onPrimaryContainer: '#D6E3FF',
    secondary: '#C2C6DC',
    onSecondary: '#2C3042',
    secondaryContainer: '#43475A',
    onSecondaryContainer: '#DEE2F9',
    tertiary: '#E1BBDD',
    onTertiary: '#412742',
    tertiaryContainer: '#593E59',
    onTertiaryContainer: '#FFD6FA',
    error: '#FFB4AB',
    onError: '#690005',
    background: '#111318',
    onBackground: '#E2E2E9',
    surface: '#111318',
    onSurface: '#E2E2E9',
    surfaceVariant: '#44474F',
    onSurfaceVariant: '#C4C6D0',
    outline: '#8E9099',
    outlineVariant: '#44474F',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#E2E2E9',
    inverseOnSurface: '#2E3036',
    inversePrimary: '#415F91',
    elevation: {
      ...baseDark.colors.elevation,
      level0: '#111318',
      level1: '#1A1D22',
      level2: '#1F2329',
      level3: '#252930',
      level4: '#282D34',
      level5: '#2D323A',
    },
    header: '#1B1E24',
    headerEdge: '#3A3F48',
    headerCutout: '#111318',
    onHeader: '#E2E2E9',
    success: '#5ED29B',
    onSuccess: '#003920',
    urgent: '#FFB4AB',
    onUrgent: '#690005',
    glass: '#1D2027',
    glassStrong: '#242833',
    glassBorder: '#8E9099',
    glassGlow: '#000000',
  },
};

export const theme = darkTheme;