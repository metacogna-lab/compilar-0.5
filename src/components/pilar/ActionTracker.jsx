/**
 * User Action Tracking Utility
 * Captures and stores all user interactions for analytics
 */

import { base44 } from '@/api/base44Client';

// Session ID key for localStorage
const SESSION_KEY = 'pilar_session_id';
const SESSION_EXPIRY_KEY = 'pilar_session_expiry';
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

let sessionId = null;

export function getSessionId() {
  if (sessionId) return sessionId;
  
  // Try to restore from localStorage
  if (typeof window !== 'undefined') {
    const storedSession = localStorage.getItem(SESSION_KEY);
    const storedExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    
    if (storedSession && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      if (Date.now() < expiryTime) {
        // Session still valid, extend it
        sessionId = storedSession;
        localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
        return sessionId;
      }
    }
    
    // Create new session
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
    localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
  } else {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return sessionId;
}

// Refresh session expiry on activity
export function refreshSession() {
  if (typeof window !== 'undefined' && sessionId) {
    localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
  }
}

/**
 * Track a user action
 */
export async function trackAction(actionType, data = {}) {
  // Refresh session on any activity
  refreshSession();
  
  const action = {
    action_type: actionType,
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    ...data
  };

  // Fire and forget - don't block UI
  // Silently fail if user is not authenticated
  try {
    await base44.entities.UserAction.create(action);
  } catch (error) {
    // Ignore authentication errors silently
    if (!error.message?.includes('auth') && !error.message?.includes('401')) {
      console.error('Failed to track action:', error);
    }
  }
  
  return action;
}

/**
 * Track page view
 */
export function trackPageView(pageName, pillar = null) {
  return trackAction('page_view', {
    page: pageName,
    pillar
  });
}

/**
 * Track pillar selection
 */
export function trackPillarSelected(pillar, source = 'map') {
  return trackAction('pillar_selected', {
    pillar,
    metadata: { source }
  });
}

/**
 * Track assessment start
 */
export function trackAssessmentStarted(pillar, attemptNumber = 1) {
  return trackAction('assessment_started', {
    pillar,
    metadata: { attempt_number: attemptNumber }
  });
}

/**
 * Track assessment completion
 */
export function trackAssessmentCompleted(pillar, score, responseCount) {
  return trackAction('assessment_completed', {
    pillar,
    metadata: { score, response_count: responseCount }
  });
}

/**
 * Track question answered
 */
export function trackQuestionAnswered(pillar, questionId, timeSpent, wasSkipped = false) {
  return trackAction(wasSkipped ? 'question_skipped' : 'question_answered', {
    pillar,
    metadata: { question_id: questionId, time_spent_seconds: timeSpent }
  });
}

/**
 * Track modal interactions
 */
export function trackModalOpened(pillar) {
  return trackAction('modal_opened', { pillar });
}

export function trackModalClosed(pillar) {
  return trackAction('modal_closed', { pillar });
}

/**
 * Track navigation clicks
 */
export function trackNavigationClick(from, to) {
  return trackAction('navigation_click', {
    metadata: { from_page: from, to_page: to }
  });
}

/**
 * Track recommendation interaction
 */
export function trackRecommendationClicked(pillar, recommendationType) {
  return trackAction('recommendation_clicked', {
    pillar,
    metadata: { recommendation_type: recommendationType }
  });
}

/**
 * Track activity started
 */
export function trackActivityStarted(pillar, activityName) {
  return trackAction('activity_started', {
    pillar,
    metadata: { activity_name: activityName }
  });
}

/**
 * Track graph interaction
 */
export function trackGraphInteraction(graphType, interactionType, metadata = {}) {
  return trackAction('graph_interaction', {
    metadata: { graph_type: graphType, interaction_type: interactionType, ...metadata }
  });
}

/**
 * Track chatbot interaction
 */
export function trackChatbotInteraction(context, messageType, pillar = null) {
  return trackAction('chatbot_interaction', {
    pillar,
    metadata: { context, message_type: messageType }
  });
}

/**
 * Track content read/engagement
 */
export function trackContentEngagement(contentType, contentId, duration = null, pillar = null) {
  return trackAction('content_engagement', {
    pillar,
    metadata: { content_type: contentType, content_id: contentId, duration_seconds: duration }
  });
}

/**
 * Track insight viewed
 */
export function trackInsightViewed(insightType, pillar = null, metadata = {}) {
  return trackAction('insight_viewed', {
    pillar,
    metadata: { insight_type: insightType, ...metadata }
  });
}