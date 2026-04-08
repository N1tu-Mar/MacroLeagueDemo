import { create } from 'zustand';
import { MealLog } from '../types';
import { DEMO_TODAYS_MEALS } from '../data/mockData';

interface MacroState {
  todaysMeals: MealLog[];
  addMeal: (meal: MealLog) => void;
  getTodaysTotals: () => { calories: number; protein: number; carbs: number; fats: number };
  resetDaily: () => void;
}

export const useMacroStore = create<MacroState>((set, get) => ({
  todaysMeals: DEMO_TODAYS_MEALS,
  addMeal: (meal: MealLog) =>
    set((state) => ({ todaysMeals: [...state.todaysMeals, meal] })),
  getTodaysTotals: () => {
    const meals = get().todaysMeals;
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fats: acc.fats + m.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  },
  resetDaily: () => set({ todaysMeals: [] }),
}));
