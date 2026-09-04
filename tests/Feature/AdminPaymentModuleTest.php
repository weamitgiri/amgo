<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * Smoke coverage for the admin payment module.
 *
 * Runs against the configured database rather than a migrated-fresh one,
 * because the schema is shared with the Node API and this project has no
 * factories for organizers/bookings. Each test creates the rows it needs and
 * removes them again.
 */
class AdminPaymentModuleTest extends TestCase
{
    protected ?User $admin = null;
    protected ?int $bookingId = null;
    protected ?int $organizerId = null;
    protected array $createdPaymentIds = [];

    /**
     * Route paths are written literally rather than via route().
     *
     * APP_URL points at a subdirectory (http://localhost/p/), so route() emits
     * "/p/admin/payments" — a path the router never matches, which surfaces as
     * a confusing 404 in tests.
     */
    private const BASE = '/admin/payments';

    protected function setUp(): void
    {
        parent::setUp();

        // APP_URL is http://localhost/p/ (the app is served from a
        // subdirectory), so the test client would request /p/admin/payments —
        // a path the router never registers. Pin the root for tests only.
        URL::forceRootUrl('http://localhost');

        // The 'admin' guard's provider is the User model.
        $this->admin = User::first();

        if (! $this->admin) {
            $this->markTestSkipped('No admin user available to authenticate as.');
        }

        $booking = DB::table('organizer_bookings')->first();

        if (! $booking) {
            $this->markTestSkipped('No organizer booking available to attach payments to.');
        }

        $this->bookingId = $booking->id;
        $this->organizerId = $booking->organizer_id;
    }

    protected function tearDown(): void
    {
        if ($this->createdPaymentIds) {
            Payment::whereIn('id', $this->createdPaymentIds)->delete();
        }

        parent::tearDown();
    }

    protected function makePayment(array $overrides = []): Payment
    {
        $payment = Payment::create(array_merge([
            'booking_id' => $this->bookingId,
            'organizer_id' => $this->organizerId,
            'payment_method' => 'razorpay',
            'gateway' => 'razorpay',
            'gateway_order_id' => 'order_' . uniqid(),
            'gateway_payment_id' => 'pay_' . uniqid(),
            'amount' => 11800.00,
            'currency' => 'INR',
            'payment_status' => Payment::STATUS_CAPTURED,
            'refund_status' => 'none',
            'paid_at' => now(),
        ], $overrides));

        $this->createdPaymentIds[] = $payment->id;

        return $payment;
    }

    protected function actingAsAdmin()
    {
        return $this->actingAs($this->admin, 'admin');
    }

    public function test_dashboard_renders_with_live_figures(): void
    {
        $this->makePayment(['amount' => 11800.00]);

        $response = $this->actingAsAdmin()->get(self::BASE);

        $response->assertOk();
        $response->assertSee('Payment Dashboard');
        $response->assertSee('Total Revenue');
    }

    public function test_payment_list_renders_and_shows_a_payment(): void
    {
        $payment = $this->makePayment();

        $response = $this->actingAsAdmin()->get(self::BASE . '/list');

        $response->assertOk();
        $response->assertSee($payment->gateway_payment_id);
    }

    public function test_filters_narrow_the_result_set(): void
    {
        $razorpay = $this->makePayment(['gateway' => 'razorpay', 'payment_method' => 'razorpay']);
        $cod = $this->makePayment([
            'gateway' => 'cod',
            'payment_method' => 'cod',
            'gateway_order_id' => null,
            'gateway_payment_id' => null,
            'payment_status' => Payment::STATUS_PENDING,
            'paid_at' => null,
        ]);

        // Filtering to COD must exclude the Razorpay transaction id entirely.
        $response = $this->actingAsAdmin()->get(self::BASE . '/list?gateway=cod');

        $response->assertOk();
        $response->assertDontSee($razorpay->gateway_payment_id);
        $response->assertSee('#' . $cod->booking_id);
    }

    public function test_scope_presets_filter_by_gateway(): void
    {
        $razorpay = $this->makePayment();

        $response = $this->actingAsAdmin()->get(self::BASE . '/list?scope=cod');

        $response->assertOk();
        $response->assertSee('COD Payments');
        $response->assertDontSee($razorpay->gateway_payment_id);
    }

    public function test_transaction_id_search_finds_a_payment(): void
    {
        $payment = $this->makePayment();

        $response = $this->actingAsAdmin()
            ->get(self::BASE . '/list?transaction_id=' . $payment->gateway_payment_id);

        $response->assertOk();
        $response->assertSee($payment->gateway_payment_id);
    }

    public function test_detail_page_renders_razorpay_identifiers(): void
    {
        $payment = $this->makePayment();

        $response = $this->actingAsAdmin()->get(self::BASE . '/' . $payment->id);

        $response->assertOk();
        $response->assertSee($payment->gateway_order_id);
        $response->assertSee($payment->gateway_payment_id);
    }

    public function test_detail_page_shows_na_for_cod_gateway_fields(): void
    {
        $payment = $this->makePayment([
            'gateway' => 'cod',
            'payment_method' => 'cod',
            'gateway_order_id' => null,
            'gateway_payment_id' => null,
            'payment_status' => Payment::STATUS_PENDING,
            'paid_at' => null,
        ]);

        $response = $this->actingAsAdmin()->get(self::BASE . '/' . $payment->id);

        $response->assertOk();
        $response->assertSee('N/A');
        $response->assertSee('Mark COD Payment as Paid');
    }

    public function test_reports_page_renders(): void
    {
        $this->makePayment();

        $response = $this->actingAsAdmin()->get(self::BASE . '/reports');

        $response->assertOk();
        $response->assertSee('Payment Reports');
        $response->assertSee('Success Rate');
    }

    public function test_csv_export_streams_matching_rows(): void
    {
        $payment = $this->makePayment();

        $response = $this->actingAsAdmin()
            ->get(self::BASE . '/export?transaction_id=' . $payment->gateway_payment_id);

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $csv = $response->streamedContent();
        $this->assertStringContainsString('Order (Booking) ID', $csv);
        $this->assertStringContainsString($payment->gateway_payment_id, $csv);
    }

    public function test_admin_can_settle_a_pending_cod_payment(): void
    {
        $payment = $this->makePayment([
            'gateway' => 'cod',
            'payment_method' => 'cod',
            'gateway_order_id' => null,
            'gateway_payment_id' => null,
            'payment_status' => Payment::STATUS_PENDING,
            'paid_at' => null,
        ]);

        $this->actingAsAdmin()
            ->post(self::BASE . '/' . $payment->id . '/mark-paid')
            ->assertRedirect();

        $payment->refresh();
        $this->assertSame(Payment::STATUS_CAPTURED, $payment->payment_status);
        $this->assertNotNull($payment->paid_at);
    }

    public function test_admin_cannot_settle_a_razorpay_payment(): void
    {
        // A gateway payment's status belongs to Razorpay; letting an admin
        // force it would desynchronise the ledger from the gateway forever.
        $payment = $this->makePayment(['payment_status' => Payment::STATUS_PENDING, 'paid_at' => null]);

        $this->actingAsAdmin()
            ->post(self::BASE . '/' . $payment->id . '/mark-paid')
            ->assertRedirect();

        $payment->refresh();
        $this->assertSame(Payment::STATUS_PENDING, $payment->payment_status);
    }

    public function test_settling_an_already_paid_cod_payment_is_rejected(): void
    {
        $payment = $this->makePayment([
            'gateway' => 'cod',
            'payment_method' => 'cod',
            'gateway_order_id' => null,
            'gateway_payment_id' => null,
            'payment_status' => Payment::STATUS_CAPTURED,
        ]);

        $paidAt = $payment->paid_at;

        $this->actingAsAdmin()
            ->post(self::BASE . '/' . $payment->id . '/mark-paid')
            ->assertSessionHas('error');

        $payment->refresh();
        $this->assertEquals($paidAt->timestamp, $payment->paid_at->timestamp);
    }

    public function test_guests_cannot_reach_the_payment_module(): void
    {
        $payment = $this->makePayment();

        // This app answers an unauthenticated admin request with its
        // "Session expired" warning page at status 200 rather than a redirect
        // (see bootstrap/app.php), which is how every existing admin route
        // behaves. What matters is that no payment data is rendered.
        foreach ([self::BASE, self::BASE . '/list', self::BASE . '/' . $payment->id] as $path) {
            $response = $this->get($path);

            // No payment data of any kind reaches an unauthenticated caller.
            $response->assertDontSee('Payment Dashboard');
            $response->assertDontSee('All Payments');
            $response->assertDontSee($payment->gateway_payment_id);
            $response->assertDontSee((string) $payment->amount);
        }
    }
}
