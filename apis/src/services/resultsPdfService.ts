import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { query } from '../config/db';

const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage', 'results-pdfs');

function ensureStorageDir() {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
}

export async function generateResultsPdf(groupId: number | string): Promise<{ path: string; expiresAt: Date }> {
    ensureStorageDir();

    const [groupRows] = await query<any>(
        `SELECT gg.*, ob.scheduled_date, ob.scheduled_time, ag.title AS case_title
         FROM game_groups gg
         JOIN organizer_bookings ob ON ob.id = gg.booking_id
         LEFT JOIN activity_games ag ON ag.id = COALESCE(gg.game_id, ob.game_id)
         WHERE gg.id = ? LIMIT 1`,
        [groupId]
    );
    const group = groupRows?.[0];
    if (!group) throw new Error('Group not found for PDF generation');

    const [results] = await query<any>('SELECT * FROM results WHERE group_id = ? ORDER BY id DESC LIMIT 1', [groupId]);
    const result = results?.[0];

    const [sessions] = await query<any>(
        `SELECT ps.id, ps.total_score, gr.role_type, gr.character_name,
                gp.name AS participant_name, gp.email AS participant_email
         FROM participant_sessions ps
         LEFT JOIN game_roles gr ON gr.id = ps.role_id
         LEFT JOIN game_participants gp ON gp.id = ps.participant_id
         WHERE ps.group_id = ?`,
        [groupId]
    );

    const winnerIds: number[] = result?.winner_ids
        ? typeof result.winner_ids === 'string'
            ? JSON.parse(result.winner_ids)
            : result.winner_ids
        : [];
    const winnerSet = new Set(winnerIds.map((id) => String(id)));

    const perRoleResults: any[] = result?.per_role_results
        ? typeof result.per_role_results === 'string'
            ? JSON.parse(result.per_role_results)
            : result.per_role_results
        : [];
    const statusBySession = new Map<string, string>(
        perRoleResults.map((r: any) => [String(r.session_id), r.status])
    );
    const STATUS_LABELS: Record<string, string> = {
        winner: 'WINNER',
        correct: 'CORRECT — identified the killer',
        loser: 'LOSER — wrong guess',
        killer_wins: 'KILLER WINS — escaped!',
    };

    const filename = `group-${groupId}-${crypto.randomBytes(12).toString('hex')}.pdf`;
    const filePath = path.join(STORAGE_DIR, filename);

    await new Promise<void>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Page geometry (Letter, 50pt margins → content spans x:50..562).
        const LEFT = doc.page.margins.left;
        const RIGHT = doc.page.width - doc.page.margins.right;
        const PAD = 6;

        // ---------- Title ----------
        doc.font('Helvetica-Bold').fontSize(20).fillColor('#1a1a2e')
            .text('Mystery Quest — Results', LEFT, doc.y, { align: 'center', width: RIGHT - LEFT });
        doc.moveDown(0.3);
        doc.strokeColor('#b15cf7').lineWidth(1.5).moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).stroke();
        doc.moveDown(0.8);

        // ---------- Meta ----------
        const meta: [string, string][] = [
            ['Case', group.case_title || 'The Bungalow Secret'],
            ['Group', group.group_name || '—'],
            ['Session', `${group.scheduled_date ?? ''} ${group.scheduled_time ?? ''}`.trim() || '—'],
            ['Completed', String(group.completed_at || new Date().toISOString())],
        ];
        for (const [label, val] of meta) {
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#444444').text(`${label}:  `, LEFT, doc.y, { continued: true });
            doc.font('Helvetica').fillColor('#000000').text(val);
        }
        doc.moveDown(0.8);

        // ---------- Outcome ----------
        const culpritIdentified = !!result?.is_correct;
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a1a2e').text('Outcome', LEFT, doc.y);
        doc.moveDown(0.2);
        doc.font('Helvetica-Bold').fontSize(12).fillColor(culpritIdentified ? '#1f8a4c' : '#c0392b')
            .text(
                culpritIdentified
                    ? 'The culprit was correctly identified.'
                    : 'The culprit was NOT identified — the culprit wins.',
                LEFT,
                doc.y
            );
        doc.font('Helvetica').fontSize(11).fillColor('#000000')
            .text(`Correct guesses: ${result?.correct_guess_count ?? '—'} of 4`, LEFT, doc.y);
        doc.moveDown(0.9);

        // ---------- Participants table ----------
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a1a2e').text('Participants', LEFT, doc.y);
        doc.moveDown(0.4);

        // Column layout: widths sum to (RIGHT-LEFT) = 512.
        const cols = {
            idx: { x: LEFT, w: 26 },
            name: { x: LEFT + 26, w: 196 },
            role: { x: LEFT + 222, w: 96 },
            score: { x: LEFT + 318, w: 52 },
            result: { x: LEFT + 370, w: 142 },
        };
        const seps = [cols.idx.x, cols.name.x, cols.role.x, cols.score.x, cols.result.x, RIGHT];
        const bottomLimit = doc.page.height - doc.page.margins.bottom;

        const measure = (text: unknown, w: number, font: string, size: number): number => {
            doc.font(font).fontSize(size);
            return doc.heightOfString(String(text ?? ''), { width: w - PAD * 2 });
        };

        const drawHeaderRow = () => {
            const heads: [{ x: number; w: number }, string][] = [
                [cols.idx, '#'],
                [cols.name, 'Participant'],
                [cols.role, 'Role'],
                [cols.score, 'Score'],
                [cols.result, 'Result'],
            ];
            const y = doc.y;
            let h = 0;
            for (const [c, t] of heads) h = Math.max(h, measure(t, c.w, 'Helvetica-Bold', 10));
            h += PAD * 2;
            doc.rect(LEFT, y, RIGHT - LEFT, h).fill('#2a1348');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
            for (const [c, t] of heads) doc.text(t, c.x + PAD, y + PAD, { width: c.w - PAD * 2 });
            doc.strokeColor('#999999').lineWidth(0.5);
            doc.moveTo(LEFT, y + h).lineTo(RIGHT, y + h).stroke();
            for (const x of seps) doc.moveTo(x, y).lineTo(x, y + h).stroke();
            doc.moveTo(LEFT, y).lineTo(RIGHT, y).stroke();
            doc.y = y + h;
        };

        drawHeaderRow();

        let rowIndex = 0;
        for (const s of sessions) {
            rowIndex += 1;
            const status = statusBySession.get(String(s.id)) ?? (winnerSet.has(String(s.id)) ? 'winner' : 'loser');
            const resultLabel = STATUS_LABELS[status] ?? String(status).toUpperCase();
            const name = s.participant_name || 'Unknown';
            const email = s.participant_email || 'no email';
            const role = s.role_type || 'unassigned';
            const score = String(s.total_score ?? 0);

            const nameH = measure(name, cols.name.w, 'Helvetica-Bold', 10) + measure(email, cols.name.w, 'Helvetica', 8);
            const h =
                Math.max(
                    measure(rowIndex, cols.idx.w, 'Helvetica', 10),
                    nameH,
                    measure(role, cols.role.w, 'Helvetica', 10),
                    measure(score, cols.score.w, 'Helvetica-Bold', 10),
                    measure(resultLabel, cols.result.w, 'Helvetica-Bold', 9)
                ) +
                PAD * 2;

            if (doc.y + h > bottomLimit) {
                doc.addPage();
                drawHeaderRow();
            }
            const y = doc.y;

            // Zebra striping for readability.
            if (rowIndex % 2 === 0) doc.rect(LEFT, y, RIGHT - LEFT, h).fill('#f6f2fb');

            doc.font('Helvetica').fontSize(10).fillColor('#555555')
                .text(String(rowIndex), cols.idx.x + PAD, y + PAD, { width: cols.idx.w - PAD * 2 });
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111')
                .text(name, cols.name.x + PAD, y + PAD, { width: cols.name.w - PAD * 2 });
            doc.font('Helvetica').fontSize(8).fillColor('#888888')
                .text(email, cols.name.x + PAD, y + PAD + measure(name, cols.name.w, 'Helvetica-Bold', 10), {
                    width: cols.name.w - PAD * 2,
                });
            doc.font('Helvetica').fontSize(10).fillColor('#111111')
                .text(role, cols.role.x + PAD, y + PAD, { width: cols.role.w - PAD * 2 });
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111')
                .text(score, cols.score.x + PAD, y + PAD, { width: cols.score.w - PAD * 2 });
            const resultColor = status === 'loser' ? '#c0392b' : status === 'killer_wins' ? '#b8860b' : '#1f8a4c';
            doc.font('Helvetica-Bold').fontSize(9).fillColor(resultColor)
                .text(resultLabel, cols.result.x + PAD, y + PAD, { width: cols.result.w - PAD * 2 });

            doc.strokeColor('#d9d0e8').lineWidth(0.5);
            doc.moveTo(LEFT, y + h).lineTo(RIGHT, y + h).stroke();
            for (const x of seps) doc.moveTo(x, y).lineTo(x, y + h).stroke();
            doc.y = y + h;
        }
        doc.fillColor('#000000');

        doc.end();
        stream.on('finish', () => resolve());
        stream.on('error', reject);
    });

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await query('UPDATE game_groups SET results_pdf_path = ?, results_pdf_expires_at = ? WHERE id = ?', [
        filename,
        expiresAt,
        groupId,
    ]);

    return { path: filePath, expiresAt };
}

export function resolvePdfPath(filename: string): string {
    return path.join(STORAGE_DIR, filename);
}
