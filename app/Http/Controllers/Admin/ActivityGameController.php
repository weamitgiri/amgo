<?php

namespace App\Http\Controllers\Admin;

use App\Models\Activity;
use App\Models\ActivityGame;
use App\Models\GameRole;
use App\Models\StrategyCard;
use App\Models\InvestigatorCard;
use App\Models\GamePhoto;
use App\Models\GameClue;
use App\Models\GameRule;
use App\Models\GameFullStory;
use App\Http\Requests\Admin\StoreActivityGameRequest;
use App\Http\Requests\Admin\UpdateActivityGameRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ActivityGameController extends Controller
{
    public function index(Activity $activity)
    {
        $games = $activity->games;
        return view('admin.activity-games.index', compact('activity', 'games'));
    }

    public function create(Activity $activity)
    {
        return view('admin.activity-games.create', compact('activity'));
    }

    public function store(StoreActivityGameRequest $request, Activity $activity)
    {
        try {
            $request->merge(['activity_id' => $activity->id]);

            $gameId = null;

            DB::transaction(function () use ($request, &$gameId) {
                $game = ActivityGame::create($request->only([
                    'activity_id', 'title', 'case_summary', 'tagline', 'status', 'timeline', 'quick_facts'
                ]));
                $gameId = $game->id;

                // Save Roles and Strategy Cards
                if ($request->has('roles')) {
                    foreach ($request->roles as $roleIndex => $roleData) {
                        $role = $game->roles()->create([
                            'role_type' => $roleData['role_type'],
                            'character_name' => $roleData['character_name'],
                            'subtitle' => $roleData['subtitle'] ?? null,
                            'objective' => $roleData['objective'] ?? null,
                            'what_you_know' => $roleData['what_you_know'] ?? [],
                            'keep_in_mind' => $roleData['keep_in_mind'] ?? [],
                            'footer_text' => $roleData['footer_text'] ?? null,
                        ]);

                        if ($request->hasFile("roles.{$roleIndex}.role_image")) {
                            $role->role_image = $this->storePublicImageOrFail($request->file("roles.{$roleIndex}.role_image"), 'roles');
                            $role->save();
                        }

                        if (isset($roleData['strategy_cards'])) {
                            foreach ($roleData['strategy_cards'] as $cardData) {
                                $role->strategyCards()->create($cardData);
                            }
                        }
                    }
                }

                // Save Investigator Cards
                if ($request->has('investigator_cards')) {
                    foreach ($request->investigator_cards as $cardData) {
                        $game->investigatorCards()->create($cardData);
                    }
                }

                // Save Photos
                if ($request->has('photos')) {
                    foreach ($request->photos as $index => $photoData) {
                        $photo = $game->photos()->create([
                            'photo_number' => $photoData['photo_number'],
                            'label' => $photoData['label'],
                        ]);
                        if ($request->hasFile("photos.{$index}.image")) {
                            $photo->image = $this->storePublicImageOrFail($request->file("photos.{$index}.image"), 'game_photos');
                            $photo->save();
                        }
                    }
                }

                // Save Clues
                if ($request->has('clues')) {
                    foreach ($request->clues as $index => $clueData) {
                        $clue = $game->clues()->create([
                            'clue_title' => $clueData['clue_title'],
                            'clue_short_description' => $clueData['clue_short_description'] ?? null,
                            'clue_detail' => $clueData['clue_detail'] ?? null,
                        ]);
                        if ($request->hasFile("clues.{$index}.clue_image")) {
                            $clue->clue_image = $this->storePublicImageOrFail($request->file("clues.{$index}.clue_image"), 'clues');
                            $clue->save();
                        }
                    }
                }

                // Save Rules
                if ($request->has('rules')) {
                    foreach ($request->rules as $ruleData) {
                        $game->rules()->create($ruleData);
                    }
                }

                // Save Full Story
                if ($request->has('full_story')) {
                    foreach ($request->full_story as $storyData) {
                        $game->fullStory()->create($storyData);
                    }
                }
            });

            return redirect()->route('admin.activity-games.index', $activity)->with('success', 'Game created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Something went wrong: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(Activity $activity, ActivityGame $game)
    {
        $game->load(['roles.strategyCards', 'investigatorCards', 'photos', 'clues', 'rules', 'fullStory']);
        return view('admin.activity-games.edit', compact('activity', 'game'));
    }

    public function update(UpdateActivityGameRequest $request, Activity $activity, ActivityGame $game)
    {
        try {
            $request->merge(['activity_id' => $activity->id]);

            DB::transaction(function () use ($request, $game) {
                $game->update($request->only([
                    'title', 'case_summary', 'tagline', 'status', 'timeline', 'quick_facts'
                ]));

                // 1. Synchronize Roles and Strategy Cards
                $existingRoleIds = [];
                if ($request->has('roles')) {
                    foreach ($request->roles as $roleIndex => $roleData) {
                        $role = $game->roles()->updateOrCreate(
                            ['role_type' => $roleData['role_type']],
                            [
                                'character_name' => $roleData['character_name'],
                                'subtitle' => $roleData['subtitle'] ?? null,
                                'objective' => $roleData['objective'] ?? null,
                                'what_you_know' => $roleData['what_you_know'] ?? [],
                                'keep_in_mind' => $roleData['keep_in_mind'] ?? [],
                                'footer_text' => $roleData['footer_text'] ?? null,
                            ]
                        );

                        if ($request->hasFile("roles.{$roleIndex}.role_image")) {
                            $old = $role->role_image;
                            $role->role_image = $this->storePublicImageOrFail($request->file("roles.{$roleIndex}.role_image"), 'roles');
                            $role->save();
                            $this->deletePublicPathQuietly($old);
                        }

                        $existingRoleIds[] = $role->id;

                        // Synchronize Strategy Cards
                        $role->strategyCards()->delete();
                        if (isset($roleData['strategy_cards'])) {
                            foreach ($roleData['strategy_cards'] as $cardData) {
                                $role->strategyCards()->create($cardData);
                            }
                        }
                    }
                }
                $game->roles()->whereNotIn('id', $existingRoleIds)->delete();

                // 2. Synchronize Investigator Cards
                $game->investigatorCards()->delete();
                if ($request->has('investigator_cards')) {
                    foreach ($request->investigator_cards as $cardData) {
                        $game->investigatorCards()->create($cardData);
                    }
                }

                // 3. Synchronize Photos
                if ($request->has('photos')) {
                    // Get current photos to handle image cleanup if needed, or just clear and recreate
                    $existing = $game->photos()->get();
                    $game->photos()->delete();
                    foreach ($request->photos as $index => $photoData) {
                        $photo = $game->photos()->create([
                            'photo_number' => $photoData['photo_number'],
                            'label' => $photoData['label'],
                            'image' => $photoData['existing_image'] ?? ''
                        ]);
                        if ($request->hasFile("photos.{$index}.image")) {
                            $old = $photo->image;
                            $photo->image = $this->storePublicImageOrFail($request->file("photos.{$index}.image"), 'game_photos');
                            $photo->save();
                            $this->deletePublicPathQuietly($old);
                        }
                    }
                } else {
                    $game->photos()->delete();
                }

                // 4. Synchronize Clues
                $game->clues()->delete();
                if ($request->has('clues')) {
                    foreach ($request->clues as $index => $clueData) {
                        $clue = $game->clues()->create([
                            'clue_title' => $clueData['clue_title'],
                            'clue_short_description' => $clueData['clue_short_description'] ?? null,
                            'clue_detail' => $clueData['clue_detail'] ?? null,
                            'clue_image' => $clueData['existing_image'] ?? null
                        ]);
                        if ($request->hasFile("clues.{$index}.clue_image")) {
                            $old = $clue->clue_image;
                            $clue->clue_image = $this->storePublicImageOrFail($request->file("clues.{$index}.clue_image"), 'clues');
                            $clue->save();
                            $this->deletePublicPathQuietly($old);
                        }
                    }
                }

                // 5. Synchronize Rules
                $game->rules()->delete();
                if ($request->has('rules')) {
                    foreach ($request->rules as $ruleData) {
                        $game->rules()->create($ruleData);
                    }
                }

                // 6. Synchronize Full Story
                $game->fullStory()->delete();
                if ($request->has('full_story')) {
                    foreach ($request->full_story as $storyData) {
                        $game->fullStory()->create($storyData);
                    }
                }
            });

            return redirect()->route('admin.activity-games.index', $activity)->with('success', 'Game updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Something went wrong: ' . $e->getMessage())->withInput();
        }
    }

    public function show(Activity $activity, ActivityGame $game)
    {
        $game->load(['roles.strategyCards', 'investigatorCards', 'photos', 'clues', 'rules', 'fullStory']);
        return view('admin.activity-games.show', compact('activity', 'game'));
    }

    public function clone(Activity $activity, ActivityGame $game)
    {
        try {
            DB::transaction(function () use ($game) {
                // Clone the main game record
                $newGame = $game->replicate();
                $newGame->title = $game->title . ' (Clone)';
                $newGame->status = 'draft';
                $newGame->save();

                // Clone Roles and their Strategy Cards
                foreach ($game->roles as $role) {
                    $newRole = $role->replicate();
                    $newRole->game_id = $newGame->id;
                    $newRole->save();

                    foreach ($role->strategyCards as $card) {
                        $newCard = $card->replicate();
                        $newCard->role_id = $newRole->id;
                        $newCard->save();
                    }
                }

                // Clone Investigator Cards
                foreach ($game->investigatorCards as $card) {
                    $newCard = $card->replicate();
                    $newCard->game_id = $newGame->id;
                    $newCard->save();
                }

                // Clone Photos
                foreach ($game->photos as $photo) {
                    $newPhoto = $photo->replicate();
                    $newPhoto->game_id = $newGame->id;
                    $newPhoto->save();
                }

                // Clone Clues
                foreach ($game->clues as $clue) {
                    $newClue = $clue->replicate();
                    $newClue->game_id = $newGame->id;
                    $newClue->save();
                }

                // Clone Rules
                foreach ($game->rules as $rule) {
                    $newRule = $rule->replicate();
                    $newRule->game_id = $newGame->id;
                    $newRule->save();
                }

                // Clone Full Story
                foreach ($game->fullStory as $story) {
                    $newStory = $story->replicate();
                    $newStory->game_id = $newGame->id;
                    $newStory->save();
                }
            });

            return redirect()->route('admin.activity-games.index', $activity)->with('success', 'Game cloned successfully as draft.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to clone game: ' . $e->getMessage());
        }
    }

    public function destroy(Activity $activity, ActivityGame $game)
    {
        $game->delete();
        return redirect()->route('admin.activity-games.index', $activity)->with('success', 'Game deleted successfully.');
    }

    private function storePublicImageOrFail($file, string $dir): string
    {
        try {
            /** @var \Illuminate\Http\UploadedFile $file */
            return $file->store($dir, 'public');
        } catch (\Throwable $e) {
            throw new \RuntimeException("Image upload failed. Please try again. ({$dir})", 0, $e);
        }
    }

    private function deletePublicPathQuietly(?string $path): void
    {
        if (!$path) {
            return;
        }

        try {
            Storage::disk('public')->delete($path);
        } catch (\Throwable $e) {
            // best-effort cleanup; don't block save.
        }
    }

    public function getRoleForm(Request $request, Activity $activity)
    {
        $type = $request->query('type');
        $i = $request->query('index');
        return view('admin.activity-games.partials._role_form', compact('type', 'i', 'activity'))->render();
    }
}
