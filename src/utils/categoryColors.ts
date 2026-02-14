import { MD3Theme } from 'react-native-paper';
import { HabitCategory } from '../store/habits.store';

// Paleta clara - pasteles sofisticados alineados al nuevo tema
const lightCategoryColors: Record<HabitCategory, string> = {
  study: '#D9E9FF',       // Azul suave - derivado de secundario
  exercise: '#FFE5E8',    // Rosa coral - derivado de primary
  health: '#E5F5E8',      // Verde suave - derivado de success
  work: '#FFF0E0',        // Naranja cálido - derivado de tertiary
  personal: '#F0E8FF',    // Morado suave - derivado de secondary
  discipline: '#FFE5E5',  // Rojo profundo - derivado de error
};

// Paleta oscura - tonos profundos del dark theme
const darkCategoryColors: Record<HabitCategory, string> = {
  study: '#1F3A7A',       // Azul profundo - más saturado
  exercise: '#7A2A3A',    // Rojo oscuro - elegante
  health: '#2A5A3A',      // Verde profundo - natural
  work: '#6A4A2A',        // Naranja/Marrón oscuro - cálido
  personal: '#4A3A7A',    // Morado profundo - sofisticado
  discipline: '#7A2A5A',  // Magenta profundo - intenso
};

export const getCategoryColor = (
  category: HabitCategory,
  theme?: Pick<MD3Theme, 'dark'> | { dark?: boolean }
): string => {
  const isDark = !!(theme && (theme as any).dark);
  return (isDark ? darkCategoryColors : lightCategoryColors)[ category ];
};
