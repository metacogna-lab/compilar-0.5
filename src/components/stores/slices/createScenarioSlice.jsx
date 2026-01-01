/**
 * Scenario Management Slice
 * Handles quest/scenario logic with branching paths
 */

export const createScenarioSlice = (set, get) => ({
  // State
  activeScenario: null,
  history: [],
  previewImpact: null,
  
  // Actions
  setActiveScenario: (scenario) => set({ activeScenario: scenario }),
  
  setPreviewForces: (choiceId) => {
    const { activeScenario } = get();
    if (!activeScenario) return;
    
    const choice = activeScenario.choices?.find(c => c.id === choiceId);
    if (!choice) return;
    
    set({ previewImpact: choice.impact });
  },
  
  clearPreview: () => set({ previewImpact: null }),
  
  resolveScenario: (choiceId, scenarioData = {}) => {
    const { activeScenario, history } = get();
    if (!activeScenario) return;
    
    // Find the selected choice
    const choice = activeScenario.choices?.find(c => c.id === choiceId);
    if (!choice) return;
    
    // Apply impacts to pillars
    if (choice.impact) {
      const currentPillars = get().pillars || {};
      const updatedPillars = { ...currentPillars };
      
      Object.entries(choice.impact).forEach(([pillarKey, value]) => {
        if (updatedPillars[pillarKey] !== undefined) {
          updatedPillars[pillarKey] = Math.max(0, Math.min(100, updatedPillars[pillarKey] + value));
        }
      });
      
      set({ pillars: updatedPillars });
    }
    
    // Add to history
    const historyEntry = {
      scenario: activeScenario,
      choiceId,
      choiceText: choice.text,
      timestamp: Date.now(),
    };
    
    set({ history: [...history, historyEntry] });
    
    // Branching logic: Load next scenario or clear
    if (choice.nextScenarioId && scenarioData[choice.nextScenarioId]) {
      const nextScenario = scenarioData[choice.nextScenarioId];
      set({ activeScenario: nextScenario, previewImpact: null });
    } else {
      // No next scenario defined, clear active
      set({ activeScenario: null, previewImpact: null });
    }
  },
  
  resetScenarios: () => set({ activeScenario: null, history: [], previewImpact: null }),
});