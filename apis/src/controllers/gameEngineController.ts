/**
 * Game Engine Controller
 *
 * Core logic for the Detective Mystery game mechanics.
 * Handles phase-specific actions:
 * 1. Questioning Phase (Investigator vs Suspects).
 * 2. Lie Detector Phase (Voting and Truth-seeking).
 * 3. Case Summary management (Investigator's reopen power).
 * 4. Final accusations and result computation (see verdictScoringService.ts).
 *
 * Participants are not organizer-authenticated (they have no JWT) — every action
 * here is scoped by `group_id` + the participant's own `participant_id`, the same
 * identification pattern already used by participantController.ts's
 * getLobbyInfo/getGameSummary endpoints.
 */

import { Request, Response } from 'express';
import { successResponse } from '../utils/apiResponse';
import { query, withTransaction } from '../config/db';
import { serializeData } from '../utils/serializer';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { io } from '../server';
import moment from 'moment';
import { submitAccusation as submitAccusationService } from '../services/verdictScoringService';

async function getSessionForParticipant(groupId: number | string, participantId: number | string) {
    const [rows] = await query<any>(
        `SELECT ps.*, gr.role_type, gr.character_name FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ? AND ps.participant_id = ? LIMIT 1`,
        [groupId, participantId]
    );
    return rows?.[0] || null;
}

async function getActivityConfigForGroup(groupId: number | string) {
    const [rows] = await query<any>(
        `SELECT a.* FROM game_groups gg
            JOIN organizer_bookings ob ON ob.id = gg.booking_id
            JOIN activities a ON a.id = ob.activity_id
            WHERE gg.id = ? LIMIT 1`,
        [groupId]
    );
    return rows?.[0] || null;
}

async function getLieDetectorTallyData(roundId: number | string) {
    const [rows] = await query<any>(
        `SELECT vote_value, COUNT(*) as cnt FROM votes WHERE reference_id = ? AND reference_type = 'lie_detector' GROUP BY vote_value`,
        [roundId]
    );
    const tally = { believable: 0, suspicious: 0 };
    for (const r of rows) {
        if (r.vote_value === 'believable') tally.believable = Number(r.cnt);
        if (r.vote_value === 'suspicious') tally.suspicious = Number(r.cnt);
    }
    return tally;
}

/**
 * Get Current Game State
 * Hydrates the frontend with all group data, timers, and active questions.
 */
export const getGameState = asyncHandler(async (req: Request, res: Response) => {
    const participantId = req.query.participant_id as string | undefined;
    const { group_id } = req.params;
    if (!participantId) throw new AppError('participant_id is required', 400);

    const [groups] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [group_id]);
    const group = groups?.[0];
    if (!group) throw new AppError('Group not found', 404);

    const [sessions] = await query<any>(
        `SELECT ps.*, p.name as participant_name, p.email as participant_email,
                gr.role_type, gr.character_name, gr.role_image, gr.objective
            FROM participant_sessions ps
            JOIN game_participants p ON p.id = ps.participant_id
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ?`,
        [group_id]
    );

    const userSession = sessions.find((s: any) => String(s.participant_id) === String(participantId));
    if (!userSession) throw new AppError('You are not part of this group', 403);

    const [timers] = await query<any>('SELECT * FROM timers WHERE group_id = ? AND is_active = 1', [group_id]);

    const [questions] = await query<any>('SELECT * FROM questions WHERE group_id = ? ORDER BY id ASC', [group_id]);
    const [answers] = await query<any>(
        `SELECT a.* FROM answers a JOIN questions q ON q.id = a.question_id WHERE q.group_id = ?`,
        [group_id]
    );
    const answersByQuestionId = new Map<string, any[]>();
    for (const a of answers) {
        const key = String(a.question_id);
        answersByQuestionId.set(key, [...(answersByQuestionId.get(key) || []), a]);
    }

    const hydratedQuestions = questions.map((q: any) => ({
        ...q,
        answers: answersByQuestionId.get(String(q.id)) || [],
    }));

    const [lieDetectorRounds] = await query<any>(
        'SELECT * FROM lie_detector_rounds WHERE group_id = ? ORDER BY id DESC',
        [group_id]
    );
    const lieDetectorRoundsWithTally = await Promise.all(
        lieDetectorRounds.map(async (r: any) => ({ ...r, tally: await getLieDetectorTallyData(r.id) }))
    );

    const [clueRooms] = await query<any>(
        `SELECT cr.*, gc.clue_title, gc.clue_short_description, gc.clue_detail, gc.clue_image
            FROM clue_rooms cr
            JOIN game_clues gc ON gc.id = cr.clue_id
            WHERE cr.group_id = ?`,
        [group_id]
    );

    const [witnessPasscards] = await query<any>('SELECT * FROM witness_passcards WHERE group_id = ?', [group_id]);

    const [results] = await query<any>('SELECT * FROM results WHERE group_id = ? ORDER BY id DESC', [group_id]);

    const [accusations] = await query<any>(
        'SELECT participant_session_id FROM group_accusations WHERE group_id = ?',
        [group_id]
    );
    const myAccusationSubmitted = accusations.some((a: any) => String(a.participant_session_id) === String(userSession.id));

    const groupPayload = {
        ...group,
        participant_sessions: sessions.map((s: any) => ({
            ...s,
            participants: { id: s.participant_id, name: s.participant_name, email: s.participant_email },
            game_roles: s.role_id
                ? {
                      id: s.role_id,
                      role_type: s.role_type,
                      character_name: s.character_name,
                      role_image: s.role_image,
                      objective: s.objective,
                  }
                : null,
        })),
        timers,
        questions: hydratedQuestions,
        lie_detector_rounds: lieDetectorRoundsWithTally,
        clue_rooms: clueRooms.map((c: any) => ({
            ...c,
            game_clues: {
                id: c.clue_id,
                title: c.clue_title,
                description: c.clue_short_description,
                detail: c.clue_detail,
                image: c.clue_image,
            },
        })),
        witness_passcards: witnessPasscards,
        results,
        my_accusation_submitted: myAccusationSubmitted,
    };

    return successResponse(res, 'Game state retrieved', {
        group: serializeData(groupPayload),
        my_role: serializeData(
            groupPayload.participant_sessions.find((s: any) => String(s.id) === String(userSession.id))?.game_roles
        ),
        is_investigator: userSession.role_type === 'investigator',
    });
});

/**
 * Investigator Asks a Question
 * Enforces the "Max N questions total" rule (activity-configurable, default 5).
 * Awards +10 points to the Investigator immediately, and starts a per-question
 * response timer so a non-answer auto-skips with a penalty (see timerService.ts).
 */
export const askQuestion = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, participant_id, asked_to_session_id, question_text } = req.body;

    const investigatorSession = await getSessionForParticipant(group_id, participant_id);
    if (!investigatorSession || investigatorSession.role_type !== 'investigator') {
        throw new AppError('Only the Investigator can ask questions', 403);
    }

    const config = await getActivityConfigForGroup(group_id);
    const maxQuestions = Number(config?.max_questions ?? 5);
    const responseSecs = Number(config?.question_response_secs ?? 120);

    const [countRows] = await query<any>('SELECT COUNT(*) as cnt FROM questions WHERE group_id = ?', [group_id]);
    if (Number(countRows?.[0]?.cnt || 0) >= maxQuestions) {
        throw new AppError(`Maximum of ${maxQuestions} questions reached`, 400);
    }

    const question = await withTransaction(async (conn) => {
        const [insertResult] = await conn.query<any>(
            `INSERT INTO questions (group_id, asked_by, asked_to, question_text, points_awarded, created_at, updated_at)
                VALUES (?, ?, ?, ?, 10, NOW(), NOW())`,
            [group_id, investigatorSession.id, asked_to_session_id, question_text]
        );
        const questionId = insertResult.insertId;

        await conn.query(`UPDATE participant_sessions SET total_score = total_score + 10 WHERE id = ?`, [
            investigatorSession.id,
        ]);

        await conn.query(
            `INSERT INTO timers (group_id, timer_type, reference_id, expires_at, is_active, created_at, updated_at)
                VALUES (?, 'question_response', ?, ?, 1, NOW(), NOW())`,
            [group_id, questionId, moment().add(responseSecs, 'seconds').toDate()]
        );

        const [rows] = await conn.query<any[]>(`SELECT * FROM questions WHERE id = ? LIMIT 1`, [questionId]);
        return rows?.[0];
    });

    io.to(`group_${group_id}`).emit('new_question', serializeData(question));

    return successResponse(res, 'Question asked successfully', serializeData(question));
});

/**
 * Participant Answers a Question
 * Enforces the response-timer rule (activity-configurable, default 2 minutes).
 * Deducts the configured no-response penalty if the answer is late.
 */
export const answerQuestion = asyncHandler(async (req: Request, res: Response) => {
    const { question_id, participant_id, answer_text } = req.body;

    const [questions] = await query<any>('SELECT * FROM questions WHERE id = ? LIMIT 1', [question_id]);
    const question = questions?.[0];
    if (!question) throw new AppError('Question not found', 404);

    const participantSession = await getSessionForParticipant(question.group_id, participant_id);
    if (!participantSession || participantSession.id !== question.asked_to) {
        throw new AppError('You are not the one asked this question', 403);
    }

    const [existingAnswers] = await query<any>('SELECT id FROM answers WHERE question_id = ? LIMIT 1', [question_id]);
    if (existingAnswers?.[0]) throw new AppError('Already answered', 400);

    const config = await getActivityConfigForGroup(question.group_id);
    const responseSecs = Number(config?.question_response_secs ?? 120);
    const noResponsePenalty = Math.abs(Number(config?.no_response_penalty ?? -10));

    const now = moment();
    const lateBySecs = now.diff(moment(question.created_at), 'seconds');
    const penalty = lateBySecs > responseSecs ? noResponsePenalty : 0;

    const answer = await withTransaction(async (conn) => {
        await conn.query(
            `INSERT INTO answers (question_id, participant_session_id, answer_text, penalty_applied, answered_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [question_id, participantSession.id, answer_text, penalty, now.toDate()]
        );

        if (penalty > 0) {
            await conn.query(`UPDATE participant_sessions SET total_score = total_score - ? WHERE id = ?`, [
                penalty,
                participantSession.id,
            ]);
        }

        // The answer arrived — defuse the timeout timer so it doesn't also fire.
        await conn.query(
            `UPDATE timers SET is_active = 0 WHERE group_id = ? AND timer_type = 'question_response' AND reference_id = ?`,
            [question.group_id, question_id]
        );

        const [rows] = await conn.query<any[]>(`SELECT * FROM answers WHERE question_id = ? ORDER BY id DESC LIMIT 1`, [
            question_id,
        ]);
        return rows?.[0];
    });

    io.to(`group_${question.group_id}`).emit('new_answer', serializeData(answer));

    return successResponse(res, 'Answered successfully', serializeData(answer));
});

/**
 * Submit Final Accusation
 * Any non-culprit role (Investigator, Suspect, Witness, Participant) may submit
 * exactly one accusation. Once all eligible roles have submitted (or the
 * questioning timer independently expires), the verdict is finalized and scored —
 * see verdictScoringService.finalizeVerdict.
 */
export const submitAccusation = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, participant_id, accused_session_id, reasoning } = req.body;

    const session = await getSessionForParticipant(group_id, participant_id);
    if (!session) throw new AppError('Session not found', 404);

    const result = await submitAccusationService(group_id, session.id, accused_session_id, reasoning);

    return successResponse(res, 'Accusation submitted', result);
});

/**
 * Start Lie Detector Round
 * Investigator-only, once per game.
 */
export const startLieDetector = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, participant_id, suspect_session_id } = req.body;

    const investigatorSession = await getSessionForParticipant(group_id, participant_id);
    if (!investigatorSession || investigatorSession.role_type !== 'investigator') {
        throw new AppError('Only the Investigator can start the lie detector', 403);
    }

    const [usedRows] = await query<any>(
        `SELECT id FROM score_logs WHERE participant_session_id = ? AND reason = 'lie_detector_used' LIMIT 1`,
        [investigatorSession.id]
    );
    if (usedRows?.[0]) throw new AppError('The Lie Detector can only be used once per game', 400);

    const config = await getActivityConfigForGroup(group_id);
    const timerSecs = Number(config?.lie_detector_timer_secs ?? 420);

    const round = await withTransaction(async (conn) => {
        const [insertResult] = await conn.query<any>(
            `INSERT INTO lie_detector_rounds (group_id, suspect_id, status, created_at, updated_at)
                VALUES (?, ?, 'active', NOW(), NOW())`,
            [group_id, suspect_session_id]
        );
        const roundId = insertResult.insertId;

        await conn.query(
            `INSERT INTO timers (group_id, timer_type, reference_id, expires_at, is_active, created_at, updated_at)
                VALUES (?, 'lie_detector', ?, ?, 1, NOW(), NOW())`,
            [group_id, roundId, moment().add(timerSecs, 'seconds').toDate()]
        );

        await conn.query(
            `INSERT INTO score_logs (participant_session_id, points, reason, created_at, updated_at)
                VALUES (?, 0, 'lie_detector_used', NOW(), NOW())`,
            [investigatorSession.id]
        );

        const [rows] = await conn.query<any[]>(`SELECT * FROM lie_detector_rounds WHERE id = ? LIMIT 1`, [roundId]);
        return rows?.[0];
    });

    io.to(`group_${group_id}`).emit('lie_detector_started', serializeData(round));

    return successResponse(res, 'Lie detector round started', serializeData(round));
});

/**
 * Vote in Lie Detector — one vote per participant per answer, tallied in real time.
 */
export const voteLieDetector = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, participant_id, round_id, vote_value } = req.body;

    const session = await getSessionForParticipant(group_id, participant_id);
    if (!session) throw new AppError('Session not found', 404);

    try {
        await query(
            `INSERT INTO votes (group_id, voter_id, reference_id, reference_type, vote_value, created_at, updated_at)
                VALUES (?, ?, ?, 'lie_detector', ?, NOW(), NOW())`,
            [group_id, session.id, round_id, vote_value]
        );
    } catch (err: any) {
        if (err?.code === 'ER_DUP_ENTRY') {
            throw new AppError('You have already voted on this answer', 400);
        }
        throw err;
    }

    const tally = await getLieDetectorTallyData(round_id);
    io.to(`group_${group_id}`).emit('new_vote', { round_id, tally });

    return successResponse(res, 'Vote cast successfully', tally);
});

export const getLieDetectorTally = asyncHandler(async (req: Request, res: Response) => {
    const { round_id } = req.params;
    const tally = await getLieDetectorTallyData(round_id);
    return successResponse(res, 'Tally retrieved', tally);
});

/**
 * Ends the active Lie Detector round (Investigator-only) and transitions the group
 * back to the normal questioning phase. Also triggered automatically by
 * timerService.ts when the round's timer expires.
 */
export const endLieDetectorRound = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, participant_id, round_id } = req.body;

    const investigatorSession = await getSessionForParticipant(group_id, participant_id);
    if (!investigatorSession || investigatorSession.role_type !== 'investigator') {
        throw new AppError('Only the Investigator can end the lie detector round', 403);
    }

    await query(`UPDATE lie_detector_rounds SET status = 'completed' WHERE id = ?`, [round_id]);
    await query(`UPDATE timers SET is_active = 0 WHERE group_id = ? AND timer_type = 'lie_detector'`, [group_id]);

    io.to(`group_${group_id}`).emit('phase_changed', {
        new_phase: 'questioning',
        message: 'Lie Detector round has ended.',
    });

    return successResponse(res, 'Lie detector round ended');
});

/**
 * Use Witness Passcard
 */
export const useWitnessPasscard = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, participant_id } = req.body;

    const witnessSession = await getSessionForParticipant(group_id, participant_id);
    if (!witnessSession || witnessSession.role_type !== 'witness') {
        throw new AppError('Only the Witness can use the passcard', 403);
    }

    const [existingPasscards] = await query<any>(
        'SELECT * FROM witness_passcards WHERE group_id = ? AND participant_session_id = ? LIMIT 1',
        [group_id, witnessSession.id]
    );
    const existingPasscard = existingPasscards?.[0];

    if (existingPasscard && existingPasscard.is_used) {
        throw new AppError('Passcard already used', 400);
    }

    const passcard = await withTransaction(async (conn) => {
        if (existingPasscard?.id) {
            await conn.query('UPDATE witness_passcards SET is_used = 1, used_at = ? WHERE id = ?', [
                new Date(),
                existingPasscard.id,
            ]);
        } else {
            await conn.query(
                `INSERT INTO witness_passcards (group_id, participant_session_id, is_used, used_at, created_at, updated_at)
                    VALUES (?, ?, 1, ?, NOW(), NOW())`,
                [group_id, witnessSession.id, new Date()]
            );
        }
        const [rows] = await conn.query<any[]>(
            'SELECT * FROM witness_passcards WHERE group_id = ? AND participant_session_id = ? LIMIT 1',
            [group_id, witnessSession.id]
        );
        return rows?.[0];
    });

    const [investigatorSessions] = await query<any>(
        `SELECT ps.* FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ? AND gr.role_type = 'investigator'
            LIMIT 1`,
        [group_id]
    );
    const investigatorSession = investigatorSessions?.[0];

    if (investigatorSession && investigatorSession.socket_id) {
        io.to(investigatorSession.socket_id).emit('witness_passcard_used', {
            message: 'The Witness has used their secret passcard!',
        });
    }

    return successResponse(res, 'Passcard used successfully', serializeData(passcard));
});

/**
 * Reopen Case Summary — Investigator-only, once per game.
 */
export const reopenCaseSummary = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, participant_id } = req.body;

    const investigatorSession = await getSessionForParticipant(group_id, participant_id);
    if (!investigatorSession || investigatorSession.role_type !== 'investigator') {
        throw new AppError('Only the Investigator can reopen the case summary', 403);
    }

    const [groups] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [group_id]);
    if (!groups?.[0]) throw new AppError('Group not found', 404);

    const [reopenLogs] = await query<any>(
        `SELECT id FROM score_logs WHERE participant_session_id = ? AND reason = 'reopen_case_summary' LIMIT 1`,
        [investigatorSession.id]
    );
    if (reopenLogs?.[0]) throw new AppError('You can only reopen the case summary once', 400);

    await withTransaction(async (conn) => {
        await conn.query(
            `INSERT INTO timers (group_id, timer_type, expires_at, is_active, created_at, updated_at)
                VALUES (?, 'case_summary', ?, 1, NOW(), NOW())`,
            [group_id, moment().add(5, 'minutes').toDate()]
        );

        await conn.query(
            `INSERT INTO score_logs (participant_session_id, points, reason, created_at, updated_at)
                VALUES (?, 0, 'reopen_case_summary', NOW(), NOW())`,
            [investigatorSession.id]
        );
    });

    io.to(`group_${group_id}`).emit('case_summary_reopened', {
        message: 'Investigator has reopened the case summary for 5 more minutes!',
    });

    return successResponse(res, 'Case summary reopened successfully');
});
