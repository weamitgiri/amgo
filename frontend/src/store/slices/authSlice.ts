/**
 * Authentication Slice
 * Handles authentication state and related actions
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi, apiClient } from "@/api/client";
import type { AuthState, User } from "@/types/common";
import type { LoginRequest, LoginResponse } from "@/types/api";
import { ENV } from "@/config/environment";

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Async thunk for login
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      
      // Store tokens
      apiClient.setToken(response.token);
      if (typeof window !== "undefined") {
        localStorage.setItem(ENV.REFRESH_TOKEN_KEY, response.refreshToken);
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

/**
 * Async thunk for logout
 */
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      apiClient.setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

/**
 * Async thunk to get current user
 */
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch user");
    }
  }
);

/**
 * Async thunk to refresh authentication token
 */
export const refreshAuthToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        return rejectWithValue("No refresh token available");
      }

      const response = await authApi.refreshToken(refreshToken);
      apiClient.setToken(response.token);
      
      if (typeof window !== "undefined") {
        localStorage.setItem(ENV.REFRESH_TOKEN_KEY, response.refreshToken);
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Token refresh failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Synchronous actions
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Restore auth state from storage
    restoreAuthState: (state, action: PayloadAction<Partial<AuthState>>) => {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user as any;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Refresh Token
    builder
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { setUser, setError, clearError, restoreAuthState } = authSlice.actions;
export default authSlice.reducer;
