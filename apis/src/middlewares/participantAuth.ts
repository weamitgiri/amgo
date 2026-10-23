import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { errorResponse } from '../utils/apiResponse';

/**
 * Participant session guard for the public game APIs.
 *
 * Participants have no JWT; their credential is the server-issued `join_token`
 * (a 64-hex secret, unique in game_participants) handed back by verify-otp and
 * kept client-side. Before this guard, every game action trusted the
 * `participant_id` in the request body/query, so anyone could act as — or read
 * the private state of — any player just by sending a different number.
 *
 * The guard resolves the caller from the token alone and then refuses any
 * request whose supplied `participant_id` or route `group_id` does not belong to
 * that verified participant. The identity used downstream is therefore always
 * the one proven by the token, never a client-supplied id.
 *
 * It intentionally does NOT guard: the organizer/admin routes (JWT-authed), the
 * results PDF link (opened as a plain <a> that cannot carry a header — see the
 * note in resultsRoutes), and the dev-only phase-skip endpoint.
 */
export const participantAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.get('x-participant-token');

    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
        return errorResponse(res, 'Participant session required', [], 401);
    }

    let rows: any[];
    try {
        [rows] = await query(
            `SELECT id, booking_id, group_id, status
             FROM game_participants
             WHERE join_token = ? AND email_verified_at IS NOT NULL
             LIMIT 1`,
            [token]
        );
    } catch (err) {
        return next(err);
    }

    if (rows.length === 0) {
        return errorResponse(res, 'Invalid or expired participant session', [], 401);
    }

    const participant = rows[0] as { id: number; booking_id: number; group_id: number | null; status: string };

    // A forged participant_id — the caller claims to be someone else.
    const claimedId = req.body?.participant_id ?? req.query?.participant_id;
    if (claimedId != null && String(claimedId) !== String(participant.id)) {
        return errorResponse(res, 'Participant identity mismatch', [], 403);
    }

    // A forged group in the route — the caller is acting on a group that is not
    // their own. (Legitimate cross-group references, e.g. rating another team's
    // dish, travel in the body as rated_group_id, never as the route group_id.)
    const routeGroupId = req.params?.group_id;
    if (
        routeGroupId != null &&
        participant.group_id != null &&
        String(routeGroupId) !== String(participant.group_id)
    ) {
        return errorResponse(res, 'This group does not belong to your session', [], 403);
    }

    // Hand the verified identity to the controllers. Any participant_id they read
    // from the request has already been checked to equal this id, so a forged one
    // can never reach them.
    (req as any).participant = participant;

    return next();
};
