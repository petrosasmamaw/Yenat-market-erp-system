function formatCurrency(amount, currency = "USD", rate = 125) {
  const safeAmount = isNaN(amount) ? 0 : amount;
  if (currency === "ETB") {
    const etbVal = Math.round(safeAmount * rate * 100) / 100;
    return `${etbVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
  }
  return `$${safeAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatDate(dateString) {
  if (!dateString) return "\u2014";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
}
function formatDateTime(dateString) {
  if (!dateString) return "\u2014";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateString;
  }
}
export {
  formatCurrency,
  formatDate,
  formatDateTime
};
