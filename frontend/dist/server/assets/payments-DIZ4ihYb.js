import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Download, FileText, DollarSign, CheckCircle, Clock, Calendar } from "lucide-react";
import { D as DashboardShell } from "./DashboardShell-DnxArFqU.js";
import { B as Button } from "./button-BmLZMIt9.js";
import { a as toastSuccess } from "./toast-B5Q8Bvxc.js";
import { i as isOrganizerAuthenticated } from "./router-qdPwl0jo.js";
import "./Flogo-BFeWNg6Z.js";
import "@tanstack/react-query";
import "./organizer.service-D9SFzC32.js";
import "./config-qISbZfHI.js";
import "./socket-Bwou9MYK.js";
import "socket.io-client";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "sonner";
const PAYMENT_RECORDS = [{
  id: "1",
  date: "15 May 2026",
  description: "Mystery Quest - Standard Package",
  amount: "₹2,999",
  status: "completed",
  invoiceId: "INV-2026-001",
  packageName: "Standard"
}, {
  id: "2",
  date: "10 Apr 2026",
  description: "Mystery Quest - Premium Package",
  amount: "₹4,999",
  status: "completed",
  invoiceId: "INV-2026-002",
  packageName: "Premium"
}, {
  id: "3",
  date: "05 Mar 2026",
  description: "Mystery Quest - Standard Package",
  amount: "₹2,999",
  status: "completed",
  invoiceId: "INV-2026-003",
  packageName: "Standard"
}, {
  id: "4",
  date: "20 Feb 2026",
  description: "Mystery Quest - Enterprise Package",
  amount: "₹7,999",
  status: "pending",
  invoiceId: "INV-2026-004",
  packageName: "Enterprise"
}];
function PaymentsPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({
        to: "/login",
        search: {
          redirect: "/payments"
        }
      });
    }
  }, [navigate]);
  const handleExportCSV = () => {
    const headers = ["Invoice ID", "Date", "Package", "Amount", "Status", "Description"];
    const rows = PAYMENT_RECORDS.map((r) => [r.invoiceId, r.date, r.packageName, r.amount, r.status.toUpperCase(), r.description]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv"
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-history-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toastSuccess("Payment history exported as CSV");
  };
  const handlePrint = () => {
    window.print();
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-emerald-600 bg-emerald-50";
      case "pending":
        return "text-amber-600 bg-amber-50";
      case "failed":
        return "text-rose-600 bg-rose-50";
      default:
        return "";
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" });
      case "pending":
        return /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxs(DashboardShell, { crumb: "Payment History", children: [
    /* @__PURE__ */ jsx("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Payment History" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "View all your transactions and download invoices." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: handleExportCSV, variant: "outline", className: "gap-2", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
          "Export CSV"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: handlePrint, variant: "outline", className: "gap-2", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
          "Print"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "mt-6 grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SummaryCard, { icon: DollarSign, title: "Total Spent", value: "₹18,996", color: "text-blue-600" }),
      /* @__PURE__ */ jsx(SummaryCard, { icon: CheckCircle, title: "Completed Payments", value: "3", color: "text-emerald-600" }),
      /* @__PURE__ */ jsx(SummaryCard, { icon: Clock, title: "Pending Payments", value: "1", color: "text-amber-600" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "mt-6 rounded-2xl bg-white shadow-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-900", children: "Invoice ID" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-900", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-900", children: "Package" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-semibold text-gray-900", children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-900", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-center text-xs font-semibold text-gray-900", children: "Action" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-200", children: PAYMENT_RECORDS.map((record) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: record.invoiceId }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-gray-400" }),
          record.date
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: /* @__PURE__ */ jsx("span", { className: "px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium", children: record.packageName }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-semibold text-gray-900 text-right", children: record.amount }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm", children: /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-3 py-1 rounded-full font-medium text-xs w-fit ${getStatusColor(record.status)}`, children: [
          getStatusIcon(record.status),
          record.status.charAt(0).toUpperCase() + record.status.slice(1)
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-center", children: /* @__PURE__ */ jsxs("button", { className: "text-primary hover:text-primary/80 transition-colors text-sm font-medium", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 inline mr-1" }),
          "Download"
        ] }) })
      ] }, record.id)) })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "mt-6 rounded-2xl bg-blue-50 border border-blue-200 p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6 text-blue-600 flex-shrink-0 mt-1" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-blue-900", children: "GST Invoice Information" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-800 mt-1", children: "All payments are processed securely. A GST invoice will be automatically generated and sent to your registered email after successful payment. You can also download invoices from the action column above." })
      ] })
    ] }) })
  ] });
}
function SummaryCard({
  icon: Icon,
  title,
  value,
  color
}) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-white p-6 shadow-sm border border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-2", children: value })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `h-12 w-12 rounded-lg bg-opacity-10 grid place-items-center ${color}`, children: /* @__PURE__ */ jsx(Icon, { className: `h-6 w-6 ${color}` }) })
  ] }) });
}
export {
  PaymentsPage as component
};
