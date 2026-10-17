/**
 * Cook & Create stage durations: a game uses the durations snapshotted when it
 * was created (cc_game_instances.stage_durations), not whatever the global
 * settings / template say now. Run with: npm run test:cc-durations
 */
import assert from 'node:assert';
import { CC_GAME_DURATION_FIELDS, withGameDurations } from '../../src/services/ccStageDurations';

let failures = 0;
function check(name: string, fn: () => void) {
    try {
        fn();
        console.log(`  ok  - ${name}`);
    } catch (err) {
        failures++;
        console.error(`  FAIL - ${name}`);
        console.error(`         ${(err as Error).message}`);
    }
}

const template = {
    id: 21,
    name: 'Kitchen',
    round1_votes_per_player: 2,
    role_brief_secs: 300,
    round1_timer_secs: 120,
    round1_results_secs: 60,
    round2_submit_timer_secs: 120,
    round2_review_timer_secs: 120,
    round3_discussion_timer_secs: 60,
    round3_voting_timer_secs: 120,
    dish_naming_secs: 60,
};
const snapshot = {
    role_brief_secs: 120,
    round1_timer_secs: 90,
    round1_results_secs: 30,
    round2_submit_timer_secs: 45,
    round2_review_timer_secs: 50,
    round3_discussion_timer_secs: 75,
    round3_voting_timer_secs: 80,
    dish_naming_secs: 40,
};

console.log('Cook & Create stage duration tests');

check('covers exactly the eight in-game durations', () => {
    assert.deepStrictEqual([...CC_GAME_DURATION_FIELDS].sort(), Object.keys(snapshot).sort());
});

check("a game with a snapshot uses its snapshot, not the template's current values", () => {
    const result = withGameDurations(template, { stage_durations: snapshot });
    for (const f of CC_GAME_DURATION_FIELDS) assert.strictEqual(result[f], snapshot[f], f);
});

check('reads a snapshot stored as a JSON string', () => {
    const result = withGameDurations(template, { stage_durations: JSON.stringify(snapshot) });
    assert.strictEqual(result.round3_voting_timer_secs, 80);
});

check('leaves every other template setting untouched', () => {
    const result = withGameDurations(template, { stage_durations: snapshot });
    assert.strictEqual(result.id, 21);
    assert.strictEqual(result.name, 'Kitchen');
    assert.strictEqual(result.round1_votes_per_player, 2);
});

check('a game without a snapshot keeps the template values', () => {
    assert.deepStrictEqual(withGameDurations(template, { stage_durations: null }), template);
    assert.deepStrictEqual(withGameDurations(template, {}), template);
});

check('ignores missing, zero or non-numeric snapshot values', () => {
    const result = withGameDurations(template, {
        stage_durations: { round1_timer_secs: 0, dish_naming_secs: 'abc', round3_voting_timer_secs: 95 },
    });
    assert.strictEqual(result.round1_timer_secs, 120);
    assert.strictEqual(result.dish_naming_secs, 60);
    assert.strictEqual(result.role_brief_secs, 300);
    assert.strictEqual(result.round3_voting_timer_secs, 95);
});

check('does not mutate the template object', () => {
    const copy = { ...template };
    withGameDurations(template, { stage_durations: snapshot });
    assert.deepStrictEqual(template, copy);
});

if (failures > 0) {
    console.error(`\n${failures} test(s) failed`);
    process.exit(1);
}
console.log('\nAll Cook & Create stage duration tests passed');
process.exit(0);
