import { StateCreator } from 'zustand';
import { InteractionSlice, GameStore, PillarId } from '../types';

export const createInteractionSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  InteractionSlice
> = (set, get) => ({
  processInsight: (detectedEntity: {
    pillarId: PillarId;
    forceId?: string;
    confidence: number;
    context?: string;
  }) => {
    set((state) => {
      const { pillarId, forceId, confidence } = detectedEntity;
      const pillar = state.pillars[pillarId];

      if (!pillar) {
        console.warn(`Pillar ${pillarId} not found for insight processing`);
        return;
      }

      // If a specific force is detected, apply weighted increase
      if (forceId && pillar.forces[forceId]) {
        // Confidence-weighted increase: confidence (0-1) * 10 points
        const weightedIncrease = confidence * 10;
        state.updateForce(pillarId, forceId, weightedIncrease);
      } else {
        // Distribute increase across all unlocked forces
        const unlockedForces = pillar.unlockedForces.length > 0
          ? pillar.unlockedForces
          : Object.keys(pillar.forces).slice(0, 3); // Unlock first 3 forces by default

        if (unlockedForces.length > 0) {
          const weightedIncreasePerForce = (confidence * 5) / unlockedForces.length;
          unlockedForces.forEach((fId) => {
            if (pillar.forces[fId]) {
              state.updateForce(pillarId, fId, weightedIncreasePerForce);
            }
          });
        }
      }

      // Add points for insight interaction
      state.addPoints(Math.floor(confidence * 10), 'AI Insight Processed');
    });
  },

  submitAssessment: (pillarId: PillarId, score: number, responses: any[]) => {
    set((state) => {
      const pillar = state.pillars[pillarId];
      if (!pillar) {
        console.warn(`Pillar ${pillarId} not found for assessment submission`);
        return;
      }

      // Update pillar based on assessment score
      // Score is 0-100, distribute across forces
      const totalForces = Object.keys(pillar.forces).length;
      if (totalForces > 0) {
        const scorePerForce = score / totalForces;
        Object.keys(pillar.forces).forEach((forceId) => {
          const currentValue = pillar.forces[forceId].value;
          const delta = (scorePerForce - currentValue) * 0.3; // 30% adjustment towards target
          state.updateForce(pillarId, forceId, delta);
        });
      }

      // Recalculate total score
      state.recalculatePillarScore(pillarId);

      // Check for mastery level progression
      const avgScore = pillar.totalScore / Math.max(1, totalForces);
      let newMasteryLevel = 0;
      if (avgScore >= 80) newMasteryLevel = 5; // Master
      else if (avgScore >= 65) newMasteryLevel = 4; // Practitioner
      else if (avgScore >= 50) newMasteryLevel = 3; // Explorer
      else if (avgScore >= 35) newMasteryLevel = 2; // Developing
      else if (avgScore >= 20) newMasteryLevel = 1; // Newcomer
      
      if (newMasteryLevel > pillar.masteryLevel) {
        state.updateMasteryLevel(pillarId, newMasteryLevel);
        
        // Unlock additional forces based on mastery level
        const forcesToUnlock = Math.min(newMasteryLevel * 2, totalForces);
        const allForceIds = Object.keys(pillar.forces);
        for (let i = 0; i < forcesToUnlock; i++) {
          if (allForceIds[i] && !pillar.unlockedForces.includes(allForceIds[i])) {
            state.unlockForce(pillarId, allForceIds[i]);
          }
        }
      }

      // Award points based on score
      state.addPoints(Math.floor(score), 'Assessment Completed');
      state.updateStreak();

      // Check for badge awards
      state.checkAndAwardBadges();
    });
  },

  processAgentFeedback: (feedback: {
    pillarId: PillarId;
    comprehensionScore: number;
    masteryIndicators: string[];
    strugglingConcepts: string[];
  }) => {
    set((state) => {
      const { pillarId, comprehensionScore, masteryIndicators, strugglingConcepts } = feedback;
      const pillar = state.pillars[pillarId];

      if (!pillar) return;

      // High comprehension: boost related forces
      if (comprehensionScore > 0.7) {
        masteryIndicators.forEach((indicator) => {
          // Try to match indicator to a force
          const matchingForce = Object.keys(pillar.forces).find(fId =>
            fId.toLowerCase().includes(indicator.toLowerCase()) ||
            indicator.toLowerCase().includes(fId.toLowerCase())
          );
          if (matchingForce) {
            state.updateForce(pillarId, matchingForce, 5);
          }
        });
        state.addPoints(15, 'High Comprehension');
      }

      // Low comprehension: slight decrease to struggling concepts
      if (comprehensionScore < 0.4) {
        strugglingConcepts.forEach((concept) => {
          const matchingForce = Object.keys(pillar.forces).find(fId =>
            fId.toLowerCase().includes(concept.toLowerCase())
          );
          if (matchingForce) {
            state.updateForce(pillarId, matchingForce, -3);
          }
        });
      }
    });
  },
});