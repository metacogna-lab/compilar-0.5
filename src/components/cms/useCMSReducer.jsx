import { useReducer } from 'react';

// Action types
const ACTIONS = {
  SET_USER: 'SET_USER',
  SET_SELECTED_CATEGORY: 'SET_SELECTED_CATEGORY',
  TOGGLE_PREVIEW: 'TOGGLE_PREVIEW',
  TOGGLE_METADATA: 'TOGGLE_METADATA',
  SET_ANALYSIS: 'SET_ANALYSIS',
  SET_CONSISTENCY: 'SET_CONSISTENCY',
  SET_SUGGESTIONS: 'SET_SUGGESTIONS',
  SET_BLOG_ANALYSIS: 'SET_BLOG_ANALYSIS',
  START_LOADING: 'START_LOADING',
  STOP_LOADING: 'STOP_LOADING',
  RESET_ANALYSIS: 'RESET_ANALYSIS'
};

// Initial state - grouped by concern
const initialState = {
  // User state
  user: null,
  
  // UI state
  selectedCategory: 'blog',
  showPreviewPopover: false,
  showMetadataPanel: true,
  
  // Analysis state
  aiAnalysis: null,
  analyzingContent: false,
  
  consistencyCheck: null,
  checkingConsistency: false,
  
  suggestedPosts: null,
  generatingSuggestions: false,
  
  blogAnalysis: null,
  analyzingBlog: false,
  
  // Site pages state
  loadingSitePages: false
};

// Reducer function
function cmsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload };
      
    case ACTIONS.SET_SELECTED_CATEGORY:
      return { ...state, selectedCategory: action.payload };
      
    case ACTIONS.TOGGLE_PREVIEW:
      return { ...state, showPreviewPopover: !state.showPreviewPopover };
      
    case ACTIONS.TOGGLE_METADATA:
      return { ...state, showMetadataPanel: !state.showMetadataPanel };
      
    case ACTIONS.SET_ANALYSIS:
      return {
        ...state,
        aiAnalysis: action.payload.data,
        analyzingContent: action.payload.loading
      };
      
    case ACTIONS.SET_CONSISTENCY:
      return {
        ...state,
        consistencyCheck: action.payload.data,
        checkingConsistency: action.payload.loading
      };
      
    case ACTIONS.SET_SUGGESTIONS:
      return {
        ...state,
        suggestedPosts: action.payload.data,
        generatingSuggestions: action.payload.loading
      };
      
    case ACTIONS.SET_BLOG_ANALYSIS:
      return {
        ...state,
        blogAnalysis: action.payload.data,
        analyzingBlog: action.payload.loading
      };
      
    case ACTIONS.START_LOADING:
      return { ...state, [action.payload.key]: true };
      
    case ACTIONS.STOP_LOADING:
      return { ...state, [action.payload.key]: false };
      
    case ACTIONS.RESET_ANALYSIS:
      return {
        ...state,
        aiAnalysis: null,
        consistencyCheck: null,
        blogAnalysis: null
      };
      
    default:
      return state;
  }
}

// Custom hook
export function useCMSReducer() {
  const [state, dispatch] = useReducer(cmsReducer, initialState);
  
  // Action creators
  const actions = {
    setUser: (user) => dispatch({ type: ACTIONS.SET_USER, payload: user }),
    
    setSelectedCategory: (category) => 
      dispatch({ type: ACTIONS.SET_SELECTED_CATEGORY, payload: category }),
      
    togglePreview: () => dispatch({ type: ACTIONS.TOGGLE_PREVIEW }),
    
    toggleMetadata: () => dispatch({ type: ACTIONS.TOGGLE_METADATA }),
    
    setAnalysis: (data, loading = false) =>
      dispatch({ type: ACTIONS.SET_ANALYSIS, payload: { data, loading } }),
      
    setConsistency: (data, loading = false) =>
      dispatch({ type: ACTIONS.SET_CONSISTENCY, payload: { data, loading } }),
      
    setSuggestions: (data, loading = false) =>
      dispatch({ type: ACTIONS.SET_SUGGESTIONS, payload: { data, loading } }),
      
    setBlogAnalysis: (data, loading = false) =>
      dispatch({ type: ACTIONS.SET_BLOG_ANALYSIS, payload: { data, loading } }),
      
    startLoading: (key) => 
      dispatch({ type: ACTIONS.START_LOADING, payload: { key } }),
      
    stopLoading: (key) =>
      dispatch({ type: ACTIONS.STOP_LOADING, payload: { key } }),
      
    resetAnalysis: () => dispatch({ type: ACTIONS.RESET_ANALYSIS })
  };
  
  return [state, actions];
}