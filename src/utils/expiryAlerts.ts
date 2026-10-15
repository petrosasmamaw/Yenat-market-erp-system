export type ExpirySeverity = 'EXPIRED' | 'URGENT' | 'WARNING' | 'HEALTHY';

export interface BatchExpiryInfo {
  batchNumber: string;
  productName: string;
  expiryDate: string; // YYYY-MM-DD or ISO
  remainingQuantity: number;
  unit: string;
}

export interface ExpiryStatusResult {
  severity: ExpirySeverity;
  daysRemaining: number;
  label: string;
}

/**
 * Evaluates expiry status for fresh & shelf products.
 * Urgent: <= 3 days (e.g. fresh injera, fresh cut siga)
 * Warning: <= 7 days
 * Expired: < 0 days
 * Healthy: > 7 days
 */
export function getExpiryStatus(
  expiryDateString: string,
  currentDate: Date = new Date()
): ExpiryStatusResult {
  const expiry = new Date(expiryDateString);
  // Normalize both to start of day in local time for accurate day difference
  const expDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()).getTime();
  const curDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.round((expDay - curDay) / msPerDay);

  if (daysRemaining < 0) {
    return {
      severity: 'EXPIRED',
      daysRemaining,
      label: `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago`
    };
  }

  if (daysRemaining <= 3) {
    return {
      severity: 'URGENT',
      daysRemaining,
      label: daysRemaining === 0 ? 'Expires today' : `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
    };
  }

  if (daysRemaining <= 7) {
    return {
      severity: 'WARNING',
      daysRemaining,
      label: `Expires in ${daysRemaining} days`
    };
  }

  return {
    severity: 'HEALTHY',
    daysRemaining,
    label: `${daysRemaining} days shelf life`
  };
}
