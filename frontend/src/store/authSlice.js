import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch, apiUrl } from '../utils/api';

const savedToken =
  typeof localStorage !== 'undefined' ? localStorage.getItem('yenat_erp_token') : null;
const savedUser =
  typeof localStorage !== 'undefined' ? localStorage.getItem('yenat_erp_user') : null;

export const login = createAsyncThunk('auth/login', async ({ username, pin }, { rejectWithValue }) => {
  const res = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, pin }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return rejectWithValue(data.error || 'Invalid username or PIN');
  }
  return data;
});

export const validateSession = createAsyncThunk(
  'auth/validateSession',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) {
      return rejectWithValue('No session');
    }
    const res = await apiFetch('/api/auth/me');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return rejectWithValue(data.error || 'Session expired');
    }
    return data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken,
    user: savedUser ? JSON.parse(savedUser) : null,
    isAuthenticated: Boolean(savedToken),
    isLoading: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      state.isLoading = false;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('yenat_erp_token', action.payload.token);
        localStorage.setItem('yenat_erp_user', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('yenat_erp_token');
        localStorage.removeItem('yenat_erp_user');
      }
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('yenat_erp_token', action.payload.token);
          localStorage.setItem('yenat_erp_user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      .addCase(validateSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(validateSession.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('yenat_erp_token');
          localStorage.removeItem('yenat_erp_user');
        }
      });
  },
});

export const { loginSuccess, logout, setAuthError, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
