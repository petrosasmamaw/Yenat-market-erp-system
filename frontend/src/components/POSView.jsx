import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  completeSale
} from "../store/erpSlice";
import { formatCurrency } from "../utils/formatters";
import { getExpiryStatus } from "../utils/expiryAlerts";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Receipt,
  Layers,
  Printer,
  X
} from "lucide-react";
const POSView = () => {
  const dispatch = useAppDispatch();
  const { products, batches, cart, storeInfo, currency, usdToEtbRate } = useAppSelector(
    (state) => state.erp
  );
  const currentUser = useAppSelector((state) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBatchModalProduct, setSelectedBatchModalProduct] = useState(null);
  const [completedSaleRecord, setCompletedSaleRecord] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customerNote, setCustomerNote] = useState("");
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
  const filteredProducts = products.filter((product) => {
    const matchesCat = selectedCategory === "All" || product.category === selectedCategory;
    const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });
  const getProductBatches = (productId) => {
    return batches.filter((b) => b.productId === productId && b.remainingQuantity > 0);
  };
  let cartSubtotal = 0;
  let cartCost = 0;
  for (const item of cart) {
    cartSubtotal += item.sellingPrice * item.quantity;
    cartCost += item.costPrice * item.quantity;
  }
  const cartTax = Math.round(cartSubtotal * storeInfo.taxRate * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + cartTax) * 100) / 100;
  const cartProjectedProfit = Math.round((cartSubtotal - cartCost) * 100) / 100;
  const profitMarginPercent = cartSubtotal > 0 ? Math.round(cartProjectedProfit / cartSubtotal * 1e3) / 10 : 0;
  const handleCheckout = () => {
    if (cart.length === 0) return;
    dispatch(
      completeSale({
        cashierName: currentUser?.name || "Cashier",
        paymentMethod,
        customerNote: customerNote.trim()
      })
    );
  };
  const lastSale = useAppSelector((state) => state.erp.sales[0]);
  return /* @__PURE__ */ jsxs("div", { className: "h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-neutral-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden border-r border-neutral-200 bg-neutral-50", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white border-b border-neutral-200 space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-neutral-400 absolute left-3 top-3" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search products (Berbere, Siga Tibs, Injera, Kibe, Coffee...)",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-neutral-50"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 overflow-x-auto pb-1 text-xs", children: categories.map((cat) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSelectedCategory(cat),
            className: `px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? "erp-segment-active" : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"}`,
            children: cat
          },
          cat
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 p-5 overflow-y-auto", children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: filteredProducts.map((product) => {
          const activeBatches = getProductBatches(product.id);
          const totalRemaining = activeBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);
          const isOutOfStock = totalRemaining <= 0;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: "bg-white rounded-xl border border-neutral-200 p-4 flex flex-col justify-between shadow-xs hover:border-emerald-700/50 transition-all",
              children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-amber-700", children: product.category }),
                      /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-neutral-900 leading-snug mt-0.5", children: product.name })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-neutral-400 shrink-0", children: product.sku })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-neutral-500 mt-1 line-clamp-2", children: product.description }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "text-neutral-500 text-[11px]", children: "In Stock: " }),
                      /* @__PURE__ */ jsxs(
                        "span",
                        {
                          className: `font-mono font-bold ${isOutOfStock ? "text-rose-600" : "text-neutral-900"}`,
                          children: [
                            totalRemaining,
                            " ",
                            product.unit
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-emerald-800 font-semibold", children: [
                      activeBatches.length,
                      " active batch",
                      activeBatches.length === 1 ? "" : "es"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-4 pt-3 border-t border-neutral-100", children: isOutOfStock ? /* @__PURE__ */ jsx("div", { className: "w-full py-2 text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg", children: "Out of Stock" }) : /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setSelectedBatchModalProduct(product),
                    className: "w-full py-2 px-3 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs",
                    children: [
                      /* @__PURE__ */ jsx(Layers, { className: "w-3.5 h-3.5 text-amber-300" }),
                      /* @__PURE__ */ jsx("span", { children: "Select Batch & Add" })
                    ]
                  }
                ) })
              ]
            },
            product.id
          );
        }) }),
        filteredProducts.length === 0 && /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-xs text-neutral-400", children: "No products found matching your search." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "w-full lg:w-96 bg-white flex flex-col justify-between shrink-0 shadow-sm border-l border-neutral-200", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-neutral-200 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(ShoppingCart, { className: "w-4 h-4 text-emerald-800" }),
          /* @__PURE__ */ jsxs("h2", { className: "text-xs font-bold text-neutral-900 uppercase tracking-wide", children: [
            "Sale Register (",
            cart.length,
            " item",
            cart.length === 1 ? "" : "s",
            ")"
          ] })
        ] }),
        cart.length > 0 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => dispatch(clearCart()),
            className: "text-xs text-rose-600 hover:underline",
            children: "Clear"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 p-4 overflow-y-auto space-y-3", children: [
        cart.map((item) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "p-3 rounded-lg border border-neutral-200 bg-neutral-50/60 text-xs space-y-2",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "font-bold text-neutral-900 truncate", children: item.productName }),
                  /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-amber-800 font-medium", children: [
                    "Batch: ",
                    /* @__PURE__ */ jsx("span", { className: "font-mono", children: item.batchNumber }),
                    " (Cost: $",
                    item.costPrice.toFixed(2),
                    "/",
                    item.unit,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => dispatch(removeFromCart(item.batchId)),
                    className: "text-neutral-400 hover:text-rose-600",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => dispatch(
                        updateCartQuantity({
                          batchId: item.batchId,
                          quantity: item.quantity - 1
                        })
                      ),
                      className: "w-6 h-6 rounded bg-white border border-neutral-300 flex items-center justify-center hover:bg-neutral-100",
                      children: /* @__PURE__ */ jsx(Minus, { className: "w-3 h-3 text-neutral-600" })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-xs w-6 text-center tabular-nums", children: item.quantity }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => dispatch(
                        updateCartQuantity({
                          batchId: item.batchId,
                          quantity: item.quantity + 1
                        })
                      ),
                      className: "w-6 h-6 rounded bg-white border border-neutral-300 flex items-center justify-center hover:bg-neutral-100",
                      children: /* @__PURE__ */ jsx(Plus, { className: "w-3 h-3 text-neutral-600" })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] text-neutral-500", children: item.unit })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsx("div", { className: "font-mono font-bold text-neutral-900 tabular-nums", children: formatCurrency(item.sellingPrice * item.quantity, currency, usdToEtbRate) }),
                  /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-emerald-700 font-semibold font-mono", children: [
                    "+$",
                    ((item.sellingPrice - item.costPrice) * item.quantity).toFixed(2),
                    " profit"
                  ] })
                ] })
              ] })
            ]
          },
          item.batchId
        )),
        cart.length === 0 && /* @__PURE__ */ jsxs("div", { className: "py-20 text-center text-xs text-neutral-400", children: [
          /* @__PURE__ */ jsx(Receipt, { className: "w-8 h-8 text-neutral-300 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("span", { children: "Register is empty." }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-neutral-400 mt-1", children: "Select items from catalog and choose which batch to sell." })
        ] })
      ] }),
      cart.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-neutral-200 bg-neutral-50/80 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-neutral-700 mb-1", children: "Payment Method" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-1 text-xs", children: ["Cash", "Credit Card", "Mobile / Zelle"].map((method) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setPaymentMethod(method),
              className: `py-1.5 px-2 text-center rounded border font-semibold text-[11px] transition-colors ${paymentMethod === method ? "bg-brand-800 text-white border-brand-800" : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"}`,
              children: method
            },
            method
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-xs pt-1 border-t border-neutral-200", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
            /* @__PURE__ */ jsx("span", { children: "Subtotal:" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono tabular-nums", children: formatCurrency(cartSubtotal, currency, usdToEtbRate) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
            /* @__PURE__ */ jsx("span", { children: "Nevada Sales Tax (8.38%):" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono tabular-nums", children: formatCurrency(cartTax, currency, usdToEtbRate) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between font-bold text-neutral-900 text-sm pt-1 border-t border-neutral-200", children: [
            /* @__PURE__ */ jsx("span", { children: "Total Due:" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-emerald-950 tabular-nums", children: formatCurrency(cartTotal, currency, usdToEtbRate) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded", children: [
            /* @__PURE__ */ jsx("span", { children: "Calculated Batch Profit:" }),
            /* @__PURE__ */ jsxs("span", { className: "font-mono", children: [
              "+$",
              cartProjectedProfit.toFixed(2),
              " (",
              profitMarginPercent,
              "%)"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleCheckout,
            className: "w-full py-3 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: "Complete Sale & Print Receipt" })
            ]
          }
        )
      ] })
    ] }),
    selectedBatchModalProduct && /* @__PURE__ */ jsx(
      BatchSelectionModal,
      {
        product: selectedBatchModalProduct,
        batches: getProductBatches(selectedBatchModalProduct.id),
        onClose: () => setSelectedBatchModalProduct(null),
        onSelectBatch: (batch, qty) => {
          dispatch(
            addToCart({
              product: selectedBatchModalProduct,
              batch,
              quantity: qty
            })
          );
          setSelectedBatchModalProduct(null);
        }
      }
    ),
    lastSale && /* @__PURE__ */ jsx(
      ReceiptModal,
      {
        sale: lastSale,
        storeInfo,
        currency,
        rate: usdToEtbRate
      }
    )
  ] });
};
const BatchSelectionModal = ({
  product,
  batches,
  onClose,
  onSelectBatch
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState(
    batches[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(1);
  const selectedBatch = batches.find((b) => b.id === selectedBatchId);
  const maxAvailable = selectedBatch?.remainingQuantity || 0;
  const today = /* @__PURE__ */ new Date();
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-5 border-b border-[var(--color-border-subtle)] bg-white text-brand-900 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase font-bold text-amber-400", children: "Select Specific Batch for Costing" }),
        /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-white", children: product.name })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "text-neutral-400 hover:text-white",
          children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-600 leading-relaxed", children: "Choose the exact batch being sold. The system computes exact profit from the batch's actual purchase or production cost." }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-60 overflow-y-auto", children: batches.map((b) => {
        const expStatus = getExpiryStatus(b.expiryDate, today);
        const isSelected = selectedBatchId === b.id;
        const unitProfit = b.sellingPrice - b.costPrice;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => setSelectedBatchId(b.id),
            className: `p-3.5 rounded-lg border cursor-pointer transition-all ${isSelected ? "border-emerald-700 bg-emerald-50/60 shadow-xs" : "border-neutral-200 hover:border-neutral-300 bg-white"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900", children: [
                    "#",
                    b.batchNumber
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-neutral-500", children: [
                    "(",
                    b.source,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `text-[10px] font-semibold px-2 py-0.5 rounded ${expStatus.severity === "URGENT" ? "bg-rose-100 text-rose-800" : expStatus.severity === "WARNING" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`,
                    children: expStatus.label
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-100 text-[11px]", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-neutral-500", children: "Remaining:" }),
                  " ",
                  /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900", children: [
                    b.remainingQuantity,
                    " ",
                    b.unit
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-neutral-500", children: "Cost:" }),
                  " ",
                  /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-700", children: [
                    "$",
                    b.costPrice.toFixed(2)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-neutral-500", children: "Sell Price:" }),
                  " ",
                  /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-emerald-900", children: [
                    "$",
                    b.sellingPrice.toFixed(2)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-emerald-700 font-semibold mt-1", children: [
                "Batch Profit: +$",
                unitProfit.toFixed(2),
                " / ",
                b.unit
              ] })
            ]
          },
          b.id
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-neutral-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("label", { className: "text-xs font-bold text-neutral-700", children: [
            "Quantity to Sell (",
            product.unit,
            "):"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setQuantity(Math.max(1, quantity - 1)),
                className: "w-8 h-8 rounded border border-neutral-300 flex items-center justify-center font-bold",
                children: "-"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                max: maxAvailable,
                value: quantity,
                onChange: (e) => setQuantity(
                  Math.max(1, Math.min(maxAvailable, parseInt(e.target.value) || 1))
                ),
                className: "w-16 py-1 text-center font-mono font-bold border border-neutral-300 rounded text-sm"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setQuantity(Math.min(maxAvailable, quantity + 1)),
                className: "w-8 h-8 rounded border border-neutral-300 flex items-center justify-center font-bold",
                children: "+"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right text-[11px] text-neutral-500 mt-1", children: [
          "Max available in this batch: ",
          maxAvailable,
          " ",
          product.unit
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 pt-3 border-t border-neutral-200", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            className: "px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-lg",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            disabled: !selectedBatch || maxAvailable <= 0,
            onClick: () => selectedBatch && onSelectBatch(selectedBatch, quantity),
            className: "px-5 py-2 text-xs font-bold text-white bg-emerald-900 rounded-lg hover:bg-emerald-800 disabled:opacity-50",
            children: [
              "Add ",
              quantity,
              " ",
              product.unit,
              " to Sale"
            ]
          }
        )
      ] })
    ] })
  ] }) });
};
const ReceiptModal = ({ sale, storeInfo, currency, rate }) => {
  const [isOpen, setIsOpen] = useState(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 left-80 z-40", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "px-3.5 py-2 bg-emerald-900 text-white rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold hover:bg-emerald-800",
        children: [
          /* @__PURE__ */ jsx(Receipt, { className: "w-4 h-4 text-amber-300" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "View Last Receipt (",
            sale.receiptNumber,
            ")"
          ] })
        ]
      }
    ) }),
    isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-neutral-200 p-6 text-neutral-900 text-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start pb-3 border-b border-neutral-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center w-full", children: [
          /* @__PURE__ */ jsx("div", { className: "font-bold text-base text-emerald-950", children: "YENAT MARKET" }),
          /* @__PURE__ */ jsx("div", { className: "text-[11px] text-neutral-600", children: storeInfo.address }),
          /* @__PURE__ */ jsx("div", { className: "text-[11px] text-neutral-600", children: storeInfo.phone }),
          /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-neutral-400 mt-1", children: [
            "Receipt: ",
            sale.receiptNumber,
            " \xB7 ",
            new Date(sale.timestamp).toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setIsOpen(false), className: "text-neutral-400 hover:text-black", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "py-4 space-y-2 border-b border-neutral-200 font-mono", children: sale.items.map((it) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start text-[11px]", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-bold text-neutral-900", children: it.productName }),
          /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-neutral-500", children: [
            it.quantity,
            " ",
            it.unit,
            " @ $",
            it.sellingPrice.toFixed(2),
            " (Batch #",
            it.batchNumber,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "font-bold tabular-nums", children: [
          "$",
          it.itemTotal.toFixed(2)
        ] })
      ] }, it.batchId)) }),
      /* @__PURE__ */ jsxs("div", { className: "py-3 space-y-1 font-mono text-xs border-b border-neutral-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Subtotal:" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "$",
            sale.subtotal.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Tax:" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "$",
            sale.tax.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between font-bold text-sm text-emerald-950 pt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "TOTAL:" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "$",
            sale.total.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[11px] text-neutral-500", children: [
          /* @__PURE__ */ jsx("span", { children: "Payment:" }),
          /* @__PURE__ */ jsx("span", { children: sale.paymentMethod })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[11px] text-emerald-700 font-bold", children: [
          /* @__PURE__ */ jsx("span", { children: "Batch Gross Profit:" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "+$",
            sale.totalProfit.toFixed(2)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center text-[10px] text-neutral-400 pt-3", children: [
        "Thank you for shopping at Yenat Market Las Vegas!",
        /* @__PURE__ */ jsx("br", {}),
        "Authentic Ethiopian Spices, Siga & Fresh Daily Injera."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => window.print(),
            className: "flex-1 py-2 bg-neutral-900 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx(Printer, { className: "w-3.5 h-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Print" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsOpen(false),
            className: "px-4 py-2 bg-neutral-200 text-neutral-800 rounded font-bold text-xs",
            children: "Close"
          }
        )
      ] })
    ] }) })
  ] });
};
export {
  POSView
};
