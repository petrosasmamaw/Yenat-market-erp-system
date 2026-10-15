import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCurrencyRate, syncERPState, showToast } from '../store/erpSlice';
import { loginSuccess } from '../store/authSlice';
import { UserAccount } from '../types/erp';
import {
  Database,
  Users,
  Building,
  Coins,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Server
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { storeInfo, usdToEtbRate, syncStatus, lastSynced } = useAppSelector(
    state => state.erp
  );
  const currentUser = useAppSelector(state => state.auth.user);

  const [neonUrl, setNeonUrl] = useState(
    'postgresql://neondb_owner:npg_sample@ep-quiet-fog-12345.us-east-2.aws.neon.tech/neondb?sslmode=require'
  );
  const [isTestingNeon, setIsTestingNeon] = useState(false);
  const [neonTestResult, setNeonTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const [rateInput, setRateInput] = useState(usdToEtbRate.toString());

  // Staff user profiles
  const users: UserAccount[] = [
    {
      id: 'u1',
      username: 'admin',
      name: 'Almaz Tadesse',
      role: 'Store Owner / Manager',
      email: 'almaz@yenatmarketvegas.com'
    },
    {
      id: 'u2',
      username: 'cashier',
      name: 'Dawit Bekele',
      role: 'Cashier & Sales Staff',
      email: 'dawit@yenatmarketvegas.com'
    },
    {
      id: 'u3',
      username: 'butcher',
      name: 'Haile Menelik',
      role: 'Master Butcher & Baker',
      email: 'haile@yenatmarketvegas.com'
    }
  ];

  const handleTestNeon = async () => {
    setIsTestingNeon(true);
    setNeonTestResult(null);

    try {
      const res = await fetch('/api/neon/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionUrl: neonUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setNeonTestResult({ success: true, message: data.message });
        dispatch(
          showToast({
            type: 'success',
            message: 'Neon PostgreSQL database connected successfully!'
          })
        );
      } else {
        setNeonTestResult({
          success: false,
          message: data.error || 'Connection failed'
        });
      }
    } catch (err: any) {
      setNeonTestResult({
        success: false,
        message: 'Could not reach server endpoint.'
      });
    } finally {
      setIsTestingNeon(false);
    }
  };

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(rateInput);
    if (val > 0) {
      dispatch(setCurrencyRate(val));
      dispatch(
        showToast({
          type: 'success',
          message: `Exchange rate set to 1 USD = ${val} ETB Birr`
        })
      );
    }
  };

  const handleSwitchUser = (user: UserAccount) => {
    dispatch(
      loginSuccess({
        token: 'mock_jwt_token_' + user.id,
        user
      })
    );
    dispatch(
      showToast({
        type: 'info',
        message: `Active user switched to ${user.name} (${user.role})`
      })
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="pb-6 border-b border-neutral-200">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Store Configuration & Database
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage Neon PostgreSQL connection, staff user profiles, Ethiopian Birr exchange rate, and store metadata.
        </p>
      </div>

      {/* Neon Database Settings Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Neon Serverless PostgreSQL Database
              </h2>
              <p className="text-xs text-neutral-500">
                Direct connection for persistence, transactions, and live store records
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
            Node Express + Neon Driver Ready
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Neon Connection String URL (PostgreSQL)
            </label>
            <input
              type="text"
              value={neonUrl}
              onChange={e => setNeonUrl(e.target.value)}
              placeholder="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
              className="w-full px-3 py-2 font-mono text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              The Express backend communicates via `@neondatabase/serverless`. Local data is automatically mirrored to persistent disk storage.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleTestNeon}
              disabled={isTestingNeon}
              className="px-4 py-2 rounded-lg bg-emerald-900 text-white font-bold hover:bg-emerald-800 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-xs"
            >
              {isTestingNeon ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Server className="w-4 h-4 text-amber-300" />
              )}
              <span>{isTestingNeon ? 'Testing...' : 'Test Neon Connection'}</span>
            </button>

            <button
              onClick={() => dispatch(syncERPState())}
              className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-neutral-600" />
              <span>Sync All Data to Server</span>
            </button>
          </div>

          {neonTestResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                neonTestResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {neonTestResult.success ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
              )}
              <span>{neonTestResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Staff & Cashier User Accounts Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Staff & Cashier Sessions (JWT Protected)
            </h2>
            <p className="text-xs text-neutral-500">
              Switch between store roles or authenticate on the register
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {users.map(u => {
            const isCurrent = currentUser?.id === u.id;
            return (
              <div
                key={u.id}
                onClick={() => handleSwitchUser(u)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-emerald-800 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-800'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-900">{u.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-amber-800 font-medium mt-1">{u.role}</div>
                <div className="text-[10px] text-neutral-400 mt-2 font-mono">
                  PIN: {u.id === 'u1' ? '2026' : u.id === 'u2' ? '1234' : '5678'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Currency & Store Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency Exchange Rate */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Ethiopian Birr (ETB) Rate
              </h2>
              <p className="text-xs text-neutral-500">
                Display prices and balances in USD or ETB
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateRate} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                1 USD ($) = How many Ethiopian Birr (ETB)?
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={rateInput}
                  onChange={e => setRateInput(e.target.value)}
                  className="w-32 px-3 py-1.5 font-mono font-bold rounded border border-neutral-300"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-emerald-900 rounded hover:bg-emerald-800"
                >
                  Save Rate
                </button>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500">
              Current setting: 1 USD = {usdToEtbRate} ETB. You can toggle currency anytime in the top header.
            </p>
          </form>
        </div>

        {/* Store Location & Tax Rate */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Store Profile</h2>
              <p className="text-xs text-neutral-500">
                {storeInfo.name} · Las Vegas, NV
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-neutral-600">
            <div>
              <span className="font-bold text-neutral-800">Address:</span>{' '}
              {storeInfo.address}
            </div>
            <div>
              <span className="font-bold text-neutral-800">Telephone:</span>{' '}
              {storeInfo.phone}
            </div>
            <div>
              <span className="font-bold text-neutral-800">Clark County Sales Tax:</span>{' '}
              <span className="font-mono">{(storeInfo.taxRate * 100).toFixed(3)}%</span>
            </div>
            <div>
              <span className="font-bold text-neutral-800">Server State:</span>{' '}
              <span className="font-mono text-emerald-800">
                {syncStatus === 'syncing' ? 'Syncing...' : 'Synchronized'} (
                {lastSynced ? new Date(lastSynced).toLocaleTimeString() : 'Up to date'})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
