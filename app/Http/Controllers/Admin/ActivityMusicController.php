<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreActivityMusicRequest;
use App\Models\Activity;
use App\Models\ActivityMusic;
use App\Support\UploadLimits;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Music Manager: background tracks per game activity. The website plays the
 * activity's active track; activating a track deactivates the activity's others.
 */
class ActivityMusicController extends Controller
{
    public function index()
    {
        $tracks = ActivityMusic::with('activity:id,title')->latest()->get();

        return view('admin.music.index', compact('tracks'));
    }

    public function create()
    {
        return view('admin.music.create', $this->formData());
    }

    public function store(StoreActivityMusicRequest $request)
    {
        $data = $request->safe()->only(['title', 'activity_id', 'status']);
        $data += $this->storeFile($request->file('music_file'));
        $data['created_by'] = auth('admin')->id();

        $music = DB::transaction(function () use ($data) {
            $music = ActivityMusic::create($data);
            $this->deactivateOthers($music);

            return $music;
        });

        return redirect()->route('admin.music.index')->with('success', $this->savedMessage($music, 'uploaded'));
    }

    public function edit(ActivityMusic $music)
    {
        return view('admin.music.edit', $this->formData() + compact('music'));
    }

    public function update(StoreActivityMusicRequest $request, ActivityMusic $music)
    {
        $data = $request->safe()->only(['title', 'activity_id', 'status']);
        $oldFile = null;
        if ($request->hasFile('music_file')) {
            $oldFile = $music->file_path;
            $data += $this->storeFile($request->file('music_file'));
        }
        $data['updated_by'] = auth('admin')->id();

        DB::transaction(function () use ($music, $data) {
            $music->update($data);
            $this->deactivateOthers($music);
        });

        // The replaced file goes only after the new one is saved.
        if ($oldFile && $oldFile !== $music->file_path) {
            Storage::disk('public')->delete($oldFile);
        }

        return redirect()->route('admin.music.index')->with('success', $this->savedMessage($music, 'updated'));
    }

    public function destroy(ActivityMusic $music)
    {
        // The model's deleted event removes the file from storage.
        $music->delete();

        return redirect()->route('admin.music.index')->with('success', 'Music deleted successfully.');
    }

    public function toggleStatus(Request $request)
    {
        $music = ActivityMusic::findOrFail($request->id);

        DB::transaction(function () use ($music) {
            $music->update(['status' => !$music->status, 'updated_by' => auth('admin')->id()]);
            $this->deactivateOthers($music);
        });

        return response()->json([
            'success' => true,
            'status' => $music->status,
            'message' => $music->status ? 'Music activated. Other tracks for this activity were set to inactive.' : 'Music deactivated.',
        ]);
    }

    /** Activities to choose from, plus the upload limits the form checks in the browser. */
    private function formData(): array
    {
        $phpLimit = UploadLimits::fileBytes();
        $maxBytes = ActivityMusic::MAX_KB * 1024;

        return [
            'activities' => Activity::orderBy('title')->get(['id', 'title', 'status']),
            'maxBytes' => $phpLimit > 0 ? min($maxBytes, $phpLimit) : $maxBytes,
            'serverLimited' => $phpLimit > 0 && $phpLimit < $maxBytes,
            'allowedTypes' => ActivityMusic::ALLOWED_EXTENSIONS,
        ];
    }

    private function storeFile(UploadedFile $file): array
    {
        return [
            'file_path' => $file->store('activity-music', 'public'),
            'original_name' => mb_substr($file->getClientOriginalName(), 0, 255),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ];
    }

    /** One active track per activity: keep this one, switch the activity's others off. */
    private function deactivateOthers(ActivityMusic $music): void
    {
        if ($music->status) {
            ActivityMusic::where('activity_id', $music->activity_id)
                ->where('id', '!=', $music->id)
                ->where('status', true)
                ->update(['status' => false]);
        }
    }

    private function savedMessage(ActivityMusic $music, string $verb): string
    {
        return $music->status
            ? "Music {$verb} and set as the active track for this activity."
            : "Music {$verb} (inactive).";
    }
}
