import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { query } from '../config/db';
import { drawParticipantsTable, loadGroupResults, type ResultRow } from './resultsPdfService';

/**
 * Mystery Quest — ONE results PDF per game session (booking) for HR, listing
 * every group with its outcome and players (the same participants table as the
 * per-group PDF). Built from live data; reused until the results change.
 *
 * Privacy: each group's data is purged one hour after it finishes. The PDF is
 * captured just before the session's first purge (so it still has every group),
 * then kept until the last group is purged, when it is deleted too.
 */

const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage', 'results-pdfs');
const filePrefix = (bookingId: number) => `mq-session-${bookingId}-`;

function ensureStorageDir() {
    if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export function resolveMQSessionPdfPath(filename: string): string {
    return path.join(STORAGE_DIR, filename);
}

/** This session's stored PDF files, newest first. */
function storedFiles(bookingId: number): string[] {
    if (!fs.existsSync(STORAGE_DIR)) return [];
    const prefix = filePrefix(bookingId);
    return fs
        .readdirSync(STORAGE_DIR)
        .filter((f) => f.startsWith(prefix) && f.endsWith('.pdf'))
        .map((f) => ({ f, t: fs.statSync(path.join(STORAGE_DIR, f)).mtimeMs }))
        .sort((a, b) => b.t - a.t)
        .map((x) => x.f);
}

function deleteFiles(files: string[]) {
    for (const f of files) {
        try {
            fs.unlinkSync(path.join(STORAGE_DIR, f));
        } catch {
            /* already gone */
        }
    }
}

/** Removes every stored session PDF for this booking. */
export function deleteMQSessionPdfs(bookingId: number): void {
    deleteFiles(storedFiles(bookingId));
}

type SessionGroup = {
    id: number;
    name: string;
    status: string;
    completedAt: Date | null;
    purged: boolean;
};

/** Finished Mystery Quest groups of the booking (Cook & Create groups excluded). */
async function getSessionGroups(bookingId: number): Promise<SessionGroup[]> {
    const [rows] = await query<any>(
        `SELECT gg.id, gg.group_name, gg.status, gg.completed_at, gg.purged_at
         FROM game_groups gg
         WHERE gg.booking_id = ? AND gg.status IN ('completed', 'incomplete')
           AND NOT EXISTS (SELECT 1 FROM cc_game_instances ci WHERE ci.group_id = gg.id)
         ORDER BY gg.id ASC`,
        [bookingId]
    );
    return (rows as any[]).map((r) => ({
        id: Number(r.id),
        name: r.group_name || `Group ${r.id}`,
        status: r.status,
        completedAt: r.completed_at ? new Date(r.completed_at) : null,
        purged: !!r.purged_at,
    }));
}

const fmtDateTime = (d: Date | null): string =>
    d && !isNaN(d.getTime())
        ? d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
        : '—';

const fmtDate = (d: any): string => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtTime = (t: any): string => {
    if (!t) return '—';
    const m = String(t).match(/^(\d{1,2}):(\d{2})/);
    if (!m) return String(t);
    const h = Number(m[1]);
    return `${h % 12 || 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
};

type GroupSection = { group: SessionGroup; result: any; rows: ResultRow[] };

async function renderPdf(bookingId: number, sections: GroupSection[], filePath: string): Promise<void> {
    const [infoRows] = await query<any>(
        `SELECT ob.scheduled_date, ob.scheduled_time, o.name AS organiser_name, ag.title AS case_title
         FROM organizer_bookings ob
         LEFT JOIN organizers o ON o.id = ob.organizer_id
         LEFT JOIN activity_games ag ON ag.id = ob.game_id
         WHERE ob.id = ? LIMIT 1`,
        [bookingId]
    );
    const info = infoRows?.[0] ?? {};

    await new Promise<void>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Page geometry (Letter, 50pt margins → content spans x:50..562, the
        // width the participants table is laid out for).
        const LEFT = doc.page.margins.left;
        const RIGHT = doc.page.width - doc.page.margins.right;
        const WIDTH = RIGHT - LEFT;
        const BOTTOM = doc.page.height - doc.page.margins.bottom;

        // ---------- Title ----------
        doc.font('Helvetica-Bold').fontSize(20).fillColor('#1a1a2e')
            .text('Mystery Quest — Session Results', LEFT, doc.y, { align: 'center', width: WIDTH });
        doc.moveDown(0.3);
        doc.strokeColor('#b15cf7').lineWidth(1.5).moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).stroke();
        doc.moveDown(0.8);

        // ---------- Session meta ----------
        const meta: [string, string][] = [
            ['Game', 'Mystery Quest'],
            ['Case', (info.case_title || '').trim() || '—'],
            ['Date', fmtDate(info.scheduled_date)],
            ['Start time', fmtTime(info.scheduled_time)],
            ['Organiser', (info.organiser_name || '').trim() || 'Organizer'],
            ['Session ID', String(bookingId)],
            ['Groups', String(sections.length)],
        ];
        for (const [label, val] of meta) {
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#444444').text(`${label}:  `, LEFT, doc.y, { continued: true });
            doc.font('Helvetica').fillColor('#000000').text(val);
        }
        doc.moveDown(1);

        // ---------- One section per group ----------
        for (const { group, result, rows } of sections) {
            // Keep a group's heading and outcome together with the start of its table.
            if (doc.y + 150 > BOTTOM) doc.addPage();

            const top = doc.y;
            doc.rect(LEFT, top, WIDTH, 26).fill('#2a1348');
            doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff')
                .text(group.name, LEFT + 10, top + 7, { width: WIDTH / 2 });
            doc.font('Helvetica').fontSize(10).fillColor('#e9ddff')
                .text(
                    `${group.status === 'incomplete' ? 'Incomplete' : 'Completed'} · ${fmtDateTime(group.completedAt)}`,
                    LEFT + WIDTH / 2,
                    top + 8,
                    { width: WIDTH / 2 - 10, align: 'right' }
                );
            doc.y = top + 26 + 8;

            if (group.status === 'incomplete') {
                doc.font('Helvetica-Bold').fontSize(11).fillColor('#c0392b')
                    .text('Game incomplete — the session ended early.', LEFT, doc.y);
            } else {
                const culpritIdentified = !!result?.is_correct;
                doc.font('Helvetica-Bold').fontSize(11).fillColor(culpritIdentified ? '#1f8a4c' : '#c0392b')
                    .text(
                        culpritIdentified
                            ? 'The culprit was correctly identified.'
                            : 'The culprit was NOT identified — the culprit wins.',
                        LEFT,
                        doc.y
                    );
            }
            doc.font('Helvetica').fontSize(10).fillColor('#000000')
                .text(`Correct guesses: ${result?.correct_guess_count ?? '—'} of 4`, LEFT, doc.y);
            doc.moveDown(0.5);

            if (rows.length === 0) {
                doc.font('Helvetica').fontSize(10).fillColor('#888888').text('No participants recorded.', LEFT, doc.y);
            } else {
                drawParticipantsTable(doc, rows);
            }
            doc.moveDown(1.4);
        }

        doc.end();
        stream.on('finish', () => resolve());
        stream.on('error', reject);
    });
}

/**
 * Returns the filename of this session's up-to-date results PDF, generating it
 * when the results have changed since the stored one. Null when the session has
 * no finished Mystery Quest group, or when every group's data has been purged
 * (its PDF is deleted then). Once any group is purged the stored PDF is never
 * rebuilt, since that group's rows are gone.
 */
export async function generateMQResultsPdfForBooking(bookingId: number): Promise<string | null> {
    const groups = await getSessionGroups(bookingId);
    if (groups.length === 0) return null;

    const existing = storedFiles(bookingId);
    if (groups.every((g) => g.purged)) {
        deleteFiles(existing);
        return null;
    }
    if (groups.some((g) => g.purged)) return existing[0] ?? null;

    const sections: GroupSection[] = [];
    for (const group of groups) {
        const { result, rows } = await loadGroupResults(group.id);
        sections.push({ group, result, rows });
    }

    // Name the file after its content, so unchanged results reuse the stored PDF.
    const signature = crypto
        .createHash('sha256')
        .update(
            JSON.stringify(
                sections.map(({ group, result, rows }) => [
                    group.id,
                    group.name,
                    group.status,
                    group.completedAt?.getTime() ?? null,
                    result?.id ?? null,
                    result?.is_correct ?? null,
                    result?.correct_guess_count ?? null,
                    rows,
                ])
            )
        )
        .digest('hex')
        .slice(0, 32);
    const filename = `${filePrefix(bookingId)}${signature}.pdf`;
    if (existing.includes(filename)) return filename;

    ensureStorageDir();
    const tmpPath = resolveMQSessionPdfPath(`${filename}.tmp`);
    await renderPdf(bookingId, sections, tmpPath);
    fs.renameSync(tmpPath, resolveMQSessionPdfPath(filename));
    deleteFiles(existing);
    return filename;
}
