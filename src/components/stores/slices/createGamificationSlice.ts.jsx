import { StateCreator } from 'zustand';
import { GamificationSlice, GameStore, Badge } from '../types';
import { base44 } from '@/api/base44Client';

export const createGamificationSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  GamificationSlice
> = (set, get) => ({
  badges: [],
  points: 0,
  streak: 0,
  lastActivityDate: null,

  loadBadges: (earnedBadges: Badge[]) => {
    set((state) => {
      state.badges = earnedBadges;
    });
  },

  addPoints: (amount: number, reason: string) => {
    set((state) => {
      state.points += amount;
    });
  },

  updateStreak: () => {
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = state.lastActivityDate
        ? new Date(state.lastActivityDate).toISOString().split('T')[0]
        : null;

      if (!lastActivity) {
        // First activity
        state.streak = 1;
        state.lastActivityDate = today;
      } else if (lastActivity === today) {
        // Same day, no change
        return;
      } else {
        // Check if consecutive days
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const dayDiff = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          // Consecutive day
          state.streak += 1;
        } else {
          // Streak broken
          state.streak = 1;
        }
        state.lastActivityDate = today;
      }
    });
  },

  checkAndAwardBadges: async () => {
    try {
      const state = get();
      
      // Call backend function to evaluate and award badges
      const response = await base44.functions.invoke('evaluateUserProgress', {
        pillars: state.pillars,
        points: state.points,
        streak: state.streak,
        currentBadges: state.badges.map(b => b.id),
      });

      if (response.data?.success && response.data.newBadges) {
        set((s) => {
          s.badges = [...s.badges, ...response.data.newBadges];
        });
      }

      if (response.data?.masteryUpdates) {
        Object.entries(response.data.masteryUpdates).forEach(([pillarId, level]) => {
          set((s) => {
            s.updateMasteryLevel(pillarId as any, level as number);
          });
        });
      }
    } catch (error) {
      console.error('Failed to check badges:', error);
    }
  },
});