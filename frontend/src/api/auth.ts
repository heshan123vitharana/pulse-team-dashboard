import apiClient, { TOKEN_STORAGE_KEY } from "./client";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Credentials sent as application/x-www-form-urlencoded (OAuth2 password flow). */
export interface LoginCredentials {
  username: string; // FastAPI's OAuth2PasswordRequestForm field name for email
  password: string;
}

export interface Role {
  id: number;
  role_name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role?: Role;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role_id: number;
}

/**
 * Shape of the JSON response returned by POST /api/v1/auth/login.
 * Mirrors the backend's `Token` schema.
 */
export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  role: string;
}

/** Keys used for persistence in localStorage. */
const ROLE_STORAGE_KEY = "pulse_user_role";

// ─── Auth Service ─────────────────────────────────────────────────────────────

const authService = {
  /**
   * Authenticates the user against the FastAPI backend.
   *
   * Sends credentials as `application/x-www-form-urlencoded` because
   * FastAPI's `OAuth2PasswordRequestForm` dependency requires that encoding.
   * On success, persists the JWT and role to localStorage.
   *
   * @throws Re-throws Axios errors so the caller can display them.
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const params = new URLSearchParams();
    params.append("username", credentials.username);
    params.append("password", credentials.password);

    const response = await apiClient.post<TokenResponse>(
      "/api/v1/auth/login",
      params,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, role } = response.data;

    localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
    localStorage.setItem(ROLE_STORAGE_KEY, role);

    return response.data;
  },

  /**
   * Clears all auth state from localStorage.
   * Components should call this on explicit logout.
   */
  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
  },

  /**
   * Returns `true` when a JWT token is present in localStorage.
   * Client-side heuristic only — the 401 interceptor handles server-side rejection.
   */
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
  },

  /** Returns the stored role string, or `null` if not authenticated. */
  getRole(): string | null {
    return localStorage.getItem(ROLE_STORAGE_KEY);
  },

  /** Returns the raw JWT string, or `null` if not authenticated. */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  /** Decodes the JWT token and returns the user's email (stored in 'sub'). */
  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      // Convert Base64Url to Base64
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(window.atob(base64));
      return decoded.sub || null;
    } catch (e) {
      console.error("Failed to decode JWT token:", e);
      return null;
    }
  },

  /** Fetches all roles available in the system */
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>("/api/v1/auth/roles");
    return response.data;
  },

  /** Fetches all users (Manager only). */
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>("/api/v1/auth/users");
    return response.data;
  },

  /** Registers a new user (Manager only). */
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>("/api/v1/auth/register", data);
    return response.data;
  },

  /** Get the current logged in user details */
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>("/api/v1/auth/me");
    return response.data;
  },

  /** Update the current logged in user details */
  async updateMe(data: { name?: string; email?: string }): Promise<User> {
    const response = await apiClient.put<User>("/api/v1/auth/me", data);
    return response.data;
  },
};

export default authService;
