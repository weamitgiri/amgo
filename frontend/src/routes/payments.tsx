import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Download, FileText, DollarSign, Calendar, CheckCircle, Clock } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "@/lib/toast";
import { isOrganizerAuthenticated, requireOrganizerAuth } from "@/lib/auth";

export const Route = createFileRoute("/payments")({
  beforeLoad: requireOrganizerAuth,
  head: () => ({ meta: [{ title: "Payment History — Zoventro" }] }),
  component: PaymentsPage,
});

interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  invoiceId: string;
  packageName: string;
}

const PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: "1",
    date: "15 May 2026",
    description: "Mystery Quest - Standard Package",
    amount: "₹2,999",
    status: "completed",
    invoiceId: "INV-2026-001",
    packageName: "Standard",
  },
  {
    id: "2",
    date: "10 Apr 2026",
    description: "Mystery Quest - Premium Package",
    amount: "₹4,999",
    status: "completed",
    invoiceId: "INV-2026-002",
    packageName: "Premium",
  },
  {
    id: "3",
    date: "05 Mar 2026",
    description: "Mystery Quest - Standard Package",
    amount: "₹2,999",
    status: "completed",
    invoiceId: "INV-2026-003",
    packageName: "Standard",
  },
  {
    id: "4",
    date: "20 Feb 2026",
    description: "Mystery Quest - Enterprise Package",
    amount: "₹7,999",
    status: "pending",
    invoiceId: "INV-2026-004",
    packageName: "Enterprise",
  },
];

function PaymentsPage() {
  const navigate = useNavigate();

  // Early auth check as fallback
  useEffect(() => {
    if (!isOrganizerAuthenticated()) {
      navigate({ to: "/login", search: { redirect: "/payments" } });
    }
  }, [navigate]);

  const handleExportCSV = () => {
    const headers = ["Invoice ID", "Date", "Package", "Amount", "Status", "Description"];
    const rows = PAYMENT_RECORDS.map((r) => [
      r.invoiceId,
      r.date,
      r.packageName,
      r.amount,
      r.status.toUpperCase(),
      r.description,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toastSuccess("Payment history exported as CSV");
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <DashboardShell crumb="Payment History">
      {/* Header */}
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View all your transactions and download invoices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={DollarSign}
          title="Total Spent"
          value="₹18,996"
          color="text-blue-600"
        />
        <SummaryCard
          icon={CheckCircle}
          title="Completed Payments"
          value="3"
          color="text-emerald-600"
        />
        <SummaryCard
          icon={Clock}
          title="Pending Payments"
          value="1"
          color="text-amber-600"
        />
      </section>

      {/* Payments Table */}
      <section className="mt-6 rounded-2xl bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Package
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {PAYMENT_RECORDS.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {record.invoiceId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {record.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {record.packageName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    {record.amount}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium text-xs w-fit ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {getStatusIcon(record.status)}
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                      <Download className="h-4 w-4 inline mr-1" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* GST Invoice Info */}
      <section className="mt-6 rounded-2xl bg-blue-50 border border-blue-200 p-6">
        <div className="flex gap-4">
          <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900">GST Invoice Information</h3>
            <p className="text-sm text-blue-800 mt-1">
              All payments are processed securely. A GST invoice will be automatically generated
              and sent to your registered email after successful payment. You can also download
              invoices from the action column above.
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
  icon: any;
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
