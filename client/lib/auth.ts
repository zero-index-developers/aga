const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
const GITHUB_AUTH_START_PATH = '/api/auth/github';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  avatar?: string | null;
  github_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

class AuthService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const localToken = localStorage.getItem('auth_token');

    if (localToken) {
      return localToken;
    }

    const cookieToken = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('auth_token='))
      ?.split('=')[1];

    return cookieToken ? decodeURIComponent(cookieToken) : null;
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `auth_token=${encodeURIComponent(token)}; Path=/; Max-Age=2592000; SameSite=Lax${secure}`;
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; Path=/; Max-Age=0; SameSite=Lax';
  }

  clearToken(): void {
    this.removeToken();
  }

  private getErrorMessage(data: any, status: number): string {
    if (data?.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors)
        .flat()
        .filter((message): message is string => typeof message === 'string');

      if (messages.length > 0) {
        return messages.join(' ');
      }
    }

    return data?.message || `Request failed with status ${status}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    if (!API_URL) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured');
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(this.getErrorMessage(data, response.status));
    }

    return data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setToken(data.token);
    return data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.removeToken();
    }
  }

  async getUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/user');
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async getGitHubAuthUrl(): Promise<{ url: string }> {
    return this.request<{ url: string }>('/auth/github');
  }

  getGitHubAuthStartUrl(): string {
    if (!API_URL) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured');
    }

    return `${API_URL}${GITHUB_AUTH_START_PATH}`;
  }

  startGitHubOAuth(): void {
    const url = this.getGitHubAuthStartUrl();
    console.info('[GitHub OAuth] Redirecting to backend OAuth start:', url);
    window.location.assign(url);
  }

  async handleGitHubCallback(code: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>(`/auth/github/callback?code=${code}`);
    this.setToken(data.token);
    return data;
  }

  async disconnectGitHub(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/github/disconnect', {
      method: 'POST',
    });
  }
}

export const authService = new AuthService();

// Made with Bob
