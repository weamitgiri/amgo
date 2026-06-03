<?php

namespace App\Http\Controllers\Admin;

use App\Models\Activity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityController extends Controller
{
    public function index()
    {
        $activities = Activity::withCount('games')->get();
        return view('admin.activities.index', compact('activities'));
    }

    public function create()
    {
        return view('admin.activities.create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|max:100',
                'slug' => 'required|unique:activities,slug',
                'description' => 'nullable',
                'cover_image' => 'nullable|image|max:2048',
                'icon' => 'nullable|image|max:512',
                'status' => 'required|in:draft,active',
                'lobby_wait_secs' => 'required|integer|min:60|max:3600',
                'entry_cutoff_mins' => 'required|integer',
                'game_duration_secs' => 'required|integer|min:300|max:10800',
                'auto_expire_days' => 'required|integer',
                'win_bonus' => 'required|integer|min:0',
                'participation_bonus' => 'required|integer|min:0',
                'timely_response_bonus' => 'required|integer|min:0',
                'no_response_penalty' => 'required|integer|max:0',
                'wrong_vote_penalty' => 'required|integer|max:0',
                'lie_detector_enabled' => 'boolean',
                'lie_detector_voting_timer_secs' => 'required_if:lie_detector_enabled,1|nullable|integer',
            ]);

            if ($request->hasFile('cover_image')) {
                $validated['cover_image'] = $request->file('cover_image')->store('activities', 'public');
            }

            if ($request->hasFile('icon')) {
                $validated['icon'] = $request->file('icon')->store('activities/icons', 'public');
            }

            $validated['lie_detector_enabled'] = $request->has('lie_detector_enabled');

            Activity::create($validated);

            return redirect()->route('admin.activities.index')->with('success', 'Activity created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Something went wrong: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(Activity $activity)
    {
        return view('admin.activities.edit', compact('activity'));
    }

    public function update(Request $request, Activity $activity)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|max:100',
                'slug' => 'required|unique:activities,slug,' . $activity->id,
                'description' => 'nullable',
                'cover_image' => 'nullable|image|max:2048',
                'icon' => 'nullable|image|max:512',
                'status' => 'required|in:draft,active',
                'lobby_wait_secs' => 'required|integer|min:60|max:3600',
                'entry_cutoff_mins' => 'required|integer',
                'game_duration_secs' => 'required|integer|min:300|max:10800',
                'auto_expire_days' => 'required|integer',
                'win_bonus' => 'required|integer|min:0',
                'participation_bonus' => 'required|integer|min:0',
                'timely_response_bonus' => 'required|integer|min:0',
                'no_response_penalty' => 'required|integer|max:0',
                'wrong_vote_penalty' => 'required|integer|max:0',
                'lie_detector_enabled' => 'boolean',
                'lie_detector_voting_timer_secs' => 'required_if:lie_detector_enabled,1|nullable|integer',
            ]);

            if ($request->hasFile('cover_image')) {
                $validated['cover_image'] = $request->file('cover_image')->store('activities', 'public');
            }

            if ($request->hasFile('icon')) {
                $validated['icon'] = $request->file('icon')->store('activities/icons', 'public');
            }

            $validated['lie_detector_enabled'] = $request->has('lie_detector_enabled');

            $activity->update($validated);

            return redirect()->route('admin.activities.index')->with('success', 'Activity updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Something went wrong: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Activity $activity)
    {
        $activity->delete();
        return redirect()->route('admin.activities.index')->with('success', 'Activity deleted successfully.');
    }

    public function toggleStatus(Request $request)
    {
        $activity = Activity::findOrFail($request->id);
        $activity->status = $activity->status === 'active' ? 'draft' : 'active';
        $activity->save();

        return response()->json(['success' => true, 'status' => $activity->status]);
    }

    public function getGames(Activity $activity)
    {
        return response()->json($activity->games);
    }
}
