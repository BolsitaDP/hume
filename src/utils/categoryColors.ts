import { MD3Theme } from 'react-native-paper';
import { HabitCategory } from '../store/habits.store';

const lightCategoryColors: Record<HabitCategory, string> = {
  study: '#D7ECFF',
  exercise: '#FFE0EC',
  health: '#DDFBEA',
  work: '#FFEED5',
  personal: '#E8E4FF',
  discipline: '#FFDCE5',
};

const darkCategoryColors: Record<HabitCategory, string> = {
  study: '#24446C',
  exercise: '#63304A',
  health: '#225241',
  work: '#5B4330',
  personal: '#423A74',
  discipline: '#6A3044',
};

export const getCategoryColor = (
  category: HabitCategory,
  theme?: Pick<MD3Theme, 'dark'> | { dark?: boolean }
): string => {
  const isDark = !!(theme && (theme as any).dark);
  return (isDark ? darkCategoryColors : lightCategoryColors)[ category ];
};
