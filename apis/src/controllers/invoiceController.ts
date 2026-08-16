import { Request, Response } from 'express';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import {
    getInvoiceForBooking,
    getInvoiceSeller,
    listInvoicesForOrganizer,
    renderInvoicePdf,
} from '../services/invoicePdfService';

/**
 * Payment history for the signed-in organizer. Scoped to their own bookings by
 * organizer_id from the auth token — never by a client-supplied id.
 */
export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
    const organizerId = (req as any).user?.id;
    if (!organizerId) throw new AppError('Unauthorized', 401);

    const invoices = await listInvoicesForOrganizer(organizerId);
    const paid = invoices.filter((i) => i.payment_status === 'paid');

    return successResponse(res, 'Invoices fetched successfully', {
        invoices,
        summary: {
            total_spent: paid.reduce((sum, i) => sum + i.total_payable, 0),
            completed_count: paid.length,
            pending_count: invoices.filter((i) => i.payment_status === 'pending').length,
            failed_count: invoices.filter((i) => i.payment_status === 'failed').length,
        },
    });
});

/** Streams a booking's GST invoice as a PDF. */
export const downloadInvoice = asyncHandler(async (req: Request, res: Response) => {
    const organizerId = (req as any).user?.id;
    if (!organizerId) throw new AppError('Unauthorized', 401);

    const { booking_id } = req.params;
    // Ownership is enforced inside the query — a booking belonging to someone
    // else simply doesn't resolve, so this 404s rather than leaking its existence.
    const invoice = await getInvoiceForBooking(booking_id, organizerId);
    if (!invoice) throw new AppError('Invoice not found for this booking', 404);

    const seller = await getInvoiceSeller();
    const filename = `invoice-${invoice.invoice_no.replace(/\//g, '-')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    renderInvoicePdf(invoice, seller, res);
});
