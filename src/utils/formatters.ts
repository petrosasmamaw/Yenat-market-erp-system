import { CurrencyMode } from '../types/erp';

/**
 * Formats a monetary amount into USD ($) or Ethiopian Birr (ETB / ብር)
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyMode = 'USD',
  rate: number = 125
): string {
  const safeAmount = isNaN(amount) ? 0 : amount;

  if (currency === 'ETB') {
    const etbVal = Math.round(safeAmount * rate * 100) / 100;
    return `${etbVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
  }

  return `$${safeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a date string into readable short or full date
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}
