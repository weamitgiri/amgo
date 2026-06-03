import { Request, Response } from 'express';
import { query } from '../config/db';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

async function getOrganizerProfileRow(organizerId: number | string) {
    const [rows] = await query(
        `SELECT id, name, email, company_name, company_website, designation, phone, email_verified_at, status
         FROM organizers WHERE id = ? AND deleted_at IS NULL`,
        [organizerId]
    );
    return rows[0] ?? null;
}

async function getLatestBillingForOrganizer(organizerId: number | string) {
    const [rows] = await query(
        `SELECT
            b.id as billing_id,
            ob.id as booking_id,
            b.gst_number,
            b.billing_address,
            b.city,
            b.state,
            b.pin_code,
            b.payment_method,
            b.payment_status,
            b.updated_at
         FROM organizer_bookings ob
         LEFT JOIN organizer_billings b ON b.booking_id = ob.id
         WHERE ob.organizer_id = ?
         ORDER BY ob.created_at DESC, b.id DESC
         LIMIT 1`,
        [organizerId]
    );
    return rows[0] ?? null;
}

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const organizerId = (req as any).user.id;

    const organizer = await getOrganizerProfileRow(organizerId);
    if (!organizer) {
        throw new AppError('Organizer not found', 404);
    }

    const billing = await getLatestBillingForOrganizer(organizerId);

    return successResponse(res, 'Profile retrieved successfully.', {
        organizer: {
            id: organizer.id,
            name: organizer.name,
            email: organizer.email,
            company_name: organizer.company_name,
            company_website: organizer.company_website ?? '',
            designation: organizer.designation ?? '',
            phone: organizer.phone ?? '',
            email_verified: !!organizer.email_verified_at,
            status: organizer.status,
        },
        billing: billing
            ? {
                  billing_id: billing.billing_id,
                  booking_id: billing.booking_id,
                  gst_number: billing.gst_number ?? '',
                  billing_address: billing.billing_address ?? '',
                  city: billing.city ?? '',
                  state: billing.state ?? '',
                  pin_code: billing.pin_code ?? '',
                  payment_method: billing.payment_method ?? null,
                  payment_status: billing.payment_status ?? null,
                  updated_at: billing.updated_at ?? null,
              }
            : null,
    });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const organizerId = (req as any).user.id;
    const { name, company_name, company_website, designation, phone } = req.body;

    const organizer = await getOrganizerProfileRow(organizerId);
    if (!organizer) {
        throw new AppError('Organizer not found', 404);
    }

    await query(
        `UPDATE organizers SET
            name = ?,
            company_name = ?,
            company_website = ?,
            designation = ?,
            phone = ?,
            updated_at = NOW()
         WHERE id = ?`,
        [
            name?.trim() || organizer.name,
            company_name?.trim() || organizer.company_name,
            company_website?.trim() || null,
            designation?.trim() || null,
            phone?.trim() || null,
            organizerId,
        ]
    );

    const updated = await getOrganizerProfileRow(organizerId);

    return successResponse(res, 'Profile updated successfully.', {
        organizer: {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            company_name: updated.company_name,
            company_website: updated.company_website ?? '',
            designation: updated.designation ?? '',
            phone: updated.phone ?? '',
        },
    });
});

export const updateBilling = asyncHandler(async (req: Request, res: Response) => {
    const organizerId = (req as any).user.id;
    const { gst_number, billing_address, city, state, pin_code } = req.body;

    const billingRow = await getLatestBillingForOrganizer(organizerId);
    if (!billingRow?.billing_id) {
        throw new AppError(
            'No billing record found. Complete a booking with payment first.',
            404
        );
    }

    const [owned] = await query(
        `SELECT ob.id FROM organizer_bookings ob
         JOIN organizer_billings b ON b.booking_id = ob.id
         WHERE b.id = ? AND ob.organizer_id = ?`,
        [billingRow.billing_id, organizerId]
    );

    if (owned.length === 0) {
        throw new AppError('Billing record not found', 404);
    }

    await query(
        `UPDATE organizer_billings SET
            gst_number = ?,
            billing_address = ?,
            city = ?,
            state = ?,
            pin_code = ?,
            updated_at = NOW()
         WHERE id = ?`,
        [
            gst_number?.trim() || null,
            billing_address?.trim(),
            city?.trim(),
            state?.trim(),
            pin_code?.trim(),
            billingRow.billing_id,
        ]
    );

    const billing = await getLatestBillingForOrganizer(organizerId);

    return successResponse(res, 'Billing details updated successfully.', {
        billing: {
            billing_id: billing.billing_id,
            booking_id: billing.booking_id,
            gst_number: billing.gst_number ?? '',
            billing_address: billing.billing_address ?? '',
            city: billing.city ?? '',
            state: billing.state ?? '',
            pin_code: billing.pin_code ?? '',
        },
    });
});
