import { HabitCategory } from '../store/habits.store';

export const categoryColors: Record<HabitCategory, string> = {
  study: '#E8F4FF',      // Azul muy pastel
  exercise: '#FFE8E8',   // Rojo/Rosa muy pastel
  health: '#E8F8E8',     // Verde muy pastel
  work: '#FFF4E0',       // Naranja/Amarillo muy pastel
  personal: '#F4E8FF',   // Púrpura muy pastel
  discipline: '#FFE8F4', // Rosa muy pastel
};

export const getCategoryColor = (category: HabitCategory): string => {
  return categoryColors[ category ];
};
