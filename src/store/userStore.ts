import { create } from 'zustand';
import { UserProfile, DailyGoals } from '../types';
import { DEMO_USER, DEMO_DAILY_GOALS } from '../data/mockData';

interface UserState {
  user: UserProfile | null;
  dailyGoals: DailyGoals;
  isAuthenticated: boolean;
  login: (user?: UserProfile) => void;
  logout: () => void;
  addXp: (amount: number) => void;
  addPoints: (amount: number) => void;
  incrementStreak: () => void;
  incrementMealsLogged: () => void;
  setDailyGoals: (goals: DailyGoals) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  dailyGoals: DEMO_DAILY_GOALS,
  isAuthenticated: false,
  login: (user?: UserProfile) =>
    set({ user: user ?? DEMO_USER, isAuthenticated: true }),
  logout: () =>
    set({ user: null, isAuthenticated: false }),
  addXp: (amount: number) =>
    set((state) => {
      if (!state.user) return state;
      const newXp = state.user.xp + amount;
      const newLevel = Math.floor(newXp / 500) + 1;
      return { user: { ...state.user, xp: newXp, level: newLevel } };
    }),
  addPoints: (amount: number) =>
    set((state) => {
      if (!state.user) return state;
      return { user: { ...state.user, points: state.user.points + amount } };
    }),
  incrementStreak: () =>
    set((state) => {
      if (!state.user) return state;
      const newStreak = state.user.streakCount + 1;
      return {
        user: {
          ...state.user,
          streakCount: newStreak,
          longestStreak: Math.max(newStreak, state.user.longestStreak),
        },
      };
    }),
  incrementMealsLogged: () =>
    set((state) => {
      if (!state.user) return state;
      return { user: { ...state.user, totalMealsLogged: state.user.totalMealsLogged + 1 } };
    }),
  setDailyGoals: (goals: DailyGoals) =>
    set({ dailyGoals: goals }),
}));
