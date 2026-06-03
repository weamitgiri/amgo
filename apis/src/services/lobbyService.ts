import moment, { Moment } from 'moment';
import { query } from '../config/db';

export type LobbyMember = {
    id: number;
    name: string;
    status: string;
    is_you: boolean;
};

export type LobbyPhase = 'before_start' | 'waiting_members' | 'lobby_timer' | 'ready';

export type LobbyPayload = {
    group_id: number;
    group_name: string;
    group_status: string;
    booking_id: number;
    invitation_link: string | null;
    activity: {
        id: number;
        title: string;
        slug: string;
        description: string | null;
        cover_image: string | null;
        icon: string | null;
    };
    game: {
        id: number | null;
        title: string | null;
        tagline: string | null;
        case_summary: string | null;
    };
    rules: { id: number; rule_text: string; order: number }[];
    settings: {
        group_size: number;
        lobby_wait_secs: number;
        game_duration_secs: number;
        max_questions: number;
        question_response_secs: number;
        clue_room_unlock_secs: number;
        lie_detector_enabled: boolean;
        lie_detector_timer_secs: number;
    };
    members: LobbyMember[];
    member_count: number;
    group_capacity: number;
    remaining_slots: number;
    is_group_full: boolean;
    scheduled_start_at: string | null;
    scheduled_start_label: string | null;
    game_redirect_at: string | null;
    lobby_phase: LobbyPhase;
    lobby_countdown_seconds: number | null;
    game_starts_at: string | null;
    can_start_game: boolean;
    status_message: string;
};

export function parseBookingSchedule(scheduled_date: unknown, scheduled_time: unknown): Moment | null {
    if (!scheduled_date || !scheduled_time) return null;

    const scheduledDate = moment(scheduled_date as string).isValid()
        ? moment(scheduled_date as string).format('YYYY-MM-DD')
        : String(scheduled_date).split('T')[0];

    const timeMoment = moment(scheduled_time as string, ['HH:mm:ss', 'HH:mm', moment.ISO_8601], true);
    const scheduledTime = timeMoment.isValid()
        ? timeMoment.format('HH:mm:ss')
        : String(scheduled_time);

    const scheduleStart = moment(`${scheduledDate} ${scheduledTime}`, 'YYYY-MM-DD HH:mm:ss', true);
    return scheduleStart.isValid() ? scheduleStart : null;
}

function formatScheduleLabel(scheduleStart: Moment): string {
    return scheduleStart.format('D MMMM YYYY, h:mm A');
}

export async function buildLobbyPayload(
    groupId: number | string,
    currentParticipantId?: number | string | null
): Promise<LobbyPayload | null> {
    const [groupRows] = await query(
        `SELECT gg.id, gg.group_name, gg.status AS group_status, gg.booking_id,
            ob.invitation_link, ob.game_id, ob.scheduled_date, ob.scheduled_time,
            a.id AS activity_id, a.title AS activity_title, a.slug AS activity_slug,
            a.description AS activity_description, a.cover_image, a.icon,
            a.lobby_wait_secs, a.game_duration_secs, a.group_size, a.max_questions,
            a.question_response_secs, a.clue_room_unlock_secs,
            a.lie_detector_enabled, a.lie_detector_timer_secs,
            ag.id AS game_row_id, ag.title AS case_title, ag.tagline, ag.case_summary
         FROM game_groups gg
         JOIN organizer_bookings ob ON gg.booking_id = ob.id
         JOIN activities a ON ob.activity_id = a.id
         LEFT JOIN activity_games ag ON ob.game_id = ag.id
         WHERE gg.id = ?`,
        [groupId]
    );

    if (groupRows.length === 0) return null;

    const row = groupRows[0];
    const groupSize = Number(row.group_size) || 5;
    const lobbyWaitSecs = Number(row.lobby_wait_secs) || 900;
    const lobbyWaitMins = Math.round(lobbyWaitSecs / 60);

    const [members] = await query(
        `SELECT id, name, status, COALESCE(email_verified_at, created_at) AS joined_at
         FROM game_participants WHERE group_id = ? ORDER BY joined_at ASC`,
        [groupId]
    );

    const memberList: LobbyMember[] = members.map((m: any) => ({
        id: m.id,
        name: m.name || 'Participant',
        status: m.status || 'joined',
        is_you: currentParticipantId != null && String(m.id) === String(currentParticipantId),
    }));

    const memberCount = memberList.length;
    const isGroupFull = memberCount >= groupSize;
    const now = moment();
    const scheduleStart = parseBookingSchedule(row.scheduled_date, row.scheduled_time);
    const scheduledStartLabel = scheduleStart ? formatScheduleLabel(scheduleStart) : null;
    const gameRedirectAt = scheduleStart ? scheduleStart.clone().add(lobbyWaitSecs, 'seconds') : null;

    let lobbyPhase: LobbyPhase = 'before_start';
    let lobbyCountdownSeconds: number | null = null;
    let gameStartsAt: string | null = null;
    let canStartGame = false;
    let statusMessage = '';

    if (!scheduleStart || !gameRedirectAt) {
        statusMessage = 'Event schedule is not set. Please contact your organizer.';
    } else if (now.isBefore(scheduleStart)) {
        lobbyPhase = 'before_start';
        statusMessage = `This activity has not started yet. The scheduled start is ${scheduledStartLabel}.`;
    } else if (!isGroupFull) {
        lobbyPhase = 'waiting_members';
        const need = groupSize - memberCount;
        statusMessage =
            need === 1
                ? `Waiting for 1 more participant to join via the invite link. Your group needs exactly ${groupSize} members before the ${lobbyWaitMins}-minute lobby timer can begin.`
                : `Waiting for ${need} more participants to join via the invite link. Your group needs exactly ${groupSize} members before the ${lobbyWaitMins}-minute lobby timer can begin.`;
    } else if (now.isBefore(gameRedirectAt)) {
        lobbyPhase = 'lobby_timer';
        gameStartsAt = gameRedirectAt.toISOString();
        lobbyCountdownSeconds = Math.max(0, gameRedirectAt.diff(now, 'seconds'));
        statusMessage = `The activity started at ${scheduledStartLabel}. The game will begin in ${lobbyWaitMins} minutes from the scheduled start time.`;
    } else {
        lobbyPhase = 'ready';
        gameStartsAt = gameRedirectAt.toISOString();
        lobbyCountdownSeconds = 0;
        canStartGame = true;

        if (row.group_status === 'waiting') {
            await query(`UPDATE game_groups SET status = 'active' WHERE id = ? AND status = 'waiting'`, [
                groupId,
            ]);
            row.group_status = 'active';
        }

        statusMessage = 'Your group is ready. Starting the game…';
    }

    const [rules] = row.game_row_id
        ? await query(
              'SELECT id, rule_text, `order` FROM game_rules WHERE game_id = ? ORDER BY `order` ASC',
              [row.game_row_id]
          )
        : [[]];

    return {
        group_id: Number(row.id),
        group_name: row.group_name,
        group_status: row.group_status,
        booking_id: Number(row.booking_id),
        invitation_link: row.invitation_link,
        activity: {
            id: Number(row.activity_id),
            title: row.activity_title,
            slug: row.activity_slug,
            description: row.activity_description,
            cover_image: row.cover_image,
            icon: row.icon,
        },
        game: {
            id: row.game_row_id ? Number(row.game_row_id) : null,
            title: row.case_title,
            tagline: row.tagline,
            case_summary: row.case_summary,
        },
        rules: rules.map((r: any) => ({
            id: r.id,
            rule_text: r.rule_text,
            order: r.order,
        })),
        settings: {
            group_size: groupSize,
            lobby_wait_secs: lobbyWaitSecs,
            game_duration_secs: Number(row.game_duration_secs) || 1200,
            max_questions: Number(row.max_questions) || 5,
            question_response_secs: Number(row.question_response_secs) || 120,
            clue_room_unlock_secs: Number(row.clue_room_unlock_secs) || 600,
            lie_detector_enabled: Boolean(row.lie_detector_enabled),
            lie_detector_timer_secs: Number(row.lie_detector_timer_secs) || 420,
        },
        members: memberList,
        member_count: memberCount,
        group_capacity: groupSize,
        remaining_slots: Math.max(0, groupSize - memberCount),
        is_group_full: isGroupFull,
        scheduled_start_at: scheduleStart?.toISOString() ?? null,
        scheduled_start_label: scheduledStartLabel,
        game_redirect_at: gameRedirectAt?.toISOString() ?? null,
        lobby_phase: lobbyPhase,
        lobby_countdown_seconds: lobbyPhase === 'lobby_timer' ? lobbyCountdownSeconds : null,
        game_starts_at: gameStartsAt,
        can_start_game: canStartGame,
        status_message: statusMessage,
    };
}

export async function emitLobbyUpdate(io: any, groupId: number | string) {
    if (!io) return;
    const payload = await buildLobbyPayload(groupId);
    if (!payload) return;
    io.to(`group_${groupId}`).emit('lobby_updated', payload);
}
