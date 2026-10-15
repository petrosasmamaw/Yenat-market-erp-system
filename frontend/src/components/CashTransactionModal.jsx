import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { addCashIn, recordCashOut } from "../store/erpSlice";
import { formatCurrency } from "../utils/formatters";
import { canDebitBalance } from "../utils/financeLedger";
import { X, ArrowDownRight, ArrowUpRight, AlertTriangle } from "lucide-react";
const CashTransactionModal = ({ type, isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const balance = useAppSelector((state) => state.erp.balance);
  const currency = useAppSelector((state) => state.erp.currency);
  const rate = useAppSelector((state) => state.erp.usdToEtbRate);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(
    type === "in" ? "Retail Cash Deposit" : "Worker Wages & Staff"
  );
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  if (!isOpen) return null;
  const numAmount = parseFloat(amount) || 0;
  const isDebit = type === "out";
  const wouldBeNegative = isDebit && !canDebitBalance(balance, numAmount);
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (numAmount <= 0) {
      setErrorMsg("Please enter a valid amount greater than 0.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a clear description explaining why money is moving (e.g. "Monthly worker wage" or "Teff purchase").');
      return;
    }
    if (isDebit && wouldBeNegative) {
      setErrorMsg(`Cannot debit! Balance cannot be negative. Current available is ${formatCurrency(balance, currency, rate)}.`);
      return;
    }
    if (type === "in") {
      dispatch(addCashIn({ amount: numAmount, category, description: description.trim() }));
    } else {
      dispatch(recordCashOut({ amount: numAmount, category, description: description.trim() }));
    }
    onClose();
  };
  const inCategories = [
    "Retail Cash Deposit",
    "Owner Working Capital Inflow",
    "Customer Prepayment",
    "Supplier Rebate / Refund",
    "Other Store Income"
  ];
  const outCategories = [
    "Live Cattle / Ox Carcass Purchase",
    "Teff Flour & Bakery Raw Goods",
    "Spices & Imported Stock Purchase",
    "Worker Wages & Staff",
    "Store Rent (Tropicana Ave)",
    "Utilities (NV Energy & Water)",
    "Packaging & Store Bags",
    "Equipment Maintenance (Slicers & Oven)",
    "Other Operating Expense"
  ];
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "erp-modal-header", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        type === "in" ? /* @__PURE__ */ jsx(ArrowDownRight, { className: "w-5 h-5 text-brand-800" }) : /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-5 h-5 text-neutral-600" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-brand-900", children: type === "in" ? "Add Money In (Cash Inflow)" : "Pay Money Out (Cash Outflow)" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-500", children: [
            "Current Balance: ",
            /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold text-brand-900", children: formatCurrency(balance, currency, rate) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "text-neutral-400 transition-colors hover:text-neutral-700",
          children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [
      errorMsg && /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 shrink-0 text-rose-600" }),
        /* @__PURE__ */ jsx("span", { children: errorMsg })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-xs font-bold text-neutral-700 mb-1", children: [
          "Amount (USD $) ",
          /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2.5 text-neutral-500 font-mono text-sm", children: "$" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              min: "0.01",
              autoFocus: true,
              required: true,
              value: amount,
              onChange: (e) => setAmount(e.target.value),
              placeholder: "0.00",
              className: "w-full pl-8 pr-3 py-2 text-base font-mono font-semibold rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-xs font-bold text-neutral-700 mb-1", children: [
          "Category ",
          /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: category,
            onChange: (e) => setCategory(e.target.value),
            className: "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white",
            children: (type === "in" ? inCategories : outCategories).map((cat) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, cat))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-xs font-bold text-neutral-700 mb-1", children: [
          "Description / Reason ",
          /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            required: true,
            rows: 2,
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: type === "in" ? "e.g. Added weekend cash float or owner deposit" : "e.g. Paid monthly worker wage or NV energy electricity for meat cooler",
            className: "w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-neutral-500 mt-0.5", children: "Every balance movement must have an audit reason for store records." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-neutral-600", children: "Balance after this record:" }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `font-mono font-bold text-sm ${wouldBeNegative ? "text-rose-600" : "text-neutral-900"}`,
            children: formatCurrency(
              type === "in" ? balance + numAmount : Math.max(0, balance - numAmount),
              currency,
              rate
            )
          }
        )
      ] }),
      wouldBeNegative && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-rose-600 font-medium", children: "Action blocked: Store balance cannot be negative per financial policy." }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 pt-2 border-t border-neutral-200", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: wouldBeNegative || numAmount <= 0,
            className: "erp-btn-primary disabled:opacity-50",
            children: type === "in" ? "Confirm Cash In" : "Confirm Cash Out"
          }
        )
      ] })
    ] })
  ] }) });
};
export {
  CashTransactionModal
};
