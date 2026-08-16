import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Download, FileText, IndianRupee, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { toastError, toastSuccess } from "@/lib/toast";
import { isOrganizerAuthenticated, requireOrganizerAuth } from "@/lib/auth";
import { organizerService } from "@/api/services/organizer.service";
import { apiClient } from "@/api/client";
import type { OrganizerInvoice, OrganizerInvoicesResponse } from "@/api/types/organizer";

export const Route = createFileRoute("/payments")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({ meta: [{ title: "Payment History — Zoventro" }] }),
  component: PaymentsPage,
});

const inr = (n: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function PaymentsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<OrganizerInvoicesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [organizer, setOrganizer] = useState({ name: "Organizer", email: "" });

  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({ to: "/login", search: { redirect: "/payments" } });
    }
  }, [navigate]);

  const load = useCallback(async () => {
    try {
      const [res, profile] = await Promise.all([
        organizerService.getInvoices(),
        organizerService.getProfile().catch(() => null),
      ]);
      setData(res);
      if (profile?.organizer) {
        setOrganizer({ name: profile.organizer.name ?? "Organizer", email: profile.organizer.email ?? "" });
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

  const invoices: OrganizerInvoice[] = data?.invoices ?? [];

  const handleDownload = async (invoice: OrganizerInvoice) => {
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
    const rows = invoices.map((r) => [
      r.invoice_no,
      formatDate(r.invoice_date),
      r.package_name,
      r.taxable_value.toFixed(2),
      r.gst_amount.toFixed(2),
      r.total_payable.toFixed(2),
      r.payment_status.toUpperCase(),
      (r.payment_method ?? "—").toUpperCase(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toastSuccess("Payment history exported as CSV");
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <DashboardShell
      crumb="Payment History"
      userName={organizer.name}
      userEmail={organizer.email}
      onLogout={() => {
        apiClient.setToken(null);
        navigate({ to: "/login", search: { redirect: "/payments" } });
      }}
    >
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View all your transactions and download GST invoices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExportCSV} variant="outline" className="gap-2" disabled={loading}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => window.print()} variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={IndianRupee}
          title="Total Spent"
          value={loading ? "—" : inr(data?.summary.total_spent ?? 0)}
          color="text-blue-600"
        />
        <SummaryCard
          icon={CheckCircle}
          title="Completed Payments"
          value={loading ? "—" : String(data?.summary.completed_count ?? 0)}
          color="text-emerald-600"
        />
        <SummaryCard
          icon={Clock}
          title="Pending Payments"
          value={loading ? "—" : String(data?.summary.pending_count ?? 0)}
          color="text-amber-600"
        />
      </section>

      <section className="mt-6 rounded-2xl bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Invoice No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Package</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900">Taxable</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900">GST</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Loading your payment history…
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No payments yet. Once you book an event, its GST invoice will appear here.
                  </td>
                </tr>
              ) : (
                invoices.map((record) => (
                  <tr key={record.booking_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.invoice_no}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(record.invoice_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        {record.package_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{inr(record.taxable_value)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{inr(record.gst_amount)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {inr(record.total_payable)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium text-xs w-fit ${getStatusColor(
                          record.payment_status
                        )}`}
                      >
                        {getStatusIcon(record.payment_status)}
                        {record.payment_status.charAt(0).toUpperCase() + record.payment_status.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(record)}
                        disabled={downloadingId === record.booking_id}
                        className="text-primary hover:text-primary/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="h-4 w-4 inline mr-1" />
                        {downloadingId === record.booking_id ? "Preparing…" : "Download"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-blue-50 border border-blue-200 p-6">
        <div className="flex gap-4">
          <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900">GST Invoice Information</h3>
            <p className="text-sm text-blue-800 mt-1">
              All payments are processed securely. Every booking's GST invoice can be downloaded from the
              Invoice column above, and remains available for 7 years from the date of issue as required
              under the GST Act.
            </p>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-lg bg-opacity-10 grid place-items-center ${color}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}
