<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\CcGameTemplate;
use App\Models\CcStageDurations;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * The nine static Cook & Create stage durations are one global setting: saving
 * them through ANY template (or a Cook & Create activity's lobby wait) updates
 * every template, and every template's form shows the same values.
 *
 * Runs against the configured database like the other feature tests (the schema
 * is shared with the Node API); every test runs inside a transaction that is
 * rolled back, so nothing it saves is kept.
 */
class CookAndCreateStageDurationsTest extends TestCase
{
    use DatabaseTransactions;

    private const BASE = '/admin/cook-and-create/templates';

    /** Different from the defaults and within each field's validation bounds. */
    private const NEW_VALUES = [
        'lobby_wait_secs' => 900,
        'role_brief_secs' => 240,
        'round1_timer_secs' => 150,
        'round1_results_secs' => 45,
        'round2_submit_timer_secs' => 90,
        'round2_review_timer_secs' => 100,
        'round3_discussion_timer_secs' => 75,
        'round3_voting_timer_secs' => 110,
        'dish_naming_secs' => 50,
    ];

    protected ?User $admin = null;

    protected function setUp(): void
    {
        parent::setUp();

        // APP_URL is served from a subdirectory (http://localhost/p/); pin the
        // root so the test client hits the paths the router registers.
        URL::forceRootUrl('http://localhost');

        $this->admin = User::first();
        if (! $this->admin) {
            $this->markTestSkipped('No admin user available to authenticate as.');
        }
        if (CcGameTemplate::count() < 2) {
            $this->markTestSkipped('Needs at least two Cook & Create templates.');
        }
    }

    /** A valid update payload that keeps everything about $template except the durations. */
    private function payloadFor(CcGameTemplate $template, array $durations): array
    {
        $template->load(['templateIngredients', 'clues', 'rules']);

        $payload = [
            'activity_game_id' => $template->activity_game_id,
            'name' => $template->name,
            'tagline' => $template->tagline,
            'description' => $template->description,
            'round1_votes_per_player' => $template->round1_votes_per_player,
            'round1_top_ingredients' => $template->round1_top_ingredients,
            'round2_step_max_chars' => $template->round2_step_max_chars,
            'round3_max_messages_per_player' => $template->round3_max_messages_per_player,
            'impostor_bias_card_text' => $template->impostor_bias_card_text,
            'status' => $template->status,
            'ingredient_ids' => $template->templateIngredients->pluck('ingredient_id')->all(),
            'clues' => $template->clues->map(fn ($c) => ['round_number' => $c->round_number, 'clue_text' => $c->clue_text])->all(),
            'game_rules' => $template->rules->map(fn ($r) => ['rule_text' => $r->rule_text])->all(),
        ] + $durations;

        if ($template->show_host_role_enabled) {
            $payload['show_host_role_enabled'] = 1;
        }

        return $payload;
    }

    /** Everything about a template that the duration sync must never touch. */
    private function otherSettings(CcGameTemplate $template): array
    {
        $template = $template->fresh(['templateIngredients', 'clues', 'rules']);

        return [
            'fields' => collect($template->getAttributes())
                ->except([...CcStageDurations::TEMPLATE_FIELDS, 'updated_at'])
                ->all(),
            'ingredients' => $template->templateIngredients->pluck('ingredient_id')->all(),
            'clues' => $template->clues->pluck('clue_text')->all(),
            'rules' => $template->rules->pluck('rule_text')->all(),
        ];
    }

    private function assertEveryTemplateHas(array $values): void
    {
        $templateValues = array_intersect_key($values, array_flip(CcStageDurations::TEMPLATE_FIELDS));
        foreach (CcGameTemplate::all() as $template) {
            foreach ($templateValues as $field => $expected) {
                $this->assertSame($expected, $template->$field, "Template {$template->id} {$field}");
            }
        }
        foreach (Activity::where('slug', 'like', 'cook%')->get() as $activity) {
            $this->assertSame($values['lobby_wait_secs'], (int) $activity->lobby_wait_secs, "Activity {$activity->slug} lobby wait");
        }
    }

    public function test_saving_one_template_updates_the_durations_of_every_template(): void
    {
        [$edited, $other] = CcGameTemplate::orderBy('id')->take(2)->get()->all();
        $editedBefore = $this->otherSettings($edited);
        $otherBefore = $this->otherSettings($other);
        $mysteryLobbyBefore = Activity::where('slug', 'not like', 'cook%')->pluck('lobby_wait_secs', 'id')->all();

        $this->actingAs($this->admin, 'admin')
            ->put(self::BASE . "/{$edited->id}", $this->payloadFor($edited, self::NEW_VALUES))
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        // Single source of truth holds the new values…
        $global = CcStageDurations::current();
        foreach (self::NEW_VALUES as $field => $expected) {
            $this->assertSame($expected, $global->$field, "global {$field}");
        }
        // …and every template + Cook & Create activity carries them.
        $this->assertEveryTemplateHas(self::NEW_VALUES);

        // Nothing else changed — on the edited template or any other.
        $this->assertEquals($editedBefore, $this->otherSettings($edited));
        $this->assertEquals($otherBefore, $this->otherSettings($other));
        // Other games' activities keep their own lobby wait.
        $this->assertEquals($mysteryLobbyBefore, Activity::where('slug', 'not like', 'cook%')->pluck('lobby_wait_secs', 'id')->all());
    }

    public function test_every_template_form_shows_the_same_saved_values(): void
    {
        [$edited, $other] = CcGameTemplate::orderBy('id')->take(2)->get()->all();

        $this->actingAs($this->admin, 'admin')
            ->put(self::BASE . "/{$edited->id}", $this->payloadFor($edited, self::NEW_VALUES))
            ->assertSessionHasNoErrors();

        foreach ([$edited, $other] as $template) {
            $html = $this->actingAs($this->admin, 'admin')->get(self::BASE . "/{$template->id}/edit")->assertOk()->getContent();
            foreach (self::NEW_VALUES as $field => $expected) {
                $this->assertMatchesRegularExpression(
                    '/name="' . $field . '"[^>]*value="' . $expected . '"/s',
                    $html,
                    "Template {$template->id} form should show {$field} = {$expected}"
                );
            }
        }
    }

    public function test_creating_a_template_also_applies_its_durations_globally(): void
    {
        $source = CcGameTemplate::orderBy('id')->first();
        $payload = ['name' => 'Stage durations test template'] + $this->payloadFor($source, self::NEW_VALUES);

        $this->actingAs($this->admin, 'admin')
            ->post(self::BASE, $payload)
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertNotNull(CcGameTemplate::where('name', 'Stage durations test template')->first());
        $this->assertEveryTemplateHas(self::NEW_VALUES);
    }

    public function test_an_invalid_duration_is_rejected_and_nothing_changes(): void
    {
        $template = CcGameTemplate::orderBy('id')->first();
        $globalBefore = CcStageDurations::current()->only(CcStageDurations::FIELDS);
        $templatesBefore = CcGameTemplate::orderBy('id')->get(CcStageDurations::TEMPLATE_FIELDS)->toArray();

        $invalid = ['lobby_wait_secs' => 30, 'dish_naming_secs' => 0] + self::NEW_VALUES;

        $this->actingAs($this->admin, 'admin')
            ->from(self::BASE . "/{$template->id}/edit")
            ->put(self::BASE . "/{$template->id}", $this->payloadFor($template, $invalid))
            ->assertSessionHasErrors(['lobby_wait_secs', 'dish_naming_secs']);

        $this->assertEquals($globalBefore, CcStageDurations::current()->only(CcStageDurations::FIELDS));
        $this->assertEquals($templatesBefore, CcGameTemplate::orderBy('id')->get(CcStageDurations::TEMPLATE_FIELDS)->toArray());
    }

    public function test_a_cook_and_create_activity_lobby_wait_applies_to_all_cook_and_create(): void
    {
        $activity = Activity::where('slug', 'like', 'cook%')->orderBy('id')->first();
        $mysteryLobbyBefore = Activity::where('slug', 'not like', 'cook%')->pluck('lobby_wait_secs', 'id')->all();
        $otherDurationsBefore = CcStageDurations::current()->only(CcStageDurations::TEMPLATE_FIELDS);

        $payload = collect($activity->getAttributes())->only([
            'title', 'slug', 'description', 'status', 'entry_cutoff_mins', 'game_duration_secs',
            'auto_expire_days', 'no_response_penalty',
        ])->all();
        $payload['lobby_wait_secs'] = 600;

        $this->actingAs($this->admin, 'admin')
            ->put("/admin/activities/{$activity->id}", $payload)
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertSame(600, CcStageDurations::current()->lobby_wait_secs);
        $this->assertEveryTemplateHas(['lobby_wait_secs' => 600] + $otherDurationsBefore);
        $this->assertEquals($mysteryLobbyBefore, Activity::where('slug', 'not like', 'cook%')->pluck('lobby_wait_secs', 'id')->all());
    }
}
