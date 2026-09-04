<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Aggregated payment reporting.
 *
 * Kept apart from PaymentController because the questions are different: that
 * one answers "show me this payment", this one answers "how much did we take,
 * broken down how". They share no query paths, only the Payment model.
 */
class PaymentReportController extends Controller
{
    /**
     * Revenue report over a date range, grouped by day, month or gateway.
     *
     * Reporting is settled-only throughout — pending COD and failed attempts
     * appear as separate counters, never inside a revenue figure.
     */
    public function index(Request $request)
    {
        $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'group_by' => 'nullable|in:day,month,gateway,status',
        ]);

        $from = $request->filled('from')
            ? \Illuminate\Support\Carbon::parse($request->query('from'))->startOfDay()
            : now()->subDays(29)->startOfDay();

        $to = $request->filled('to')
            ? \Illuminate\Support\Carbon::parse($request->query('to'))->endOfDay()
            : now()->endOfDay();

        $groupBy = $request->query('group_by', 'day');

        // Revenue is measured on paid_at (when the money landed); attempt
        // counts on created_at (when it was tried). Mixing the two would make
        // the rows disagree with the totals.
        $rows = $this->groupedRows($groupBy, $from, $to);

        $summary = Payment::query()
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('COUNT(*) as attempts')
            ->selectRaw("SUM(payment_status = 'captured') as successful")
            ->selectRaw("SUM(payment_status = 'pending') as pending")
            ->selectRaw("SUM(payment_status IN ('failed','cancelled')) as failed")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' THEN amount END), 0) as revenue")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' AND gateway = 'razorpay' THEN amount END), 0) as razorpay_revenue")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' AND gateway = 'cod' THEN amount END), 0) as cod_revenue")
            ->selectRaw('COALESCE(SUM(refunded_amount), 0) as refunded')
            ->first();

        // Success rate is only meaningful against attempts that reached a
        // terminal state; pending COD would otherwise drag it down forever.
        $terminal = (int) $summary->successful + (int) $summary->failed;
        $success_rate = $terminal > 0 ? round(($summary->successful / $terminal) * 100, 1) : null;

        return view('admin.payments.reports', [
            'rows' => $rows,
            'summary' => $summary,
            'success_rate' => $success_rate,
            'from' => $from,
            'to' => $to,
            'group_by' => $groupBy,
        ]);
    }

    /** CSV of the same aggregation the report screen is showing. */
    public function export(Request $request): StreamedResponse
    {
        $from = $request->filled('from')
            ? \Illuminate\Support\Carbon::parse($request->query('from'))->startOfDay()
            : now()->subDays(29)->startOfDay();

        $to = $request->filled('to')
            ? \Illuminate\Support\Carbon::parse($request->query('to'))->endOfDay()
            : now()->endOfDay();

        $groupBy = $request->query('group_by', 'day');
        $rows = $this->groupedRows($groupBy, $from, $to);

        $filename = 'payment-report-' . $groupBy . '-' . $from->format('Ymd') . '-' . $to->format('Ymd') . '.csv';

        return response()->streamDownload(function () use ($rows, $groupBy) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [ucfirst($groupBy), 'Payments', 'Revenue', 'Razorpay Revenue', 'COD Revenue', 'Refunded']);

            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->bucket,
                    $row->payments,
                    $row->revenue,
                    $row->razorpay_revenue,
                    $row->cod_revenue,
                    $row->refunded,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    /**
     * Builds the grouped aggregate.
     *
     * The bucket expression is chosen from a fixed match, never interpolated
     * from the request — `group_by` reaches raw SQL, so it must not be able to
     * carry anything but one of these four literals.
     */
    protected function groupedRows(string $groupBy, $from, $to)
    {
        $bucket = match ($groupBy) {
            'month' => "DATE_FORMAT(payments.created_at, '%Y-%m')",
            'gateway' => 'payments.gateway',
            'status' => 'payments.payment_status',
            default => 'DATE(payments.created_at)',
        };

        return Payment::query()
            ->whereBetween('payments.created_at', [$from, $to])
            ->selectRaw("{$bucket} as bucket")
            ->selectRaw('COUNT(*) as payments')
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' THEN amount END), 0) as revenue")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' AND gateway = 'razorpay' THEN amount END), 0) as razorpay_revenue")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' AND gateway = 'cod' THEN amount END), 0) as cod_revenue")
            ->selectRaw("SUM(payment_status = 'captured') as successful")
            ->selectRaw("SUM(payment_status IN ('failed','cancelled')) as failed")
            ->selectRaw('COALESCE(SUM(refunded_amount), 0) as refunded')
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get();
    }
}
