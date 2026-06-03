/**
 * Store Selectors and Utilities
 * Pre-built selectors for commonly used state slices
 */

import type { RootState } from "./index";

/**
 * Authentication Selectors
 */
export const selectAuth = (state: RootState) => state.auth;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

/**
 * Games Selectors
 */
export const selectGames = (state: RootState) => state.games;
export const selectGamesList = (state: RootState) => state.games.list;
export const selectGamesLoading = (state: RootState) => state.games.list.loading;
export const selectGamesError = (state: RootState) => state.games.list.error;
export const selectCurrentGame = (state: RootState) => state.games.currentGame;
export const selectSelectedGameId = (state: RootState) => state.games.selectedGameId;

/**
 * Memoized Selectors
 * These can be used with redux-reselect for optimized renders
 */
export const selectGameById = (gameId: string) => (state: RootState) => {
  return state.games.list.data?.find((game) => game.id === gameId);
};

export const selectGameCount = (state: RootState) => {
  return state.games.list.data?.length ?? 0;
};
