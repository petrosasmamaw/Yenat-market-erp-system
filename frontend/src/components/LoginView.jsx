import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { login, clearAuthError } from '../store/authSlice';
import { fetchERPState } from '../store/erpSlice';
import { Store, LogIn } from 'lucide-react';

const appStage = import.meta.env.VITE_APP_STAGE || 'development';

export function LoginView() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(login({ username: username.trim(), pin }));
    if (login.fulfilled.match(result)) {
      dispatch(fetchERPState());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] p-4">
      <div className="erp-card w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-800 ring-1 ring-brand-100">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-brand-900">Yenat Market ERP</h1>
            <p className="text-xs text-neutral-500">Sign in with your staff username and PIN</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">Username</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">PIN</label>
            <input
              type="password"
              autoComplete="current-password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              required
            />
          </div>

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {error}
            </p>
          )}

          <button type="submit" disabled={isLoading} className="erp-btn-primary w-full py-2.5">
            <LogIn className="h-4 w-4" />
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {appStage === 'development' && (
          <p className="mt-6 text-[11px] leading-relaxed text-neutral-500">
            Development demo: use <span className="font-mono text-brand-800">admin</span> / PIN{' '}
            <span className="font-mono text-brand-800">2026</span> until you configure real staff
            records and JWT in <span className="font-mono">backend/.env</span>.
          </p>
        )}
      </div>
    </div>
  );
}
