<?php

namespace App\Services;

use App\Models\OrganizerBooking;
use App\Models\Payment;
use Carbon\Carbon;

/**
 * GST invoice data for an organizer booking, for the admin panel's PDF download.
 *
 * Mirrors apis/src/services/invoicePdfService.ts (the organizer's own
 * download) so both sides print the same document: same invoice number, same
 * supplier settings, same intra/inter-state rule. Supplier details come only
 * from Admin > Settings > Invoice; when no GSTIN is configured the document is
 * a "Provisional Receipt" and prints no GST identifier, never an invented one.
 */
class OrganizerInvoiceService
{
    /** GST state codes, keyed by the state names the booking form accepts. */
    public const STATE_CODES = [
        'Jammu and Kashmir' => '01', 'Himachal Pradesh' => '02', 'Punjab' => '03', 'Chandigarh' => '04',
        'Uttarakhand' => '05', 'Haryana' => '06', 'Delhi' => '07', 'Rajasthan' => '08',
        'Uttar Pradesh' => '09', 'Bihar' => '10', 'Sikkim' => '11', 'Arunachal Pradesh' => '12',
        'Nagaland' => '13', 'Manipur' => '14', 'Mizoram' => '15', 'Tripura' => '16',
        'Meghalaya' => '17', 'Assam' => '18', 'West Bengal' => '19', 'Jharkhand' => '20',
        'Odisha' => '21', 'Chhattisgarh' => '22', 'Madhya Pradesh' => '23', 'Gujarat' => '24',
        'Dadra and Nagar Haveli and Daman and Diu' => '26', 'Maharashtra' => '27', 'Karnataka' => '29',
        'Goa' => '30', 'Lakshadweep' => '31', 'Kerala' => '32', 'Tamil Nadu' => '33',
        'Puducherry' => '34', 'Andaman and Nicobar Islands' => '35', 'Telangana' => '36',
        'Andhra Pradesh' => '37', 'Ladakh' => '38',
    ];

    public function seller(): array
    {
        $gstin = strtoupper(trim((string) setting('invoice_seller_gstin', '')));
        $state = trim((string) setting('invoice_seller_state', ''));

        return [
            'name' => setting('invoice_seller_name') ?: (setting('website_name') ?: 'Invoice'),
            'legal_name' => (string) setting('invoice_seller_legal_name', ''),
            'proprietor' => (string) setting('invoice_seller_proprietor', ''),
            'gstin' => $gstin,
            'address' => setting('invoice_seller_address') ?: (string) setting('company_address', ''),
            'city' => (string) setting('invoice_seller_city', ''),
            'state' => $state,
            'state_code' => setting('invoice_seller_state_code') ?: ($gstin ? substr($gstin, 0, 2) : self::stateCode($state)),
            'pin' => (string) setting('invoice_seller_pin', ''),
            'email' => setting('invoice_seller_email') ?: (string) setting('support_email', ''),
            'number_prefix' => setting('invoice_number_prefix') ?: 'ZV',
            'gst_rate' => (float) (setting('invoice_gst_rate') ?: 18),
            'is_gst_registered' => strlen($gstin) === 15,
        ];
    }

    public static function stateCode(?string $state): string
    {
        $state = strtolower(trim((string) $state));
        foreach (self::STATE_CODES as $name => $code) {
            if (strtolower($name) === $state) {
                return $code;
            }
        }
        return '';
    }

    /**
     * Same format as the Node service — PREFIX/YEAR/00001 from the booking id —
     * so an invoice keeps one number however many times it's downloaded.
     */
    public static function invoiceNumber(string $prefix, OrganizerBooking $booking): string
    {
        $year = Carbon::parse($booking->created_at ?? now())->year;
        return sprintf('%s/%d/%05d', $prefix, $year, $booking->id);
    }

    /** Null when the booking has no billing row — there's nothing to invoice. */
    public function forBooking(OrganizerBooking $booking): ?array
    {
        $booking->loadMissing(['organizer', 'billing', 'package', 'activity']);
        $billing = $booking->billing;
        if (!$billing) {
            return null;
        }

        $seller = $this->seller();
        $organizer = $booking->organizer;
        $buyerState = trim((string) $billing->state);

        $isIntraState = $seller['state'] !== '' && $buyerState !== ''
            && strtolower($seller['state']) === strtolower($buyerState);

        $taxable = (float) $billing->package_price;
        $additional = (float) $billing->additional_charges;
        $gst = (float) $billing->gst_amount;
        $total = (float) $billing->total_payable;
        $cgst = round($gst / 2, 2);

        $payment = Payment::where('booking_id', $booking->id)
            ->orderByRaw("payment_status = 'captured' DESC")
            ->latest('id')
            ->first();
        $isPaid = $billing->payment_status === 'paid'
            || ($payment && $payment->payment_status === Payment::STATUS_CAPTURED);

        $method = $payment->gateway ?? $billing->payment_method;
        $paymentMode = match ($method) {
            'razorpay' => 'Razorpay (Online)',
            'cod' => 'Cash on Delivery',
            null, '' => '-',
            default => ucwords(str_replace('_', ' ', $method)),
        };

        $packageName = $booking->package?->name ?: 'Team Building Package';

        return [
            'seller' => $seller,
            'invoice_no' => self::invoiceNumber($seller['number_prefix'], $booking),
            'invoice_date' => Carbon::parse($booking->created_at ?? now()),
            'package_name' => $packageName,
            'description' => $booking->activity?->title
                ? $booking->activity->title . ' (' . $packageName . ')'
                : $packageName,
            'payment_mode' => $paymentMode,
            'transaction_id' => $payment?->gateway_payment_id ?: $payment?->transaction_reference,
            'is_paid' => $isPaid,
            'payment_status' => $isPaid ? 'paid' : ($payment->payment_status ?? $billing->payment_status),
            'buyer' => [
                'name' => $organizer?->company_name ?: ($organizer?->name ?? 'Customer'),
                'contact' => $organizer?->company_name ? $organizer->name : null,
                'email' => $organizer?->email,
                'gstin' => $billing->gst_number ? strtoupper($billing->gst_number) : null,
                'address' => $billing->billing_address,
                'city' => $billing->city,
                'state' => $buyerState,
                'state_code' => self::stateCode($buyerState),
                'pin' => $billing->pin_code,
            ],
            'is_intra_state' => $isIntraState,
            'taxable_value' => $taxable,
            'additional_charges' => $additional,
            'gst_amount' => $gst,
            'cgst' => $cgst,
            'sgst' => round($gst - $cgst, 2),
            'round_off' => round($total - ($taxable + $additional + $gst), 2),
            'total_payable' => $total,
        ];
    }
}
