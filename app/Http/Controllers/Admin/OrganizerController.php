<?php

namespace App\Http\Controllers\Admin;

use App\Models\Organizer;
use App\Models\OrganizerBooking;
use App\Models\OrganizerBilling;
use App\Models\Activity;
use App\Models\ActivityGame;
use App\Models\Package;
use App\Models\Payment;
use App\Services\OrganizerInvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class OrganizerController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        // Paginated on the server (newest first) instead of loading every
        // organizer into a client-side DataTable.
        $organizers = Organizer::with(['bookings' => fn ($q) => $q->latest('id'), 'bookings.activity', 'bookings.package', 'bookings.billing'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return view('admin.organizers.index', compact('organizers', 'search'));
    }

    public function create()
    {
        $activities = Activity::where('status', 'active')->get();
        $packages = Package::where('status', 'active')->get();
        return view('admin.organizers.create', compact('activities', 'packages'));
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                // Step 1: Contact Details
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:organizers,email',
                'company_name' => 'required|string|max:255',
                'company_website' => 'nullable|url',
                
                // Step 2: Activity & Schedule
                'activity_id' => 'required|exists:activities,id',
                'package_id' => 'required|exists:packages,id',
                'scheduled_date' => 'required|date|after_or_equal:today',
                'scheduled_time' => 'required',

                // Step 3: Billing
                'gst_number' => 'nullable|string|max:15',
                'billing_address' => 'required|string',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'pin_code' => 'required|string|max:10',
                
                // Pricing (In a real app, calculate on server)
                'package_price' => 'required|numeric',
                'taxes' => 'required|numeric',
                'gst_amount' => 'required|numeric',
                'total_payable' => 'required|numeric',

                // Step 4: Payment
                'payment_method' => 'required|string',
                'confirmation_details' => 'required|array|min:5',
            ]);

            DB::beginTransaction();

            $organizer = Organizer::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'company_name' => $validated['company_name'],
                'company_website' => $validated['company_website'] ?? null,
                'status' => $validated['status'] ?? 'active',
            ]);

            $booking = OrganizerBooking::create([
                'organizer_id' => $organizer->id,
                'activity_id' => $validated['activity_id'],
                'package_id' => $validated['package_id'],
                'scheduled_date' => $validated['scheduled_date'],
                'scheduled_time' => $validated['scheduled_time'],
                'invitation_link' => Str::random(20),
                'status' => 'pending_activation',
            ]);

            OrganizerBilling::create([
                'booking_id' => $booking->id,
                'gst_number' => $validated['gst_number'] ?? null,
                'billing_address' => $validated['billing_address'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'pin_code' => $validated['pin_code'],
                'package_price' => $validated['package_price'],
                'taxes' => $validated['taxes'],
                'gst_amount' => $validated['gst_amount'],
                'total_payable' => $validated['total_payable'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'paid', // Assuming paid for admin entry
                'confirmation_details' => $validated['confirmation_details'],
            ]);

            DB::commit();

            return redirect()->route('admin.organizers.index')->with('success', 'Organizer and Booking created successfully.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error: ' . $e->getMessage())->withInput();
        }
    }

    public function show(Organizer $organizer)
    {
        $organizer->load([
            'bookings' => fn ($q) => $q->latest('id'),
            'bookings.activity.games',
            'bookings.game',
            'bookings.package',
            'bookings.billing',
        ]);
        $payments = Payment::where('organizer_id', $organizer->id)->latest('id')->get()->groupBy('booking_id');

        return view('admin.organizers.show', compact('organizer', 'payments'));
    }

    /**
     * GST invoice PDF for one of the organizer's bookings (?booking=ID), or
     * their latest billed booking. CGST+SGST when the billing state matches the
     * seller's state in Admin > Settings > Invoice, IGST otherwise.
     */
    public function invoice(Request $request, Organizer $organizer, OrganizerInvoiceService $invoices)
    {
        $booking = $organizer->bookings()
            ->whereHas('billing')
            ->when($request->filled('booking'), fn ($q) => $q->whereKey($request->query('booking')))
            ->latest('id')
            ->first();

        $invoice = $booking ? $invoices->forBooking($booking) : null;
        if (!$invoice) {
            return redirect()->back()->with('error', 'No billing details found for this organizer, so there is no invoice to download.');
        }

        $filename = 'invoice-' . str_replace('/', '-', $invoice['invoice_no']) . '.pdf';

        return Pdf::loadView('admin.organizers.invoice-pdf', compact('invoice'))
            ->setPaper('a4')
            ->download($filename);
    }

    public function edit(Organizer $organizer)
    {
        $organizer->load(['bookings.activity.games', 'bookings.package', 'bookings.billing']);
        $activities = Activity::where('status', 'active')->get();
        $packages = Package::where('status', 'active')->get();
        $booking = $organizer->bookings->first(); // Assuming one booking for now
        return view('admin.organizers.edit', compact('organizer', 'activities', 'packages', 'booking'));
    }

    public function update(Request $request, Organizer $organizer)
    {
        try {
            $booking = $organizer->bookings->first();
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:organizers,email,' . $organizer->id,
                'company_name' => 'required|string|max:255',
                'company_website' => 'nullable|url',
                'activity_id' => 'required|exists:activities,id',
                'package_id' => 'required|exists:packages,id',
                'scheduled_date' => 'required|date',
                'scheduled_time' => 'required',
                'gst_number' => 'nullable|string|max:15',
                'billing_address' => 'required|string',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'pin_code' => 'required|string|max:10',
                'status' => 'required|in:active,inactive',
            ]);

            DB::beginTransaction();

            $organizer->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'company_name' => $validated['company_name'],
                'company_website' => $validated['company_website'],
                'status' => $validated['status'],
            ]);

            $booking->update([
                'activity_id' => $validated['activity_id'],
                'package_id' => $validated['package_id'],
                'scheduled_date' => $validated['scheduled_date'],
                'scheduled_time' => $validated['scheduled_time'],
            ]);

            if (!$booking->invitation_link) {
                $booking->update(['invitation_link' => Str::random(20)]);
            }

            $booking->billing->update([
                'gst_number' => $validated['gst_number'],
                'billing_address' => $validated['billing_address'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'pin_code' => $validated['pin_code'],
            ]);

            DB::commit();

            return redirect()->route('admin.organizers.index')->with('success', 'Organizer updated successfully.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Organizer $organizer)
    {
        $organizer->delete();
        return redirect()->route('admin.organizers.index')->with('success', 'Organizer deleted successfully.');
    }

    public function getPackages($gameId)
    {
        // Simple logic to return packages - could be filtered by game in future
        $packages = Package::where('status', 'active')->get();
        return response()->json($packages);
    }

    public function toggleStatus(Request $request)
    {
        $organizer = Organizer::findOrFail($request->id);
        $organizer->status = $organizer->status === 'active' ? 'inactive' : 'active';
        $organizer->save();
        return response()->json(['success' => true, 'status' => $organizer->status]);
    }
}
