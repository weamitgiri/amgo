"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBookingSchedule = parseBookingSchedule;
exports.buildLobbyPayload = buildLobbyPayload;
exports.emitLobbyUpdate = emitLobbyUpdate;
const moment_1 = __importDefault(require("moment"));
const db_1 = require("../config/db");
const pseudonym_1 = require("../utils/pseudonym");
const timerService_1 = require("./timerService");
function parseBookingSchedule(scheduled_date, scheduled_time) {
    if (!scheduled_date || !scheduled_time)
        return null;
    const scheduledDate = (0, moment_1.default)(scheduled_date).isValid()
        ? (0, moment_1.default)(scheduled_date).format('YYYY-MM-DD')
        : String(scheduled_date).split('T')[0];
    const timeMoment = (0, moment_1.default)(scheduled_time, ['HH:mm:ss', 'HH:mm', moment_1.default.ISO_8601], true);
    const scheduledTime = timeMoment.isValid()
        ? timeMoment.format('HH:mm:ss')
        : String(scheduled_time);
    const scheduleStart = (0, moment_1.default)(`${scheduledDate} ${scheduledTime}`, 'YYYY-MM-DD HH:mm:ss', true);
    return scheduleStart.isValid() ? scheduleStart : null;
}
function formatScheduleLabel(scheduleStart) {
    return scheduleStart.format('D MMMM YYYY, h:mm A');
}
async function buildLobbyPayload(groupId, currentParticipantId) {
    const [groupRows] = await (0, db_1.query)(`SELECT gg.id, gg.group_name, gg.status AS group_status, gg.booking_id,
            ob.invitation_link, ob.game_id, ob.scheduled_date, ob.scheduled_time,
            a.id AS activity_id, a.title AS activity_title, a.slug AS activity_slug,
            a.description AS activity_description, a.cover_image, a.icon,
            a.lobby_wait_secs, a.game_duration_secs, a.case_summary_view_secs, a.group_size, a.max_questions,
            a.question_response_secs, a.clue_room_unlock_secs,
            a.lie_detector_enabled, a.lie_detector_timer_secs,
            ag.id AS game_row_id, ag.title AS case_title, ag.tagline, ag.case_summary
         FROM game_groups gg
         JOIN organizer_bookings ob ON gg.booking_id = ob.id
         JOIN activities a ON ob.activity_id = a.id
         LEFT JOIN activity_games ag ON ag.id = COALESCE(gg.game_id, ob.game_id)
         WHERE gg.id = ?`, [groupId]);
    if (groupRows.length === 0)
        return null;
    const row = groupRows[0];
    const groupSize = Number(row.group_size) || 5;
    const lobbyWaitSecs = Number(row.lobby_wait_secs) || 900;
    const lobbyWaitMins = Math.round(lobbyWaitSecs / 60);
    const [members] = await (0, db_1.query)(`SELECT id, name, status, COALESCE(email_verified_at, created_at) AS joined_at
         FROM game_participants WHERE group_id = ? ORDER BY joined_at ASC`, [groupId]);
    const memberList = members.map((m) => {
        const isYou = currentParticipantId != null && String(m.id) === String(currentParticipantId);
        const realName = m.name || 'Participant';
        return {
            id: m.id,
            name: isYou ? realName : (0, pseudonym_1.shortName)(realName, Number(m.id)),
            status: m.status || 'joined',
            is_you: isYou,
        };
    });
    const memberCount = memberList.length;
    const isGroupFull = memberCount >= groupSize;
    const now = (0, moment_1.default)();
    const scheduleStart = parseBookingSchedule(row.scheduled_date, row.scheduled_time);
    const scheduledStartLabel = scheduleStart ? formatScheduleLabel(scheduleStart) : null;
    // Entry window / lobby wait is admin-configurable per activity (activities.lobby_wait_secs).
    const gameRedirectAt = scheduleStart ? scheduleStart.clone().add(lobbyWaitSecs, 'seconds') : null;
    let lobbyPhase = 'before_start';
    let lobbyCountdownSeconds = null;
    let gameStartsAt = null;
    let canStartGame = false;
    let statusMessage = '';
    if (!scheduleStart || !gameRedirectAt) {
        statusMessage = 'Event schedule is not set. Please contact your organizer.';
    }
    else if (now.isBefore(scheduleStart)) {
        lobbyPhase = 'before_start';
        statusMessage = `This activity has not started yet. The scheduled start is ${scheduledStartLabel}.`;
    }
    else if (now.isBefore(gameRedirectAt)) {
        lobbyPhase = 'lobby_timer';
        gameStartsAt = gameRedirectAt.toISOString();
        lobbyCountdownSeconds = Math.max(0, gameRedirectAt.diff(now, 'seconds'));
        const remainingSlots = Math.max(0, groupSize - memberCount);
        statusMessage = remainingSlots > 0
            ? `The activity started at ${scheduledStartLabel}. You can still join until the ${lobbyWaitMins}-minute entry window closes. ${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} remain.`
            : `The activity started at ${scheduledStartLabel}. The game will begin when the ${lobbyWaitMins}-minute entry window closes.`;
    }
    else {
        lobbyPhase = 'ready';
        gameStartsAt = gameRedirectAt.toISOString();
        lobbyCountdownSeconds = 0;
        canStartGame = true;
        if (row.group_status === 'waiting') {
            await (0, db_1.query)(`UPDATE game_groups SET status = 'active' WHERE id = ? AND status = 'waiting'`, [
                groupId,
            ]);
            row.group_status = 'active';
        }
        // Game starts now — kick off the case-summary clock (idempotent).
        await (0, timerService_1.ensureCaseSummaryTimer)(groupId, Number(row.case_summary_view_secs) || 300);
        statusMessage = `The ${lobbyWaitMins}-minute entry window has closed. Starting the game…`;
    }
    const [rules] = row.game_row_id
        ? await (0, db_1.query)('SELECT id, rule_text, `order` FROM game_rules WHERE game_id = ? ORDER BY `order` ASC', [row.game_row_id])
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
        rules: rules.map((r) => ({
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
async function emitLobbyUpdate(io, groupId) {
    if (!io)
        return;
    const payload = await buildLobbyPayload(groupId);
    if (!payload)
        return;
    io.to(`group_${groupId}`).emit('lobby_updated', payload);
}
