import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Download, FileText, IndianRupee, CheckCircle, Clock, Calendar, XCircle } from "lucide-react";
import { D as DashboardShell } from "./DashboardShell-B-aNzHMJ.js";
import { B as Button } from "./button-BmLZMIt9.js";
import { t as toastError, a as toastSuccess } from "./toast-B5Q8Bvxc.js";
import { i as isOrganizerAuthenticated, a as apiClient } from "./router-BvkvNwFV.js";
import { o as organizerService } from "./organizer.service-4VUsLXYn.js";
import "./Flogo-BFeWNg6Z.js";
import "@tanstack/react-query";
import "./socket-Bwou9MYK.js";
import "socket.io-client";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "sonner";
import "./config-OQZNPa_v.js";
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;
const formatDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};
function PaymentsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [organizer, setOrganizer] = useState({
    name: "Organizer",
    email: ""
  });
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
  const load = useCallback(async () => {
    try {
      const [res, profile] = await Promise.all([organizerService.getInvoices(), organizerService.getProfile().catch(() => null)]);
      setData(res);
      if (profile?.organizer) {
        setOrganizer({
          name: profile.organizer.name ?? "Organizer",
          email: profile.organizer.email ?? ""
        });
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not load your payment history.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const invoices = data?.invoices ?? [];
  const handleDownload = async (invoice) => {
    setDownloadingId(invoice.booking_id);
    try {
      await organizerService.downloadInvoice(invoice.booking_id, invoice.invoice_no);
      toastSuccess(`Invoice ${invoice.invoice_no} downloaded`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not download that invoice.");
    } finally {
      setDownloadingId(null);
    }
  };
  const handleExportCSV = () => {
    if (invoices.length === 0) {
      toastError("There's nothing to export yet.");
      return;
    }
    const headers = ["Invoice No", "Date", "Package", "Taxable Value", "GST", "Total", "Status", "Payment Mode"];
    const rows = invoices.map((r) => [r.invoice_no, formatDate(r.invoice_date), r.package_name, r.taxable_value.toFixed(2), r.gst_amount.toFixed(2), r.total_payable.toFixed(2), r.payment_status.toUpperCase(), (r.payment_method ?? "—").toUpperCase()]);
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
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-emerald-600 bg-emerald-50";
      case "pending":
        return "text-amber-600 bg-amber-50";
      case "failed":
        return "text-rose-600 bg-rose-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" });
      case "pending":
        return /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" });
      case "failed":
        return /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxs(DashboardShell, { crumb: "Payment History", userName: organizer.name, userEmail: organizer.email, onLogout: () => {
    apiClient.setToken(null);
    navigate({
      to: "/login",
      search: {
        redirect: "/payments"
      }
    });
  }, children: [
    /* @__PURE__ */ jsx("section", { className: "rounded-2xl bg-white p-6 shadow-card", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Payment History" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "View all your transactions and download GST invoices." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: handleExportCSV, variant: "outline", className: "gap-2", disabled: loading, children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
          "Export CSV"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => window.print(), variant: "outline", className: "gap-2", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
          "Print"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "mt-6 grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SummaryCard, { icon: IndianRupee, title: "Total Spent", value: loading ? "—" : inr(data?.summary.total_spent ?? 0), color: "text-blue-600" }),
      /* @__PURE__ */ jsx(SummaryCard, { icon: CheckCircle, title: "Completed Payments", value: loading ? "—" : String(data?.summary.completed_count ?? 0), color: "text-emerald-600" }),
      /* @__PURE__ */ jsx(SummaryCard, { icon: Clock, title: "Pending Payments", value: loading ? "—" : String(data?.summary.pending_count ?? 0), color: "text-amber-600" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "mt-6 rounded-2xl bg-white shadow-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-900", children: "Invoice No" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-900", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-900", children: "Package" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-semibold text-gray-900", children: "Taxable" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-semibold text-gray-900", children: "GST" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-semibold text-gray-900", children: "Total" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-900", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-center text-xs font-semibold text-gray-900", children: "Invoice" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-200", children: loading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-6 py-12 text-center text-sm text-muted-foreground", children: "Loading your payment history…" }) }) : invoices.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-6 py-12 text-center text-sm text-muted-foreground", children: "No payments yet. Once you book an event, its GST invoice will appear here." }) }) : invoices.map((record) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: record.invoice_no }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-gray-400" }),
          formatDate(record.invoice_date)
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: /* @__PURE__ */ jsx("span", { className: "px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium", children: record.package_name }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-600 text-right", children: inr(record.taxable_value) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-600 text-right", children: inr(record.gst_amount) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-semibold text-gray-900 text-right", children: inr(record.total_payable) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm", children: /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-3 py-1 rounded-full font-medium text-xs w-fit ${getStatusColor(record.payment_status)}`, children: [
          getStatusIcon(record.payment_status),
          record.payment_status.charAt(0).toUpperCase() + record.payment_status.slice(1)
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-center", children: /* @__PURE__ */ jsxs("button", { onClick: () => handleDownload(record), disabled: downloadingId === record.booking_id, className: "text-primary hover:text-primary/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 inline mr-1" }),
          downloadingId === record.booking_id ? "Preparing…" : "Download"
        ] }) })
      ] }, record.booking_id)) })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "mt-6 rounded-2xl bg-blue-50 border border-blue-200 p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6 text-blue-600 flex-shrink-0 mt-1" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-blue-900", children: "GST Invoice Information" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-800 mt-1", children: "All payments are processed securely. Every booking's GST invoice can be downloaded from the Invoice column above, and remains available for 7 years from the date of issue as required under the GST Act." })
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
