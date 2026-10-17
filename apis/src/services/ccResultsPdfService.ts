import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { query } from '../config/db';

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
 * Award winners come from each group's AVERAGE received star rating, which only
 * exists after players rate dishes post-game, so the PDF is generated lazily
 * once winners are available (and as a final safety net before the privacy
 * purge anonymises member names/emails) — never with empty awards.
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

/**
 * Compute the award winners for a booking, reusing the EXACT ranking the live
 * results use (getAwards): each group's average received star rating, highest
 * first; ties break by earlier finish then lower group id; category i (in
 * configured order) → the i-th ranked group. Returns one section per active
 * award category, with the winning group's members (name + email).
 */
async function computeBookingAwards(bookingId: number): Promise<AwardSection[]> {
    // The Fun Awards are the first configured categories (the results screen
    // shows the top five, in order) — match that so the PDF mirrors the game's
    // award display exactly. Names come straight from the admin configuration.
    const AWARD_COUNT = 5;
    const [allCategories] = await query<any>(
        `SELECT id, name FROM cc_rating_categories WHERE status = 'active' ORDER BY \`order\` ASC, id ASC`
    );
    const categories = (allCategories as any[]).slice(0, AWARD_COUNT);

    // Completed groups in this booking that produced a dish (eligible to win).
    const [groupsRows] = await query<any>(
        `SELECT gg.id AS group_id, gg.group_name, ci.finished_at
         FROM game_groups gg JOIN cc_game_instances ci ON ci.group_id = gg.id
         WHERE gg.booking_id = ? AND ci.status = 'completed' AND ci.dish_name IS NOT NULL`,
        [bookingId]
    );
    const completedGroupIds = new Set<number>((groupsRows || []).map((g: any) => Number(g.group_id)));
    const labelByGroup = new Map<number, string>();
    const finishedAtByGroup = new Map<number, number>();
    for (const g of groupsRows || []) {
        labelByGroup.set(Number(g.group_id), g.group_name);
        finishedAtByGroup.set(
            Number(g.group_id),
            g.finished_at ? Date.parse(g.finished_at) : Number.MAX_SAFE_INTEGER
        );
    }

    const [avgRows] = await query<any>(
        `SELECT r.rated_group_id, AVG(r.stars) AS avg_stars, COUNT(r.stars) AS n
         FROM cc_ratings r JOIN game_groups gg ON gg.id = r.rated_group_id
         WHERE gg.booking_id = ? AND r.stars IS NOT NULL
         GROUP BY r.rated_group_id`,
        [bookingId]
    );
    const eligible = (avgRows || [])
        .map((r: any) => ({ groupId: Number(r.rated_group_id), avg: Number(r.avg_stars), n: Number(r.n) }))
        .filter((e: { groupId: number; n: number }) => e.n > 0 && completedGroupIds.has(e.groupId))
        .sort((a: { groupId: number; avg: number }, b: { groupId: number; avg: number }) => {
            if (b.avg !== a.avg) return b.avg - a.avg;
            const fa = finishedAtByGroup.get(a.groupId) ?? Number.MAX_SAFE_INTEGER;
            const fb = finishedAtByGroup.get(b.groupId) ?? Number.MAX_SAFE_INTEGER;
            if (fa !== fb) return fa - fb;
            return a.groupId - b.groupId;
        });

    const sections: AwardSection[] = [];
    for (let i = 0; i < categories.length; i++) {
        const winnerGroupId = i < eligible.length ? eligible[i].groupId : null;
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
            categoryName: categories[i].name,
            winnerGroupId,
            winnerGroupLabel: winnerGroupId != null ? labelByGroup.get(winnerGroupId) ?? `Group ${winnerGroupId}` : null,
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

/** Renders the PDF to a new file and returns its filename (not full path). */
async function renderPdf(info: BookingInfo, sections: AwardSection[]): Promise<string> {
    ensureStorageDir();
    const filename = `cc-booking-${info.bookingId}-${crypto.randomBytes(12).toString('hex')}.pdf`;
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
        const colGroupW = 90;
        const colEmailW = 190;
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
                .text(s.winnerGroupLabel ? `Winning ${s.winnerGroupLabel}` : 'Not awarded (no ratings received)', LEFT, doc.y + 2, { width: WIDTH });
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

    return filename;
}

/**
 * Generate (or regenerate) the awards PDF for a booking and store its path on
 * every completed CC group of that booking. Returns the filename, or null when
 * there are no award winners yet (nothing worth generating). Deletes a previous
 * file for the booking so files don't accumulate. Guarded against concurrency.
 */
export async function generateCCResultsPdfForBooking(bookingId: number): Promise<string | null> {
    const id = Number(bookingId);
    if (generating.has(id)) return null;
    generating.add(id);
    try {
        const sections = await computeBookingAwards(id);
        if (!sections.some((s) => s.winnerGroupId != null)) return null; // no winners → skip

        const info = await getBookingInfo(id);
        if (!info) return null;

        // Previous file(s) for this booking's completed CC groups — remove after
        // a successful regenerate so storage doesn't grow unbounded.
        const [existing] = await query<any>(
            `SELECT DISTINCT gg.cc_results_pdf_path AS p
             FROM game_groups gg JOIN cc_game_instances ci ON ci.group_id = gg.id
             WHERE gg.booking_id = ? AND gg.cc_results_pdf_path IS NOT NULL`,
            [id]
        );

        const filename = await renderPdf(info, sections);

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
        return null; // leave path unset so a later request retries
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
