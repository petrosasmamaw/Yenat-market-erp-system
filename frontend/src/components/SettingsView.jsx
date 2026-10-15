import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { setCurrencyRate, syncERPState, showToast } from "../store/erpSlice";
import { login } from "../store/authSlice";
import {
  Database,
  Users,
  Building,
  Coins,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Server
} from "lucide-react";
import { apiFetch } from "../utils/api";
const SettingsView = () => {
  const dispatch = useAppDispatch();
  const { storeInfo, usdToEtbRate, syncStatus, lastSynced } = useAppSelector(
    (state) => state.erp
  );
  const currentUser = useAppSelector((state) => state.auth.user);
  const [neonUrl, setNeonUrl] = useState("");
  const [serverHealth, setServerHealth] = useState(null);
  useEffect(() => {
    apiFetch("/api/health")
      .then((r) => r.json())
      .then(setServerHealth)
      .catch(() => setServerHealth(null));
  }, []);
  const [isTestingNeon, setIsTestingNeon] = useState(false);
  const [neonTestResult, setNeonTestResult] = useState(null);
  const [rateInput, setRateInput] = useState(usdToEtbRate.toString());
  const users = [
    {
      id: "u1",
      username: "admin",
      name: "Almaz Tadesse",
      role: "Store Owner / Manager",
      email: "almaz@yenatmarketvegas.com"
    },
    {
      id: "u2",
      username: "cashier",
      name: "Dawit Bekele",
      role: "Cashier & Sales Staff",
      email: "dawit@yenatmarketvegas.com"
    },
    {
      id: "u3",
      username: "butcher",
      name: "Haile Menelik",
      role: "Master Butcher & Baker",
      email: "haile@yenatmarketvegas.com"
    }
  ];
  const handleTestNeon = async () => {
    setIsTestingNeon(true);
    setNeonTestResult(null);
    try {
      const res = await apiFetch("/api/neon/test", {
        method: "POST",
        body: JSON.stringify({
          connectionUrl: neonUrl.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNeonTestResult({ success: true, message: data.message });
        dispatch(
          showToast({
            type: "success",
            message: "Neon PostgreSQL database connected successfully!"
          })
        );
      } else {
        setNeonTestResult({
          success: false,
          message: data.error || "Connection failed"
        });
      }
    } catch (err) {
      setNeonTestResult({
        success: false,
        message: "Could not reach server endpoint."
      });
    } finally {
      setIsTestingNeon(false);
    }
  };
  const handleUpdateRate = (e) => {
    e.preventDefault();
    const val = parseFloat(rateInput);
    if (val > 0) {
      dispatch(setCurrencyRate(val));
      dispatch(
        showToast({
          type: "success",
          message: `Exchange rate set to 1 USD = ${val} ETB Birr`
        })
      );
    }
  };
  const demoPins = { u1: "2026", u2: "1234", u3: "5678" };
  const handleSwitchUser = async (user) => {
    const pin = demoPins[user.id];
    const result = await dispatch(login({ username: user.username, pin }));
    if (login.fulfilled.match(result)) {
      dispatch(
        showToast({
          type: "success",
          message: `Signed in as ${user.name} (${user.role})`
        })
      );
    } else {
      dispatch(
        showToast({
          type: "error",
          message: result.payload || "Could not switch user"
        })
      );
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-8 max-w-5xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "pb-6 border-b border-neutral-200", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-neutral-900 tracking-tight", children: "Store Configuration & Database" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 mt-1", children: "Manage Neon PostgreSQL connection, staff user profiles, Ethiopian Birr exchange rate, and store metadata." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800", children: /* @__PURE__ */ jsx(Database, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-neutral-900", children: "Neon Serverless PostgreSQL Database" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500", children: "Direct connection for persistence, transactions, and live store records" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900", children: "Node Express + Neon Driver Ready" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "Neon Connection String URL (PostgreSQL)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: neonUrl,
              onChange: (e) => setNeonUrl(e.target.value),
              placeholder: "postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require",
              className: "w-full px-3 py-2 font-mono text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            }
          ),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-neutral-500 mt-1", children: [
            "Set ",
            /* @__PURE__ */ jsx("span", { className: "font-mono text-brand-800", children: "DATABASE_URL" }),
            " in ",
            /* @__PURE__ */ jsx("span", { className: "font-mono", children: "backend/.env" }),
            ", then test (optional override URL above). Hybrid mode keeps a local JSON backup."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleTestNeon,
              disabled: isTestingNeon,
              className: "px-4 py-2 rounded-lg bg-brand-800 text-white font-bold hover:bg-emerald-800 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-xs",
              children: [
                isTestingNeon ? /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Server, { className: "w-4 h-4 text-amber-300" }),
                /* @__PURE__ */ jsx("span", { children: isTestingNeon ? "Testing..." : "Test Neon Connection" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => dispatch(syncERPState()),
              className: "px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold transition-colors flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4 text-neutral-600" }),
                /* @__PURE__ */ jsx("span", { children: "Sync All Data to Server" })
              ]
            }
          )
        ] }),
        neonTestResult && /* @__PURE__ */ jsxs(
          "div",
          {
            className: `p-3 rounded-lg border text-xs flex items-center gap-2 ${neonTestResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"}`,
            children: [
              neonTestResult.success ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 shrink-0 text-emerald-700" }) : /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 shrink-0 text-rose-700" }),
              /* @__PURE__ */ jsx("span", { children: neonTestResult.message })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800", children: /* @__PURE__ */ jsx(Users, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-neutral-900", children: "Staff & Cashier Sessions (JWT Protected)" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500", children: "Switch between store roles or authenticate on the register" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: users.map((u) => {
        const isCurrent = currentUser?.id === u.id;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => handleSwitchUser(u),
            className: `p-4 rounded-xl border cursor-pointer transition-all ${isCurrent ? "border-emerald-800 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-800" : "border-neutral-200 hover:border-neutral-300 bg-white"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-xs text-neutral-900", children: u.name }),
                isCurrent && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded", children: "Active" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-amber-800 font-medium mt-1", children: u.role }),
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-neutral-400 mt-2 font-mono", children: [
                "PIN: ",
                u.id === "u1" ? "2026" : u.id === "u2" ? "1234" : "5678"
              ] })
            ]
          },
          u.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800", children: /* @__PURE__ */ jsx(Coins, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-neutral-900", children: "Ethiopian Birr (ETB) Rate" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500", children: "Display prices and balances in USD or ETB" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleUpdateRate, className: "space-y-3 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block font-bold text-neutral-700 mb-1", children: "1 USD ($) = How many Ethiopian Birr (ETB)?" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  step: "0.5",
                  min: "1",
                  value: rateInput,
                  onChange: (e) => setRateInput(e.target.value),
                  className: "w-32 px-3 py-1.5 font-mono font-bold rounded border border-neutral-300"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  className: "px-4 py-1.5 font-bold text-white bg-emerald-900 rounded hover:bg-emerald-800",
                  children: "Save Rate"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-neutral-500", children: [
            "Current setting: 1 USD = ",
            usdToEtbRate,
            " ETB. You can toggle currency anytime in the top header."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800", children: /* @__PURE__ */ jsx(Building, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-neutral-900", children: "Store Profile" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-500", children: [
              storeInfo.name,
              " \xB7 Las Vegas, NV"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs text-neutral-600", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-neutral-800", children: "Address:" }),
            " ",
            storeInfo.address
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-neutral-800", children: "Telephone:" }),
            " ",
            storeInfo.phone
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-neutral-800", children: "Clark County Sales Tax:" }),
            " ",
            /* @__PURE__ */ jsxs("span", { className: "font-mono", children: [
              (storeInfo.taxRate * 100).toFixed(3),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-neutral-800", children: "Server State:" }),
            " ",
            /* @__PURE__ */ jsxs("span", { className: "font-mono text-emerald-800", children: [
              syncStatus === "syncing" ? "Syncing..." : "Synchronized",
              " (",
              lastSynced ? new Date(lastSynced).toLocaleTimeString() : "Up to date",
              ")"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
export {
  SettingsView
};
