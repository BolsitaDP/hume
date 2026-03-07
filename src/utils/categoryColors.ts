import { MD3Theme } from 'react-native-paper';
import { HabitCategory } from '../store/habits.store';

const lightCategoryColors: Record<HabitCategory, string> = {
  study: '#B9D4F3',
  exercise: '#E3BDD1',
  health: '#BCDCCB',
  work: '#E0C9AE',
  personal: '#CDC3F1',
  discipline: '#E3B9C8',
};

const darkCategoryColors: Record<HabitCategory, string> = {
  study: '#1E3A5B',
  exercise: '#52263D',
  health: '#1C4637',
  work: '#4A3626',
  personal: '#342E60',
  discipline: '#542639',
};

export const getCategoryColor = (
  category: HabitCategory,
  theme?: Pick<MD3Theme, 'dark'> | { dark?: boolean }
): string => {
  const isDark = !!(theme && (theme as any).dark);
  return (isDark ? darkCategoryColors : lightCategoryColors)[ category ];
};
