import { create } from 'zustand';

export const usePageStore = create((set) => ({
  // Current page context for AI
  currentPageContext: {
    title: "Welcome",
    description: "Explore the app.",
    contentSummary: "This is the default content summary. Navigate to any page to get specific AI insights.",
    pageName: "Home"
  },
  
  // AI Insights panel state
  isAIInsightsOpen: false,
  toggleAIInsights: () => set((state) => ({ isAIInsightsOpen: !state.isAIInsightsOpen })),
  
  // Page context setter
  setCurrentPageContext: (context) => set({ currentPageContext: context }),
  
  // Conversation turn tracking (max 5)
  aiConversationTurns: 0,
  incrementConversationTurns: () => set((state) => ({ aiConversationTurns: state.aiConversationTurns + 1 })),
  resetConversationTurns: () => set({ aiConversationTurns: 0 }),
}));