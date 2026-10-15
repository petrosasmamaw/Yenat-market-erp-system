import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { addBatch, setActiveTab } from "../store/erpSlice";
import { formatCurrency, formatDate } from "../utils/formatters";
import { canDebitBalance } from "../utils/financeLedger";
import {
  Plus,
  AlertTriangle,
  Receipt,
  CheckCircle2
} from "lucide-react";
const PurchasesView = () => {
  const dispatch = useAppDispatch();
  const { products, batches, balance, currency, usdToEtbRate } = useAppSelector(
    (state) => state.erp
  );
  const [selectedProductId, setSelectedProductId] = useState(
    products[0]?.id || ""
  );
  const [supplierName, setSupplierName] = useState("Addis Direct Imports LLC");
  const [batchNumber, setBatchNumber] = useState(`BATCH-${Date.now().toString().slice(-5)}`);
  const [quantity, setQuantity] = useState("50");
  const [costPrice, setCostPrice] = useState("3.80");
  const [sellingPrice, setSellingPrice] = useState("7.99");
  const [inwardDate, setInwardDate] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("Standard shipment received into stock");
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + prod.shelfLifeDays);
      setExpiryDate(d.toISOString().split("T")[0]);
    }
  };
  const numQty = parseFloat(quantity) || 0;
  const numCost = parseFloat(costPrice) || 0;
  const numSell = parseFloat(sellingPrice) || 0;
  const totalCost = Math.round(numQty * numCost * 100) / 100;
  const projectedRevenue = Math.round(numQty * numSell * 100) / 100;
  const projectedProfit = Math.round((projectedRevenue - totalCost) * 100) / 100;
  const canAfford = canDebitBalance(balance, totalCost);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || !canAfford || numQty <= 0 || numCost <= 0) return;
    const newBatch = {
      id: "b_pur_" + Date.now(),
      batchNumber: batchNumber.trim(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      inwardDate,
      expiryDate,
      initialQuantity: numQty,
      remainingQuantity: numQty,
      unit: selectedProduct.unit,
      costPrice: numCost,
      sellingPrice: numSell,
      source: "Direct Purchase",
      notes: `${notes.trim()} (Supplier: ${supplierName.trim()})`
    };
    dispatch(
      addBatch({
        ...newBatch,
        deductCash: true,
        supplierName: supplierName.trim()
      })
    );
    setBatchNumber(`BATCH-${Date.now().toString().slice(-5)}`);
  };
  const purchasedBatches = batches.filter((b) => b.source === "Direct Purchase");
  return /* @__PURE__ */ jsxs("div", { className: "erp-page-inner space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-neutral-900 tracking-tight", children: "Purchases & Inward Stock Batches" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-1", children: "Receive inventory from suppliers, assign unique batch numbers and costs, and automatically debit store balance." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => dispatch(setActiveTab("inventory")),
          className: "px-3.5 py-2 rounded-lg bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 text-amber-300" }),
            /* @__PURE__ */ jsx("span", { children: "New Catalog Definition" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-neutral-200", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-neutral-900", children: "Receive New Stock Batch" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500", children: "Product must exist in catalog. Each batch records its specific cost basis." })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded", children: "Cost-by-Batch Tracking" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-xs font-bold text-neutral-700 mb-1", children: [
            "Select Catalog Product ",
            /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "select",
            {
              required: true,
              value: selectedProductId,
              onChange: (e) => handleProductChange(e.target.value),
              className: "w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white",
              children: products.map((p) => /* @__PURE__ */ jsxs("option", { value: p.id, children: [
                p.name,
                " (",
                p.category,
                ") \u2014 Unit: ",
                p.unit
              ] }, p.id))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Supplier / Vendor Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: supplierName,
                onChange: (e) => setSupplierName(e.target.value),
                placeholder: "e.g. Addis Direct Imports LLC or Idaho Teff Co",
                className: "w-full px-3 py-2 rounded border border-neutral-300"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block font-bold text-neutral-700 mb-1", children: [
              "Batch Number ",
              /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: batchNumber,
                onChange: (e) => setBatchNumber(e.target.value),
                className: "w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs p-4 rounded-lg bg-neutral-50 border border-neutral-200", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block font-bold text-neutral-700 mb-1", children: [
              "Quantity Received (",
              selectedProduct?.unit || "unit",
              ") ",
              /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0.1",
                step: "0.1",
                required: true,
                value: quantity,
                onChange: (e) => setQuantity(e.target.value),
                className: "w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300 bg-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block font-bold text-neutral-700 mb-1", children: [
              "Cost Price Paid / Unit ($) ",
              /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0.01",
                step: "0.01",
                required: true,
                value: costPrice,
                onChange: (e) => setCostPrice(e.target.value),
                className: "w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300 bg-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block font-bold text-neutral-700 mb-1", children: [
              "Store Selling Price / Unit ($) ",
              /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0.01",
                step: "0.01",
                required: true,
                value: sellingPrice,
                onChange: (e) => setSellingPrice(e.target.value),
                className: "w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300 bg-white text-emerald-900"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Inward Arrival Date" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                required: true,
                value: inwardDate,
                onChange: (e) => setInwardDate(e.target.value),
                className: "w-full px-3 py-2 font-mono rounded border border-neutral-300"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block font-bold text-neutral-700 mb-1", children: [
              "Product Expiry Date ",
              /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                required: true,
                value: expiryDate,
                onChange: (e) => setExpiryDate(e.target.value),
                className: "w-full px-3 py-2 font-mono rounded border border-neutral-300"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-neutral-700 mb-1", children: "Invoice / Batch Notes" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: notes,
              onChange: (e) => setNotes(e.target.value),
              className: "w-full px-3 py-2 text-xs rounded border border-neutral-300"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-3 border-t border-neutral-200 flex justify-end", children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: !canAfford || numQty <= 0 || numCost <= 0,
            className: "px-6 py-2.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 text-amber-300" }),
              /* @__PURE__ */ jsx("span", { children: "Confirm Purchase & Debit Store Balance" })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200", children: "Batch Financial Summary" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Total Inward Cost:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900", children: [
                "$",
                totalCost.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Unit Margin:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-emerald-800", children: [
                "+$",
                (numSell - numCost).toFixed(2),
                " / ",
                selectedProduct?.unit || "unit"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Projected Revenue:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900", children: [
                "$",
                projectedRevenue.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-neutral-200 flex justify-between font-bold text-emerald-900 text-sm", children: [
              /* @__PURE__ */ jsx("span", { children: "Projected Gross Profit:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono tabular-nums", children: [
                "+$",
                projectedProfit.toFixed(2)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-neutral-700", children: [
              /* @__PURE__ */ jsx("span", { children: "Available Store Balance:" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: formatCurrency(balance, currency, usdToEtbRate) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-rose-700", children: [
              /* @__PURE__ */ jsx("span", { children: "Deduction for Purchase:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold", children: [
                "-$",
                totalCost.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-1 border-t border-neutral-200 flex items-center justify-between font-bold text-neutral-900", children: [
              /* @__PURE__ */ jsx("span", { children: "Balance After Purchase:" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono", children: formatCurrency(Math.max(0, balance - totalCost), currency, usdToEtbRate) })
            ] })
          ] }),
          !canAfford && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: "Insufficient balance! Cannot allow overdraft." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900", children: [
          /* @__PURE__ */ jsx("strong", { children: "Batch Separation Note:" }),
          " If Berbere costs $3.50 this week and $4.00 next week, both batches will exist simultaneously and calculate margins accurately when sold."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-neutral-900 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Receipt, { className: "w-4 h-4 text-emerald-800" }),
        /* @__PURE__ */ jsx("span", { children: "Recent Direct Inward Stock Batches" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto border border-neutral-200 rounded-lg", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Batch #" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Product Name" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 font-mono", children: "Inward Date" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 font-mono", children: "Expiry Date" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Qty Received" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Cost Paid" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Sell Price" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Notes" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-neutral-200", children: purchasedBatches.map((b) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-neutral-50", children: [
          /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 font-mono font-bold text-neutral-900", children: [
            "#",
            b.batchNumber
          ] }),
          /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 font-medium text-neutral-900", children: b.productName }),
          /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 font-mono text-neutral-600", children: formatDate(b.inwardDate) }),
          /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 font-mono text-neutral-600", children: formatDate(b.expiryDate) }),
          /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold", children: [
            b.initialQuantity,
            " ",
            b.unit
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono text-neutral-700", children: [
            "$",
            b.costPrice.toFixed(2)
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-emerald-900", children: [
            "$",
            b.sellingPrice.toFixed(2)
          ] }),
          /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 text-[11px] text-neutral-500 truncate max-w-xs", children: b.notes || "\u2014" })
        ] }, b.id)) })
      ] }) })
    ] })
  ] });
};
export {
  PurchasesView
};
