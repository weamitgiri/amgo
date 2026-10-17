import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { query } from '../config/db';
import { getAwards, getCCRatingCategories } from './cookandcreateService';

/**
 * Auto-generated Cook & Create awards results PDF.
 *
 * One PDF per booking (the award winners are ranked across all groups in the
 * booking), listing each of the admin-configured award categories with its
 * winning group and that group's members + emails. The file is kept permanently
 * in its own folder and its path is stored on every completed CC group of the
 * booking (game_groups.cc_results_pdf_path) — the existing 1-hour retention
 * purge only touches results_pdf_path / the results-pdfs folder, so these are
 * never auto-deleted.
 *
 * Award winners come from the live results board (getAwards), which ranks groups
 * by the star ratings players give after the game, so the PDF is generated
 * lazily once winners exist, kept in step with the results if more ratings
 * arrive (and captured a final time before the privacy purge anonymises member
 * names/emails) — never with empty awards.
 */
const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage', 'cc-results-pdfs');

function ensureStorageDir() {
    if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

/** Resolve a stored cc_results_pdf_path filename to an absolute path. */
export function resolveCCPdfPath(filename: string): string {
    return path.join(STORAGE_DIR, path.basename(filename));
}

type AwardSection = {
    categoryName: string;
    winnerGroupId: number | null;
    winnerGroupLabel: string | null;
    members: { name: string; email: string }[];
};

type BookingInfo = {
    bookingId: number;
    organiserName: string;
    gameDate: string | null;
    startTime: string | null;
    gameName: string;
};

/** Per-booking lock so a double completion/refresh can't race two generations. */
const generating = new Set<number>();

/** Bump when the PDF layout changes, so stored PDFs are rebuilt in the new layout. */
const PDF_LAYOUT_VERSION = 2;

/**
 * The five Fun Awards and their winners for a booking, taken from the live
 * results board (getAwards) — the same winners players see — so the PDF can
 * never disagree with the game. The categories are the first five active ones
 * in configured order, exactly what the results screen displays. Only groups
 * that won an award appear, each with its members (name + email); a group that
 * won several awards appears under each one; an award without a winner has none.
 */
async function computeBookingAwards(bookingId: number): Promise<AwardSection[]> {
    const AWARD_COUNT = 5;
    const categories = (await getCCRatingCategories()).slice(0, AWARD_COUNT);

    // getAwards ranks the whole booking, so any of its completed groups works.
    const [anyGroup] = await query<any>(
        `SELECT gg.id FROM game_groups gg JOIN cc_game_instances ci ON ci.group_id = gg.id
         WHERE gg.booking_id = ? AND ci.status = 'completed' ORDER BY gg.id ASC LIMIT 1`,
        [bookingId]
    );
    if (!anyGroup?.[0]) return [];
    const board = await getAwards(anyGroup[0].id);
    if (!board) return [];

    const sections: AwardSection[] = [];
    for (const cat of categories) {
        const winner = board.groups.find((g) => g.awards.some((a) => a.category_id === cat.id)) ?? null;
        const winnerGroupId = winner ? winner.group_id : null;
        let members: { name: string; email: string }[] = [];
        if (winnerGroupId != null) {
            const [memberRows] = await query<any>(
                `SELECT name, email FROM game_participants
                 WHERE group_id = ? AND name IS NOT NULL AND TRIM(name) <> ''
                 ORDER BY id ASC`,
                [winnerGroupId]
            );
            members = (memberRows || []).map((m: any) => ({
                name: (m.name || '').trim() || 'Player',
                email: (m.email || '').trim() || '—',
            }));
        }
        sections.push({
            categoryName: cat.name,
            winnerGroupId,
            winnerGroupLabel: winner ? (winner.group_name || '').trim() || `Group ${winner.group_id}` : null,
            members,
        });
    }
    return sections;
}

async function getBookingInfo(bookingId: number): Promise<BookingInfo | null> {
    const [rows] = await query<any>(
        `SELECT ob.id, ob.scheduled_date, ob.scheduled_time, o.name AS organiser_name,
                COALESCE(ag.title, 'Cook & Create') AS game_title
         FROM organizer_bookings ob
         LEFT JOIN organizers o ON o.id = ob.organizer_id
         LEFT JOIN activity_games ag ON ag.id = ob.game_id
         WHERE ob.id = ? LIMIT 1`,
        [bookingId]
    );
    const r = rows?.[0];
    if (!r) return null;
    const fmtDate = (d: any): string | null => {
        if (!d) return null;
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const fmtTime = (t: any): string | null => {
        if (!t) return null;
        const s = String(t);
        const m = s.match(/^(\d{1,2}):(\d{2})/);
        if (!m) return s;
        let h = Number(m[1]);
        const min = m[2];
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${min} ${ampm}`;
    };
    return {
        bookingId: Number(r.id),
        organiserName: (r.organiser_name || '').trim() || 'Organizer',
        gameDate: fmtDate(r.scheduled_date),
        startTime: fmtTime(r.scheduled_time),
        gameName: 'Cook & Create',
    };
}

/** Renders the PDF into the storage folder under the given filename. */
async function renderPdf(info: BookingInfo, sections: AwardSection[], filename: string): Promise<void> {
    ensureStorageDir();
    const filePath = path.join(STORAGE_DIR, filename);

    await new Promise<void>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, bufferPages: true, size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const LEFT = doc.page.margins.left;
        const RIGHT = doc.page.width - doc.page.margins.right;
        const WIDTH = RIGHT - LEFT;
        const BOTTOM = doc.page.height - doc.page.margins.bottom;
        const ORANGE = '#CB7430';
        const DARK = '#3F2B20';
        const GREY = '#6F625A';
        const LINE = '#E6D7C5';

        // Start a fresh page before content that wouldn't fit, so nothing clips.
        const ensureSpace = (needed: number) => {
            if (doc.y + needed > BOTTOM) doc.addPage();
        };

        // ---- Title + game info header ----
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(20).text('Cook & Create — Game Results', LEFT, LEFT, { width: WIDTH, align: 'center' });
        doc.moveDown(0.8);

        const infoRows: [string, string][] = [
            ['Game', info.gameName],
            ['Date', info.gameDate ?? '—'],
            ['Start time', info.startTime ?? '—'],
            ['Organiser', info.organiserName],
            ['Session ID', String(info.bookingId)],
        ];
        const boxTop = doc.y;
        const labelW = 90;
        doc.font('Helvetica').fontSize(11);
        const rowH = 18;
        infoRows.forEach(([k, v], idx) => {
            const y = boxTop + 10 + idx * rowH;
            doc.fillColor(GREY).font('Helvetica-Bold').text(k, LEFT + 12, y, { width: labelW });
            doc.fillColor(DARK).font('Helvetica').text(v, LEFT + 12 + labelW, y, { width: WIDTH - labelW - 24 });
        });
        const boxH = 10 + infoRows.length * rowH + 6;
        doc.roundedRect(LEFT, boxTop, WIDTH, boxH, 6).strokeColor(LINE).lineWidth(1).stroke();
        doc.y = boxTop + boxH + 18;

        // ---- One section per award ----
        const colGroupW = 72;
        const colEmailW = 222;
        const colNameW = WIDTH - colGroupW - colEmailW;

        const drawTableHeader = () => {
            const y = doc.y;
            doc.rect(LEFT, y, WIDTH, 22).fill('#FBEFE0');
            doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10);
            doc.text('Group No.', LEFT + 8, y + 6, { width: colGroupW - 8 });
            doc.text('Member Name', LEFT + colGroupW + 8, y + 6, { width: colNameW - 8 });
            doc.text('Email Address', LEFT + colGroupW + colNameW + 8, y + 6, { width: colEmailW - 8 });
            doc.y = y + 22;
        };

        sections.forEach((s, i) => {
            ensureSpace(70);
            // Award heading
            doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(14)
                .text(`${i + 1}. ${s.categoryName}`, LEFT, doc.y, { width: WIDTH });
            doc.fillColor(DARK).font('Helvetica-Bold').fontSize(11)
                .text(`Winning Group: ${s.winnerGroupLabel ?? 'No winner'}`, LEFT, doc.y + 2, { width: WIDTH });
            doc.moveDown(0.6);

            if (!s.winnerGroupLabel || s.members.length === 0) {
                doc.fillColor(GREY).font('Helvetica-Oblique').fontSize(10)
                    .text(s.winnerGroupLabel ? 'No member details available.' : '—', LEFT, doc.y, { width: WIDTH });
                doc.moveDown(1);
                return;
            }

            drawTableHeader();
            doc.font('Helvetica').fontSize(10);
            s.members.forEach((m) => {
                // Measure the tallest cell so rows never overlap or clip.
                const nameH = doc.heightOfString(m.name, { width: colNameW - 16 });
                const emailH = doc.heightOfString(m.email, { width: colEmailW - 16 });
                const cellH = Math.max(nameH, emailH, 12) + 10;
                if (doc.y + cellH > BOTTOM) {
                    doc.addPage();
                    drawTableHeader();
                    doc.font('Helvetica').fontSize(10);
                }
                const y = doc.y;
                doc.fillColor(DARK);
                doc.text(s.winnerGroupLabel as string, LEFT + 8, y + 5, { width: colGroupW - 12 });
                doc.text(m.name, LEFT + colGroupW + 8, y + 5, { width: colNameW - 16 });
                doc.text(m.email, LEFT + colGroupW + colNameW + 8, y + 5, { width: colEmailW - 16 });
                doc.rect(LEFT, y, WIDTH, cellH).strokeColor(LINE).lineWidth(0.5).stroke();
                // vertical separators
                doc.moveTo(LEFT + colGroupW, y).lineTo(LEFT + colGroupW, y + cellH).stroke();
                doc.moveTo(LEFT + colGroupW + colNameW, y).lineTo(LEFT + colGroupW + colNameW, y + cellH).stroke();
                doc.y = y + cellH;
            });
            doc.moveDown(1.2);
        });

        // ---- Page numbers ----
        // Footers sit inside the bottom margin; pdfkit would auto-add a blank
        // page for text written past the bottom margin, so zero that margin on
        // each page while stamping the footer (and keep the text on one line).
        const range = doc.bufferedPageRange();
        for (let p = range.start; p < range.start + range.count; p++) {
            doc.switchToPage(p);
            doc.page.margins.bottom = 0;
            doc.font('Helvetica').fontSize(9).fillColor(GREY)
                .text(`Page ${p - range.start + 1} of ${range.count}`, LEFT, doc.page.height - 35, { width: WIDTH, align: 'center', lineBreak: false });
        }

        doc.end();
        stream.on('finish', () => resolve());
        stream.on('error', reject);
    });
}

/** The booking's stored awards PDF filename whose file still exists, if any. */
async function getStoredPdfFilename(bookingId: number): Promise<string | null> {
    const [rows] = await query<any>(
        `SELECT DISTINCT cc_results_pdf_path AS p FROM game_groups
         WHERE booking_id = ? AND cc_results_pdf_path IS NOT NULL`,
        [bookingId]
    );
    for (const row of rows || []) {
        if (fs.existsSync(resolveCCPdfPath(row.p))) return row.p;
    }
    return null;
}

/**
 * Ensure the booking's single awards PDF exists and matches the current results,
 * storing its filename on every completed CC group of the booking. Returns the
 * filename, or null when there are no award winners yet (nothing to download).
 *
 * The filename is derived from the results it contains, so repeated calls (list
 * refreshes, downloads, completion events) reuse the same file and it is only
 * rebuilt when the winners or their members actually change; the superseded file
 * is then deleted. Once the privacy purge has started on any group of the
 * booking, the PDF captured before it is kept as-is and never rebuilt.
 */
export async function generateCCResultsPdfForBooking(bookingId: number): Promise<string | null> {
    const id = Number(bookingId);
    const stored = await getStoredPdfFilename(id);
    if (generating.has(id)) return stored;
    generating.add(id);
    try {
        const [purged] = await query<any>(
            'SELECT 1 FROM game_groups WHERE booking_id = ? AND purged_at IS NOT NULL LIMIT 1',
            [id]
        );
        if (purged.length > 0) return stored;

        const sections = await computeBookingAwards(id);
        if (!sections.some((s) => s.winnerGroupId != null)) return stored; // no winners yet

        const info = await getBookingInfo(id);
        if (!info) return stored;

        const signature = crypto
            .createHash('sha256')
            .update(JSON.stringify({ layout: PDF_LAYOUT_VERSION, info, sections }))
            .digest('hex')
            .slice(0, 32);
        const filename = `cc-booking-${id}-${signature}.pdf`;
        if (stored === filename) return filename;

        // Previous file(s) for this booking — removed after the new one is stored.
        const [existing] = await query<any>(
            `SELECT DISTINCT cc_results_pdf_path AS p FROM game_groups
             WHERE booking_id = ? AND cc_results_pdf_path IS NOT NULL`,
            [id]
        );

        await renderPdf(info, sections, filename);

        await query(
            `UPDATE game_groups gg
             JOIN cc_game_instances ci ON ci.group_id = gg.id
             SET gg.cc_results_pdf_path = ?
             WHERE gg.booking_id = ? AND ci.status = 'completed'`,
            [filename, id]
        );

        for (const row of existing || []) {
            if (row.p && row.p !== filename) {
                try { fs.unlinkSync(resolveCCPdfPath(row.p)); } catch { /* best effort */ }
            }
        }
        return filename;
    } catch (err: any) {
        console.error('[ccResultsPdfService] generate failed for booking', bookingId, err?.message || err);
        return stored; // keep serving the previous file; a later request retries
    } finally {
        generating.delete(id);
    }
}

/** Convenience: resolve a group's booking and generate its booking PDF. */
export async function generateCCResultsPdfForGroup(groupId: number | string): Promise<string | null> {
    const [rows] = await query<any>('SELECT booking_id FROM game_groups WHERE id = ? LIMIT 1', [groupId]);
    const bookingId = rows?.[0]?.booking_id;
    if (!bookingId) return null;
    return generateCCResultsPdfForBooking(Number(bookingId));
}
