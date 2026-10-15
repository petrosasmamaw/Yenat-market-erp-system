function getExpiryStatus(expiryDateString, currentDate = /* @__PURE__ */ new Date()) {
  const expiry = new Date(expiryDateString);
  const expDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()).getTime();
  const curDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
  const msPerDay = 24 * 60 * 60 * 1e3;
  const daysRemaining = Math.round((expDay - curDay) / msPerDay);
  if (daysRemaining < 0) {
    return {
      severity: "EXPIRED",
      daysRemaining,
      label: `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} ago`
    };
  }
  if (daysRemaining <= 3) {
    return {
      severity: "URGENT",
      daysRemaining,
      label: daysRemaining === 0 ? "Expires today" : `Expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`
    };
  }
  if (daysRemaining <= 7) {
    return {
      severity: "WARNING",
      daysRemaining,
      label: `Expires in ${daysRemaining} days`
    };
  }
  return {
    severity: "HEALTHY",
    daysRemaining,
    label: `${daysRemaining} days shelf life`
  };
}
export {
  getExpiryStatus
};
