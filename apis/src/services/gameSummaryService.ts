import { query, withTransaction } from '../config/db';

const ROLE_GRADS = [
    'from-amber-700 via-orange-600 to-red-900',
    'from-slate-700 via-zinc-700 to-slate-900',
    'from-fuchsia-700 via-purple-600 to-rose-900',
    'from-emerald-800 via-green-700 to-zinc-900',
    'from-violet-600 via-purple-700 to-purple-950',
];

function parseJsonArray(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
            return [];
        }
    }
    return [];
}

function parseTimeline(value: unknown): { time: string; event: string }[] {
    if (!value) return [];
    let raw = value;
    if (typeof value === 'string') {
        try {
            raw = JSON.parse(value);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(raw)) return [];
    return raw
        .map((item: any) => ({
            time: String(item?.time ?? item?.label ?? ''),
            event: String(item?.event ?? item?.text ?? ''),
        }))
        .filter((item) => item.time || item.event);
}

function parseQuickFacts(value: unknown): { label: string; value: string; icon: string }[] {
    if (!value) return [];
    let raw = value;
    if (typeof value === 'string') {
        try {
            raw = JSON.parse(value);
        } catch {
            return [];
        }
    }
    if (Array.isArray(raw)) {
        return raw.map((item: any, i: number) => ({
            label: String(item?.label ?? `Fact ${i + 1}`),
            value: String(item?.value ?? item),
            icon: 'info',
        }));
    }
    if (raw && typeof raw === 'object') {
        const map: Record<string, string> = {
            location: 'location',
            date_time: 'calendar',
            weather: 'cloud',
            cctv_status: 'video',
        };
        return Object.entries(raw as Record<string, string>).map(([key, val]) => ({
            label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            value: String(val),
            icon: map[key] ?? 'info',
        }));
    }
    return [];
}

function shortName(name: string, id: number): string {
    const inside = name.match(/\(([^)]+)\)/);
    const base = (inside?.[1] || name.split(/\s+/)[0] || 'Player').replace(/\W/g, '').slice(0, 12);
    return `${base}${(id % 70) + 30}`;
}

function shuffleIds<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

async function ensureParticipantRoleAssignment(
    groupId: number,
    gameId: number,
    participantId: number
): Promise<number | null> {
    return withTransaction(async (conn) => {
        await conn.query('SELECT id FROM game_groups WHERE id = ? FOR UPDATE', [groupId]);

        const [participantRows] = (await conn.query(
            `SELECT id FROM game_participants
             WHERE group_id = ? AND email_verified_at IS NOT NULL
             ORDER BY COALESCE(email_verified_at, created_at) ASC`,
            [groupId]
        )) as any;

        const [roleRows] = (await conn.query(
            'SELECT id FROM game_roles WHERE game_id = ? ORDER BY id ASC',
            [gameId]
        )) as any;

        const participants = participantRows as { id: number }[];
        const roleIds = (roleRows as { id: number }[]).map((r) => Number(r.id));

        if (participants.length === 0 || roleIds.length === 0) return null;

        const [sessionRows] = (await conn.query(
            'SELECT id, participant_id, role_id FROM participant_sessions WHERE group_id = ?',
            [groupId]
        )) as any;

        const sessions = sessionRows as { id: number; participant_id: number; role_id: number | null }[];
        const sessionByParticipant = new Map(sessions.map((s) => [Number(s.participant_id), s]));

        for (const p of participants) {
            if (!sessionByParticipant.has(Number(p.id))) {
                const [inserted] = (await conn.query(
                    'INSERT INTO participant_sessions (group_id, participant_id, is_online) VALUES (?, ?, 0)',
                    [groupId, p.id]
                )) as any;
                sessionByParticipant.set(Number(p.id), {
                    id: inserted.insertId,
                    participant_id: Number(p.id),
                    role_id: null,
                });
            }
        }

        const allUnassigned =
            participants.length === roleIds.length &&
            participants.every((p) => {
                const s = sessionByParticipant.get(Number(p.id));
                return s && (s.role_id == null || s.role_id === 0);
            });

        if (allUnassigned) {
            const shuffledRoles = shuffleIds(roleIds);
            for (let i = 0; i < participants.length; i++) {
                const p = participants[i];
                const session = sessionByParticipant.get(Number(p.id));
                const roleId = shuffledRoles[i];
                if (session) {
                    await conn.query('UPDATE participant_sessions SET role_id = ? WHERE id = ?', [
                        roleId,
                        session.id,
                    ]);
                    session.role_id = roleId;
                }
            }
        }

        const mine = sessionByParticipant.get(participantId);
        return mine?.role_id != null && mine.role_id !== 0 ? Number(mine.role_id) : null;
    });
}

export type GameSummaryPayload = {
    group_id: number;
    participant: { id: number; name: string };
    activity: { title: string; slug: string };
    settings: {
        case_summary_view_secs: number;
        game_duration_secs: number;
        max_questions: number;
        question_response_secs: number;
        clue_room_unlock_secs: number;
        strategy_guide_delay_secs: number;
        lie_detector_enabled: boolean;
        lie_detector_max_questions: number;
        lie_detector_timer_secs: number;
        no_response_penalty: number;
    };
    game: {
        id: number;
        title: string;
        tagline: string | null;
        case_summary_html: string | null;
        timeline: { time: string; event: string }[];
        quick_facts: { label: string; value: string; icon: string }[];
    };
    roles: {
        id: number;
        role_type: string;
        role_label: string;
        role_subtitle: string;
        name: string;
        short: string;
        grad: string;
        objective: string;
        you_know: string[];
        keep_in_mind: string[];
        role_image: string | null;
        is_you: boolean;
    }[];
    photos: { id: number; label: string; image: string | null }[];
    clues: {
        id: number;
        clue_title: string;
        clue_short_description: string | null;
        clue_detail: string | null;
        clue_image: string | null;
    }[];
    rules: { id: number; title: string; description: string; details: string[] }[];
    strategy_slides: { title: string; description: string; details: string[] }[];
};

export async function buildGameSummaryPayload(
    groupId: number | string,
    participantId?: number | string | null
): Promise<GameSummaryPayload | null> {
    const [groupRows] = await query(
        `SELECT gg.id, ob.game_id, ob.activity_id,
            a.title AS activity_title, a.slug AS activity_slug,
            a.case_summary_view_secs, a.game_duration_secs, a.max_questions,
            a.question_response_secs, a.clue_room_unlock_secs, a.strategy_guide_delay_secs,
            a.lie_detector_enabled, a.lie_detector_max_questions, a.lie_detector_timer_secs,
            a.no_response_penalty,
            ag.id AS game_row_id, ag.title AS case_title, ag.tagline, ag.case_summary,
            ag.timeline, ag.quick_facts
         FROM game_groups gg
         JOIN organizer_bookings ob ON gg.booking_id = ob.id
         JOIN activities a ON ob.activity_id = a.id
         LEFT JOIN activity_games ag ON ob.game_id = ag.id
         WHERE gg.id = ?`,
        [groupId]
    );

    if (groupRows.length === 0 || !groupRows[0].game_row_id) return null;

    const row = groupRows[0];

    let participant = { id: 0, name: 'Participant' };
    if (participantId) {
        const [pRows] = await query(
            'SELECT id, name FROM game_participants WHERE id = ? AND group_id = ?',
            [participantId, groupId]
        );
        if (pRows.length > 0) {
            participant = { id: Number(pRows[0].id), name: pRows[0].name || 'Participant' };
        }
    }

    const [roleRows] = await query(
        `SELECT id, role_type, character_name, subtitle, role_image, objective, what_you_know, keep_in_mind
         FROM game_roles WHERE game_id = ? ORDER BY id ASC`,
        [row.game_row_id]
    );

    const [photoRows] = await query(
        'SELECT id, label, image FROM game_photos WHERE game_id = ? ORDER BY photo_number ASC',
        [row.game_row_id]
    );

    const [clueRows] = await query(
        'SELECT id, clue_title, clue_short_description, clue_detail, clue_image FROM game_clues WHERE game_id = ? ORDER BY id ASC',
        [row.game_row_id]
    );

    const [ruleRows] = await query(
        'SELECT id, rule_text, `order` FROM game_rules WHERE game_id = ? ORDER BY `order` ASC',
        [row.game_row_id]
    );

    const [cardRows] = await query(
        `SELECT suspect_label, tag, profile_text, why_suspicious, suggested_questions
         FROM investigator_cards WHERE game_id = ? ORDER BY card_number ASC`,
        [row.game_row_id]
    );

    let myRoleId: number | null = null;
    if (participant.id) {
        myRoleId = await ensureParticipantRoleAssignment(
            Number(row.id),
            Number(row.game_row_id),
            Number(participant.id)
        );
    }

    const roles = roleRows.map((r: any, index: number) => {
        const name = r.character_name || 'Unknown';
        const isYou = myRoleId != null && Number(r.id) === myRoleId;
        const roleLabel = r.subtitle?.split('.')[0]?.trim() || r.role_type;
        const base = {
            id: Number(r.id),
            role_type: isYou ? r.role_type : '',
            role_label: isYou ? roleLabel : '',
            role_subtitle: isYou ? String(r.subtitle || roleLabel).trim() : '',
            name,
            short: isYou ? `${shortName(name, Number(r.id))} (You)` : shortName(name, Number(r.id)),
            grad: ROLE_GRADS[index % ROLE_GRADS.length],
            objective: isYou ? r.objective || '' : '',
            you_know: isYou ? parseJsonArray(r.what_you_know) : [],
            keep_in_mind: isYou ? parseJsonArray(r.keep_in_mind) : [],
            role_image: r.role_image,
            is_you: isYou,
        };
        return base;
    });

    const rules = ruleRows.map((r: any, index: number) => ({
        id: Number(r.id),
        title: `Game Rule ${index + 1}`,
        description: r.rule_text,
        details: [r.rule_text],
    }));

    const strategy_slides = cardRows.map((c: any) => ({
        title: c.suspect_label || c.tag || 'Strategy Tip',
        description: c.profile_text || '',
        details: [
            c.why_suspicious,
            c.suggested_questions,
        ].filter(Boolean),
    }));

    return {
        group_id: Number(row.id),
        participant,
        activity: {
            title: row.activity_title,
            slug: row.activity_slug,
        },
        settings: {
            case_summary_view_secs: Number(row.case_summary_view_secs) || 300,
            game_duration_secs: Number(row.game_duration_secs) || 1200,
            max_questions: Number(row.max_questions) || 5,
            question_response_secs: Number(row.question_response_secs) || 120,
            clue_room_unlock_secs: Number(row.clue_room_unlock_secs) || 600,
            strategy_guide_delay_secs: Number(row.strategy_guide_delay_secs) || 120,
            lie_detector_enabled: Boolean(row.lie_detector_enabled),
            lie_detector_max_questions: Number(row.lie_detector_max_questions) || 3,
            lie_detector_timer_secs: Number(row.lie_detector_timer_secs) || 420,
            no_response_penalty: Number(row.no_response_penalty) || -10,
        },
        game: {
            id: Number(row.game_row_id),
            title: row.case_title,
            tagline: row.tagline,
            case_summary_html: row.case_summary,
            timeline: parseTimeline(row.timeline),
            quick_facts: parseQuickFacts(row.quick_facts),
        },
        roles,
        photos: photoRows.map((p: any) => ({
            id: Number(p.id),
            label: p.label,
            image: p.image,
        })),
        clues: clueRows.map((c: any) => ({
            id: Number(c.id),
            clue_title: String(c.clue_title || ''),
            clue_short_description: c.clue_short_description ? String(c.clue_short_description) : null,
            clue_detail: c.clue_detail ? String(c.clue_detail) : null,
            clue_image: c.clue_image ? String(c.clue_image) : null,
        })),
        rules,
        strategy_slides:
            strategy_slides.length > 0
                ? strategy_slides
                : [
                      {
                          title: 'Strategy Tip',
                          description: 'Review the case summary and timeline before questioning suspects.',
                          details: ['Note inconsistencies in statements.', 'Use your questions wisely.'],
                      },
                  ],
    };
}
