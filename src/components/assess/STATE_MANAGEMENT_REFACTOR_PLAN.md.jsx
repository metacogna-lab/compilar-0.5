# State Management Refactor Plan
## PILAR Assessment System - Comprehensive State Architecture

### Current State Management Issues

1. **Scattered State Logic**:
   - `AssessmentChatbot` manages conversation state locally
   - `PillarQuiz` manages quiz state independently
   - `useAgentDrivenUI` hook manages agent analysis state
   - `Assess` page coordinates all states with useState hooks
   - No centralized source of truth

2. **Prop Drilling**:
   - Deep component trees passing props through multiple levels
   - `conversationHistory`, `pillar`, `mode`, `userProfile` passed repeatedly
   - Difficult to add new state without refactoring multiple components

3. **RAG Context Management**:
   - Currently no clear state management for RAG retrieved context
   - Force data, pillar knowledge scattered across components
   - No caching or memoization strategy for expensive RAG queries

4. **Session Persistence**:
   - LocalStorage usage is ad-hoc
   - Assessment state saved inconsistently
   - No structured approach to resuming interrupted sessions

---

### Recommended State Management Solution: Zustand

**Why Zustand over Context API or Redux:**
- Already installed (`zustand@^4.4.7`)
- Minimal boilerplate, TypeScript-friendly
- No provider wrapping needed
- Built-in persistence middleware
- Excellent for both global and scoped state
- Performance-optimized (no unnecessary re-renders)

---

### Proposed Store Architecture

#### 1. **Assessment Store** (`useAssessmentStore`)
**Responsibilities:**
- Current assessment session state
- Selected pillar, mode, view
- Quiz progress and responses
- Session timing and metrics

```typescript
// stores/useAssessmentStore.ts
interface AssessmentState {
  // Session
  sessionId: string | null;
  sessionStartTime: number | null;
  
  // Context
  selectedPillarId: string | null;
  selectedMode: 'egalitarian' | 'hierarchical' | null;
  view: 'overview' | 'quiz' | 'completed';
  
  // Quiz
  currentQuestionIndex: number;
  responses: QuizResponse[];
  quizCompleted: boolean;
  
  // Actions
  startSession: (pillar: string, mode: string) => void;
  updateResponse: (response: QuizResponse) => void;
  completeAssessment: (score: number) => void;
  resetSession: () => void;
}
```

#### 2. **Conversation Store** (`useConversationStore`)
**Responsibilities:**
- Chat message history
- Agent analysis state
- Conversation memory (topics discussed, sentiment, comprehension)

```typescript
// stores/useConversationStore.ts
interface ConversationState {
  messages: Message[];
  conversationMemory: ConversationMemory;
  agentState: AgentState;
  
  // Actions
  addMessage: (message: Message) => void;
  updateMemory: (update: Partial<ConversationMemory>) => void;
  processAgentAnalysis: (analysis: AgentResponse) => void;
  clearConversation: () => void;
}
```

#### 3. **RAG Context Store** (`useRAGStore`)
**Responsibilities:**
- Cached RAG queries and results
- Force data indexed by pillar/mode
- Knowledge retrieval state

```typescript
// stores/useRAGStore.ts
interface RAGState {
  // Cache
  queryCache: Map<string, RagContextChunk[]>;
  forcesByPillarMode: Map<string, ForceData[]>;
  
  // Loading
  isRetrieving: boolean;
  lastQueryTime: number;
  
  // Actions
  retrieveContext: (query: string, pillar: string, mode: string) => Promise<RagContextChunk[]>;
  getCachedForces: (pillar: string, mode: string) => ForceData[];
  invalidateCache: () => void;
}
```

#### 4. **User Profile Store** (`useUserProfileStore`)
**Responsibilities:**
- User profile data
- Assessment history
- Gamification state
- Journey stage

```typescript
// stores/useUserProfileStore.ts
interface UserProfileState {
  profile: UserProfile | null;
  assessmentHistory: AssessmentSession[];
  gamification: UserGamification | null;
  
  // Computed
  experienceLevel: 'novice' | 'intermediate' | 'expert';
  confidenceLevel: 'low' | 'moderate' | 'high';
  
  // Actions
  loadProfile: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  refreshHistory: () => Promise<void>;
}
```

#### 5. **UI State Store** (`useUIStore`)
**Responsibilities:**
- Modal states (remedial panel, bonus challenge, force detail)
- Sidebar visibility
- Chatbot expanded/collapsed
- Loading states

```typescript
// stores/useUIStore.ts
interface UIState {
  // Modals
  showRemedialPanel: boolean;
  showBonusChallenge: boolean;
  showForceDetailModal: boolean;
  selectedForceName: string | null;
  
  // Layout
  isChatbotExpanded: boolean;
  isSidebarCollapsed: boolean;
  
  // Actions
  openModal: (modal: string, data?: any) => void;
  closeModal: (modal: string) => void;
  toggleChatbot: () => void;
}
```

---

### Migration Strategy

#### Phase 1: Create Stores (Week 1)
1. Create `stores/` directory
2. Implement base stores with TypeScript interfaces
3. Add persistence middleware for assessment state
4. Write unit tests for store logic

#### Phase 2: Migrate Components (Week 2)
1. **Assess Page**: Replace useState with store hooks
2. **AssessmentChatbot**: Migrate to useConversationStore
3. **PillarQuiz**: Migrate to useAssessmentStore
4. **Agent-Driven UI**: Integrate with conversation store
5. Remove prop drilling, use stores directly

#### Phase 3: RAG Integration (Week 3)
1. Implement RAG caching in useRAGStore
2. Pre-fetch forces for selected pillar/mode
3. Integrate with `buildDynamicSystemPrompt`
4. Add background refresh for stale data

#### Phase 4: Optimization (Week 4)
1. Add selectors to prevent unnecessary re-renders
2. Implement middleware for analytics tracking
3. Add DevTools support (zustand-devtools)
4. Performance profiling and fixes

---

### Benefits of Refactor

1. **Clarity**: Single source of truth for each domain
2. **Testability**: Stores can be tested independently
3. **Performance**: Fine-grained subscriptions, no prop drilling
4. **Developer Experience**: Predictable state updates, TypeScript support
5. **Persistence**: Built-in localStorage sync for session recovery
6. **Scalability**: Easy to add new features without touching existing code

---

### Code Example: Before vs After

**Before (Assess.js):**
```jsx
const [messages, setMessages] = useState([]);
const [pillar, setPillar] = useState(null);
const [mode, setMode] = useState(null);
// ... 15 more useState hooks

<AssessmentChatbot 
  conversationHistory={messages}
  onUpdateHistory={setMessages}
  pillar={pillar}
  mode={mode}
  // ... many more props
/>
```

**After (Assess.js):**
```jsx
// No local state needed!
<AssessmentChatbot />

// Component internally does:
// const { messages, pillar, mode } = useConversationStore();
// const { selectedPillarId } = useAssessmentStore();
```

---

### Implementation Checklist

- [ ] Create base store files in `stores/` directory
- [ ] Define TypeScript interfaces for all stores
- [ ] Add persistence middleware for assessment state
- [ ] Migrate Assess page to use stores
- [ ] Migrate AssessmentChatbot to conversation store
- [ ] Migrate PillarQuiz to assessment store
- [ ] Implement RAG caching layer
- [ ] Update `buildDynamicSystemPrompt` to use RAG store
- [ ] Remove all prop drilling
- [ ] Add DevTools integration
- [ ] Write migration tests
- [ ] Update documentation

---

### Notes for Implementation

- Use `immer` middleware for nested state updates
- Add `persist` middleware for critical state (assessment progress)
- Consider `subscribeWithSelector` for performance optimization
- Keep stores focused and single-purpose
- Use computed properties (getters) for derived state
- Add middleware for automatic entity sync (e.g., save to DB on state change)

---

### Risk Mitigation

1. **Gradual Migration**: Migrate one component at a time, test thoroughly
2. **Backward Compatibility**: Keep old props working during transition
3. **Feature Flags**: Use flags to toggle between old/new state management
4. **Rollback Plan**: Git branches for easy rollback if issues arise
5. **Performance Monitoring**: Track re-render counts before/after

---

### Success Metrics

- **Code Reduction**: 30-40% less state management code
- **Re-render Optimization**: 50% fewer unnecessary re-renders
- **Developer Velocity**: Faster feature development (measure ticket completion time)
- **Bug Reduction**: Fewer state-related bugs in production
- **Load Time**: Faster initial load with RAG caching