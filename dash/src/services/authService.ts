import { LoginResponse, User } from "../types/auth";

// Storage keys
const AUTH_STORAGE_KEY = "authUser";
const TOKEN_STORAGE_KEY = "authToken";
const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";
const TOKEN_EXPIRES_KEY = "tokenExpires";

export class AuthService {
  // Store login response
  static storeAuthData(loginResponse: LoginResponse): void {
    try {
      // Store the full response
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loginResponse));

      // Store individual tokens for easy access
      sessionStorage.setItem(TOKEN_STORAGE_KEY, loginResponse.token);
      sessionStorage.setItem(
        REFRESH_TOKEN_STORAGE_KEY,
        loginResponse.refreshToken
      );
      sessionStorage.setItem(
        TOKEN_EXPIRES_KEY,
        loginResponse.tokenExpires.toString()
      );

      console.log("✅ Auth data stored successfully");
    } catch (error) {
      console.error("❌ Error storing auth data:", error);
    }
  }

  // Get stored auth data
  static getAuthData(): LoginResponse | null {
    try {
      const authData = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.error("❌ Error retrieving auth data:", error);
      return null;
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    const authData = this.getAuthData();
    return authData?.user || null;
  }

  // Get access token
  static getToken(): string | null {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  // Get token expiration
  static getTokenExpires(): number | null {
    const expires = sessionStorage.getItem(TOKEN_EXPIRES_KEY);
    return expires ? parseInt(expires) : null;
  }

  // Check if token is expired
  static isTokenExpired(): boolean {
    const expires = this.getTokenExpires();
    if (!expires) return true;

    // Add 5 minute buffer before expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() >= expires - bufferTime;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user && !this.isTokenExpired());
  }

  // Update token (for refresh scenarios)
  static updateToken(newToken: string, newExpires: number): void {
    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      sessionStorage.setItem(TOKEN_EXPIRES_KEY, newExpires.toString());

      // Update the stored auth data
      const authData = this.getAuthData();
      if (authData) {
        authData.token = newToken;
        authData.tokenExpires = newExpires;
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      }

      console.log("✅ Token updated successfully");
    } catch (error) {
      console.error("❌ Error updating token:", error);
    }
  }

  // Clear all auth data
  static clearAuthData(): void {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRES_KEY);

      console.log("✅ Auth data cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing auth data:", error);
    }
  }

  // Get user's full name
  static getUserFullName(): string {
    const user = this.getCurrentUser();
    if (!user) return "";

    return `${user.firstName} ${user.lastName}`.trim();
  }

  // Get user's role
  static getUserRole(): string {
    const user = this.getCurrentUser();
    return user?.role?.name || "";
  }

  // Get company info
  static getCompanyInfo() {
    const user = this.getCurrentUser();
    return user?.company || null;
  }

  // Check if user has specific role
  static hasRole(roleName: string): boolean {
    const userRole = this.getUserRole();
    return userRole.toLowerCase() === roleName.toLowerCase();
  }

  // Check if user is admin
  static isAdmin(): boolean {
    return this.hasRole("admin");
  }

  // Check if user is user
  static isUser(): boolean {
    return this.hasRole("user");
  }
}
