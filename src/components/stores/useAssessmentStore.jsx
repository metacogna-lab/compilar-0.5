
import { create } from 'zustand';

/**
 * Assessment Store - Manages assessment pipeline state with best practices
 * Uses selectors for granular updates and encapsulates all logic within actions
 */
export const useAssessmentStore = create((set, get) => ({
  // Pipeline state
  pipelineStage: 'profile',
  isLoading: false,
  loadingMessage: '',
  thinkingSteps: [],
  
  // User context and mappings
  goalMapping: null,
  assessmentResults: null,
  
  // Assessment data
  selectedPillarId: null,
  selectedMode: null,
  revealedCard: null,
  conversationHistory: [],
  sessionStartTime: null,
  
  // AI Coaching
  aiCoaching: null,
  isGeneratingCoaching: false,
  
  // Actions - All state modifications encapsulated here
  actions: {
    // Pipeline navigation
    setPipelineStage: (stage) => set({ pipelineStage: stage }),
    
    // Loading state management
    setLoading: (isLoading, message = '', steps = []) => 
      set({ isLoading, loadingMessage: message, thinkingSteps: steps }),
    
    addThinkingStep: (step) => 
      set((state) => ({ thinkingSteps: [...state.thinkingSteps, step] })),
    
    clearThinkingSteps: () => set({ thinkingSteps: [] }),
    
    // Goal mapping
    setGoalMapping: (mapping) => set({ goalMapping: mapping }),
    
    // Assessment session
    startAssessment: (pillarId, mode, cardData) => set({
      selectedPillarId: pillarId,
      selectedMode: mode,
      revealedCard: cardData,
      sessionStartTime: Date.now(),
      conversationHistory: []
    }),
    
    setRevealedCard: (card) => set({ revealedCard: card }),
    
    updateConversationHistory: (history) => set({ conversationHistory: history }),
    
    addConversationMessage: (message) => 
      set((state) => ({ 
        conversationHistory: [...state.conversationHistory, message] 
      })),
    
    // Results
    setAssessmentResults: (results) => set({ assessmentResults: results }),
    
    // AI Coaching
    setAICoaching: (coaching) => set({ aiCoaching: coaching }),
    setGeneratingCoaching: (isGenerating) => set({ isGeneratingCoaching: isGenerating }),
    
    // Reset
    resetAssessment: () => set({
      selectedPillarId: null,
      selectedMode: null,
      revealedCard: null,
      conversationHistory: [],
      sessionStartTime: null,
      assessmentResults: null,
      aiCoaching: null,
      isGeneratingCoaching: false
    }),
    
    resetAll: () => set({
      pipelineStage: 'profile',
      isLoading: false,
      loadingMessage: '',
      thinkingSteps: [],
      goalMapping: null,
      assessmentResults: null,
      selectedPillarId: null,
      selectedMode: null,
      revealedCard: null,
      conversationHistory: [],
      sessionStartTime: null,
      aiCoaching: null,
      isGeneratingCoaching: false
    })
  }
}));

// Selector hooks for granular access (prevents unnecessary re-renders)
export const usePipelineStage = () => useAssessmentStore((state) => state.pipelineStage);
export const useLoadingState = () => useAssessmentStore((state) => ({
  isLoading: state.isLoading,
  loadingMessage: state.loadingMessage,
  thinkingSteps: state.thinkingSteps
}));
export const useGoalMapping = () => useAssessmentStore((state) => state.goalMapping);
export const useAssessmentActions = () => useAssessmentStore((state) => state.actions);
