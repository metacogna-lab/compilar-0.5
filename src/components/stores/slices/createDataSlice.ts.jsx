import { StateCreator } from 'zustand';
import { DataSlice, GameStore, GameMode, PillarId, Pillar, Force } from '../types';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { forceConnectionsData } from '@/components/pilar/forceConnectionsData';

const PILLAR_MAP: Record<string, PillarId> = {
  'divsexp': 'purpose',
  'normexp': 'purpose',
  'indrecip': 'interpersonal',
  'dirrecip': 'interpersonal',
  'popularity': 'interpersonal',
  'status': 'interpersonal',
  'grpprosp': 'learning',
  'ownprosp': 'learning',
  'outresp': 'action',
  'incresp': 'action',
};

export const createDataSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  DataSlice
> = (set, get) => ({
  pillars: {} as Record<PillarId, Pillar>,
  mode: 'egalitarian',
  initialized: false,

  initializePillars: (mode: GameMode) => {
    set((state) => {
      const pillarData = pillarsInfo[mode];
      const newPillars: Record<PillarId, Pillar> = {} as Record<PillarId, Pillar>;

      // Initialize the 5 main PILAR pillars
      const pillarIds: PillarId[] = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
      
      pillarIds.forEach((pillarId) => {
        newPillars[pillarId] = {
          id: pillarId,
          label: pillarId.charAt(0).toUpperCase() + pillarId.slice(1),
          abbreviation: pillarId.charAt(0).toUpperCase(),
          forces: {},
          totalScore: 0,
          masteryLevel: 0,
          unlockedForces: [],
        };
      });

      // Map forces from forceConnectionsData to pillars
      forceConnectionsData.forces
        .filter(f => f.mode.toLowerCase() === mode.toLowerCase())
        .forEach((force) => {
          // Determine which pillar this force belongs to
          const pillarTitle = force.force_from;
          const pillarInfo = pillarData.find(p => p.title === pillarTitle);
          
          if (pillarInfo) {
            const mappedPillarId = PILLAR_MAP[pillarInfo.id] || 'purpose';
            
            if (newPillars[mappedPillarId]) {
              newPillars[mappedPillarId].forces[force.name] = {
                id: force.name,
                name: force.name,
                value: 50, // Default starting value
                velocity: 0,
                lastUpdated: new Date().toISOString(),
              };
            }
          }
        });

      // Calculate initial total scores
      pillarIds.forEach((pillarId) => {
        newPillars[pillarId].totalScore = Object.values(newPillars[pillarId].forces)
          .reduce((sum, force) => sum + force.value, 0);
      });

      state.pillars = newPillars;
      state.mode = mode;
      state.initialized = true;
    });
  },

  updateForce: (pillarId: PillarId, forceId: string, delta: number) => {
    set((state) => {
      const pillar = state.pillars[pillarId];
      if (!pillar) {
        console.warn(`Pillar ${pillarId} not found`);
        return;
      }

      const force = pillar.forces[forceId];
      if (!force) {
        console.warn(`Force ${forceId} not found in pillar ${pillarId}`);
        return;
      }

      // Clamp force value between 0 and 100
      const newValue = Math.max(0, Math.min(100, force.value + delta));
      force.value = newValue;
      force.velocity = delta;
      force.lastUpdated = new Date().toISOString();

      // Recalculate pillar total score
      pillar.totalScore = Object.values(pillar.forces)
        .reduce((sum, f) => sum + f.value, 0);
    });
  },

  setMode: (mode: GameMode) => {
    set((state) => {
      state.mode = mode;
    });
  },

  recalculatePillarScore: (pillarId: PillarId) => {
    set((state) => {
      const pillar = state.pillars[pillarId];
      if (pillar) {
        pillar.totalScore = Object.values(pillar.forces)
          .reduce((sum, force) => sum + force.value, 0);
      }
    });
  },

  updateMasteryLevel: (pillarId: PillarId, newLevel: number) => {
    set((state) => {
      const pillar = state.pillars[pillarId];
      if (pillar) {
        pillar.masteryLevel = Math.max(0, Math.min(5, newLevel));
      }
    });
  },

  unlockForce: (pillarId: PillarId, forceId: string) => {
    set((state) => {
      const pillar = state.pillars[pillarId];
      if (pillar && !pillar.unlockedForces.includes(forceId)) {
        pillar.unlockedForces.push(forceId);
      }
    });
  },
});