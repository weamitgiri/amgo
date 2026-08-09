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

    public function index()
    {
        $templates = CcGameTemplate::with('activityGame')->orderByDesc('id')->get();
        return view('admin.cook-and-create.templates.index', compact('templates'));
    }

    public function create()
    {
        $ingredients = CcIngredient::active()->orderBy('name')->get();
        $activityGames = ActivityGame::whereHas('activity', fn ($q) => $q->where('slug', 'cook-and-create'))->get();
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

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        $validated['show_host_role_enabled'] = $request->has('show_host_role_enabled');

        if ($request->hasFile('background_image')) {
            $validated['background_image'] = $request->file('background_image')->store('cook-and-create/templates', 'public');
        } else {
            unset($validated['background_image']); // stays NULL on create — frontend falls back to bundled art
        }

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
        $activityGames = ActivityGame::whereHas('activity', fn ($q) => $q->where('slug', 'cook-and-create'))->get();
        $selectedIngredientIds = $template->templateIngredients->pluck('ingredient_id')->all();
        return view('admin.cook-and-create.templates.edit', compact('template', 'ingredients', 'activityGames', 'selectedIngredientIds'));
    }

    public function update(Request $request, CcGameTemplate $template)
    {
        $validated = $request->validate($this->rules());
        $validated['show_host_role_enabled'] = $request->has('show_host_role_enabled');

        if ($request->hasFile('background_image')) {
            $validated['background_image'] = $request->file('background_image')->store('cook-and-create/templates', 'public');
        } else {
            unset($validated['background_image']); // keep the existing image if no new file was uploaded
        }

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
