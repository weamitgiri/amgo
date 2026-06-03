/**
 * Custom Redux Hooks
 * Type-safe hooks for using Redux in components
 */

import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Auth selectors
 */
export const useAuth = () => useAppSelector((state) => state.auth);
export const useAuthUser = () => useAppSelector((state) => state.auth.user);
export const useAuthLoading = () => useAppSelector((state) => state.auth.isLoading);
export const useAuthError = () => useAppSelector((state) => state.auth.error);
export const useIsAuthenticated = () =>
  useAppSelector((state) => state.auth.isAuthenticated);

/**
 * Games selectors
 */
export const useGames = () => useAppSelector((state) => state.games);
export const useGamesList = () => useAppSelector((state) => state.games.list);
export const useCurrentGame = () => useAppSelector((state) => state.games.currentGame);
export const useSelectedGameId = () =>
  useAppSelector((state) => state.games.selectedGameId);
