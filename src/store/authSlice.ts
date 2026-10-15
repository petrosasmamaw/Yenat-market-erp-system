import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserAccount } from '../types/erp';

interface AuthState {
  token: string | null;
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const savedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('yenat_erp_token') : null;
const savedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('yenat_erp_user') : null;

const initialState: AuthState = {
  token: savedToken,
  user: savedUser ? JSON.parse(savedUser) : {
    id: 'u1',
    username: 'admin',
    name: 'Almaz Tadesse',
    role: 'Store Owner / Manager',
    email: 'almaz@yenatmarketvegas.com'
  },
  isAuthenticated: true, // Default authenticated for frictionless access, can sign in/switch user anytime
  isLoading: false,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; user: UserAccount }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('yenat_erp_token', action.payload.token);
        localStorage.setItem('yenat_erp_user', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('yenat_erp_token');
        localStorage.removeItem('yenat_erp_user');
      }
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

export const { loginSuccess, logout, setAuthError, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
