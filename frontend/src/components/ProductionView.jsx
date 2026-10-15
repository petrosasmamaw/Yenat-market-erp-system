import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { recordOxBreakdownAction, recordInjeraProductionAction } from "../store/erpSlice";
import { formatCurrency, formatDate } from "../utils/formatters";
import { canDebitBalance } from "../utils/financeLedger";
import {
  Beef,
  Flame,
  History,
  CheckCircle,
  AlertCircle
} from "lucide-react";
const ProductionView = () => {
  const dispatch = useAppDispatch();
  const {
    balance,
    currency,
    usdToEtbRate,
    oxProductions,
    injeraProductions
  } = useAppSelector((state) => state.erp);
  const currentUser = useAppSelector((state) => state.auth.user);
  const [activeWorkflow, setActiveWorkflow] = useState("ox");
  const [oxTag, setOxTag] = useState(`OX-${Math.floor(100 + Math.random() * 900)}`);
  const [oxCost, setOxCost] = useState("1400");
  const [processingFee, setProcessingFee] = useState("100");
  const [cuts, setCuts] = useState([
    { cutName: "Fresh Siga Tibs (Tender Beef Cubes)", productId: "prod_siga_tibs", weightLbs: 85, sellingPricePerLb: 10.99 },
    { cutName: "Fresh Kitfo Meat (Prime Lean Beef)", productId: "prod_siga_kitfo", weightLbs: 55, sellingPricePerLb: 12.99 },
    { cutName: "Fresh Siga Kurt (Raw Beef Cut)", productId: "prod_siga_kurt", weightLbs: 45, sellingPricePerLb: 11.49 },
    { cutName: "Beef Short Ribs & Soup Cuts", productId: "prod_siga_ribs", weightLbs: 65, sellingPricePerLb: 7.99 },
    { cutName: "Marrow Bones & Broth Cuts", productId: "", weightLbs: 40, sellingPricePerLb: 3.5 }
  ]);
  const [oxNotes, setOxNotes] = useState("Local Angus steer carcass butchered into fresh retail cuts");
  const [teffCost, setTeffCost] = useState("130");
  const [powerCost, setPowerCost] = useState("18");
  const [packagingCost, setPackagingCost] = useState("18.50");
  const [packsProduced, setPacksProduced] = useState("90");
  const [injeraSellPrice, setInjeraSellPrice] = useState("4.99");
  const [injeraNotes, setInjeraNotes] = useState("100% Teff morning sourdough bake");
  const numOxCost = parseFloat(oxCost) || 0;
  const numProcessingFee = parseFloat(processingFee) || 0;
  const totalOxCost = numOxCost + numProcessingFee;
  const totalWeightLbs = cuts.reduce((sum, c) => sum + (c.weightLbs || 0), 0);
  const avgCostPerLb = totalWeightLbs > 0 ? Math.round(totalOxCost / totalWeightLbs * 100) / 100 : 0;
  const totalProjectedRevenue = cuts.reduce(
    (sum, c) => sum + c.weightLbs * c.sellingPricePerLb,
    0
  );
  const projectedOxProfit = Math.round((totalProjectedRevenue - totalOxCost) * 100) / 100;
  const canAffordOx = canDebitBalance(balance, totalOxCost);
  const numTeff = parseFloat(teffCost) || 0;
  const numPower = parseFloat(powerCost) || 0;
  const numPkg = parseFloat(packagingCost) || 0;
  const totalInjeraCost = Math.round((numTeff + numPower + numPkg) * 100) / 100;
  const numPacks = parseInt(packsProduced, 10) || 0;
  const numSellPrice = parseFloat(injeraSellPrice) || 0;
  const costPerPack = numPacks > 0 ? Math.round(totalInjeraCost / numPacks * 100) / 100 : 0;
  const projectedInjeraRevenue = Math.round(numPacks * numSellPrice * 100) / 100;
  const projectedInjeraProfit = Math.round((projectedInjeraRevenue - totalInjeraCost) * 100) / 100;
  const canAffordInjera = canDebitBalance(balance, totalInjeraCost);
  const handleExecuteOxBreakdown = (e) => {
    e.preventDefault();
    if (!canAffordOx) return;
    dispatch(
      recordOxBreakdownAction({
        oxTagNumber: oxTag.trim(),
        oxPurchaseCost: numOxCost,
        processingCost: numProcessingFee,
        cuts: cuts.filter((c) => c.weightLbs > 0),
        butcherName: currentUser?.name || "Master Butcher",
        notes: oxNotes.trim()
      })
    );
    setOxTag(`OX-${Math.floor(100 + Math.random() * 900)}`);
  };
  const handleExecuteInjeraBake = (e) => {
    e.preventDefault();
    if (!canAffordInjera) return;
    dispatch(
      recordInjeraProductionAction({
        teffFlourCost: numTeff,
        gasAndPowerCost: numPower,
        packagingCost: numPkg,
        packsProduced: numPacks,
        sellingPricePerPack: numSellPrice,
        bakerName: currentUser?.name || "Master Baker",
        notes: injeraNotes.trim()
      })
    );
  };
  return /* @__PURE__ */ jsxs("div", { className: "erp-page-inner space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-neutral-900 tracking-tight", children: "In-House Production & Breakdown" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-1", children: "Produce store-made goods: Butcher whole cattle into prime Siga cuts and bake fresh Teff sourdough Injera." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 p-1 bg-neutral-200 rounded-lg", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveWorkflow("ox"),
            className: `px-3.5 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${activeWorkflow === "ox" ? "erp-segment-active" : "text-neutral-700 hover:text-neutral-950"}`,
            children: [
              /* @__PURE__ */ jsx(Beef, { className: "w-4 h-4 text-amber-400" }),
              /* @__PURE__ */ jsx("span", { children: "Ox Meat Breakdown" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveWorkflow("injera"),
            className: `px-3.5 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${activeWorkflow === "injera" ? "bg-brand-800 text-white shadow-xs" : "text-neutral-700 hover:text-neutral-950"}`,
            children: [
              /* @__PURE__ */ jsx(Flame, { className: "w-4 h-4 text-amber-200" }),
              /* @__PURE__ */ jsx("span", { children: "Injera Bakery" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveWorkflow("history"),
            className: `px-3.5 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${activeWorkflow === "history" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-700 hover:text-neutral-950"}`,
            children: [
              /* @__PURE__ */ jsx(History, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: "Production History" })
            ]
          }
        )
      ] })
    ] }),
    activeWorkflow === "ox" && /* @__PURE__ */ jsx("form", { onSubmit: handleExecuteOxBreakdown, className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-neutral-900", children: "Cattle Purchase & Butchery Allocation" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500", children: "The shop buys the live steer or whole carcass. Costs are debited from the cash balance and allocated to derived retail meat batches." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Ox / Carcass Tag #" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                required: true,
                value: oxTag,
                onChange: (e) => setOxTag(e.target.value),
                className: "w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Ox Purchase Cost ($)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                required: true,
                value: oxCost,
                onChange: (e) => setOxCost(e.target.value),
                className: "w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Slaughter & Processing Fee ($)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                value: processingFee,
                onChange: (e) => setProcessingFee(e.target.value),
                className: "w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-neutral-800", children: "Retail Meat Cuts Yield Breakdown" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] text-neutral-500", children: "5-day fresh meat expiry automatically applied" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto border border-neutral-200 rounded-lg", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Cut Name" }),
              /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Yield Weight (lbs)" }),
              /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Derived Cost/lb" }),
              /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Target Sell Price/lb" }),
              /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Projected Revenue" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-neutral-200", children: cuts.map((cut, idx) => {
              const cutRev = cut.weightLbs * cut.sellingPricePerLb;
              return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-neutral-50", children: [
                /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 font-medium text-neutral-900", children: cut.cutName }),
                /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 text-right", children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "0",
                    step: "0.5",
                    value: cut.weightLbs,
                    onChange: (e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const next = [...cuts];
                      next[idx].weightLbs = val;
                      setCuts(next);
                    },
                    className: "w-20 px-2 py-1 text-right font-mono font-bold border border-neutral-300 rounded"
                  }
                ) }),
                /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono text-neutral-600", children: [
                  "$",
                  avgCostPerLb.toFixed(2)
                ] }),
                /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 text-right", children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "0",
                    step: "0.01",
                    value: cut.sellingPricePerLb,
                    onChange: (e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const next = [...cuts];
                      next[idx].sellingPricePerLb = val;
                      setCuts(next);
                    },
                    className: "w-20 px-2 py-1 text-right font-mono font-bold border border-neutral-300 rounded text-emerald-900"
                  }
                ) }),
                /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-neutral-900 tabular-nums", children: [
                  "$",
                  cutRev.toFixed(2)
                ] })
              ] }, cut.cutName);
            }) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-neutral-700 mb-1", children: "Butcher Notes & Carcass Inspection" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: oxNotes,
              onChange: (e) => setOxNotes(e.target.value),
              className: "w-full px-3 py-1.5 text-xs rounded border border-neutral-300"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200", children: "Butchery Economics" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Total Steer Cost:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900", children: [
                "$",
                totalOxCost.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Total Retail Weight:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900", children: [
                totalWeightLbs,
                " lbs"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Average Unit Cost / lb:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-amber-800", children: [
                "$",
                avgCostPerLb.toFixed(2),
                " / lb"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Projected Retail Sales:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900", children: [
                "$",
                totalProjectedRevenue.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-neutral-200 flex justify-between font-bold text-emerald-900 text-sm", children: [
              /* @__PURE__ */ jsx("span", { children: "Projected Profit:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono tabular-nums", children: [
                "+$",
                projectedOxProfit.toFixed(2)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-neutral-700", children: [
              /* @__PURE__ */ jsx("span", { children: "Current Store Balance:" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: formatCurrency(balance, currency, usdToEtbRate) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-rose-700", children: [
              /* @__PURE__ */ jsx("span", { children: "Cash Outflow for Steer:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold", children: [
                "-$",
                totalOxCost.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-1 border-t border-neutral-200 flex items-center justify-between font-bold text-neutral-900", children: [
              /* @__PURE__ */ jsx("span", { children: "Remaining Balance:" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono", children: formatCurrency(Math.max(0, balance - totalOxCost), currency, usdToEtbRate) })
            ] })
          ] }),
          !canAffordOx && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: "Insufficient balance to purchase this cattle carcass." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: !canAffordOx || totalWeightLbs <= 0 || totalOxCost <= 0,
            className: "w-full py-3 px-4 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-amber-300" }),
              /* @__PURE__ */ jsx("span", { children: "Execute Butchery & Stock Meat Batches" })
            ]
          }
        )
      ] })
    ] }) }),
    activeWorkflow === "injera" && /* @__PURE__ */ jsx("form", { onSubmit: handleExecuteInjeraBake, className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-neutral-900", children: "In-House Injera Bakery Batch Run" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500", children: "Authentic Teff sourdough Injera is baked in-house daily. Record raw ingredients and energy cost to calculate exact unit cost per 5-pack." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Teff Flour Cost ($)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                required: true,
                value: teffCost,
                onChange: (e) => setTeffCost(e.target.value),
                className: "w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-neutral-500", children: "Bags milled from stock" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Gas, Electric & Water ($)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                value: powerCost,
                onChange: (e) => setPowerCost(e.target.value),
                className: "w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-neutral-500", children: "Mitad baking energy" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Packaging & Bags ($)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                value: packagingCost,
                onChange: (e) => setPackagingCost(e.target.value),
                className: "w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-neutral-500", children: "Plastic liners & ties" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Fresh Packs Baked (5-Pack units)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                required: true,
                value: packsProduced,
                onChange: (e) => setPacksProduced(e.target.value),
                className: "w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-neutral-500", children: "Each pack has 4-day fresh shelf life before expiry." })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Selling Price Per Pack ($)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0.1",
                required: true,
                value: injeraSellPrice,
                onChange: (e) => setInjeraSellPrice(e.target.value),
                className: "w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300 text-emerald-900"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-neutral-700 mb-1", children: "Baking Shift Notes" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: injeraNotes,
              onChange: (e) => setInjeraNotes(e.target.value),
              className: "w-full px-3 py-1.5 text-xs rounded border border-neutral-300"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200", children: "Bakery Economics" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Total Bake Production Cost:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900", children: [
                "$",
                totalInjeraCost.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Packs Produced:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900", children: [
                numPacks,
                " packs"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Derived Cost / Pack:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-amber-800", children: [
                "$",
                costPerPack.toFixed(2),
                " / pack"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-neutral-600", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Projected Sales (at $",
                numSellPrice.toFixed(2),
                "):"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold text-neutral-900", children: [
                "$",
                projectedInjeraRevenue.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-neutral-200 flex justify-between font-bold text-emerald-900 text-sm", children: [
              /* @__PURE__ */ jsx("span", { children: "Projected Profit:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono tabular-nums", children: [
                "+$",
                projectedInjeraProfit.toFixed(2)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-neutral-700", children: [
              /* @__PURE__ */ jsx("span", { children: "Current Store Balance:" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: formatCurrency(balance, currency, usdToEtbRate) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-rose-700", children: [
              /* @__PURE__ */ jsx("span", { children: "Cash Outflow for Ingredients:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold", children: [
                "-$",
                totalInjeraCost.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-1 border-t border-neutral-200 flex items-center justify-between font-bold text-neutral-900", children: [
              /* @__PURE__ */ jsx("span", { children: "Remaining Balance:" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono", children: formatCurrency(Math.max(0, balance - totalInjeraCost), currency, usdToEtbRate) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: !canAffordInjera || numPacks <= 0 || totalInjeraCost <= 0,
            className: "w-full py-3 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsx(Flame, { className: "w-4 h-4 text-white" }),
              /* @__PURE__ */ jsx("span", { children: "Bake & Stock Fresh Injera Batches" })
            ]
          }
        )
      ] })
    ] }) }),
    activeWorkflow === "history" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-neutral-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Beef, { className: "w-4 h-4 text-amber-700" }),
          /* @__PURE__ */ jsx("span", { children: "Cattle Butchery Breakdown History" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto border border-neutral-200 rounded-lg", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Date" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Tag #" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Butcher" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Total Cost" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Yield (lbs)" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Cost/lb" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Cuts Derived" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-neutral-200", children: oxProductions.map((p) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-neutral-50", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 font-mono", children: formatDate(p.date) }),
            /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 font-mono font-bold text-neutral-900", children: p.oxTagNumber }),
            /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 text-neutral-700", children: p.butcherName }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-rose-800", children: [
              "$",
              p.totalCost.toFixed(2)
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono", children: [
              p.totalYieldLbs,
              " lbs"
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-emerald-900", children: [
              "$",
              p.averageCostPerLb.toFixed(2),
              "/lb"
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 text-[11px] text-neutral-600", children: p.cuts.map((c) => `${c.cutName} (${c.weightLbs} lbs)`).join(", ") })
          ] }, p.id)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-neutral-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Flame, { className: "w-4 h-4 text-amber-600" }),
          /* @__PURE__ */ jsx("span", { children: "In-House Injera Bakery Production Runs" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto border border-neutral-200 rounded-lg", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Date" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Baker" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Bake Run Cost" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Packs Produced" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Cost Per Pack" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Sell Price" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Batch Notes" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-neutral-200", children: injeraProductions.map((p) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-neutral-50", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 font-mono", children: formatDate(p.date) }),
            /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 text-neutral-700", children: p.bakerName }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-rose-800", children: [
              "$",
              p.totalCost.toFixed(2)
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold", children: [
              p.packsProduced,
              " packs"
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono text-amber-800", children: [
              "$",
              p.costPerPack.toFixed(2)
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2.5 px-3 text-right font-mono text-emerald-900", children: [
              "$",
              p.sellingPricePerPack.toFixed(2)
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 text-[11px] text-neutral-500", children: p.notes || "\u2014" })
          ] }, p.id)) })
        ] }) })
      ] })
    ] })
  ] });
};
export {
  ProductionView
};
