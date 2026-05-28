import { api } from './api';
import type { SignInFormData, SignUpFormData, User } from '@/types';

/**
 * Authentication service.
 * Handles user registration, login, and session management.
 */
export const authService = {
  async signIn(data: SignInFormData): Promise<User> {
    return api.post<User>('/auth/signin', data);
  },

  async signUp(data: SignUpFormData): Promise<User> {
    return api.post<User>('/auth/signup', data);
  },

  async signOut(): Promise<void> {
    return api.post('/auth/signout');
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await api.get<User>('/auth/me');
    } catch {
      return null;
    }
  },
};
