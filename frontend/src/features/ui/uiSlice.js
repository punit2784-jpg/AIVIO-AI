import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [],
  activeWorkspaceTab: 'incident', // incident | rca | rootcauses | capa | review
  aiPanelOpen: true,
  isAiAnalyzing: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
      state.toasts.push({
        id,
        type: action.payload.type || 'info', // success, error, warning, info
        title: action.payload.title || '',
        message: action.payload.message || '',
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setActiveWorkspaceTab: (state, action) => {
      state.activeWorkspaceTab = action.payload;
    },
    toggleAiPanel: (state) => {
      state.aiPanelOpen = !state.aiPanelOpen;
    },
    setAiAnalyzing: (state, action) => {
      state.isAiAnalyzing = action.payload;
    },
  },
});

export const {
  addToast,
  removeToast,
  setActiveWorkspaceTab,
  toggleAiPanel,
  setAiAnalyzing,
} = uiSlice.actions;

export default uiSlice.reducer;

