import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { addProduct, writeOffBatchQuantity, setActiveTab } from "../store/erpSlice";
import { formatDate } from "../utils/formatters";
import { getExpiryStatus } from "../utils/expiryAlerts";
import {
  Plus,
  AlertTriangle,
  Search,
  PackagePlus,
  Clock,
  Trash2,
  X
} from "lucide-react";
const InventoryView = () => {
  const dispatch = useAppDispatch();
  const { products, batches, currency, usdToEtbRate } = useAppSelector((state) => state.erp);
  const [activeSubTab, setActiveSubTab] = useState("batches");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [writeOffModalBatch, setWriteOffModalBatch] = useState(null);
  const today = /* @__PURE__ */ new Date();
  const filteredBatches = batches.filter((batch) => {
    const product = products.find((p) => p.id === batch.productId);
    const matchesCat = categoryFilter === "All" || product?.category === categoryFilter;
    const matchesSearch = batch.productName.toLowerCase().includes(searchQuery.toLowerCase()) || batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeSubTab === "expiry") {
      const exp = getExpiryStatus(batch.expiryDate, today);
      const isUrgentOrWarning = exp.severity === "URGENT" || exp.severity === "WARNING" || exp.severity === "EXPIRED";
      return matchesCat && matchesSearch && isUrgentOrWarning && batch.remainingQuantity > 0;
    }
    return matchesCat && matchesSearch;
  });
  const categories = [
    "All",
    "Fresh Butchery",
    "Artisan Bakery",
    "Spices & Seasonings",
    "Dairy & Traditional Fats",
    "Imported Grains & Flours",
    "Coffee & Tea",
    "Beverages & Soft Drinks"
  ];
  return /* @__PURE__ */ jsxs("div", { className: "erp-page-inner space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-neutral-900 tracking-tight", children: "Inventory & Batch Expiry Control" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-1", children: "Track individual batch cost bases, expiry dates, and manage product catalog definitions." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setIsAddProductOpen(true),
            className: "px-3.5 py-2 rounded-lg bg-brand-800 text-white font-bold text-xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 text-amber-300" }),
              /* @__PURE__ */ jsx("span", { children: "Create Catalog Item" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => dispatch(setActiveTab("purchases")),
            className: "px-3.5 py-2 rounded-lg bg-brand-800 text-white font-bold text-xs hover:bg-brand-900 transition-colors flex items-center gap-1.5 shadow-xs",
            children: [
              /* @__PURE__ */ jsx(PackagePlus, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: "Buy Inward Batch" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 border-b border-neutral-200 pb-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveSubTab("batches"),
            className: `px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeSubTab === "batches" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"}`,
            children: [
              "Active Batches (",
              batches.length,
              ")"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveSubTab("expiry"),
            className: `px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeSubTab === "expiry" ? "bg-brand-800 text-white" : "text-amber-800 hover:bg-amber-50"}`,
            children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Expiry Watchlist" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveSubTab("catalog"),
            className: `px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeSubTab === "catalog" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"}`,
            children: [
              "Catalog Definitions (",
              products.length,
              ")"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-64", children: [
        /* @__PURE__ */ jsx(Search, { className: "w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search batch or product...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 overflow-x-auto text-xs pb-1", children: categories.map((c) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setCategoryFilter(c),
        className: `px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${categoryFilter === c ? "bg-emerald-800 text-white" : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"}`,
        children: c
      },
      c
    )) }),
    activeSubTab !== "catalog" && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200", children: [
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Batch Number" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Product Name" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Source / Process" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-right", children: "In Stock" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-right", children: "Cost / Unit" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-right", children: "Sell / Unit" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-right", children: "Batch Margin" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Expiry Date & Status" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4 text-center", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-neutral-200", children: filteredBatches.map((b) => {
          const expStatus = getExpiryStatus(b.expiryDate, today);
          const isDepleted = b.remainingQuantity <= 0;
          const unitMargin = b.sellingPrice - b.costPrice;
          const marginPct = b.sellingPrice > 0 ? Math.round(unitMargin / b.sellingPrice * 100) : 0;
          return /* @__PURE__ */ jsxs(
            "tr",
            {
              className: `hover:bg-neutral-50/80 transition-colors ${isDepleted ? "opacity-40 bg-neutral-50" : ""}`,
              children: [
                /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 font-mono font-bold text-neutral-900", children: [
                  "#",
                  b.batchNumber
                ] }),
                /* @__PURE__ */ jsx("td", { className: "py-3 px-4 font-medium text-neutral-900", children: b.productName }),
                /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-neutral-600", children: b.source }),
                /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums", children: [
                  b.remainingQuantity,
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] font-normal text-neutral-500", children: b.unit })
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 text-right font-mono tabular-nums text-neutral-700", children: [
                  "$",
                  b.costPrice.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-950", children: [
                  "$",
                  b.sellingPrice.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 text-right font-mono text-[11px] font-semibold text-emerald-800 tabular-nums", children: [
                  "+$",
                  unitMargin.toFixed(2),
                  " (",
                  marginPct,
                  "%)"
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "py-3 px-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] text-neutral-700", children: formatDate(b.expiryDate) }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 ${expStatus.severity === "EXPIRED" ? "bg-rose-100 text-rose-800" : expStatus.severity === "URGENT" ? "bg-rose-100 text-rose-800 font-bold" : expStatus.severity === "WARNING" ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"}`,
                      children: expStatus.label
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center", children: b.remainingQuantity > 0 && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setWriteOffModalBatch(b),
                    title: "Write off spoiled/damaged stock",
                    className: "p-1 text-neutral-400 hover:text-rose-600 transition-colors",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                  }
                ) })
              ]
            },
            b.id
          );
        }) })
      ] }) }),
      filteredBatches.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-xs text-neutral-400", children: "No batches found matching the selected filter." })
    ] }),
    activeSubTab === "catalog" && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center text-xs", children: [
        /* @__PURE__ */ jsx("span", { className: "text-neutral-600", children: "Products must be registered here in catalog before buying or producing batches." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setIsAddProductOpen(true),
            className: "text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Add New Catalog Definition" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200", children: [
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "SKU" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Product Name" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Category" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Default Unit" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Perishability" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Shelf Life" }),
          /* @__PURE__ */ jsx("th", { className: "py-3 px-4", children: "Active Batches" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-neutral-200", children: products.map((p) => {
          const itemBatches = batches.filter((b) => b.productId === p.id && b.remainingQuantity > 0);
          const totalInStore = itemBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-neutral-50/80", children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 font-mono font-bold text-neutral-800", children: p.sku }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 font-semibold text-neutral-900", children: p.name }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-amber-800 font-medium", children: p.category }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 font-mono", children: p.unit }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4", children: p.isFresh ? /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded", children: "Fresh Perishable" }) : /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded", children: "Shelf Stable" }) }),
            /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 text-neutral-600", children: [
              p.shelfLifeDays,
              " days"
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 font-mono font-bold text-neutral-900 tabular-nums", children: [
              totalInStore,
              " ",
              p.unit,
              " (",
              itemBatches.length,
              " batches)"
            ] })
          ] }, p.id);
        }) })
      ] }) })
    ] }),
    isAddProductOpen && /* @__PURE__ */ jsx(
      CreateProductModal,
      {
        onClose: () => setIsAddProductOpen(false),
        onSave: (newProd) => {
          dispatch(addProduct(newProd));
          setIsAddProductOpen(false);
        }
      }
    ),
    writeOffModalBatch && /* @__PURE__ */ jsx(
      WriteOffModal,
      {
        batch: writeOffModalBatch,
        onClose: () => setWriteOffModalBatch(null),
        onConfirm: (qty, reason) => {
          dispatch(
            writeOffBatchQuantity({
              batchId: writeOffModalBatch.id,
              quantity: qty,
              reason
            })
          );
          setWriteOffModalBatch(null);
        }
      }
    )
  ] });
};
const CreateProductModal = ({ onClose, onSave }) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Fresh Butchery");
  const [unit, setUnit] = useState("lb");
  const [isFresh, setIsFresh] = useState(true);
  const [shelfLifeDays, setShelfLifeDays] = useState(5);
  const [description, setDescription] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newProd = {
      id: "prod_" + Date.now(),
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category,
      unit,
      isFresh,
      shelfLifeDays: parseInt(shelfLifeDays.toString(), 10) || 7,
      description: description.trim(),
      minStockThreshold: 10
    };
    onSave(newProd);
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-5 border-b border-[var(--color-border-subtle)] bg-white text-brand-900 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-bold", children: "New Catalog Product Definition" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-300", children: "Must be created before you can buy or produce batches in stock." })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-neutral-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4 text-xs", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block font-bold text-neutral-700 mb-1", children: [
          "Product Name ",
          /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            required: true,
            autoFocus: true,
            type: "text",
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "e.g. Awaze Chili Paste or Brown Teff Flour",
            className: "w-full px-3 py-2 text-xs rounded border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "SKU / Code" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: sku,
              onChange: (e) => setSku(e.target.value),
              placeholder: "e.g. SPICE-AWZ-01",
              className: "w-full px-3 py-2 font-mono text-xs rounded border border-neutral-300"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Unit of Measure" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: unit,
              onChange: (e) => setUnit(e.target.value),
              placeholder: "lb, pack, jar, bag",
              className: "w-full px-3 py-2 text-xs rounded border border-neutral-300"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Category" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: category,
            onChange: (e) => setCategory(e.target.value),
            className: "w-full px-3 py-2 text-xs rounded border border-neutral-300 bg-white",
            children: [
              /* @__PURE__ */ jsx("option", { value: "Fresh Butchery", children: "Fresh Butchery (Siga cuts)" }),
              /* @__PURE__ */ jsx("option", { value: "Artisan Bakery", children: "Artisan Bakery (Injera)" }),
              /* @__PURE__ */ jsx("option", { value: "Spices & Seasonings", children: "Spices & Seasonings (Berbere, Mitmita, Shiro)" }),
              /* @__PURE__ */ jsx("option", { value: "Dairy & Traditional Fats", children: "Dairy & Traditional Fats (Kibe)" }),
              /* @__PURE__ */ jsx("option", { value: "Imported Grains & Flours", children: "Imported Grains & Flours (Teff)" }),
              /* @__PURE__ */ jsx("option", { value: "Coffee & Tea", children: "Coffee & Tea (Yirgacheffe, Sidama)" }),
              /* @__PURE__ */ jsx("option", { value: "Beverages & Soft Drinks", children: "Beverages & Soft Drinks" }),
              /* @__PURE__ */ jsx("option", { value: "Pantry & Sundries", children: "Pantry & Sundries" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Perishability" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: isFresh ? "fresh" : "shelf",
              onChange: (e) => setIsFresh(e.target.value === "fresh"),
              className: "w-full px-3 py-2 text-xs rounded border border-neutral-300 bg-white",
              children: [
                /* @__PURE__ */ jsx("option", { value: "fresh", children: "Fresh (Daily/Weekly expiry)" }),
                /* @__PURE__ */ jsx("option", { value: "shelf", children: "Shelf Stable (Long expiry)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Expected Shelf Life (Days)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "1",
              value: shelfLifeDays,
              onChange: (e) => setShelfLifeDays(parseInt(e.target.value) || 1),
              className: "w-full px-3 py-2 font-mono text-xs rounded border border-neutral-300"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            rows: 2,
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: "Short description for cashier and receipt",
            className: "w-full px-3 py-2 text-xs rounded border border-neutral-300"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t border-neutral-200", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 font-medium text-neutral-700 bg-neutral-100 rounded hover:bg-neutral-200",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "px-5 py-2 font-bold text-white bg-emerald-900 rounded hover:bg-emerald-800",
            children: "Save Catalog Definition"
          }
        )
      ] })
    ] })
  ] }) });
};
const WriteOffModal = ({ batch, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("Expired past safe consumption date");
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(quantity, reason);
  };
  const lossAmount = quantity * batch.costPrice;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-5 bg-rose-950 text-white flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5 text-rose-400" }),
        /* @__PURE__ */ jsx("h3", { className: "text-base font-bold", children: "Write-Off Spoiled / Damaged Food" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-neutral-400 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4 text-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-3 bg-neutral-50 rounded border border-neutral-200", children: [
        /* @__PURE__ */ jsx("div", { className: "font-bold text-neutral-900", children: batch.productName }),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-neutral-500 font-mono", children: [
          "Batch #",
          batch.batchNumber,
          " \xB7 Available: ",
          batch.remainingQuantity,
          " ",
          batch.unit,
          " \xB7 Cost Basis: $",
          batch.costPrice.toFixed(2),
          "/",
          batch.unit
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block font-bold text-neutral-700 mb-1", children: [
          "Quantity to Dispose (",
          batch.unit,
          "):"
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "0.1",
            max: batch.remainingQuantity,
            step: "0.1",
            value: quantity,
            onChange: (e) => setQuantity(parseFloat(e.target.value) || 0),
            className: "w-full px-3 py-2 font-mono font-bold text-sm rounded border border-neutral-300"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Reason for Loss:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: reason,
            onChange: (e) => setReason(e.target.value),
            className: "w-full px-3 py-2 rounded border border-neutral-300 bg-white",
            children: [
              /* @__PURE__ */ jsx("option", { value: "Expired past safe consumption date", children: "Expired past safe date (Perishable)" }),
              /* @__PURE__ */ jsx("option", { value: "Damaged in transit / packaging broken", children: "Damaged packaging / torn bag" }),
              /* @__PURE__ */ jsx("option", { value: "Spoiled or dry injera flatbread", children: "Spoiled or dry sourdough texture" }),
              /* @__PURE__ */ jsx("option", { value: "Trimming waste / butcher shrinkage", children: "Trimming shrinkage or butcher loss" }),
              /* @__PURE__ */ jsx("option", { value: "Quality check failure", children: "Failed quality standard" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-3 rounded bg-rose-50 border border-rose-200 text-rose-800", children: [
        /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Estimated Cost Loss: " }),
        /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold", children: [
          "$",
          lossAmount.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-rose-700 mt-0.5", children: "This amount will be deducted as an expense loss in the financial ledger." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t border-neutral-200", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 font-medium text-neutral-700 bg-neutral-100 rounded",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: quantity <= 0 || quantity > batch.remainingQuantity,
            className: "px-5 py-2 font-bold text-white bg-rose-800 rounded hover:bg-rose-900 disabled:opacity-50",
            children: "Confirm Disposal Loss"
          }
        )
      ] })
    ] })
  ] }) });
};
export {
  InventoryView
};
