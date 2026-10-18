<?php

namespace Tests\Feature;

use App\Models\Organizer;
use App\Models\OrganizerBooking;
use App\Models\User;
use App\Services\OrganizerInvoiceService;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * Admin organizer list / details pages and the GST invoice download.
 *
 * Read-only against the configured database: nothing is written, and seller
 * settings are only changed in memory (never saved).
 */
class AdminOrganizerPagesTest extends TestCase
{
    private const BASE = '/admin/organizers';

    protected ?User $admin = null;

    protected function setUp(): void
    {
        parent::setUp();
        URL::forceRootUrl('http://localhost');

        $this->admin = User::first();
        if (! $this->admin || ! Organizer::exists()) {
            $this->markTestSkipped('Needs an admin user and at least one organizer.');
        }
    }

    public function test_list_shows_ten_newest_first_and_paginates(): void
    {
        $ids = Organizer::orderByDesc('id')->limit(11)->pluck('id');

        $page1 = $this->actingAs($this->admin, 'admin')->get(self::BASE)->assertOk();
        $organizers = $page1->viewData('organizers');
        $this->assertSame(10, $organizers->perPage());
        $this->assertSame($ids->take(10)->all(), $organizers->pluck('id')->all());

        if ($ids->count() > 10) {
            $page2 = $this->actingAs($this->admin, 'admin')->get(self::BASE . '?page=2')->assertOk();
            $this->assertSame($ids[10], $page2->viewData('organizers')->first()->id);
        }
    }

    public function test_details_page_renders_for_organizers_with_and_without_bookings(): void
    {
        $withBilling = OrganizerBooking::whereHas('billing')->latest('id')->value('organizer_id');
        $without = Organizer::doesntHave('bookings')->value('id');

        foreach (array_filter([$withBilling, $without]) as $id) {
            $this->actingAs($this->admin, 'admin')->get(self::BASE . '/' . $id)
                ->assertOk()
                ->assertSee('Registration Details');
        }
    }

    public function test_invoice_downloads_as_pdf(): void
    {
        $organizerId = OrganizerBooking::whereHas('billing')->latest('id')->value('organizer_id');
        if (! $organizerId) {
            $this->markTestSkipped('No billed booking to invoice.');
        }

        $response = $this->actingAs($this->admin, 'admin')->get(self::BASE . '/' . $organizerId . '/invoice')->assertOk();
        $this->assertSame('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    public function test_tax_split_follows_the_sellers_state(): void
    {
        $booking = OrganizerBooking::whereHas('billing')->with('billing')->latest('id')->first();
        if (! $booking) {
            $this->markTestSkipped('No billed booking to invoice.');
        }

        // In memory only — never saved.
        setting()->set('invoice_seller_state', $booking->billing->state);
        $same = app(OrganizerInvoiceService::class)->forBooking($booking);
        $this->assertTrue($same['is_intra_state']);
        $this->assertEqualsWithDelta((float) $booking->billing->gst_amount, $same['cgst'] + $same['sgst'], 0.001);

        setting()->set('invoice_seller_state', 'Some Other State');
        $this->assertFalse(app(OrganizerInvoiceService::class)->forBooking($booking)['is_intra_state']);
    }
}
