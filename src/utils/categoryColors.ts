import { MD3Theme } from 'react-native-paper';
import { HabitCategory } from '../store/habits.store';

// Paleta clara (pasteles)
const lightCategoryColors: Record<HabitCategory, string> = {
  study: '#E8F4FF',
  exercise: '#FFE8E8',
  health: '#E8F8E8',
  work: '#FFF4E0',
  personal: '#F4E8FF',
  discipline: '#FFE8F4',
};

// Paleta oscura (tonos profundos acordes al dark mode)
const darkCategoryColors: Record<HabitCategory, string> = {
  study: '#1B2A41',      // azul profundo
  exercise: '#3A1E2A',   // rojo/rosa profundo
  health: '#1E2A22',     // verde profundo
  work: '#2A241B',       // ámbar/marrón profundo
  personal: '#2A1E41',   // púrpura profundo
  discipline: '#3A1E36', // magenta profundo
};

export const getCategoryColor = (
  category: HabitCategory,
  theme?: Pick<MD3Theme, 'dark'> | { dark?: boolean }
): string => {
  const isDark = !!(theme && (theme as any).dark);
  return (isDark ? darkCategoryColors : lightCategoryColors)[category];
};
