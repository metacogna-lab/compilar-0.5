import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createScenarioSlice } from './slices/createScenarioSlice';

/**
 * Main Game Store with Persistence
 * Saves to localStorage under 'compilar-save-v1'
 */
export const useGameStore = create(
  persist(
    (set, get) => ({
      // Pillar State
      pillars: {
        purpose: 50,
        interpersonal: 50,
        learning: 50,
        action: 50,
        resilience: 50,
      },
      
      // Forces State (example)
      forces: {},
      
      // Include Scenario Slice
      ...createScenarioSlice(set, get),
      
      // Utility Actions
      updatePillar: (pillarKey, value) => {
        const currentPillars = get().pillars;
        set({
          pillars: {
            ...currentPillars,
            [pillarKey]: Math.max(0, Math.min(100, value)),
          },
        });
      },
      
      resetGame: () => {
        set({
          pillars: {
            purpose: 50,
            interpersonal: 50,
            learning: 50,
            action: 50,
            resilience: 50,
          },
          forces: {},
        });
        get().resetScenarios();
      },
    }),
    {
      name: 'compilar-save-v1',
    }
  )
);