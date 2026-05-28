/** Sign-in form data structure */
export interface SignInFormData {
  email: string;
  password: string;
}

/** Sign-up form data structure */
export interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

/** Authenticated user profile */
export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

/** Auth state for store */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
