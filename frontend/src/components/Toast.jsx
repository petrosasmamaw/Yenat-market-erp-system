import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { clearToast } from '../store/erpSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.erp.toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(clearToast()), 4500);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const styles = {
    success: 'border-brand-200 bg-white text-brand-900',
    error: 'border-rose-200 bg-white text-rose-900',
    info: 'border-neutral-200 bg-white text-neutral-800',
  }[toast.type];

  const Icon = { success: CheckCircle2, error: AlertCircle, info: Info }[toast.type];

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md">
      <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-md ${styles}`}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-80" />
        <p className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</p>
        <button
          type="button"
          onClick={() => dispatch(clearToast())}
          className="text-neutral-400 transition-colors hover:text-neutral-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
