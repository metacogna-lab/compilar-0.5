// Core Zustand Store Types for Compilar Engine

export type GameMode = 'egalitarian' | 'hierarchical';

export type PillarId = 'purpose' | 'interpersonal' | 'learning' | 'action' | 'resilience';

export interface Force {
  id: string;
  name: string;
  value: number; // 0-100
  velocity: number; // Rate of change for animations
  lastUpdated: string; // ISO timestamp
}

export interface Pillar {
  id: PillarId;
  label: string;
  abbreviation: string;
  forces: Record<string, Force>; // Keyed by force ID
  totalScore: number; // Derived: sum of all force values
  masteryLevel: number; // 0-5 (Newcomer -> Master)
  unlockedForces: string[]; // Force IDs that are unlocked for this user
}

export interface GameState {
  pillars: Record<PillarId, Pillar>;
  mode: GameMode;
  initialized: boolean;
}

// Gamification Types
export interface BadgeCriteria {
  type: 'pillar_score' | 'assessment_count' | 'streak' | 'mastery_level' | 'self_awareness' | 'consistency';
  pillar?: PillarId;
  threshold: number;
  comparison: 'gte' | 'lte' | 'eq';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: string;
  criteria: BadgeCriteria;
  earnedAt?: string; // ISO timestamp when earned
}

export interface MasteryLevel {
  level: number;
  name: string;
  scoreThreshold: number;
  forcesUnlocked: number; // Number of forces accessible at this level
  description: string;
  rewards: string[];
}

// Store Slice Interfaces
export interface DataSlice {
  pillars: Record<PillarId, Pillar>;
  mode: GameMode;
  initialized: boolean;
  initializePillars: (mode: GameMode) => void;
  updateForce: (pillarId: PillarId, forceId: string, delta: number) => void;
  setMode: (mode: GameMode) => void;
  recalculatePillarScore: (pillarId: PillarId) => void;
  updateMasteryLevel: (pillarId: PillarId, newLevel: number) => void;
  unlockForce: (pillarId: PillarId, forceId: string) => void;
}

export interface InteractionSlice {
  processInsight: (detectedEntity: {
    pillarId: PillarId;
    forceId?: string;
    confidence: number;
    context?: string;
  }) => void;
  submitAssessment: (pillarId: PillarId, score: number, responses: any[]) => void;
  processAgentFeedback: (feedback: {
    pillarId: PillarId;
    comprehensionScore: number;
    masteryIndicators: string[];
    strugglingConcepts: string[];
  }) => void;
}

export interface GamificationSlice {
  badges: Badge[];
  points: number;
  streak: number;
  lastActivityDate: string | null;
  checkAndAwardBadges: () => Promise<void>;
  addPoints: (amount: number, reason: string) => void;
  updateStreak: () => void;
  loadBadges: (earnedBadges: Badge[]) => void;
}

// Combined Store Type
export type GameStore = DataSlice & InteractionSlice & GamificationSlice;

// User Progress Snapshot (for backend sync)
export interface UserProgressSnapshot {
  pillars: Record<PillarId, {
    totalScore: number;
    masteryLevel: number;
    forces: Record<string, number>; // forceId -> value
  }>;
  mode: GameMode;
  timestamp: string;
}