import { create } from 'zustand';
import { User, LoginData, RegisterData } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginData) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: !!authService.getCurrentUser(),
  isLoading: false,

  login: async (credentials: LoginData) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      // Token và user đã được lưu trong authService.login
      set({ user: response.user, isAuthenticated: true, isLoading: false });
      return { success: true, user: response.user };
    } catch (error: any) {
      set({ isLoading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Đăng nhập thất bại' 
      };
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true });
    try {
      const response = await authService.register(userData);
      set({ isLoading: false });
      return { success: true, message: response.message };
    } catch (error: any) {
      set({ isLoading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Đăng ký thất bại' 
      };
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const user = authService.getCurrentUser();
    const token = localStorage.getItem('token');
    if (user && token) {
      set({ user, isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },
}));

export default useAuthStore;