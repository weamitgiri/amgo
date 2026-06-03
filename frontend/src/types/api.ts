/**
 * API Request and Response Types
 * Define all API-related type definitions here
 */

/**
 * Login Request/Response Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  refreshToken: string;
}

/**
 * Game Types
 */
export interface Game {
  id: string;
  title: string;
  description?: string;
  status: "active" | "completed" | "pending";
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameRequest {
  title: string;
  description?: string;
}

export interface UpdateGameRequest {
  title?: string;
  description?: string;
  status?: string;
}

/**
 * Group Types
 */
export interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Participant Types
 */
export interface Participant {
  id: string;
  userId: string;
  gameId: string;
  status: "joined" | "pending" | "left";
  joinedAt: string;
  leftAt?: string;
}
