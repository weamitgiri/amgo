import { U as reactExports, L as jsxRuntimeExports } from "./server-D_Zkyltj.js";
import { L as Link } from "./router-DZhViOq_.js";
import { c as createLucideIcon, L as Logo } from "./Logo-COJrqD4D.js";
import { C as Crumbs } from "./Crumbs-knMBxWJ5.js";
import { b as toastSuccess } from "./toast-s3ZTemWF.js";
import { F as FileText } from "./file-text-DmEUAd4D.js";
import { D as Download } from "./download-B3xPG40w.js";
import { T as Trophy } from "./trophy-CKK5oUV7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./chevron-right-B_AJoG7h.js";
const __iconNode$1 = [
  [
    "path",
    {
      d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
      key: "143wyd"
    }
  ],
  ["path", { d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6", key: "1itne7" }],
  ["rect", { x: "6", y: "14", width: "12", height: "8", rx: "1", key: "1ue0tg" }]
];
const Printer = createLucideIcon("printer", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
];
const Star = createLucideIcon("star", __iconNode);
const ROLES = [{
  name: "Mark32 (You)",
  role: "INVESTIGATOR",
  color: "text-purple-300",
  grad: "from-violet-600 to-purple-900",
  pts: 260,
  badge: "Investigator",
  badgeBg: "bg-purple-500/20 text-purple-300"
}, {
  name: "James45",
  role: "Son-in-law",
  color: "text-emerald-300",
  grad: "from-slate-700 to-zinc-900",
  pts: 210,
  badge: "Witness",
  badgeBg: "bg-emerald-500/20 text-emerald-300"
}, {
  name: "Fred36",
  role: "Daughter-in-law",
  color: "text-rose-300",
  grad: "from-fuchsia-700 to-rose-900",
  pts: 150,
  badge: "Hidden Culprit",
  badgeBg: "bg-rose-500/20 text-rose-300"
}, {
  name: "Oni86",
  role: "Servant",
  color: "text-amber-300",
  grad: "from-emerald-800 to-zinc-900",
  pts: 100,
  badge: "Key Suspect",
  badgeBg: "bg-amber-500/20 text-amber-300"
}, {
  name: "John32",
  role: "Head Farmer",
  color: "text-sky-300",
  grad: "from-amber-700 to-red-900",
  pts: 80,
  badge: "Participant",
  badgeBg: "bg-sky-500/20 text-sky-300"
}];
function ResultsPage() {
  const [viewMode, setViewMode] = reactExports.useState("table");
  const handleExportCSV = () => {
    const headers = ["Rank", "Player", "Role", "Badge", "Points"];
    const rows = ROLES.map((r, i) => [i + 1, r.name, r.role, r.badge, r.pts]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv"
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mystery-quest-results-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toastSuccess("Results exported as CSV");
  };
  const handlePrint = () => {
    window.print();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[#0d0820] text-white p-4 md:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Mystery Quest" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm", children: [
          "Game Time Remaining ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 font-bold tabular-nums", children: "24:58" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 grid place-items-center text-xs font-bold", children: "SK" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Sneha Kapoor" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crumbs, { tone: "dark", items: [{
      label: "Home",
      to: "/"
    }, {
      label: "Lobby",
      to: "/lobby"
    }, {
      label: "Game",
      to: "/game"
    }, {
      label: "Results"
    }] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 px-5 py-4 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-2xl bg-purple-500/30 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-purple-200" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-wide", children: "Results & Role Revealed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleExportCSV, className: "rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Export CSV" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handlePrint, className: "rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2 print:hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Print" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewMode("story"), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "story" ? "bg-purple-600 text-white" : "bg-white/10 text-white/70 hover:text-white"}`, children: "Story View" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewMode("table"), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "table" ? "bg-purple-600 text-white" : "bg-white/10 text-white/70 hover:text-white"}`, children: "Table View" })
    ] }),
    viewMode === "story" ? /* @__PURE__ */ jsxRuntimeExports.jsx(StoryView, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableView, {})
  ] });
}
function StoryView() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-rose-300", children: "The Truth is Out!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/70 mt-1", children: "The hidden Culprit was" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-3 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-700 to-rose-900 ring-2 ring-rose-400/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-rose-300 text-2xl font-black", children: "Priya Malhotra" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-rose-400", children: "(Daughter In Law)!" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-3xl border border-white/10 bg-white/5 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-rose-300 font-black text-lg", children: "The Full Story" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-100/95 text-zinc-900 text-[11px] px-3 py-1 rounded-sm rotate-[-1deg]", children: [
            "Behind every ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-700 font-bold", children: "mystery" }),
            " lies a human ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-700 font-bold", children: "motive" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chapter, { title: "The Will Change", body: "Three days before the party, Priya accidentally discovered a draft document in Raghav's study while looking for a pen. The document was a revised will, Raghav planned to donate 40% of the entire Malhotra estate to a farmer rehabilitation trust as a compromise to end Kiran Singh's protests. This would reduce her and Vikram's inheritance by crores." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chapter, { title: "Her Personal Secret", body: "Priya had taken a personal loan of ₹1.8 crore from a private lender 8 months ago, without telling Vikram. She had invested it in a side business that failed completely. She was counting on Vikram's inheritance to quietly repay this without Vikram ever finding out. The will change would make repayment impossible and expose her secret entirely." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chapter, { title: "The Phone Call", body: "Was the Trigger When Raghav called Vikram at 11:20 PM, Priya was standing nearby and overheard Raghav telling Vikram about the will change. Raghav was planning to announce it publicly at the party itself, before the night ended. She had minutes to act before everything collapsed." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-center text-sm font-bold mb-3", children: "Roles Revealed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-2", children: ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mx-auto h-10 w-10 rounded-full bg-gradient-to-br ${r.grad}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs font-semibold", children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/60", children: r.role }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 inline-block text-[9px] px-2 py-0.5 rounded-full ${r.badgeBg}`, children: r.badge.toUpperCase() })
        ] }, r.name)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 h-fit", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "🎉" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-black", children: "Fun Over" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/70", children: "Here are the final results!" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-white/70", children: "Rate Your Experience" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-center gap-1", children: [
          [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-6 w-6 text-amber-300 fill-amber-300" }, i)),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-6 w-6 text-white/30" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-5 space-y-2", children: ROLES.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 text-center font-bold", children: i === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-amber-300" }) : i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-9 w-9 rounded-full bg-gradient-to-br ${r.grad}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[11px] ${r.color}`, children: r.badge })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-amber-300 font-bold text-sm", children: [
          r.pts,
          " pts"
        ] })
      ] }, r.name)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/lobby", className: "mt-5 block text-center w-full rounded-full bg-gradient-primary py-3 text-sm font-semibold shadow-glow", children: "Exit to Lobby" })
    ] })
  ] });
}
function TableView() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 overflow-x-auto rounded-2xl border border-white/10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-white/10 bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left font-semibold text-white/70", children: "Rank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left font-semibold text-white/70", children: "Player" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left font-semibold text-white/70", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left font-semibold text-white/70", children: "Badge" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right font-semibold text-white/70", children: "Points" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: ROLES.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-white/5 hover:bg-white/5 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: i === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-amber-300" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-5 w-5 grid place-items-center text-amber-300 font-bold", children: i + 1 }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-8 w-8 rounded-full bg-gradient-to-br ${r.grad}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.name })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-white/70", children: r.role }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block px-3 py-1 rounded-full text-xs font-medium ${r.badgeBg}`, children: r.badge }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right font-semibold text-amber-300", children: r.pts })
      ] }, r.name)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 bg-white/5 border-t border-white/10 grid grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/60 mb-1", children: "Winner" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-amber-300", children: ROLES[0].name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/60 mb-1", children: "Total Players" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: ROLES.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/60 mb-1", children: "Total Points" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: ROLES.reduce((sum, r) => sum + r.pts, 0) })
      ] })
    ] })
  ] });
}
function Chapter({
  title,
  body
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/75 mt-1 leading-relaxed", children: body })
    ] })
  ] });
}
export {
  ResultsPage as component
};
