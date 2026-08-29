export interface User {
  /** Internal Physics by Senath user ID (e.g., usr_9a8b7c6d5e) */
  id: string;
  /** Google's unique, stable account identifier (sub) */
  google_sub: string;
  /** User email address */
  email: string;
  /** Full display name */
  name: string;
  /** Avatar profile image URL */
  picture: string;
  /** Account creation timestamp (ISO) */
  createdAt: string;
  /** Last login timestamp (ISO) */
  lastLoginAt: string;
  /** Current count of saved editable practicals (max 10 allowed) */
  savedPracticalsCount: number;
}

export interface GoogleJwtPayload {
  iss?: string;
  sub: string;
  azp?: string;
  aud: string;
  iat?: number;
  exp?: number;
  email: string;
  email_verified?: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  isAuthModalOpen: boolean;
  openAuthModal: (promptReason?: string) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  clearError: () => void;
  renderGoogleButton: (element: HTMLElement, options?: Record<string, any>) => void;
  modalPromptReason: string | null;
}
