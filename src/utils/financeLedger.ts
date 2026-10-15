export type IntervalFilter = '1day' | '1week' | '2weeks' | '1month' | '3months' | 'all';

export interface CashTransaction {
  id: string;
  type: 'in' | 'out';
  amount: number;
  category: string;
  description: string;
  timestamp: string; // ISO date string
  referenceId?: string;
}

/**
 * Validates if an expense / debit can occur without pushing balance negative.
 * The user specified: "the balance can't negative"
 */
export function canDebitBalance(currentBalance: number, debitAmount: number): boolean {
  if (debitAmount <= 0) return false;
  return currentBalance - debitAmount >= 0;
}

/**
 * Computes net cash flow from transactions.
 */
export function calculateCashFlowSummary(transactions: CashTransaction[]) {
  let totalInflow = 0;
  let totalOutflow = 0;

  for (const tx of transactions) {
    if (tx.type === 'in') {
      totalInflow += tx.amount;
    } else if (tx.type === 'out') {
      totalOutflow += tx.amount;
    }
  }

  totalInflow = Math.round(totalInflow * 100) / 100;
  totalOutflow = Math.round(totalOutflow * 100) / 100;
  const netFlow = Math.round((totalInflow - totalOutflow) * 100) / 100;

  return {
    totalInflow,
    totalOutflow,
    netFlow
  };
}

/**
 * Filters items with a timestamp by standard ERP intervals:
 * 1 day (today), 1 week (7 days), 2 weeks (14 days), 1 month (30 days), 3 months (90 days).
 */
export function filterByInterval<T extends { timestamp: string }>(
  items: T[],
  interval: IntervalFilter,
  referenceDate: Date = new Date()
): T[] {
  if (interval === 'all') return items;

  const now = referenceDate.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  let windowMs = dayMs;
  if (interval === '1day') {
    windowMs = dayMs;
  } else if (interval === '1week') {
    windowMs = 7 * dayMs;
  } else if (interval === '2weeks') {
    windowMs = 14 * dayMs;
  } else if (interval === '1month') {
    windowMs = 30 * dayMs;
  } else if (interval === '3months') {
    windowMs = 90 * dayMs;
  }

  const cutoff = now - windowMs;

  return items.filter(item => {
    const itemTime = new Date(item.timestamp).getTime();
    return itemTime >= cutoff && itemTime <= now + 5000; // allow small skew
  });
}
