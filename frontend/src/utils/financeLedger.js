function canDebitBalance(currentBalance, debitAmount) {
  if (debitAmount <= 0) return false;
  return currentBalance - debitAmount >= 0;
}
function calculateCashFlowSummary(transactions) {
  let totalInflow = 0;
  let totalOutflow = 0;
  for (const tx of transactions) {
    if (tx.type === "in") {
      totalInflow += tx.amount;
    } else if (tx.type === "out") {
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
function filterByInterval(items, interval, referenceDate = /* @__PURE__ */ new Date()) {
  if (interval === "all") return items;
  const now = referenceDate.getTime();
  const dayMs = 24 * 60 * 60 * 1e3;
  let windowMs = dayMs;
  if (interval === "1day") {
    windowMs = dayMs;
  } else if (interval === "1week") {
    windowMs = 7 * dayMs;
  } else if (interval === "2weeks") {
    windowMs = 14 * dayMs;
  } else if (interval === "1month") {
    windowMs = 30 * dayMs;
  } else if (interval === "3months") {
    windowMs = 90 * dayMs;
  }
  const cutoff = now - windowMs;
  return items.filter((item) => {
    const itemTime = new Date(item.timestamp).getTime();
    return itemTime >= cutoff && itemTime <= now + 5e3;
  });
}
export {
  calculateCashFlowSummary,
  canDebitBalance,
  filterByInterval
};
