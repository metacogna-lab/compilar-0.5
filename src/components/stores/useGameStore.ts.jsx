import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { GameStore, PillarId } from './types';
import { createDataSlice } from './slices/createDataSlice';
import { createInteractionSlice } from './slices/createInteractionSlice';
import { createGamificationSlice } from './slices/createGamificationSlice';

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createDataSlice(...a),
        ...createInteractionSlice(...a),
        ...createGamificationSlice(...a),
      })),
      {
        name: 'compilar-game-store',
        partialize: (state) => ({
          pillars: state.pillars,
          mode: state.mode,
          initialized: state.initialized,
          points: state.points,
          streak: state.streak,
          lastActivityDate: state.lastActivityDate,
        }),
      }
    ),
    { enabled: process.env.NODE_ENV === 'development', name: 'CompilarGameStore' }
  )
);

// --- Atomic Selectors ---
// Use these to subscribe to specific slices of state for optimal performance

// Select the entire pillars state
export const usePillars = () => useGameStore((state) => state.pillars);

// Select a single pillar by ID
export const usePillar = (pillarId: PillarId) =>
  useGameStore((state) => state.pillars[pillarId]);

// Select a single force within a pillar
export const useForce = (pillarId: PillarId, forceId: string) =>
  useGameStore((state) => state.pillars[pillarId]?.forces[forceId]);

// Select a pillar's total score
export const usePillarTotalScore = (pillarId: PillarId) =>
  useGameStore((state) => state.pillars[pillarId]?.totalScore || 0);

// Select a pillar's mastery level
export const usePillarMasteryLevel = (pillarId: PillarId) =>
  useGameStore((state) => state.pillars[pillarId]?.masteryLevel || 0);

// Select unlocked forces for a pillar
export const useUnlockedForces = (pillarId: PillarId) =>
  useGameStore((state) => state.pillars[pillarId]?.unlockedForces || []);

// Select the current game mode
export const useGameMode = () => useGameStore((state) => state.mode);

// Select gamification data
export const useGamificationData = () =>
  useGameStore((state) => ({
    badges: state.badges,
    points: state.points,
    streak: state.streak,
  }));

// Select initialization state
export const useIsInitialized = () => useGameStore((state) => state.initialized);

// Composite selector for pillar overview (use sparingly)
export const usePillarOverview = (pillarId: PillarId) =>
  useGameStore((state) => {
    const pillar = state.pillars[pillarId];
    if (!pillar) return null;
    
    return {
      id: pillar.id,
      label: pillar.label,
      totalScore: pillar.totalScore,
      masteryLevel: pillar.masteryLevel,
      forceCount: Object.keys(pillar.forces).length,
      unlockedCount: pillar.unlockedForces.length,
    };
  });