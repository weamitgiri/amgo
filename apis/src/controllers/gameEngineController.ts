/**
 * Game Engine Controller
 * 
 * Core logic for the Detective Mystery game mechanics.
 * Handles phase-specific actions:
 * 1. Questioning Phase (Investigator vs Suspects).
 * 2. Lie Detector Phase (Voting and Truth-seeking).
 * 3. Case Summary management (Investigator's reopen power).
 * 4. Final Verdict and Result Logic (Winning condition calculation).
 */

import { Request, Response } from 'express';
import { successResponse } from '../utils/apiResponse';
import { query, withTransaction } from '../config/db';
import { serializeData } from '../utils/serializer';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { io } from '../server';
import moment from 'moment';

/**
 * Get Current Game State
 * Hydrates the frontend with all group data, timers, and active questions.
 */
export const getGameState = asyncHandler(async (req: Request, res: Response) => {
    const participantId = (req as any).user.id;
    const { group_id } = req.params;

    const [groups] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [group_id]);
    const group = groups?.[0];
    if (!group) throw new AppError('Group not found', 404);

    const [sessions] = await query<any>(
        `SELECT ps.*, p.name as participant_name, p.email as participant_email,
                gr.role_name, gr.role_icon, gr.role_image, gr.role_description, gr.objective
            FROM participant_sessions ps
            JOIN game_participants p ON p.id = ps.participant_id
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ?`,
        [group_id]
    );

    const userSession = sessions.find((s: any) => String(s.participant_id) === String(participantId));
    if (!userSession) throw new AppError('You are not part of this group', 403);

    const [timers] = await query<any>(
        'SELECT * FROM timers WHERE group_id = ? AND is_active = 1',
        [group_id]
    );

    const [questions] = await query<any>(
        'SELECT * FROM questions WHERE group_id = ? ORDER BY id ASC',
        [group_id]
    );
    const [answers] = await query<any>(
        `SELECT a.* FROM answers a
            JOIN questions q ON q.id = a.question_id
            WHERE q.group_id = ?`,
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

    const [clueRooms] = await query<any>(
        `SELECT cr.*, gc.title as clue_title, gc.description as clue_description, gc.reveal_after_minutes
            FROM clue_rooms cr
            JOIN game_clues gc ON gc.id = cr.clue_id
            WHERE cr.group_id = ?`,
        [group_id]
    );

    const [witnessPasscards] = await query<any>(
        'SELECT * FROM witness_passcards WHERE group_id = ?',
        [group_id]
    );

    const [results] = await query<any>(
        'SELECT * FROM results WHERE group_id = ? ORDER BY id DESC',
        [group_id]
    );

    const groupPayload = {
        ...group,
        participant_sessions: sessions.map((s: any) => ({
            ...s,
            participants: {
                id: s.participant_id,
                name: s.participant_name,
                email: s.participant_email,
            },
            game_roles: s.role_id
                ? {
                        id: s.role_id,
                        role_name: s.role_name,
                        role_icon: s.role_icon,
                        role_image: s.role_image,
                        role_description: s.role_description,
                        objective: s.objective,
                    }
                : null,
        })),
        timers,
        questions: hydratedQuestions,
        lie_detector_rounds: lieDetectorRounds,
        clue_rooms: clueRooms.map((c: any) => ({
            ...c,
            game_clues: {
                id: c.clue_id,
                title: c.clue_title,
                description: c.clue_description,
                reveal_after_minutes: c.reveal_after_minutes,
            },
        })),
        witness_passcards: witnessPasscards,
        results: results,
    };

    return successResponse(res, 'Game state retrieved', {
        group: serializeData(groupPayload),
        my_role: serializeData(groupPayload.participant_sessions.find((s: any) => String(s.id) === String(userSession.id))?.game_roles),
        is_investigator: (userSession.role_name || '').toLowerCase().includes('investigator')
    });
});

/**
 * Investigator Asks a Question
 * Enforces the "Max 5 questions total" rule.
 * Awards +10 points to the Investigator immediately.
 */
export const askQuestion = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, asked_to_session_id, question_text } = req.body;
    const participantId = (req as any).user.id;

    const [investigatorSessions] = await query<any>(
        `SELECT ps.* FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ? AND ps.participant_id = ? AND gr.role_name LIKE '%Investigator%'
            LIMIT 1`,
        [group_id, participantId]
    );
    const investigatorSession = investigatorSessions?.[0];

    if (!investigatorSession) throw new AppError('Only the Investigator can ask questions', 403);

    // Requirement: Investigator can ask max 5 questions TOTAL
    const [countRows] = await query<any>('SELECT COUNT(*) as cnt FROM questions WHERE group_id = ?', [group_id]);
    const questionCount = Number(countRows?.[0]?.cnt || 0);

    if (questionCount >= 5) throw new AppError('Maximum of 5 questions reached', 400);

    const question = await withTransaction(async (conn) => {
        await conn.query(
            `INSERT INTO questions (group_id, asked_by, asked_to, question_text, points_awarded, created_at, updated_at)
                VALUES (?, ?, ?, ?, 10, NOW(), NOW())`,
            [group_id, investigatorSession.id, asked_to_session_id, question_text]
        );

        await conn.query(
            `UPDATE participant_sessions SET total_score = total_score + 10 WHERE id = ?`,
            [investigatorSession.id]
        );

        const [rows] = await conn.query<any[]>(
            `SELECT * FROM questions WHERE group_id = ? ORDER BY id DESC LIMIT 1`,
            [group_id]
        );
        return rows?.[0];
    });

    // Real-time broadcast to all group members
    io.to(`group_${group_id}`).emit('new_question', serializeData(question));

    return successResponse(res, 'Question asked successfully', serializeData(question));
});

/**
 * Participant Answers a Question
 * Enforces the "2 minute answer timer" rule.
 * Deducts -10 points if the suspect is late.
 */
export const answerQuestion = asyncHandler(async (req: Request, res: Response) => {
    const { question_id, answer_text } = req.body;
    const participantId = (req as any).user.id;

    const [questions] = await query<any>('SELECT * FROM questions WHERE id = ? LIMIT 1', [question_id]);
    const question = questions?.[0];

    if (!question) throw new AppError('Question not found', 404);

    const [participantSessions] = await query<any>(
        'SELECT * FROM participant_sessions WHERE group_id = ? AND participant_id = ? LIMIT 1',
        [question.group_id, participantId]
    );
    const participantSession = participantSessions?.[0];

    // Security check: Only the targeted suspect can answer
    if (!participantSession || participantSession.id !== question.asked_to) {
        throw new AppError('You are not the one asked this question', 403);
    }

    const [existingAnswers] = await query<any>(
        'SELECT id FROM answers WHERE question_id = ? LIMIT 1',
        [question_id]
    );
    const existingAnswer = existingAnswers?.[0];
    if (existingAnswer) throw new AppError('Already answered', 400);

    // Timer check: Penalty if answered after 2 minutes
    const questionCreatedAt = moment(question.created_at);
    const now = moment();
    const duration = moment.duration(now.diff(questionCreatedAt)).asMinutes();
    
    let penalty = 0;
    if (duration > 2) {
        penalty = 10; 
    }

    const answer = await withTransaction(async (conn) => {
        await conn.query(
            `INSERT INTO answers (question_id, participant_session_id, answer_text, penalty_applied, answered_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [question_id, participantSession.id, answer_text, penalty, now.toDate()]
        );

        if (penalty > 0) {
            await conn.query(
                `UPDATE participant_sessions SET total_score = total_score - ? WHERE id = ?`,
                [penalty, participantSession.id]
            );
        }

        const [rows] = await conn.query<any[]>(
            `SELECT * FROM answers WHERE question_id = ? ORDER BY id DESC LIMIT 1`,
            [question_id]
        );
        return rows?.[0];
    });

    io.to(`group_${question.group_id}`).emit('new_answer', serializeData(answer));

    return successResponse(res, 'Answered successfully', serializeData(answer));
});

/**
 * Final Submission by Investigator
 */
export const submitFinalVerdict = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, identified_culprit_session_id, reasoning } = req.body;
    const participantId = (req as any).user.id;

    const [investigatorSessions] = await query<any>(
        `SELECT ps.* FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ? AND ps.participant_id = ? AND gr.role_name LIKE '%Investigator%'
            LIMIT 1`,
        [group_id, participantId]
    );
    const investigatorSession = investigatorSessions?.[0];

    if (!investigatorSession) throw new AppError('Only the Investigator can submit the final verdict', 403);

    const [culpritSessions] = await query<any>(
        `SELECT ps.*, gr.role_name FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.id = ? LIMIT 1`,
        [identified_culprit_session_id]
    );
    const culpritSession = culpritSessions?.[0];

    if (!culpritSession) throw new AppError('Culprit session not found', 404);

    const isCorrect = (culpritSession.role_name || '').toLowerCase().includes('culprit');

    const [allSessions] = await query<any>(
        `SELECT ps.id, gr.role_name FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ?`,
        [group_id]
    );

    const winners: string[] = [];
    if (isCorrect) {
        allSessions.forEach(s => {
            const role = (s.role_name || '').toLowerCase();
            if (role.includes('investigator') || role.includes('witness') || role.includes('participant')) {
                winners.push(s.id.toString());
            }
        });
    } else {
        allSessions.forEach(s => {
            const role = (s.role_name || '').toLowerCase();
            if (role.includes('culprit') || role.includes('suspect')) {
                winners.push(s.id.toString());
            }
        });
    }

    const result = await withTransaction(async (conn) => {
        await conn.query(
            `INSERT INTO results (group_id, identified_culprit_id, investigator_reasoning, is_correct, winner_ids, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [group_id, identified_culprit_session_id, reasoning, isCorrect ? 1 : 0, JSON.stringify(winners)]
        );

        await conn.query(
            `UPDATE game_groups SET status = 'completed', completed_at = NOW() WHERE id = ?`,
            [group_id]
        );

        const [rows] = await conn.query<any[]>(
            `SELECT * FROM results WHERE group_id = ? ORDER BY id DESC LIMIT 1`,
            [group_id]
        );
        return rows?.[0];
    });

    io.to(`group_${group_id}`).emit('game_ended', serializeData(result));

    return successResponse(res, 'Final verdict submitted', serializeData(result));
});

/**
 * Start Lie Detector Round
 */
export const startLieDetector = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, suspect_session_id } = req.body;
    const participantId = (req as any).user.id;

    const [investigatorSessions] = await query<any>(
        `SELECT ps.* FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ? AND ps.participant_id = ? AND gr.role_name LIKE '%Investigator%'
            LIMIT 1`,
        [group_id, participantId]
    );
    const investigatorSession = investigatorSessions?.[0];

    if (!investigatorSession) throw new AppError('Only the Investigator can start the lie detector', 403);

    const round = await withTransaction(async (conn) => {
        await conn.query(
            `INSERT INTO lie_detector_rounds (group_id, suspect_id, status, created_at, updated_at)
                VALUES (?, ?, 'active', NOW(), NOW())`,
            [group_id, suspect_session_id]
        );

        await conn.query(
            `INSERT INTO timers (group_id, timer_type, expires_at, is_active, created_at, updated_at)
                VALUES (?, 'lie_detector', ?, 1, NOW(), NOW())`,
            [group_id, moment().add(7, 'minutes').toDate()]
        );

        const [rows] = await conn.query<any[]>(
            `SELECT * FROM lie_detector_rounds WHERE group_id = ? ORDER BY id DESC LIMIT 1`,
            [group_id]
        );
        return rows?.[0];
    });

    io.to(`group_${group_id}`).emit('lie_detector_started', serializeData(round));

    return successResponse(res, 'Lie detector round started', serializeData(round));
});

/**
 * Vote in Lie Detector
 */
export const voteLieDetector = asyncHandler(async (req: Request, res: Response) => {
    const { group_id, round_id, vote_value } = req.body; 
    const participantId = (req as any).user.id;

    const [sessions] = await query<any>(
        'SELECT * FROM participant_sessions WHERE group_id = ? AND participant_id = ? LIMIT 1',
        [group_id, participantId]
    );
    const session = sessions?.[0];

    if (!session) throw new AppError('Session not found', 404);

    const vote = await withTransaction(async (conn) => {
        await conn.query(
            `INSERT INTO votes (group_id, voter_id, reference_id, reference_type, vote_value, created_at, updated_at)
                VALUES (?, ?, ?, 'lie_detector', ?, NOW(), NOW())`,
            [group_id, session.id, round_id, vote_value]
        );
        const [rows] = await conn.query<any[]>(
            `SELECT * FROM votes WHERE group_id = ? AND voter_id = ? ORDER BY id DESC LIMIT 1`,
            [group_id, session.id]
        );
        return rows?.[0];
    });

    io.to(`group_${group_id}`).emit('new_vote', {
        round_id,
        vote_count_update: true
    });

    return successResponse(res, 'Vote cast successfully', serializeData(vote));
});

/**
 * Use Witness Passcard
 */
export const useWitnessPasscard = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.body;
    const participantId = (req as any).user.id;

    const [witnessSessions] = await query<any>(
        `SELECT ps.*, gr.role_name FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ? AND ps.participant_id = ? AND gr.role_name LIKE '%Witness%'
            LIMIT 1`,
        [group_id, participantId]
    );
    const witnessSession = witnessSessions?.[0];

    if (!witnessSession) throw new AppError('Only the Witness can use the passcard', 403);

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
            await conn.query(
                'UPDATE witness_passcards SET is_used = 1, used_at = ? WHERE id = ?',
                [new Date(), existingPasscard.id]
            );
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
            WHERE ps.group_id = ? AND gr.role_name LIKE '%Investigator%'
            LIMIT 1`,
        [group_id]
    );
    const investigatorSession = investigatorSessions?.[0];

    if (investigatorSession && investigatorSession.socket_id) {
        io.to(investigatorSession.socket_id).emit('witness_passcard_used', {
            message: 'The Witness has used their secret passcard!'
        });
    }

    return successResponse(res, 'Passcard used successfully', serializeData(passcard));
});

/**
 * Reopen Case Summary
 */
export const reopenCaseSummary = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.body;
    const participantId = (req as any).user.id;

    const [investigatorSessions] = await query<any>(
        `SELECT ps.*, gr.role_name FROM participant_sessions ps
            LEFT JOIN game_roles gr ON gr.id = ps.role_id
            WHERE ps.group_id = ? AND ps.participant_id = ? AND gr.role_name LIKE '%Investigator%'
            LIMIT 1`,
        [group_id, participantId]
    );
    const investigatorSession = investigatorSessions?.[0];

    if (!investigatorSession) throw new AppError('Only the Investigator can reopen the case summary', 403);

    const [groups] = await query<any>('SELECT * FROM game_groups WHERE id = ? LIMIT 1', [group_id]);
    const group = groups?.[0];

    if (!group) throw new AppError('Group not found', 404);

    const [reopenLogs] = await query<any>(
        `SELECT id FROM score_logs WHERE participant_session_id = ? AND reason = 'reopen_case_summary' LIMIT 1`,
        [investigatorSession.id]
    );
    const reopenLog = reopenLogs?.[0];

    if (reopenLog) throw new AppError('You can only reopen the case summary once', 400);

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
        message: 'Investigator has reopened the case summary for 5 more minutes!'
    });

    return successResponse(res, 'Case summary reopened successfully');
});
