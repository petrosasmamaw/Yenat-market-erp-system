import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { recordOxBreakdownAction, recordInjeraProductionAction } from '../store/erpSlice';
import { formatCurrency, formatDate } from '../utils/formatters';
import { canDebitBalance } from '../utils/financeLedger';
import {
  Beef,
  Flame,
  Scale,
  Sparkles,
  Calculator,
  Clock,
  History,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const ProductionView: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    balance,
    currency,
    usdToEtbRate,
    oxProductions,
    injeraProductions
  } = useAppSelector(state => state.erp);
  const currentUser = useAppSelector(state => state.auth.user);

  const [activeWorkflow, setActiveWorkflow] = useState<'ox' | 'injera' | 'history'>('ox');

  // Ox Breakdown Form State
  const [oxTag, setOxTag] = useState(`OX-${Math.floor(100 + Math.random() * 900)}`);
  const [oxCost, setOxCost] = useState('1400');
  const [processingFee, setProcessingFee] = useState('100');
  const [cuts, setCuts] = useState([
    { cutName: 'Fresh Siga Tibs (Tender Beef Cubes)', productId: 'prod_siga_tibs', weightLbs: 85, sellingPricePerLb: 10.99 },
    { cutName: 'Fresh Kitfo Meat (Prime Lean Beef)', productId: 'prod_siga_kitfo', weightLbs: 55, sellingPricePerLb: 12.99 },
    { cutName: 'Fresh Siga Kurt (Raw Beef Cut)', productId: 'prod_siga_kurt', weightLbs: 45, sellingPricePerLb: 11.49 },
    { cutName: 'Beef Short Ribs & Soup Cuts', productId: 'prod_siga_ribs', weightLbs: 65, sellingPricePerLb: 7.99 },
    { cutName: 'Marrow Bones & Broth Cuts', productId: '', weightLbs: 40, sellingPricePerLb: 3.50 }
  ]);
  const [oxNotes, setOxNotes] = useState('Local Angus steer carcass butchered into fresh retail cuts');

  // Injera Baking Form State
  const [teffCost, setTeffCost] = useState('130');
  const [powerCost, setPowerCost] = useState('18');
  const [packagingCost, setPackagingCost] = useState('18.50');
  const [packsProduced, setPacksProduced] = useState('90');
  const [injeraSellPrice, setInjeraSellPrice] = useState('4.99');
  const [injeraNotes, setInjeraNotes] = useState('100% Teff morning sourdough bake');

  // Ox Calculations
  const numOxCost = parseFloat(oxCost) || 0;
  const numProcessingFee = parseFloat(processingFee) || 0;
  const totalOxCost = numOxCost + numProcessingFee;
  const totalWeightLbs = cuts.reduce((sum, c) => sum + (c.weightLbs || 0), 0);
  const avgCostPerLb = totalWeightLbs > 0 ? Math.round((totalOxCost / totalWeightLbs) * 100) / 100 : 0;
  const totalProjectedRevenue = cuts.reduce(
    (sum, c) => sum + c.weightLbs * c.sellingPricePerLb,
    0
  );
  const projectedOxProfit = Math.round((totalProjectedRevenue - totalOxCost) * 100) / 100;
  const canAffordOx = canDebitBalance(balance, totalOxCost);

  // Injera Calculations
  const numTeff = parseFloat(teffCost) || 0;
  const numPower = parseFloat(powerCost) || 0;
  const numPkg = parseFloat(packagingCost) || 0;
  const totalInjeraCost = Math.round((numTeff + numPower + numPkg) * 100) / 100;
  const numPacks = parseInt(packsProduced, 10) || 0;
  const numSellPrice = parseFloat(injeraSellPrice) || 0;
  const costPerPack = numPacks > 0 ? Math.round((totalInjeraCost / numPacks) * 100) / 100 : 0;
  const projectedInjeraRevenue = Math.round(numPacks * numSellPrice * 100) / 100;
  const projectedInjeraProfit = Math.round((projectedInjeraRevenue - totalInjeraCost) * 100) / 100;
  const canAffordInjera = canDebitBalance(balance, totalInjeraCost);

  const handleExecuteOxBreakdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAffordOx) return;

    dispatch(
      recordOxBreakdownAction({
        oxTagNumber: oxTag.trim(),
        oxPurchaseCost: numOxCost,
        processingCost: numProcessingFee,
        cuts: cuts.filter(c => c.weightLbs > 0),
        butcherName: currentUser?.name || 'Master Butcher',
        notes: oxNotes.trim()
      })
    );

    // Reset with new tag
    setOxTag(`OX-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleExecuteInjeraBake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAffordInjera) return;

    dispatch(
      recordInjeraProductionAction({
        teffFlourCost: numTeff,
        gasAndPowerCost: numPower,
        packagingCost: numPkg,
        packsProduced: numPacks,
        sellingPricePerPack: numSellPrice,
        bakerName: currentUser?.name || 'Master Baker',
        notes: injeraNotes.trim()
      })
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            In-House Production & Breakdown
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Produce store-made goods: Butcher whole cattle into prime Siga cuts and bake fresh Teff sourdough Injera.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-200 rounded-lg">
          <button
            onClick={() => setActiveWorkflow('ox')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${
              activeWorkflow === 'ox'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950'
            }`}
          >
            <Beef className="w-4 h-4 text-amber-400" />
            <span>Ox Meat Breakdown</span>
          </button>

          <button
            onClick={() => setActiveWorkflow('injera')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${
              activeWorkflow === 'injera'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-200" />
            <span>Injera Bakery</span>
          </button>

          <button
            onClick={() => setActiveWorkflow('history')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${
              activeWorkflow === 'history'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Production History</span>
          </button>
        </div>
      </div>

      {/* 1. OX BUTCHERY BREAKDOWN WORKFLOW */}
      {activeWorkflow === 'ox' && (
        <form onSubmit={handleExecuteOxBreakdown} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Animal Cost & Cut Allocations */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Cattle Purchase & Butchery Allocation
                </h3>
                <p className="text-xs text-neutral-500">
                  The shop buys the live steer or whole carcass. Costs are debited from the cash balance and allocated to derived retail meat batches.
                </p>
              </div>

              {/* Animal Tag & Costs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Ox / Carcass Tag #
                  </label>
                  <input
                    type="text"
                    required
                    value={oxTag}
                    onChange={e => setOxTag(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Ox Purchase Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={oxCost}
                    onChange={e => setOxCost(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Slaughter & Processing Fee ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={processingFee}
                    onChange={e => setProcessingFee(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
                  />
                </div>
              </div>

              {/* Cut Yield Table */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-neutral-800">
                    Retail Meat Cuts Yield Breakdown
                  </h4>
                  <span className="text-[11px] text-neutral-500">
                    5-day fresh meat expiry automatically applied
                  </span>
                </div>

                <div className="overflow-x-auto border border-neutral-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-3">Cut Name</th>
                        <th className="py-2.5 px-3 text-right">Yield Weight (lbs)</th>
                        <th className="py-2.5 px-3 text-right">Derived Cost/lb</th>
                        <th className="py-2.5 px-3 text-right">Target Sell Price/lb</th>
                        <th className="py-2.5 px-3 text-right">Projected Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {cuts.map((cut, idx) => {
                        const cutRev = cut.weightLbs * cut.sellingPricePerLb;
                        return (
                          <tr key={cut.cutName} className="hover:bg-neutral-50">
                            <td className="py-2.5 px-3 font-medium text-neutral-900">
                              {cut.cutName}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={cut.weightLbs}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const next = [...cuts];
                                  next[idx].weightLbs = val;
                                  setCuts(next);
                                }}
                                className="w-20 px-2 py-1 text-right font-mono font-bold border border-neutral-300 rounded"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-neutral-600">
                              ${avgCostPerLb.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={cut.sellingPricePerLb}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const next = [...cuts];
                                  next[idx].sellingPricePerLb = val;
                                  setCuts(next);
                                }}
                                className="w-20 px-2 py-1 text-right font-mono font-bold border border-neutral-300 rounded text-emerald-900"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900 tabular-nums">
                              ${cutRev.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Butcher Notes & Carcass Inspection
                </label>
                <input
                  type="text"
                  value={oxNotes}
                  onChange={e => setOxNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-neutral-300"
                />
              </div>
            </div>

            {/* Right 1 Col: Financial Impact & Confirmation */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                  Butchery Economics
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Total Steer Cost:</span>
                    <span className="font-mono font-bold text-neutral-900">
                      ${totalOxCost.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Total Retail Weight:</span>
                    <span className="font-mono font-bold text-neutral-900">
                      {totalWeightLbs} lbs
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Average Unit Cost / lb:</span>
                    <span className="font-mono font-bold text-amber-800">
                      ${avgCostPerLb.toFixed(2)} / lb
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Projected Retail Sales:</span>
                    <span className="font-mono font-bold text-neutral-900">
                      ${totalProjectedRevenue.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-emerald-900 text-sm">
                    <span>Projected Profit:</span>
                    <span className="font-mono tabular-nums">
                      +${projectedOxProfit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Cash Flow Balance Impact */}
                <div className="mt-6 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-neutral-700">
                    <span>Current Store Balance:</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(balance, currency, usdToEtbRate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-rose-700">
                    <span>Cash Outflow for Steer:</span>
                    <span className="font-mono font-bold">-${totalOxCost.toFixed(2)}</span>
                  </div>

                  <div className="pt-1 border-t border-neutral-200 flex items-center justify-between font-bold text-neutral-900">
                    <span>Remaining Balance:</span>
                    <span className="font-mono">
                      {formatCurrency(Math.max(0, balance - totalOxCost), currency, usdToEtbRate)}
                    </span>
                  </div>
                </div>

                {!canAffordOx && (
                  <div className="mt-3 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Insufficient balance to purchase this cattle carcass.</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={!canAffordOx || totalWeightLbs <= 0 || totalOxCost <= 0}
                className="w-full py-3 px-4 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-amber-300" />
                <span>Execute Butchery & Stock Meat Batches</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 2. INJERA BAKERY PRODUCTION WORKFLOW */}
      {activeWorkflow === 'injera' && (
        <form onSubmit={handleExecuteInjeraBake} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  In-House Injera Bakery Batch Run
                </h3>
                <p className="text-xs text-neutral-500">
                  Authentic Teff sourdough Injera is baked in-house daily. Record raw ingredients and energy cost to calculate exact unit cost per 5-pack.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Teff Flour Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={teffCost}
                    onChange={e => setTeffCost(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
                  />
                  <span className="text-[10px] text-neutral-500">Bags milled from stock</span>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Gas, Electric & Water ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={powerCost}
                    onChange={e => setPowerCost(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
                  />
                  <span className="text-[10px] text-neutral-500">Mitad baking energy</span>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Packaging & Bags ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={packagingCost}
                    onChange={e => setPackagingCost(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono font-bold rounded border border-neutral-300 bg-white"
                  />
                  <span className="text-[10px] text-neutral-500">Plastic liners & ties</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Fresh Packs Baked (5-Pack units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={packsProduced}
                    onChange={e => setPacksProduced(e.target.value)}
                    className="w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300"
                  />
                  <span className="text-[10px] text-neutral-500">
                    Each pack has 4-day fresh shelf life before expiry.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Selling Price Per Pack ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={injeraSellPrice}
                    onChange={e => setInjeraSellPrice(e.target.value)}
                    className="w-full px-3 py-2 font-mono font-bold rounded border border-neutral-300 text-emerald-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Baking Shift Notes
                </label>
                <input
                  type="text"
                  value={injeraNotes}
                  onChange={e => setInjeraNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-neutral-300"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                  Bakery Economics
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Total Bake Production Cost:</span>
                    <span className="font-mono font-bold text-neutral-900">
                      ${totalInjeraCost.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Packs Produced:</span>
                    <span className="font-mono font-bold text-neutral-900">
                      {numPacks} packs
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Derived Cost / Pack:</span>
                    <span className="font-mono font-bold text-amber-800">
                      ${costPerPack.toFixed(2)} / pack
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Projected Sales (at ${numSellPrice.toFixed(2)}):</span>
                    <span className="font-mono font-bold text-neutral-900">
                      ${projectedInjeraRevenue.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-emerald-900 text-sm">
                    <span>Projected Profit:</span>
                    <span className="font-mono tabular-nums">
                      +${projectedInjeraProfit.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-neutral-700">
                    <span>Current Store Balance:</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(balance, currency, usdToEtbRate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-rose-700">
                    <span>Cash Outflow for Ingredients:</span>
                    <span className="font-mono font-bold">-${totalInjeraCost.toFixed(2)}</span>
                  </div>

                  <div className="pt-1 border-t border-neutral-200 flex items-center justify-between font-bold text-neutral-900">
                    <span>Remaining Balance:</span>
                    <span className="font-mono">
                      {formatCurrency(Math.max(0, balance - totalInjeraCost), currency, usdToEtbRate)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canAffordInjera || numPacks <= 0 || totalInjeraCost <= 0}
                className="w-full py-3 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 text-white" />
                <span>Bake & Stock Fresh Injera Batches</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3. HISTORICAL PRODUCTION LOGS */}
      {activeWorkflow === 'history' && (
        <div className="space-y-6">
          {/* Ox Breakdown History */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Beef className="w-4 h-4 text-amber-700" />
              <span>Cattle Butchery Breakdown History</span>
            </h3>

            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Tag #</th>
                    <th className="py-2.5 px-3">Butcher</th>
                    <th className="py-2.5 px-3 text-right">Total Cost</th>
                    <th className="py-2.5 px-3 text-right">Yield (lbs)</th>
                    <th className="py-2.5 px-3 text-right">Cost/lb</th>
                    <th className="py-2.5 px-3">Cuts Derived</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {oxProductions.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 font-mono">{formatDate(p.date)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">{p.oxTagNumber}</td>
                      <td className="py-2.5 px-3 text-neutral-700">{p.butcherName}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-800">
                        ${p.totalCost.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{p.totalYieldLbs} lbs</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900">
                        ${p.averageCostPerLb.toFixed(2)}/lb
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-neutral-600">
                        {p.cuts.map(c => `${c.cutName} (${c.weightLbs} lbs)`).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Injera Bakery History */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>In-House Injera Bakery Production Runs</span>
            </h3>

            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Baker</th>
                    <th className="py-2.5 px-3 text-right">Bake Run Cost</th>
                    <th className="py-2.5 px-3 text-right">Packs Produced</th>
                    <th className="py-2.5 px-3 text-right">Cost Per Pack</th>
                    <th className="py-2.5 px-3 text-right">Sell Price</th>
                    <th className="py-2.5 px-3">Batch Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {injeraProductions.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 font-mono">{formatDate(p.date)}</td>
                      <td className="py-2.5 px-3 text-neutral-700">{p.bakerName}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-800">
                        ${p.totalCost.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{p.packsProduced} packs</td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-800">
                        ${p.costPerPack.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-900">
                        ${p.sellingPricePerPack.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-neutral-500">{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
