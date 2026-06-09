import { query } from '../config/db';

export async function ensureOrganizerStatusColumns(): Promise<void> {
    try {
        const [paymentRows] = await query("SHOW COLUMNS FROM organizers LIKE 'payment_status'");
        const [accountRows] = await query("SHOW COLUMNS FROM organizers LIKE 'account_status'");

        const hasPayment = (paymentRows as any).length > 0;
        const hasAccount = (accountRows as any).length > 0;

        if (hasPayment && hasAccount) return;

        const parts: string[] = [];
        if (!hasPayment) {
            parts.push("ADD COLUMN payment_status ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending'");
        }
        if (!hasAccount) {
            parts.push("ADD COLUMN account_status ENUM('pending','active','inactive') NOT NULL DEFAULT 'pending'");
        }

        if (parts.length > 0) {
            const sql = `ALTER TABLE organizers ${parts.join(', ')}`;
            await query(sql);
        }
    } catch (err: any) {
        // If we cannot modify schema (lack of privileges), just log and continue — callers will handle missing columns gracefully
        console.warn('[schemaHelpers] Could not ensure organizer columns:', err.message || err);
    }
}

export default ensureOrganizerStatusColumns;
