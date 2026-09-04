<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Admin payment module: dashboard, ledger, filters, detail view and export.
 *
 * Read-only over the `payments` table with one exception — settling a COD
 * payment, which is the only case where an admin legitimately decides that
 * money changed hands. Razorpay payments are never editable from here: their
 * state belongs to the gateway and arrives via verification and webhooks.
 */
class PaymentController extends Controller
{
    /**
     * Payment dashboard.
     *
     * Every figure is aggregated live from the payments table. Revenue counts
     * only captured payments — a pending COD order is an expectation, not
     * income, and quietly folding it into revenue would overstate takings.
     */
    public function dashboard()
    {
        $today = now()->startOfDay();
        $monthStart = now()->startOfMonth();

        // One pass for the lifetime counters instead of a query per card.
        $totals = Payment::query()
            ->selectRaw('COUNT(*) as total_payments')
            ->selectRaw("SUM(payment_status = 'captured') as successful_payments")
            ->selectRaw("SUM(payment_status = 'pending') as pending_payments")
            ->selectRaw("SUM(payment_status IN ('failed','cancelled')) as failed_payments")
            ->selectRaw("SUM(gateway = 'cod') as cod_orders")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' AND gateway = 'razorpay' THEN amount END), 0) as razorpay_revenue")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' AND gateway = 'cod' THEN amount END), 0) as cod_revenue")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' THEN amount END), 0) as total_revenue")
            ->selectRaw('COALESCE(SUM(refunded_amount), 0) as refunded_amount')
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'pending' AND gateway = 'cod' THEN amount END), 0) as cod_outstanding")
            ->first();

        // "Today" is measured on paid_at, not created_at: an order placed
        // yesterday and captured this morning is today's revenue.
        $today_stats = Payment::query()
            ->whereDate('paid_at', '>=', $today)
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' THEN amount END), 0) as revenue")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' AND gateway = 'razorpay' THEN amount END), 0) as razorpay_revenue")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' AND gateway = 'cod' THEN amount END), 0) as cod_revenue")
            ->selectRaw("SUM(payment_status = 'captured') as successful")
            ->first();

        $today_counts = Payment::query()
            ->whereDate('created_at', '>=', $today)
            ->selectRaw("SUM(payment_status = 'pending') as pending")
            ->selectRaw("SUM(payment_status IN ('failed','cancelled')) as failed")
            ->first();

        $month_revenue = Payment::settled()
            ->where('paid_at', '>=', $monthStart)
            ->sum('amount');

        // 14-day trend for the dashboard chart.
        $trend = Payment::settled()
            ->where('paid_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(paid_at) as day')
            ->selectRaw('SUM(amount) as revenue')
            ->selectRaw('COUNT(*) as payments')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        // Zero-fill so the chart shows flat days rather than skipping them.
        $trend_series = collect(range(13, 0))->map(function ($daysAgo) use ($trend) {
            $date = now()->subDays($daysAgo)->format('Y-m-d');
            $row = $trend->get($date);

            return [
                'date' => $date,
                'label' => now()->subDays($daysAgo)->format('d M'),
                'revenue' => (float) ($row->revenue ?? 0),
                'payments' => (int) ($row->payments ?? 0),
            ];
        })->values();

        $recent_payments = Payment::with(['organizer', 'booking.activity'])
            ->latest('created_at')
            ->limit(10)
            ->get();

        return view('admin.payments.dashboard', compact(
            'totals',
            'today_stats',
            'today_counts',
            'month_revenue',
            'trend_series',
            'recent_payments'
        ));
    }

    /**
     * Payment ledger with server-side filtering and pagination.
     *
     * `scope` gives the sidebar its preset views (Razorpay / COD / Failed /
     * Refunded) without duplicating this method four times; every other filter
     * still applies on top of it.
     */
    public function index(Request $request)
    {
        $scope = $request->query('scope', 'all');

        $query = $this->buildFilteredQuery($request, $scope)
            ->with(['organizer', 'booking.activity', 'billing']);

        $payments = $query->latest('payments.created_at')
            ->paginate(25)
            ->withQueryString();

        // Totals for the filtered set, not just the visible page — the whole
        // point of filtering to "failed payments in March" is the total.
        $summary = $this->buildFilteredQuery($request, $scope)
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('COALESCE(SUM(amount), 0) as amount')
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'captured' THEN amount END), 0) as settled_amount")
            ->first();

        return view('admin.payments.index', [
            'payments' => $payments,
            'summary' => $summary,
            'scope' => $scope,
            'filters' => $this->activeFilters($request),
            'scopeTitle' => $this->scopeTitle($scope),
        ]);
    }

    /**
     * Payment detail.
     *
     * Razorpay-specific identifiers are rendered as N/A for COD rather than
     * hidden, so the layout stays stable and an empty field is unambiguous.
     */
    public function show($id)
    {
        $payment = Payment::with([
            'organizer',
            'booking.activity',
            'booking.game',
            'booking.package',
            'billing',
        ])->findOrFail($id);

        // Delivery history for this payment, if any webhooks touched it.
        $webhook_events = DB::table('payment_webhook_events')
            ->where('payment_id', $payment->id)
            ->orderByDesc('created_at')
            ->get();

        return view('admin.payments.show', compact('payment', 'webhook_events'));
    }

    /**
     * Settles a COD payment once cash has actually been collected.
     *
     * Restricted to pending COD rows: a Razorpay payment's status is the
     * gateway's to decide, and letting an admin flip one to captured would put
     * the ledger permanently out of step with Razorpay.
     */
    public function markAsPaid(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        if (! $payment->isCod()) {
            return back()->with('error', 'Only Cash on Delivery payments can be settled manually. Razorpay payments are confirmed by the gateway.');
        }

        if ($payment->payment_status === Payment::STATUS_CAPTURED) {
            return back()->with('error', 'This payment is already marked as paid.');
        }

        if (! in_array($payment->payment_status, [Payment::STATUS_PENDING, Payment::STATUS_AUTHORIZED], true)) {
            return back()->with('error', 'Only a pending payment can be marked as paid.');
        }

        DB::transaction(function () use ($payment, $request) {
            // Re-read under a lock so two admins clicking at once cannot both
            // settle it and double-count the revenue.
            $locked = Payment::whereKey($payment->id)->lockForUpdate()->first();

            if ($locked->payment_status === Payment::STATUS_CAPTURED) {
                return;
            }

            $locked->update([
                'payment_status' => Payment::STATUS_CAPTURED,
                'paid_at' => now(),
                'metadata' => array_merge($locked->metadata ?? [], [
                    'settled_by' => 'admin',
                    'settled_by_admin_id' => optional($request->user())->id,
                    'settled_at' => now()->toIso8601String(),
                ]),
            ]);

            if ($locked->billing_id) {
                DB::table('organizer_billings')
                    ->where('id', $locked->billing_id)
                    ->update(['payment_status' => 'paid', 'updated_at' => now()]);
            }

            DB::table('organizers')
                ->where('id', $locked->organizer_id)
                ->update(['payment_status' => 'paid', 'account_status' => 'active', 'updated_at' => now()]);
        });

        Log::info('[Payments] COD payment settled by admin', [
            'payment_id' => $payment->id,
            'admin_id' => optional($request->user())->id,
        ]);

        return back()->with('success', 'Payment marked as paid.');
    }

    /**
     * CSV export of the current filter selection.
     *
     * Streamed rather than built in memory: an unfiltered export grows with the
     * whole ledger, and chunking keeps it flat regardless of size.
     */
    public function export(Request $request): StreamedResponse
    {
        $scope = $request->query('scope', 'all');
        $filename = 'payments-' . $scope . '-' . now()->format('Y-m-d-His') . '.csv';

        $query = $this->buildFilteredQuery($request, $scope)
            ->with(['organizer', 'booking.activity'])
            ->latest('payments.created_at');

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID', 'Order (Booking) ID', 'Customer', 'Email', 'Amount', 'Currency',
                'Payment Method', 'Gateway', 'Transaction ID', 'Gateway Order ID',
                'Payment Status', 'Refund Status', 'Refunded Amount', 'Order Status',
                'Activity', 'Failure Reason', 'Paid At', 'Created At',
            ]);

            $query->chunk(500, function ($payments) use ($handle) {
                foreach ($payments as $payment) {
                    fputcsv($handle, [
                        $payment->id,
                        $payment->booking_id,
                        $payment->organizer->name ?? '',
                        $payment->organizer->email ?? '',
                        $payment->amount,
                        $payment->currency,
                        strtoupper($payment->payment_method),
                        strtoupper($payment->gateway),
                        $payment->gateway_payment_id ?? '',
                        $payment->gateway_order_id ?? '',
                        $payment->payment_status,
                        $payment->refund_status,
                        $payment->refunded_amount,
                        $payment->booking->status ?? '',
                        $payment->booking->activity->title ?? '',
                        $payment->failure_reason ?? '',
                        optional($payment->paid_at)->format('Y-m-d H:i:s'),
                        optional($payment->created_at)->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    // -----------------------------------------------------------------------
    // Filtering
    // -----------------------------------------------------------------------

    /**
     * Applies the scope preset and every request filter to a fresh query.
     *
     * Returns a builder rather than results so the list and its summary totals
     * are guaranteed to be computed over exactly the same set.
     */
    protected function buildFilteredQuery(Request $request, string $scope = 'all'): Builder
    {
        $query = Payment::query();

        match ($scope) {
            'razorpay' => $query->where('gateway', Payment::GATEWAY_RAZORPAY),
            'cod' => $query->where('gateway', Payment::GATEWAY_COD),
            'failed' => $query->whereIn('payment_status', [Payment::STATUS_FAILED, Payment::STATUS_CANCELLED]),
            'refunded' => $query->where(function ($q) {
                $q->where('payment_status', Payment::STATUS_REFUNDED)
                  ->orWhere('refunded_amount', '>', 0);
            }),
            default => null,
        };

        // Dates filter on created_at (when the attempt was made) — whereDate on
        // both ends so an end date includes that whole day rather than
        // truncating at midnight.
        $query->when($request->filled('date_from'), fn ($q) => $q->whereDate('payments.created_at', '>=', $request->query('date_from')));
        $query->when($request->filled('date_to'), fn ($q) => $q->whereDate('payments.created_at', '<=', $request->query('date_to')));

        $query->when($request->filled('payment_method'), fn ($q) => $q->where('payment_method', $request->query('payment_method')));
        $query->when($request->filled('gateway'), fn ($q) => $q->where('gateway', $request->query('gateway')));
        $query->when($request->filled('payment_status'), fn ($q) => $q->where('payment_status', $request->query('payment_status')));

        $query->when($request->filled('order_status'), function ($q) use ($request) {
            $q->whereHas('booking', fn ($b) => $b->where('status', $request->query('order_status')));
        });

        $query->when($request->filled('order_id'), fn ($q) => $q->where('booking_id', $request->query('order_id')));

        $query->when($request->filled('transaction_id'), function ($q) use ($request) {
            $term = trim($request->query('transaction_id'));
            $q->where(function ($inner) use ($term) {
                $inner->where('gateway_payment_id', 'like', "%{$term}%")
                      ->orWhere('gateway_order_id', 'like', "%{$term}%")
                      ->orWhere('transaction_reference', 'like', "%{$term}%");
            });
        });

        $query->when($request->filled('customer'), function ($q) use ($request) {
            $term = trim($request->query('customer'));
            $q->whereHas('organizer', function ($o) use ($term) {
                $o->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('company_name', 'like', "%{$term}%");
            });
        });

        $query->when($request->filled('amount_min'), fn ($q) => $q->where('amount', '>=', (float) $request->query('amount_min')));
        $query->when($request->filled('amount_max'), fn ($q) => $q->where('amount', '<=', (float) $request->query('amount_max')));

        // Free-text search across the identifiers an admin is likely to paste
        // in from a support ticket.
        $query->when($request->filled('search'), function ($q) use ($request) {
            $term = trim($request->query('search'));
            $q->where(function ($inner) use ($term) {
                $inner->where('gateway_payment_id', 'like', "%{$term}%")
                      ->orWhere('gateway_order_id', 'like', "%{$term}%")
                      ->orWhere('transaction_reference', 'like', "%{$term}%")
                      ->orWhere('booking_id', $term)
                      ->orWhereHas('organizer', function ($o) use ($term) {
                          $o->where('name', 'like', "%{$term}%")
                            ->orWhere('email', 'like', "%{$term}%")
                            ->orWhere('company_name', 'like', "%{$term}%");
                      });
            });
        });

        return $query;
    }

    protected function activeFilters(Request $request): array
    {
        return $request->only([
            'date_from', 'date_to', 'payment_method', 'gateway', 'payment_status',
            'order_status', 'customer', 'order_id', 'transaction_id',
            'amount_min', 'amount_max', 'search',
        ]);
    }

    protected function scopeTitle(string $scope): string
    {
        return match ($scope) {
            'razorpay' => 'Razorpay Payments',
            'cod' => 'COD Payments',
            'failed' => 'Failed Payments',
            'refunded' => 'Refunded Payments',
            default => 'All Payments',
        };
    }
}
