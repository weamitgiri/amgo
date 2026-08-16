import PDFDocument from 'pdfkit';
import { query } from '../config/db';

/**
 * GST invoice generation for organizer bookings.
 *
 * Everything printed here is read from real data — the booking's
 * organizer_billings row for the amounts and the buyer's details, and the
 * `settings` table for the supplier's. Nothing is defaulted to a plausible
 * looking value: a tax invoice carrying an invented GSTIN or supplier name
 * would be a forged statutory document, so when the supplier's GST details
 * have not been configured in the admin panel the document downgrades itself
 * to a clearly-labelled "PROVISIONAL RECEIPT" and prints no GST identifier at
 * all. Configure them under Admin > Settings > Invoice / GST.
 */

export type InvoiceSeller = {
    name: string;
    legalName: string;
    gstin: string;
    address: string;
    city: string;
    state: string;
    stateCode: string;
    pin: string;
    email: string;
    numberPrefix: string;
    gstRate: number;
    /** False when GSTIN is unset — the document is then a receipt, not a tax invoice. */
    isGstRegistered: boolean;
};

export type InvoiceRecord = {
    booking_id: number;
    invoice_no: string;
    invoice_date: string;
    package_name: string;
    activity_title: string | null;
    buyer_name: string;
    buyer_company: string | null;
    buyer_email: string | null;
    buyer_gstin: string | null;
    buyer_address: string | null;
    buyer_city: string | null;
    buyer_state: string | null;
    buyer_pin: string | null;
    taxable_value: number;
    additional_charges: number;
    gst_amount: number;
    total_payable: number;
    payment_method: string | null;
    payment_status: 'pending' | 'paid' | 'failed';
    /** true = supplier and buyer in the same state -> CGST + SGST; false -> IGST. */
    is_intra_state: boolean;
};

const money = (n: number) =>
    'Rs. ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function getSettings(keys: string[]): Promise<Record<string, string>> {
    const [rows] = await query<any>('SELECT `key`, `value` FROM settings WHERE `key` IN (?)', [keys]);
    const out: Record<string, string> = {};
    for (const r of rows || []) out[r.key] = r.value ?? '';
    return out;
}

export async function getInvoiceSeller(): Promise<InvoiceSeller> {
    const s = await getSettings([
        'invoice_seller_name',
        'invoice_seller_legal_name',
        'invoice_seller_gstin',
        'invoice_seller_address',
        'invoice_seller_city',
        'invoice_seller_state',
        'invoice_seller_state_code',
        'invoice_seller_pin',
        'invoice_seller_email',
        'invoice_number_prefix',
        'invoice_gst_rate',
        'website_name',
        'company_address',
        'support_email',
    ]);

    const gstin = (s.invoice_seller_gstin || '').trim().toUpperCase();
    return {
        // Falls back to the site name purely as a display heading — that's a
        // branding string, not a statutory identifier.
        name: s.invoice_seller_name || s.website_name || 'Invoice',
        legalName: s.invoice_seller_legal_name || '',
        gstin,
        address: s.invoice_seller_address || s.company_address || '',
        city: s.invoice_seller_city || '',
        state: s.invoice_seller_state || '',
        stateCode: s.invoice_seller_state_code || (gstin ? gstin.slice(0, 2) : ''),
        pin: s.invoice_seller_pin || '',
        email: s.invoice_seller_email || s.support_email || '',
        numberPrefix: s.invoice_number_prefix || 'ZV',
        gstRate: s.invoice_gst_rate ? Number(s.invoice_gst_rate) : 18,
        isGstRegistered: gstin.length === 15,
    };
}

/**
 * Invoice number is derived deterministically from the booking, so the same
 * booking always downloads under the same number no matter how many times it
 * is regenerated — re-issuing a tax invoice under a new number every download
 * would break the sequential-numbering requirement.
 */
function invoiceNumberFor(prefix: string, bookingId: number, createdAt: string | Date): string {
    const year = new Date(createdAt).getFullYear();
    return `${prefix}/${year}/${String(bookingId).padStart(5, '0')}`;
}

export async function getInvoiceForBooking(
    bookingId: number | string,
    organizerId: number | string
): Promise<InvoiceRecord | null> {
    const seller = await getInvoiceSeller();

    const [rows] = await query<any>(
        `SELECT ob.id AS booking_id, ob.created_at, ob.organizer_id,
                o.name AS buyer_name, o.email AS buyer_email, o.company_name AS buyer_company,
                p.name AS package_name, a.title AS activity_title,
                b.gst_number, b.billing_address, b.city, b.state, b.pin_code,
                b.package_price, b.taxes, b.additional_charges, b.gst_amount, b.total_payable,
                b.payment_method, b.payment_status
         FROM organizer_bookings ob
         JOIN organizer_billings b ON b.booking_id = ob.id
         LEFT JOIN organizers o ON o.id = ob.organizer_id
         LEFT JOIN packages p ON p.id = ob.package_id
         LEFT JOIN activities a ON a.id = ob.activity_id
         WHERE ob.id = ? AND ob.organizer_id = ?
         LIMIT 1`,
        [bookingId, organizerId]
    );
    const r = rows?.[0];
    if (!r) return null;

    return mapInvoiceRow(r, seller);
}

function mapInvoiceRow(r: any, seller: InvoiceSeller): InvoiceRecord {
    const buyerState = (r.state || '').trim();
    // Compared on the state NAME because organizer_billings stores a name, not a
    // code. Unknown either side => treat as intra-state only when they match.
    const isIntraState =
        !!seller.state && !!buyerState && seller.state.trim().toLowerCase() === buyerState.toLowerCase();

    return {
        booking_id: Number(r.booking_id),
        invoice_no: invoiceNumberFor(seller.numberPrefix, Number(r.booking_id), r.created_at),
        invoice_date: r.created_at,
        package_name: r.package_name || 'Team Building Package',
        activity_title: r.activity_title ?? null,
        buyer_name: r.buyer_name || 'Customer',
        buyer_company: r.buyer_company ?? null,
        buyer_email: r.buyer_email ?? null,
        buyer_gstin: r.gst_number ?? null,
        buyer_address: r.billing_address ?? null,
        buyer_city: r.city ?? null,
        buyer_state: buyerState || null,
        buyer_pin: r.pin_code ?? null,
        taxable_value: Number(r.package_price || 0),
        additional_charges: Number(r.additional_charges || 0),
        gst_amount: Number(r.gst_amount || 0),
        total_payable: Number(r.total_payable || 0),
        payment_method: r.payment_method ?? null,
        payment_status: r.payment_status,
        is_intra_state: isIntraState,
    };
}

/** Payment history for the organizer's dashboard — every booking they've paid for. */
export async function listInvoicesForOrganizer(organizerId: number | string): Promise<InvoiceRecord[]> {
    const seller = await getInvoiceSeller();
    const [rows] = await query<any>(
        `SELECT ob.id AS booking_id, ob.created_at, ob.organizer_id,
                o.name AS buyer_name, o.email AS buyer_email, o.company_name AS buyer_company,
                p.name AS package_name, a.title AS activity_title,
                b.gst_number, b.billing_address, b.city, b.state, b.pin_code,
                b.package_price, b.taxes, b.additional_charges, b.gst_amount, b.total_payable,
                b.payment_method, b.payment_status
         FROM organizer_bookings ob
         JOIN organizer_billings b ON b.booking_id = ob.id
         LEFT JOIN organizers o ON o.id = ob.organizer_id
         LEFT JOIN packages p ON p.id = ob.package_id
         LEFT JOIN activities a ON a.id = ob.activity_id
         WHERE ob.organizer_id = ?
         ORDER BY ob.created_at DESC, ob.id DESC`,
        [organizerId]
    );
    return (rows || []).map((r: any) => mapInvoiceRow(r, seller));
}

/** Streams the invoice straight to the response — nothing is written to disk. */
export function renderInvoicePdf(inv: InvoiceRecord, seller: InvoiceSeller, stream: NodeJS.WritableStream): void {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(stream);

    const BLUE = '#2563EB';
    const DARK = '#111827';
    const GREY = '#6B7280';
    const left = 50;
    const right = 545;

    // ---- Header ----
    doc.fillColor(DARK).fontSize(24).font('Helvetica-Bold').text(seller.name, left, 50);
    doc.fillColor(GREY).fontSize(10).font('Helvetica').text('Corporate Team Activity Platform', left, doc.y + 2);

    doc.moveDown(1.2);
    doc.fillColor(BLUE)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(seller.isGstRegistered ? 'TAX INVOICE' : 'PROVISIONAL RECEIPT', left, doc.y);

    const blockTop = doc.y + 14;

    // ---- Supplier (left) ----
    doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(seller.legalName || seller.name, left, blockTop);
    doc.font('Helvetica').fillColor(DARK).fontSize(9);
    const sellerLines = [
        seller.address,
        [seller.city, seller.state && `${seller.state}${seller.pin ? ' - ' + seller.pin : ''}`]
            .filter(Boolean)
            .join(', '),
        seller.isGstRegistered ? `GSTIN: ${seller.gstin}` : null,
        seller.isGstRegistered && seller.state ? `State: ${seller.state} (Code ${seller.stateCode})` : null,
        seller.email ? `Email: ${seller.email}` : null,
    ].filter(Boolean) as string[];
    for (const line of sellerLines) doc.text(line, left, doc.y + 2, { width: 260 });

    // ---- Invoice meta (right) ----
    let metaY = blockTop;
    const meta: [string, string][] = [
        ['Invoice No:', inv.invoice_no],
        ['Invoice Date:', new Date(inv.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })],
        ['Place of Supply:', inv.buyer_state ? `${inv.buyer_state}` : '-'],
        ['Payment Mode:', (inv.payment_method || '-').toUpperCase()],
        ['Package:', inv.package_name],
    ];
    for (const [label, value] of meta) {
        doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text(label, 300, metaY, { width: 110, align: 'right' });
        doc.font('Helvetica').fillColor(DARK).text(value, 415, metaY, { width: right - 415, align: 'right' });
        metaY += 14;
    }

    // ---- Billed To ----
    let y = Math.max(doc.y, metaY) + 20;
    doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('Billed To', left, y);
    y = doc.y + 6;
    doc.fontSize(10).font('Helvetica-Bold').text(inv.buyer_company || inv.buyer_name, left, y);
    doc.font('Helvetica').fontSize(9);
    const buyerLines = [
        inv.buyer_address,
        [inv.buyer_city, inv.buyer_state && `${inv.buyer_state}${inv.buyer_pin ? ' - ' + inv.buyer_pin : ''}`]
            .filter(Boolean)
            .join(', '),
        inv.buyer_gstin ? `GSTIN: ${inv.buyer_gstin}` : null,
        inv.buyer_email ? `Email: ${inv.buyer_email}` : null,
    ].filter(Boolean) as string[];
    for (const line of buyerLines) doc.text(line, left, doc.y + 2, { width: 300 });

    // ---- Line items table ----
    y = doc.y + 22;
    const half = inv.gst_amount / 2;
    const cols = inv.is_intra_state
        ? [
              { label: '#', x: left, w: 24, align: 'left' as const },
              { label: 'Description', x: 74, w: 176, align: 'left' as const },
              { label: 'Taxable Value', x: 250, w: 78, align: 'right' as const },
              { label: `CGST (${seller.gstRate / 2}%)`, x: 328, w: 68, align: 'right' as const },
              { label: `SGST (${seller.gstRate / 2}%)`, x: 396, w: 68, align: 'right' as const },
              { label: 'Total', x: 464, w: 81, align: 'right' as const },
          ]
        : [
              { label: '#', x: left, w: 24, align: 'left' as const },
              { label: 'Description', x: 74, w: 220, align: 'left' as const },
              { label: 'Taxable Value', x: 294, w: 100, align: 'right' as const },
              { label: `IGST (${seller.gstRate}%)`, x: 394, w: 70, align: 'right' as const },
              { label: 'Total', x: 464, w: 81, align: 'right' as const },
          ];

    doc.rect(left, y, right - left, 30).fill(BLUE);
    doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
    for (const c of cols) doc.text(c.label, c.x + 4, y + 11, { width: c.w - 8, align: c.align });

    y += 30;
    const rowH = 34;
    doc.rect(left, y, right - left, rowH).strokeColor('#E5E7EB').lineWidth(1).stroke();
    doc.fillColor(DARK).font('Helvetica').fontSize(9);
    const description = inv.activity_title ? `${inv.activity_title} - ${inv.package_name}` : inv.package_name;
    const values = inv.is_intra_state
        ? ['1', description, money(inv.taxable_value), money(half), money(half), money(inv.total_payable)]
        : ['1', description, money(inv.taxable_value), money(inv.gst_amount), money(inv.total_payable)];
    cols.forEach((c, i) => doc.text(values[i], c.x + 4, y + 11, { width: c.w - 8, align: c.align }));

    // ---- Totals ----
    y += rowH + 16;
    const totals: [string, string][] = [
        ['Taxable Value', money(inv.taxable_value)],
        ...(inv.additional_charges > 0
            ? ([['Additional Charges', money(inv.additional_charges)]] as [string, string][])
            : []),
        ...(inv.is_intra_state
            ? ([
                  [`CGST @ ${seller.gstRate / 2}%`, money(half)],
                  [`SGST @ ${seller.gstRate / 2}%`, money(half)],
              ] as [string, string][])
            : ([[`IGST @ ${seller.gstRate}%`, money(inv.gst_amount)]] as [string, string][])),
    ];
    doc.fontSize(9.5).font('Helvetica').fillColor(DARK);
    for (const [label, value] of totals) {
        doc.text(label, 300, y, { width: 130, align: 'left' });
        doc.text(value, 430, y, { width: right - 430, align: 'right' });
        y += 16;
    }
    doc.moveTo(300, y + 4).lineTo(right, y + 4).strokeColor('#9CA3AF').stroke();
    y += 12;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total Payable', 300, y, { width: 130, align: 'left' });
    doc.text(money(inv.total_payable), 430, y, { width: right - 430, align: 'right' });

    // ---- Footer notes ----
    y += 34;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text('Nature of Supply: ', left, y, { continued: true });
    doc.font('Helvetica').text(
        inv.is_intra_state
            ? `Intra-State Supply - supplier and recipient are both located in ${inv.buyer_state}. CGST and SGST charged in equal parts as per Section 8 of the CGST Act, 2017.`
            : `Inter-State Supply - IGST charged as per Section 7 of the IGST Act, 2017.`,
        { width: right - left }
    );

    if (inv.payment_status !== 'paid') {
        doc.moveDown(0.8);
        doc.font('Helvetica-Bold')
            .fillColor('#B91C1C')
            .text(`Payment status: ${inv.payment_status.toUpperCase()} - this document is not a receipt of payment.`, {
                width: right - left,
            });
    }

    if (!seller.isGstRegistered) {
        doc.moveDown(0.8);
        doc.font('Helvetica-Bold')
            .fillColor('#B91C1C')
            .text(
                'Supplier GST details are not configured, so this document is issued as a provisional receipt and is not a valid tax invoice.',
                { width: right - left }
            );
    }

    doc.moveDown(0.8);
    doc.font('Helvetica').fontSize(8.5).fillColor(GREY).text(
        'This is a system-generated document and does not require a physical signature. It will remain available for download for 7 years from the date of issue, as required under the GST Act.',
        left,
        doc.y,
        { width: right - left }
    );
    doc.moveDown(0.5);
    doc.text(`Thank you for choosing ${seller.name}.`, { width: right - left });

    doc.end();
}
