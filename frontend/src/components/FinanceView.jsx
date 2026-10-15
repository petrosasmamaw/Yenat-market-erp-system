import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { setActiveInterval } from "../store/erpSlice";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { filterByInterval } from "../utils/financeLedger";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Minus,
  Search,
  Receipt
} from "lucide-react";
const FinanceView = ({ onOpenCashIn, onOpenCashOut }) => {
  const dispatch = useAppDispatch();
  const {
    balance,
    transactions,
    activeInterval,
    currency,
    usdToEtbRate
  } = useAppSelector((state) => state.erp);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const intervalTransactions = filterByInterval(transactions, activeInterval);
  const filteredTransactions = intervalTransactions.filter((tx) => {
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });
  const totalInflow = intervalTransactions.filter((t) => t.type === "in").reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = intervalTransactions.filter((t) => t.type === "out").reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalInflow - totalOutflow;
  const intervalLabels = [
    { id: "1day", label: "1 Day (Today)" },
    { id: "1week", label: "1 Week" },
    { id: "2weeks", label: "2 Weeks" },
    { id: "1month", label: "1 Month" },
    { id: "3months", label: "3 Months" },
    { id: "all", label: "All History" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "erp-page-inner space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-neutral-900 tracking-tight", children: "Financial Ledger & Cash Flow Tracker" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-1", children: "Real-time balance control, cash in/out entries with mandatory audit descriptions, and zero-overdraft enforcement." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "erp-segment-group shrink-0", children: intervalLabels.map((item) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => dispatch(setActiveInterval(item.id)),
          className: `px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${activeInterval === item.id ? "erp-segment-active" : "erp-segment"}`,
          children: item.label
        },
        item.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "erp-stat-label mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "Current Store Balance" }),
            /* @__PURE__ */ jsx(Wallet, { className: "w-4 h-4 text-brand-800" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold font-mono tabular-nums text-brand-900", children: formatCurrency(balance, currency, usdToEtbRate) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 border-t border-neutral-100 pt-3 text-[11px] font-medium text-neutral-500", children: "Protected: Balance cannot drop below zero." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-neutral-500 text-xs font-medium mb-2", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Total Cash In (",
              activeInterval,
              ")"
            ] }),
            /* @__PURE__ */ jsx(ArrowDownRight, { className: "w-4 h-4 text-emerald-700" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold font-mono text-emerald-900 tabular-nums", children: [
            "+",
            formatCurrency(totalInflow, currency, usdToEtbRate)
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] text-neutral-500 mt-4 pt-3 border-t border-neutral-100", children: "From POS retail sales, deposits, and income" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-neutral-500 text-xs font-medium mb-2", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Total Cash Out (",
              activeInterval,
              ")"
            ] }),
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-4 h-4 text-amber-700" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold font-mono text-neutral-900 tabular-nums", children: [
            "-",
            formatCurrency(totalOutflow, currency, usdToEtbRate)
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] text-neutral-500 mt-4 pt-3 border-t border-neutral-100", children: "For ox cattle, teff flour, rent, staff & utilities" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-neutral-500 text-xs font-medium mb-2", children: [
            /* @__PURE__ */ jsx("span", { children: "Net Operating Cash Flow" }),
            /* @__PURE__ */ jsx(Receipt, { className: "w-4 h-4 text-emerald-600" })
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: `text-2xl font-bold font-mono tabular-nums ${netFlow >= 0 ? "text-emerald-950" : "text-amber-800"}`,
              children: [
                netFlow >= 0 ? "+" : "",
                formatCurrency(netFlow, currency, usdToEtbRate)
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] text-neutral-500 mt-4 pt-3 border-t border-neutral-100", children: "Net liquidity position over selected interval" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-neutral-600", children: [
        /* @__PURE__ */ jsx("strong", { children: "Cash Flow Actions:" }),
        " Every deposit or payout must include a mandatory audit note."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onOpenCashIn,
            className: "px-4 py-2 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5 text-amber-300" }),
              /* @__PURE__ */ jsx("span", { children: "Add Money In (Deposit)" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onOpenCashOut,
            className: "px-4 py-2 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors",
            children: [
              /* @__PURE__ */ jsx(Minus, { className: "w-3.5 h-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Pay Money Out (Expense)" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-neutral-800", children: [
            "Ledger Entries (",
            filteredTransactions.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 ml-3", children: ["all", "in", "out"].map((f) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setTypeFilter(f),
              className: `px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${typeFilter === f ? "bg-brand-800 text-white" : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"}`,
              children: f === "all" ? "All Transactions" : f === "in" ? "Money In" : "Money Out"
            },
            f
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:w-72", children: [
          /* @__PURE__ */ jsx(Search, { className: "w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search by reason, category, ox, worker...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "w-full pl-8 pr-3 py-1.5 text-xs rounded border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-neutral-50/80 text-neutral-600 font-semibold border-b border-neutral-200", children: [
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 font-mono", children: "Date & Time" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Direction" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Category" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Description / Reason" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-right", children: "Amount" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-neutral-200", children: filteredTransactions.map((tx) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-neutral-50/80 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 font-mono text-neutral-500 text-[11px] whitespace-nowrap", children: formatDateTime(tx.timestamp) }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 whitespace-nowrap", children: tx.type === "in" ? /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit", children: [
            /* @__PURE__ */ jsx(ArrowDownRight, { className: "w-3 h-3 text-emerald-700" }),
            /* @__PURE__ */ jsx("span", { children: "Money In" })
          ] }) : /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit", children: [
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-3 h-3 text-amber-700" }),
            /* @__PURE__ */ jsx("span", { children: "Money Out" })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 font-medium text-neutral-900 whitespace-nowrap", children: tx.category }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-neutral-700 max-w-md", children: tx.description }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-right font-mono font-bold text-sm tabular-nums whitespace-nowrap", children: /* @__PURE__ */ jsxs("span", { className: tx.type === "in" ? "text-emerald-950" : "text-neutral-900", children: [
            tx.type === "in" ? "+" : "-",
            formatCurrency(tx.amount, currency, usdToEtbRate)
          ] }) })
        ] }, tx.id)) })
      ] }) }),
      filteredTransactions.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-xs text-neutral-400", children: "No transactions found for the selected interval and filter." })
    ] })
  ] });
};
export {
  FinanceView
};
