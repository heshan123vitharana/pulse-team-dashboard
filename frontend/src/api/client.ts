import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

/**
 * The localStorage key under which the JWT token is stored.
 * Must match the key used in authService.
 */
export const TOKEN_STORAGE_KEY = "pulse_auth_token";

/**
 * Pre-configured Axios instance for all API calls.
 * - Base URL is read from Vite's env variable (falls back to localhost for dev).
 * - Request interceptor automatically attaches the Bearer token from localStorage.
 * - Response interceptor handles 401 globally by clearing auth state.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor: attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ───────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: unknown) => {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem("pulse_user_role");
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
