<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityGame;
use App\Models\CcClue;
use App\Models\CcGameRule;
use App\Models\CcGameTemplate;
use App\Models\CcGameTemplateIngredient;
use App\Models\CcIngredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CookAndCreateTemplateController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    /**
     * Cook & Create activities aren't always named/slugged identically —
     * this dev database alone has both "cook-and-create" and "cook-create".
     * Match broadly (mirrors the Node API's isCookAndCreateSlug fallback
     * rule) instead of an exact slug, so every Cook & Create game a super
     * admin has created shows up here, not just the first one.
     */
    private function cookAndCreateActivityGames()
    {
        return ActivityGame::whereHas('activity', fn ($q) => $q->where('slug', 'like', 'cook%'));
    }

    public function index()
    {
        $templates = CcGameTemplate::with(['activityGame.activity', 'templateIngredients'])->orderByDesc('id')->get();

        // "Configured" means both a template row exists AND it has enough
        // ingredients to actually play Round 1 (min:4, same floor the create/
        // update validation enforces) — a template with zero ingredients
        // linked 404s Round 1 exactly like a missing template does.
        $wellConfiguredGameIds = $templates
            ->filter(fn ($t) => $t->templateIngredients->count() >= 4)
            ->pluck('activity_game_id')
            ->all();
        $incompleteGames = $this->cookAndCreateActivityGames()
            ->with('activity')
            ->whereNotIn('id', $wellConfiguredGameIds ?: [0])
            ->get();

        return view('admin.cook-and-create.templates.index', compact('templates', 'incompleteGames'));
    }

    public function create()
    {
        $ingredients = CcIngredient::active()->orderBy('name')->get();
        $activityGames = $this->cookAndCreateActivityGames()->with('activity')->get();
        return view('admin.cook-and-create.templates.create', compact('ingredients', 'activityGames'));
    }

    private function rules(): array
    {
        return [
            'activity_game_id' => 'required|integer|exists:activity_games,id',
            'name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'background_image' => 'nullable|image|max:4096',
            'chef1_image' => 'nullable|image|max:2048',
            'chef2_image' => 'nullable|image|max:2048',
            'chef3_image' => 'nullable|image|max:2048',
            'chef4_image' => 'nullable|image|max:2048',
            'show_host_image' => 'nullable|image|max:2048',
            'round1_votes_per_player' => 'required|integer|min:1|max:5',
            'round1_top_ingredients' => 'required|integer|min:2|max:10',
            'round1_timer_secs' => 'required|integer|min:15',
            'round2_step_max_chars' => 'required|integer|min:20|max:500',
            'round2_submit_timer_secs' => 'required|integer|min:15',
            'round2_review_timer_secs' => 'required|integer|min:15',
            'round3_discussion_timer_secs' => 'required|integer|min:15',
            'round3_voting_timer_secs' => 'required|integer|min:15',
            'round3_max_messages_per_player' => 'required|integer|min:1|max:20',
            'show_host_role_enabled' => 'boolean',
            'impostor_bias_card_text' => 'nullable|string',
            'status' => 'required|in:draft,active',
            'ingredient_ids' => 'required|array|min:4',
            'ingredient_ids.*' => 'integer|exists:cc_ingredients,id',
            'clues' => 'nullable|array',
            'clues.*.round_number' => 'required_with:clues|integer|min:1|max:3',
            'clues.*.clue_text' => 'required_with:clues|string',
            'game_rules' => 'nullable|array',
            'game_rules.*.rule_text' => 'required_with:game_rules|string',
        ];
    }

    /** background_image + the 5 portrait fields — same upload/keep-existing rule for each. */
    private const IMAGE_FIELDS = ['background_image', 'chef1_image', 'chef2_image', 'chef3_image', 'chef4_image', 'show_host_image'];

    private function handleImageUploads(Request $request, array &$validated): void
    {
        foreach (self::IMAGE_FIELDS as $field) {
            if ($request->hasFile($field)) {
                $validated[$field] = $request->file($field)->store('cook-and-create/templates', 'public');
            } else {
                unset($validated[$field]); // no new file — stays NULL on create, keeps existing value on update
            }
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        $validated['show_host_role_enabled'] = $request->has('show_host_role_enabled');
        $this->handleImageUploads($request, $validated);

        DB::transaction(function () use ($validated) {
            $template = CcGameTemplate::create(collect($validated)->except(['ingredient_ids', 'clues', 'game_rules'])->toArray());
            $this->syncIngredients($template, $validated['ingredient_ids']);
            $this->syncClues($template, $validated['clues'] ?? []);
            $this->syncRules($template, $validated['game_rules'] ?? []);
        });

        return redirect()->route('admin.cook-and-create.templates.index')->with('success', 'Template created.');
    }

    public function edit(CcGameTemplate $template)
    {
        $template->load(['templateIngredients', 'clues', 'rules']);
        $ingredients = CcIngredient::active()->orderBy('name')->get();
        $activityGames = $this->cookAndCreateActivityGames()->with('activity')->get();
        $selectedIngredientIds = $template->templateIngredients->pluck('ingredient_id')->all();
        return view('admin.cook-and-create.templates.edit', compact('template', 'ingredients', 'activityGames', 'selectedIngredientIds'));
    }

    public function update(Request $request, CcGameTemplate $template)
    {
        $validated = $request->validate($this->rules());
        $validated['show_host_role_enabled'] = $request->has('show_host_role_enabled');
        $this->handleImageUploads($request, $validated);

        DB::transaction(function () use ($template, $validated) {
            $template->update(collect($validated)->except(['ingredient_ids', 'clues', 'game_rules'])->toArray());
            $this->syncIngredients($template, $validated['ingredient_ids']);
            $this->syncClues($template, $validated['clues'] ?? []);
            $this->syncRules($template, $validated['game_rules'] ?? []);
        });

        return redirect()->route('admin.cook-and-create.templates.index')->with('success', 'Template updated.');
    }

    public function destroy(CcGameTemplate $template)
    {
        DB::transaction(function () use ($template) {
            $template->templateIngredients()->delete();
            $template->clues()->delete();
            $template->rules()->delete();
            $template->delete();
        });

        return redirect()->route('admin.cook-and-create.templates.index')->with('success', 'Template deleted.');
    }

    private function syncIngredients(CcGameTemplate $template, array $ingredientIds): void
    {
        $template->templateIngredients()->delete();
        foreach (array_values($ingredientIds) as $order => $ingredientId) {
            CcGameTemplateIngredient::create([
                'template_id' => $template->id,
                'ingredient_id' => $ingredientId,
                'order' => $order,
            ]);
        }
    }

    private function syncClues(CcGameTemplate $template, array $clues): void
    {
        $template->clues()->delete();
        foreach (array_values($clues) as $order => $clue) {
            if (empty($clue['clue_text'])) {
                continue;
            }
            CcClue::create([
                'template_id' => $template->id,
                'round_number' => $clue['round_number'],
                'clue_text' => $clue['clue_text'],
                'order' => $order,
            ]);
        }
    }

    private function syncRules(CcGameTemplate $template, array $rules): void
    {
        $template->rules()->delete();
        foreach (array_values($rules) as $order => $rule) {
            if (empty($rule['rule_text'])) {
                continue;
            }
            CcGameRule::create([
                'template_id' => $template->id,
                'rule_text' => $rule['rule_text'],
                'order' => $order,
            ]);
        }
    }
}
