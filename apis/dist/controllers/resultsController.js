"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadResultsPdf = exports.getGameResults = void 0;
const fs_1 = __importDefault(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const AppError_1 = require("../utils/AppError");
const db_1 = require("../config/db");
const serializer_1 = require("../utils/serializer");
const pseudonym_1 = require("../utils/pseudonym");
const resultsPdfService_1 = require("../services/resultsPdfService");
/**
 * Post-game results for a group — always rendered with pseudonyms (never raw
 * participant names), matching how the live game already hides identities.
 */
exports.getGameResults = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { group_id } = req.params;
    const participantId = req.query.participant_id;
    const [groupRows] = await (0, db_1.query)('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [group_id]);
    const group = groupRows?.[0];
    if (!group)
        throw new AppError_1.AppError('Group not found', 404);
    if (!['completed', 'incomplete'].includes(group.status)) {
        return (0, apiResponse_1.successResponse)(res, 'Game still in progress', { is_finished: false });
    }
    const [results] = await (0, db_1.query)('SELECT * FROM results WHERE group_id = ? ORDER BY id DESC LIMIT 1', [group_id]);
    const result = results?.[0];
    // The game is over, so the player↔character mapping is no longer secret:
    // include each player's character name and portrait for the reveal screen.
    const [sessions] = await (0, db_1.query)(`SELECT ps.id, ps.total_score, ps.participant_id, gr.role_type, gr.character_name, gr.role_image,
                gp.name AS participant_name
            FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            LEFT JOIN game_participants gp ON gp.id = ps.participant_id
            WHERE ps.group_id = ?`, [group_id]);
    // Post-game "Full Story" reveal: the game's clues in order, plus the tagline.
    const [gameRows] = await (0, db_1.query)(`SELECT ag.id AS game_row_id, ag.tagline
            FROM game_groups gg
            JOIN organizer_bookings ob ON ob.id = gg.booking_id
            LEFT JOIN activity_games ag ON ag.id = COALESCE(gg.game_id, ob.game_id)
            WHERE gg.id = ? LIMIT 1`, [group_id]);
    const gameRowId = gameRows?.[0]?.game_row_id;
    let fullStory = [];
    if (gameRowId) {
        const [clueRows] = await (0, db_1.query)(`SELECT id, clue_title, clue_short_description, clue_detail, clue_image
                FROM game_clues WHERE game_id = ? ORDER BY id ASC`, [gameRowId]);
        fullStory = (clueRows ?? []).map((c) => ({
            id: Number(c.id),
            title: c.clue_title,
            text: c.clue_detail || c.clue_short_description,
            image: c.clue_image,
        }));
    }
    const winnerIds = result?.winner_ids
        ? typeof result.winner_ids === 'string'
            ? JSON.parse(result.winner_ids)
            : result.winner_ids
        : [];
    const winnerSet = new Set(winnerIds.map((id) => String(id)));
    // Per-player verdict status (winner / correct / loser / killer_wins) computed
    // by verdictScoringService and stored on the result row.
    const perRoleResults = result?.per_role_results
        ? typeof result.per_role_results === 'string'
            ? JSON.parse(result.per_role_results)
            : result.per_role_results
        : [];
    const statusBySession = new Map(perRoleResults.map((r) => [String(r.session_id), r.status]));
    const withPseudonym = (s) => ({
        session_id: Number(s.id),
        pseudonym: (0, pseudonym_1.shortName)(s.participant_name || 'Player', Number(s.id)),
        role_type: s.role_type,
        score: s.total_score,
        status: statusBySession.get(String(s.id)) ?? (winnerSet.has(String(s.id)) ? 'winner' : 'loser'),
        character_name: s.character_name ?? null,
        role_image: s.role_image ?? null,
        is_you: participantId != null && String(s.participant_id) === String(participantId),
    });
    const culpritSession = sessions.find((s) => s.role_type === 'culprit');
    const payload = {
        is_finished: true,
        is_incomplete: group.status === 'incomplete',
        group_id: Number(group.id),
        completed_at: group.completed_at,
        killer_wins: result ? !result.is_correct : false,
        culprit: culpritSession ? withPseudonym(culpritSession) : null,
        players: sessions.filter((s) => s.role_type).map(withPseudonym),
        winners: sessions.filter((s) => winnerSet.has(String(s.id))).map(withPseudonym),
        losers: sessions.filter((s) => s.role_type && !winnerSet.has(String(s.id))).map(withPseudonym),
        correct_guess_count: result?.correct_guess_count ?? null,
        total_guessers: sessions.filter((s) => s.role_type && s.role_type !== 'culprit').length,
        tagline: gameRows?.[0]?.tagline ?? null,
        full_story: fullStory,
        pdf_available: Boolean(group.results_pdf_path && group.results_pdf_expires_at && new Date(group.results_pdf_expires_at) > new Date()),
        pdf_expires_at: group.results_pdf_expires_at,
    };
    return (0, apiResponse_1.successResponse)(res, 'Results retrieved', (0, serializer_1.serializeData)(payload));
});
/**
 * Downloads the results PDF. Available for exactly 1 hour after a group's game
 * ends, to either: the participant who was in the group (via participant_id query
 * param, matching the rest of the participant-facing API's auth-less pattern), or
 * the organizer who owns the booking (via their existing JWT).
 */
exports.downloadResultsPdf = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { group_id } = req.params;
    const participantId = req.query.participant_id;
    const [groupRows] = await (0, db_1.query)('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [group_id]);
    const group = groupRows?.[0];
    if (!group ||
        !group.results_pdf_path ||
        !group.results_pdf_expires_at ||
        new Date(group.results_pdf_expires_at) <= new Date()) {
        throw new AppError_1.AppError('Results PDF not available', 404);
    }
    let authorized = false;
    if (participantId) {
        const [memberRows] = await (0, db_1.query)('SELECT id FROM game_participants WHERE group_id = ? AND id = ? LIMIT 1', [group_id, participantId]);
        authorized = !!memberRows?.[0];
    }
    const authHeader = req.headers.authorization;
    if (!authorized && authHeader?.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            const [ownerRows] = await (0, db_1.query)(`SELECT ob.id FROM game_groups gg
                    JOIN organizer_bookings ob ON ob.id = gg.booking_id
                    WHERE gg.id = ? AND ob.organizer_id = ? LIMIT 1`, [group_id, decoded.id]);
            authorized = !!ownerRows?.[0];
        }
        catch {
            authorized = false;
        }
    }
    if (!authorized)
        throw new AppError_1.AppError('Results PDF not available', 404);
    const filePath = (0, resultsPdfService_1.resolvePdfPath)(group.results_pdf_path);
    if (!fs_1.default.existsSync(filePath))
        throw new AppError_1.AppError('Results PDF not available', 404);
    return res.download(filePath, 'mystery-quest-results.pdf');
});
