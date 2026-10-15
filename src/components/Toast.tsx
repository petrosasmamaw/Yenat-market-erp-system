import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { clearToast } from '../store/erpSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector(state => state.erp.toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dispatch(clearToast());
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-900 text-white border-emerald-700',
    error: 'bg-rose-900 text-white border-rose-700',
    info: 'bg-neutral-900 text-white border-neutral-700'
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info
  }[toast.type];

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in">
      <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bgStyles}`}>
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs font-medium leading-relaxed">
          {toast.message}
        </div>
        <button
          onClick={() => dispatch(clearToast())}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
