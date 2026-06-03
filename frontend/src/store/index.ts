/**
 * Redux Store Configuration
 * Central store setup with all slices
 */

import { configureStore, PreloadedState } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import gamesReducer from "./slices/gamesSlice";

/**
 * Configure Redux store with all reducers
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    games: gamesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types which may contain non-serializable values
        ignoredActions: ["auth/loginUser/fulfilled"],
      },
    }),
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Create a pre-configured store for SSR/testing
 */
export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      games: gamesReducer,
    },
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof setupStore>;
