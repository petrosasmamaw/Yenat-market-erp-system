import { jsx, jsxs } from "react/jsx-runtime";
import { useAppDispatch, useAppSelector } from "../store";
import { setActiveInterval } from "../store/erpSlice";
import { formatCurrency } from "../utils/formatters";
import { filterByInterval } from "../utils/financeLedger";
import {
  TrendingUp,
  Award,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3
} from "lucide-react";
const AnalyticsView = () => {
  const dispatch = useAppDispatch();
  const { sales, transactions, activeInterval, currency, usdToEtbRate } = useAppSelector(
    (state) => state.erp
  );
  const filteredSales = filterByInterval(sales, activeInterval);
  const filteredTransactions = filterByInterval(transactions, activeInterval);
  const intervalLabels = [
    { id: "1day", label: "1 Day (Today)" },
    { id: "1week", label: "1 Week" },
    { id: "2weeks", label: "2 Weeks" },
    { id: "1month", label: "1 Month" },
    { id: "3months", label: "3 Months" },
    { id: "all", label: "All Time" }
  ];
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalBatchCost = filteredSales.reduce((sum, s) => sum + s.totalCost, 0);
  const totalGrossProfit = filteredSales.reduce((sum, s) => sum + s.totalProfit, 0);
  const overallMargin = totalSalesRevenue > 0 ? Math.round(totalGrossProfit / totalSalesRevenue * 1e3) / 10 : 0;
  const productMap = /* @__PURE__ */ new Map();
  for (const sale of filteredSales) {
    for (const item of sale.items) {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += item.itemTotal;
        existing.totalCost += item.costPrice * item.quantity;
        existing.totalProfit += item.itemProfit;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: item.quantity,
          unit: item.unit,
          totalRevenue: item.itemTotal,
          totalCost: item.costPrice * item.quantity,
          totalProfit: item.itemProfit
        });
      }
    }
  }
  const topProducts = Array.from(productMap.values()).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );
  const totalInflow = filteredTransactions.filter((t) => t.type === "in").reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = filteredTransactions.filter((t) => t.type === "out").reduce((sum, t) => sum + t.amount, 0);
  return /* @__PURE__ */ jsxs("div", { className: "erp-page-inner space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-neutral-900 tracking-tight", children: "Sales & Batch Profit Analytics" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-1", children: "Analyze gross margins, top revenue drivers (Berbere, Siga, Kibe, Injera), and cash flows." })
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
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-neutral-500 mb-2", children: "Total Sales Revenue" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold font-mono text-neutral-900 tabular-nums", children: formatCurrency(totalSalesRevenue, currency, usdToEtbRate) }),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-neutral-500 mt-2", children: [
          "Across ",
          filteredSales.length,
          " customer sales"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-neutral-500 mb-2", children: "Batch Cost Basis (COGS)" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold font-mono text-neutral-700 tabular-nums", children: formatCurrency(totalBatchCost, currency, usdToEtbRate) }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] text-neutral-500 mt-2", children: "Calculated from specific batch purchase prices" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-neutral-500 mb-2", children: "Gross Profit Earned" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold font-mono text-emerald-900 tabular-nums", children: formatCurrency(totalGrossProfit, currency, usdToEtbRate) }),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-emerald-700 mt-2 font-medium", children: [
          "Overall Margin: ",
          /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold", children: [
            overallMargin,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "erp-card p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-neutral-500 mb-2", children: "Cash Inflow vs Outflow" }),
        /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold font-mono text-neutral-900 tabular-nums", children: [
          "+",
          formatCurrency(totalInflow, currency, usdToEtbRate)
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs font-mono text-neutral-500 mt-1", children: [
          "-",
          formatCurrency(totalOutflow, currency, usdToEtbRate)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-neutral-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(BarChart3, { className: "w-4 h-4 text-emerald-800" }),
            /* @__PURE__ */ jsx("span", { children: "Revenue vs Batch Cost Comparison" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-0.5", children: "Visual breakdown of gross profit retained by top products in this interval" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          topProducts.slice(0, 5).map((item) => {
            const profitPct = item.totalRevenue > 0 ? Math.round(item.totalProfit / item.totalRevenue * 100) : 0;
            return /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-neutral-900", children: item.productName }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900 tabular-nums", children: [
                  "$",
                  item.totalRevenue.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "h-3 w-full bg-neutral-100 rounded-full overflow-hidden flex", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: { width: `${100 - profitPct}%` },
                    className: "bg-neutral-400 h-full",
                    title: `Cost: $${item.totalCost.toFixed(2)}`
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: { width: `${profitPct}%` },
                    className: "bg-emerald-700 h-full",
                    title: `Profit: $${item.totalProfit.toFixed(2)}`
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[11px] text-neutral-500", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  "Cost: $",
                  item.totalCost.toFixed(2),
                  " (",
                  100 - profitPct,
                  "%)"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-emerald-800 font-semibold font-mono", children: [
                  "Profit: +$",
                  item.totalProfit.toFixed(2),
                  " (",
                  profitPct,
                  "% margin)"
                ] })
              ] })
            ] }, item.productId);
          }),
          topProducts.length === 0 && /* @__PURE__ */ jsx("div", { className: "py-12 text-center text-xs text-neutral-400", children: "No sales recorded in this interval to graph." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-neutral-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4 text-amber-700" }),
            /* @__PURE__ */ jsx("span", { children: "Cash Flow Inflow & Outflow Ratio" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-0.5", children: "Comparison of operating deposits vs inventory & operating expenses" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-semibold mb-1", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-emerald-900 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(ArrowDownRight, { className: "w-3.5 h-3.5 text-emerald-700" }),
                /* @__PURE__ */ jsx("span", { children: "Total Inflow (Sales & Deposits)" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-emerald-950", children: formatCurrency(totalInflow, currency, usdToEtbRate) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-4 w-full bg-neutral-100 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  width: `${totalInflow + totalOutflow > 0 ? Math.min(100, Math.round(totalInflow / (totalInflow + totalOutflow) * 100)) : 50}%`
                },
                className: "bg-emerald-800 h-full rounded-lg"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-semibold mb-1", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-amber-900 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-3.5 h-3.5 text-amber-700" }),
                /* @__PURE__ */ jsx("span", { children: "Total Outflow (Cattle, Teff, Rent, Wages)" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-neutral-900", children: formatCurrency(totalOutflow, currency, usdToEtbRate) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-4 w-full bg-neutral-100 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  width: `${totalInflow + totalOutflow > 0 ? Math.min(100, Math.round(totalOutflow / (totalInflow + totalOutflow) * 100)) : 50}%`
                },
                className: "bg-amber-700 h-full rounded-lg"
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-600", children: [
          /* @__PURE__ */ jsx("strong", { children: "Operating Ratio:" }),
          " For every $1.00 spent on inventory and operations, the store generated",
          " ",
          /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-emerald-900", children: [
            "$",
            totalOutflow > 0 ? (totalInflow / totalOutflow).toFixed(2) : "1.00"
          ] }),
          " ",
          "in retail receipts."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-neutral-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Award, { className: "w-4 h-4 text-amber-600" }),
          /* @__PURE__ */ jsx("span", { children: "Top Performing Items (Berbere, Siga, Kibe, Injera & Market Goods)" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-neutral-500", children: "Ranked by total sales revenue in selected interval" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto border border-neutral-200 rounded-lg", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200", children: [
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Rank" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Product Name" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Units Sold" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Total Revenue" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Batch Cost Basis" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Net Profit" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Margin %" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-neutral-200", children: topProducts.map((item, idx) => {
          const marginPct = item.totalRevenue > 0 ? Math.round(item.totalProfit / item.totalRevenue * 1e3) / 10 : 0;
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-neutral-50", children: [
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 font-mono font-bold text-neutral-500", children: [
              "#",
              idx + 1
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 font-semibold text-neutral-900", children: item.productName }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono tabular-nums", children: [
              item.totalQuantity,
              " ",
              item.unit
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-neutral-900 tabular-nums", children: [
              "$",
              item.totalRevenue.toFixed(2)
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono text-neutral-600 tabular-nums", children: [
              "$",
              item.totalCost.toFixed(2)
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-emerald-900 tabular-nums", children: [
              "+$",
              item.totalProfit.toFixed(2)
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums", children: [
              marginPct,
              "%"
            ] })
          ] }, item.productId);
        }) })
      ] }) }),
      topProducts.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-xs text-neutral-400", children: "No sales data available in this time interval." })
    ] })
  ] });
};
export {
  AnalyticsView
};
