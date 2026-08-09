"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResultsPdf = generateResultsPdf;
exports.resolvePdfPath = resolvePdfPath;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const db_1 = require("../config/db");
const STORAGE_DIR = path_1.default.join(__dirname, '..', '..', 'storage', 'results-pdfs');
function ensureStorageDir() {
    if (!fs_1.default.existsSync(STORAGE_DIR)) {
        fs_1.default.mkdirSync(STORAGE_DIR, { recursive: true });
    }
}
async function generateResultsPdf(groupId) {
    ensureStorageDir();
    const [groupRows] = await (0, db_1.query)(`SELECT gg.*, ob.scheduled_date, ob.scheduled_time, ag.title AS case_title
         FROM game_groups gg
         JOIN organizer_bookings ob ON ob.id = gg.booking_id
         LEFT JOIN activity_games ag ON ag.id = COALESCE(gg.game_id, ob.game_id)
         WHERE gg.id = ? LIMIT 1`, [groupId]);
    const group = groupRows?.[0];
    if (!group)
        throw new Error('Group not found for PDF generation');
    const [results] = await (0, db_1.query)('SELECT * FROM results WHERE group_id = ? ORDER BY id DESC LIMIT 1', [groupId]);
    const result = results?.[0];
    const [sessions] = await (0, db_1.query)(`SELECT ps.id, ps.total_score, gr.role_type, gr.character_name,
                gp.name AS participant_name, gp.email AS participant_email
         FROM participant_sessions ps
         LEFT JOIN game_roles gr ON gr.id = ps.role_id
         LEFT JOIN game_participants gp ON gp.id = ps.participant_id
         WHERE ps.group_id = ?`, [groupId]);
    const winnerIds = result?.winner_ids
        ? typeof result.winner_ids === 'string'
            ? JSON.parse(result.winner_ids)
            : result.winner_ids
        : [];
    const winnerSet = new Set(winnerIds.map((id) => String(id)));
    const perRoleResults = result?.per_role_results
        ? typeof result.per_role_results === 'string'
            ? JSON.parse(result.per_role_results)
            : result.per_role_results
        : [];
    const statusBySession = new Map(perRoleResults.map((r) => [String(r.session_id), r.status]));
    const STATUS_LABELS = {
        winner: 'WINNER',
        correct: 'CORRECT — identified the killer',
        loser: 'LOSER — wrong guess',
        killer_wins: 'KILLER WINS — escaped!',
    };
    const filename = `group-${groupId}-${crypto_1.default.randomBytes(12).toString('hex')}.pdf`;
    const filePath = path_1.default.join(STORAGE_DIR, filename);
    await new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50 });
        const stream = fs_1.default.createWriteStream(filePath);
        doc.pipe(stream);
        doc.fontSize(20).text('Mystery Quest — Results', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Case: ${group.case_title || 'The Bungalow Secret'}`);
        doc.text(`Group: ${group.group_name}`);
        doc.text(`Session: ${group.scheduled_date} ${group.scheduled_time}`);
        doc.text(`Completed: ${group.completed_at || new Date().toISOString()}`);
        doc.moveDown();
        doc.fontSize(14).text('Outcome', { underline: true });
        doc.fontSize(12).text(result?.is_correct
            ? 'The culprit was correctly identified.'
            : 'The culprit was NOT identified — the culprit wins.');
        doc.text(`Correct guesses: ${result?.correct_guess_count ?? '—'} of 4`);
        doc.moveDown();
        doc.fontSize(14).text('Participants', { underline: true });
        doc.moveDown(0.5);
        for (const s of sessions) {
            const status = statusBySession.get(String(s.id)) ?? (winnerSet.has(String(s.id)) ? 'winner' : 'loser');
            doc.fontSize(12).text(`${s.participant_name || 'Unknown'} (${s.participant_email || 'no email'}) — Role: ${s.role_type || 'unassigned'} — Score: ${s.total_score ?? 0} — ${STATUS_LABELS[status] ?? status.toUpperCase()}`);
        }
        doc.end();
        stream.on('finish', () => resolve());
        stream.on('error', reject);
    });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await (0, db_1.query)('UPDATE game_groups SET results_pdf_path = ?, results_pdf_expires_at = ? WHERE id = ?', [
        filename,
        expiresAt,
        groupId,
    ]);
    return { path: filePath, expiresAt };
}
function resolvePdfPath(filename) {
    return path_1.default.join(STORAGE_DIR, filename);
}
