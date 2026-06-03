/**
 * Games Slice
 * Handles games state and related actions
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { gamesApi } from "@/api/client";
import type { AsyncState } from "@/types/common";
import type { Game, CreateGameRequest, UpdateGameRequest } from "@/types/api";

interface GamesState {
  list: AsyncState<Game[]>;
  currentGame: AsyncState<Game>;
  selectedGameId: string | null;
}

const initialState: GamesState = {
  list: {
    data: null,
    loading: false,
    error: null,
  },
  currentGame: {
    data: null,
    loading: false,
    error: null,
  },
  selectedGameId: null,
};

/**
 * Async thunk to fetch all games
 */
export const fetchGames = createAsyncThunk(
  "games/fetchGames",
  async (_, { rejectWithValue }) => {
    try {
      const response = await gamesApi.getAll();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch games");
    }
  }
);

/**
 * Async thunk to fetch a single game
 */
export const fetchGameById = createAsyncThunk(
  "games/fetchGameById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await gamesApi.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch game");
    }
  }
);

/**
 * Async thunk to create a game
 */
export const createGame = createAsyncThunk(
  "games/createGame",
  async (data: CreateGameRequest, { rejectWithValue }) => {
    try {
      const response = await gamesApi.create(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create game");
    }
  }
);

/**
 * Async thunk to update a game
 */
export const updateGame = createAsyncThunk(
  "games/updateGame",
  async ({ id, data }: { id: string; data: UpdateGameRequest }, { rejectWithValue }) => {
    try {
      const response = await gamesApi.update(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update game");
    }
  }
);

/**
 * Async thunk to delete a game
 */
export const deleteGame = createAsyncThunk(
  "games/deleteGame",
  async (id: string, { rejectWithValue }) => {
    try {
      await gamesApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete game");
    }
  }
);

const gamesSlice = createSlice({
  name: "games",
  initialState,
  reducers: {
    setSelectedGameId: (state, action: PayloadAction<string | null>) => {
      state.selectedGameId = action.payload;
    },
    clearCurrentGame: (state) => {
      state.currentGame = {
        data: null,
        loading: false,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch games
    builder
      .addCase(fetchGames.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.data = action.payload;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error = action.payload as string;
      });

    // Fetch single game
    builder
      .addCase(fetchGameById.pending, (state) => {
        state.currentGame.loading = true;
        state.currentGame.error = null;
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.currentGame.loading = false;
        state.currentGame.data = action.payload;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.currentGame.loading = false;
        state.currentGame.error = action.payload as string;
      });

    // Create game
    builder
      .addCase(createGame.fulfilled, (state, action) => {
        if (state.list.data) {
          state.list.data.push(action.payload);
        }
      });

    // Delete game
    builder
      .addCase(deleteGame.fulfilled, (state, action) => {
        if (state.list.data) {
          state.list.data = state.list.data.filter(
            (game) => game.id !== action.payload
          );
        }
      });
  },
});

export const { setSelectedGameId, clearCurrentGame } = gamesSlice.actions;
export default gamesSlice.reducer;
