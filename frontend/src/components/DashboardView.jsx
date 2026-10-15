import { jsx, jsxs } from "react/jsx-runtime";
import { useAppDispatch, useAppSelector } from "../store";
import { setActiveTab, setActiveInterval } from "../store/erpSlice";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { filterByInterval } from "../utils/financeLedger";
import { getExpiryStatus } from "../utils/expiryAlerts";
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  ShoppingCart,
  Beef,
  Flame,
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";
const DashboardView = ({ onOpenCashIn, onOpenCashOut }) => {
  const dispatch = useAppDispatch();
  const {
    balance,
    sales,
    transactions,
    batches,
    activeInterval,
    currency,
    usdToEtbRate
  } = useAppSelector((state) => state.erp);
  const filteredSales = filterByInterval(sales, activeInterval);
  const filteredTransactions = filterByInterval(transactions, activeInterval);
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalGrossProfit = filteredSales.reduce((acc, s) => acc + s.totalProfit, 0);
  const profitMarginPercent = totalSalesRevenue > 0 ? Math.round(totalGrossProfit / totalSalesRevenue * 1e3) / 10 : 0;
  const totalInflow = filteredTransactions.filter((t) => t.type === "in").reduce((acc, t) => acc + t.amount, 0);
  const totalOutflow = filteredTransactions.filter((t) => t.type === "out").reduce((acc, t) => acc + t.amount, 0);
  const netCashFlow = totalInflow - totalOutflow;
  const today = /* @__PURE__ */ new Date();
  const batchesWithExpiry = batches.filter((b) => b.remainingQuantity > 0).map((b) => ({
    batch: b,
    expiryStatus: getExpiryStatus(b.expiryDate, today)
  })).sort((a, b) => a.expiryStatus.daysRemaining - b.expiryStatus.daysRemaining);
  const urgentBatches = batchesWithExpiry.filter(
    (item) => item.expiryStatus.severity === "URGENT" || item.expiryStatus.severity === "EXPIRED"
  );
  const intervalLabels = [
    { id: "1day", label: "1 Day (Today)" },
    { id: "1week", label: "1 Week" },
    { id: "2weeks", label: "2 Weeks" },
    { id: "1month", label: "1 Month" },
    { id: "3months", label: "3 Months" },
    { id: "all", label: "All History" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "erp-page-inner space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-brand-900 tracking-tight", children: "Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 mt-1", children: "Sales, cash flow, and inventory alerts for the selected period." })
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
    urgentBatches.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 text-amber-700 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xs font-bold text-amber-950 uppercase tracking-wide", children: [
            "Fresh Inventory Expiry Attention (",
            urgentBatches.length,
            " Batches)"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-amber-900 mt-0.5", children: [
            urgentBatches.slice(0, 2).map((item, idx) => /* @__PURE__ */ jsxs("span", { children: [
              idx > 0 && " \xB7 ",
              /* @__PURE__ */ jsx("strong", { children: item.batch.productName }),
              " (",
              item.batch.remainingQuantity,
              " ",
              item.batch.unit,
              " left \u2014 ",
              item.expiryStatus.label,
              ")"
            ] }, item.batch.id)),
            urgentBatches.length > 2 && ` \xB7 +${urgentBatches.length - 2} more`
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => dispatch(setActiveTab("inventory")),
          className: "text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1 self-start sm:self-auto shrink-0",
          children: [
            /* @__PURE__ */ jsx("span", { children: "Review Expiry Watchlist" }),
            /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-neutral-500 mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Available Store Balance" }),
          /* @__PURE__ */ jsx(Wallet, { className: "w-4 h-4 text-emerald-700" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold font-mono text-emerald-950 tabular-nums", children: formatCurrency(balance, currency, usdToEtbRate) }),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-neutral-500 mt-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Guarded against negative" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onOpenCashIn,
              className: "font-semibold text-emerald-800 hover:underline",
              children: "+ Inflow"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-neutral-500 mb-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium", children: [
            "Sales Revenue (",
            activeInterval,
            ")"
          ] }),
          /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4 text-amber-600" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold font-mono text-neutral-900 tabular-nums", children: formatCurrency(totalSalesRevenue, currency, usdToEtbRate) }),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-neutral-500 mt-2", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-neutral-700", children: filteredSales.length }),
          " receipts completed"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-neutral-500 mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Gross Profit from Batches" }),
          /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-emerald-600" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold font-mono text-emerald-900 tabular-nums", children: formatCurrency(totalGrossProfit, currency, usdToEtbRate) }),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-emerald-700 mt-2 font-medium", children: [
          "Margin: ",
          /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold", children: [
            profitMarginPercent,
            "%"
          ] }),
          " calculated by batch costs"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-neutral-500 mb-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium", children: [
            "Net Cash Flow (",
            activeInterval,
            ")"
          ] }),
          netCashFlow >= 0 ? /* @__PURE__ */ jsx(ArrowDownRight, { className: "w-4 h-4 text-emerald-700" }) : /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-4 h-4 text-amber-700" })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `text-2xl font-bold font-mono tabular-nums ${netCashFlow >= 0 ? "text-emerald-950" : "text-amber-800"}`,
            children: formatCurrency(netCashFlow, currency, usdToEtbRate)
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-neutral-500 mt-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "In: ",
            formatCurrency(totalInflow, currency, usdToEtbRate)
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Out: ",
            formatCurrency(totalOutflow, currency, usdToEtbRate)
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => dispatch(setActiveTab("pos")),
          className: "p-3.5 rounded-lg bg-brand-800 text-white hover:bg-emerald-800 transition-colors flex items-center gap-2.5 text-xs font-bold shadow-xs",
          children: [
            /* @__PURE__ */ jsx(ShoppingCart, { className: "w-4 h-4 text-amber-300" }),
            /* @__PURE__ */ jsx("span", { children: "New POS Sale Register" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => dispatch(setActiveTab("production")),
          className: "p-3.5 rounded-lg bg-white border border-neutral-300 hover:border-emerald-700 hover:bg-emerald-50/50 text-neutral-900 transition-colors flex items-center gap-2.5 text-xs font-bold shadow-xs",
          children: [
            /* @__PURE__ */ jsx(Beef, { className: "w-4 h-4 text-amber-700" }),
            /* @__PURE__ */ jsx("span", { children: "Butchery Ox Breakdown" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => dispatch(setActiveTab("production")),
          className: "p-3.5 rounded-lg bg-white border border-neutral-300 hover:border-emerald-700 hover:bg-emerald-50/50 text-neutral-900 transition-colors flex items-center gap-2.5 text-xs font-bold shadow-xs",
          children: [
            /* @__PURE__ */ jsx(Flame, { className: "w-4 h-4 text-amber-600" }),
            /* @__PURE__ */ jsx("span", { children: "Bake Fresh Injera Batch" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => dispatch(setActiveTab("purchases")),
          className: "p-3.5 rounded-lg bg-white border border-neutral-300 hover:border-emerald-700 hover:bg-emerald-50/50 text-neutral-900 transition-colors flex items-center gap-2.5 text-xs font-bold shadow-xs",
          children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-emerald-800" }),
            /* @__PURE__ */ jsx("span", { children: "Receive Inward Stock" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 pb-3 border-b border-neutral-100", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-neutral-900", children: "Recent Customer Receipts" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500", children: "Each sale links directly to batch cost" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => dispatch(setActiveTab("analytics")),
              className: "text-xs font-semibold text-emerald-800 hover:underline",
              children: "All Sales"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 flex-1 overflow-y-auto", children: [
          sales.slice(0, 5).map((sale) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "p-3.5 rounded-lg border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/50 transition-colors",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-neutral-900", children: sale.receiptNumber }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-emerald-950 tabular-nums", children: formatCurrency(sale.total, currency, usdToEtbRate) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-neutral-500 mt-1 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    sale.items.length,
                    " item",
                    sale.items.length === 1 ? "" : "s",
                    " \xB7 ",
                    sale.paymentMethod,
                    " \xB7 ",
                    sale.cashierName
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-emerald-700 font-semibold font-mono", children: [
                    "+$",
                    sale.totalProfit.toFixed(2),
                    " profit"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px] text-neutral-600 mt-1.5 truncate", children: sale.items.map((it) => `${it.productName} (${it.quantity}${it.unit})`).join(", ") })
              ]
            },
            sale.id
          )),
          sales.length === 0 && /* @__PURE__ */ jsx("div", { className: "py-8 text-center text-xs text-neutral-400", children: 'No sales recorded yet. Click "New POS Sale Register" to start selling.' })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 pb-3 border-b border-neutral-100", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-neutral-900", children: "Cash Flow Operations" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500", children: "All withdrawals and deposits require reasons" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => dispatch(setActiveTab("finance")),
              className: "text-xs font-semibold text-emerald-800 hover:underline",
              children: "Full Ledger"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3 flex-1 overflow-y-auto", children: transactions.slice(0, 5).map((tx) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "p-3.5 rounded-lg border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/50 transition-colors",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `w-2 h-2 rounded-full ${tx.type === "in" ? "bg-emerald-600" : "bg-amber-600"}`
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-neutral-900", children: tx.category })
                ] }),
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: `font-mono font-bold tabular-nums ${tx.type === "in" ? "text-emerald-900" : "text-neutral-900"}`,
                    children: [
                      tx.type === "in" ? "+" : "-",
                      formatCurrency(tx.amount, currency, usdToEtbRate)
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-neutral-600 mt-1 line-clamp-1", children: tx.description }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] text-neutral-400 mt-1 font-mono", children: formatDateTime(tx.timestamp) })
            ]
          },
          tx.id
        )) })
      ] })
    ] })
  ] });
};
export {
  DashboardView
};
