<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityMusic;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * Admin Music Manager: upload validation, activity assignment, active/inactive
 * (one active track per activity) and file cleanup on replace/delete.
 *
 * Runs against the configured database inside a transaction that is rolled
 * back, with the public disk faked, so nothing is left behind.
 */
class AdminMusicManagerTest extends TestCase
{
    use DatabaseTransactions;

    private const BASE = '/admin/music';

    protected ?User $admin = null;
    protected ?Activity $activity = null;
    protected ?Activity $otherActivity = null;

    protected function setUp(): void
    {
        parent::setUp();
        URL::forceRootUrl('http://localhost');
        Storage::fake('public');

        $this->admin = User::first();
        $activities = Activity::orderBy('id')->limit(2)->get();
        if (! $this->admin || $activities->count() < 2) {
            $this->markTestSkipped('Needs an admin user and at least two activities.');
        }
        [$this->activity, $this->otherActivity] = [$activities[0], $activities[1]];
    }

    /** A small but real MP3 (ID3 header + MPEG frames), so MIME sniffing sees audio/mpeg. */
    private function mp3(string $name = 'theme.mp3', int $frames = 20): UploadedFile
    {
        $frame = "\xFF\xFB\x90\x64" . str_repeat("\x00", 413);
        $path = tempnam(sys_get_temp_dir(), 'mp3');
        file_put_contents($path, "ID3\x03\x00\x00\x00\x00\x00\x00" . str_repeat($frame, $frames));

        return new UploadedFile($path, $name, 'audio/mpeg', null, true);
    }

    /** A real PCM WAV of the given size in bytes. */
    private function wav(string $name, int $bytes): UploadedFile
    {
        $data = max(0, $bytes - 44);
        $header = 'RIFF' . pack('V', 36 + $data) . 'WAVEfmt ' . pack('VvvVVvv', 16, 1, 1, 44100, 88200, 2, 16)
            . 'data' . pack('V', $data);
        $path = tempnam(sys_get_temp_dir(), 'wav');
        $handle = fopen($path, 'wb');
        fwrite($handle, $header);
        $chunk = str_repeat("\x00", 1024 * 1024);
        for ($left = $data; $left > 0; $left -= strlen($chunk)) {
            fwrite($handle, $left >= strlen($chunk) ? $chunk : substr($chunk, 0, $left));
        }
        fclose($handle);

        return new UploadedFile($path, $name, 'audio/wav', null, true);
    }

    private function upload(array $overrides = [])
    {
        return $this->actingAs($this->admin, 'admin')->post(self::BASE, $overrides + [
            'title' => 'Case Theme',
            'activity_id' => $this->activity->id,
            'status' => 1,
            'music_file' => $this->mp3(),
        ]);
    }

    public function test_pages_render(): void
    {
        $music = ActivityMusic::create([
            'activity_id' => $this->activity->id, 'title' => 'Listed Track',
            'file_path' => 'activity-music/listed.mp3', 'file_size' => 1000, 'status' => true,
        ]);

        $this->actingAs($this->admin, 'admin')->get(self::BASE)->assertOk()->assertSee('Listed Track');
        $this->actingAs($this->admin, 'admin')->get(self::BASE . '/create')->assertOk()->assertSee('Max size 10 MB');
        $this->actingAs($this->admin, 'admin')->get(self::BASE . "/{$music->id}/edit")->assertOk()->assertSee('Listed Track');
    }

    public function test_valid_upload_is_stored_and_assigned_to_the_activity(): void
    {
        $this->upload()->assertRedirect(route('admin.music.index'))->assertSessionHasNoErrors();

        $music = ActivityMusic::latest('id')->first();
        $this->assertSame('Case Theme', $music->title);
        $this->assertSame($this->activity->id, $music->activity_id);
        $this->assertTrue($music->status);
        $this->assertSame('theme.mp3', $music->original_name);
        $this->assertStringStartsWith('activity-music/', $music->file_path);
        Storage::disk('public')->assertExists($music->file_path);
    }

    public function test_wav_just_under_ten_mb_is_accepted(): void
    {
        $this->upload(['music_file' => $this->wav('loop.wav', 10 * 1024 * 1024 - 1024)])
            ->assertSessionHasNoErrors();
        Storage::disk('public')->assertExists(ActivityMusic::latest('id')->value('file_path'));
    }

    public function test_file_over_ten_mb_is_rejected(): void
    {
        $count = ActivityMusic::count();
        $this->upload(['music_file' => $this->wav('big.wav', 11 * 1024 * 1024)])
            ->assertSessionHasErrors(['music_file' => 'The music file may not be larger than 10 MB.']);
        $this->assertSame($count, ActivityMusic::count());
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_wrong_file_types_are_rejected(): void
    {
        // Wrong extension.
        $this->upload(['music_file' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain')])
            ->assertSessionHasErrors('music_file');

        // Audio extension but not audio content (a renamed image).
        $image = UploadedFile::fake()->image('cover.png');
        $png = tempnam(sys_get_temp_dir(), 'png');
        copy($image->getRealPath(), $png);
        $this->upload(['music_file' => new UploadedFile($png, 'song.mp3', 'audio/mpeg', null, true)])
            ->assertSessionHasErrors(['music_file' => 'The music file is not a valid audio file. Please upload an MP3, WAV, OGG, M4A file.']);

        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_required_fields(): void
    {
        $this->actingAs($this->admin, 'admin')->post(self::BASE, ['status' => 1])
            ->assertSessionHasErrors(['title', 'activity_id', 'music_file']);

        $this->upload(['activity_id' => 999999999])->assertSessionHasErrors('activity_id');
    }

    public function test_php_upload_error_gets_a_clear_message(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'err');
        $failed = new UploadedFile($path, 'huge.mp3', 'audio/mpeg', UPLOAD_ERR_INI_SIZE, true);

        $this->upload(['music_file' => $failed])->assertSessionHasErrors('music_file');
        $this->assertStringContainsString('upload_max_filesize', session('errors')->first('music_file'));
    }

    public function test_request_over_post_max_size_returns_to_the_form_with_a_message(): void
    {
        $this->actingAs($this->admin, 'admin')
            ->call('POST', self::BASE, [], [], [], [
                'CONTENT_LENGTH' => 1024 * 1024 * 1024,
                'HTTP_REFERER' => 'http://localhost/admin/music/create',
            ])
            ->assertRedirect('http://localhost/admin/music/create?upload_error=too_large');

        $this->actingAs($this->admin, 'admin')->get(self::BASE . '/create?upload_error=too_large')
            ->assertOk()->assertSee('larger than the server accepts');
    }

    public function test_only_one_active_track_per_activity(): void
    {
        $this->upload(['title' => 'First']);
        $this->upload(['title' => 'Second']);
        $this->upload(['title' => 'Other activity', 'activity_id' => $this->otherActivity->id]);

        $first = ActivityMusic::where('title', 'First')->first();
        $second = ActivityMusic::where('title', 'Second')->first();
        $other = ActivityMusic::where('title', 'Other activity')->first();
        $this->assertFalse($first->status, 'Uploading an active track deactivates the activity\'s others.');
        $this->assertTrue($second->status);
        $this->assertTrue($other->status, 'Other activities are not affected.');

        // Toggle: activating First switches Second off.
        $this->actingAs($this->admin, 'admin')->post(self::BASE . '/toggle-status', ['id' => $first->id])
            ->assertOk()->assertJson(['success' => true, 'status' => true]);
        $this->assertTrue($first->fresh()->status);
        $this->assertFalse($second->fresh()->status);
        $this->assertTrue($other->fresh()->status);

        // Toggle again: First goes inactive, nothing else changes.
        $this->actingAs($this->admin, 'admin')->post(self::BASE . '/toggle-status', ['id' => $first->id])
            ->assertOk()->assertJson(['status' => false]);
        $this->assertFalse($first->fresh()->status);
        $this->assertFalse($second->fresh()->status);
    }

    public function test_inactive_upload_does_not_touch_the_active_track(): void
    {
        $this->upload(['title' => 'Active one']);
        $this->upload(['title' => 'Inactive one', 'status' => 0]);

        $this->assertTrue(ActivityMusic::where('title', 'Active one')->first()->status);
        $this->assertFalse(ActivityMusic::where('title', 'Inactive one')->first()->status);
    }

    public function test_edit_reassigns_activity_and_replaces_the_file(): void
    {
        $this->upload();
        $music = ActivityMusic::latest('id')->first();
        $oldPath = $music->file_path;

        // Change title/activity only: file is kept.
        $this->actingAs($this->admin, 'admin')->put(self::BASE . "/{$music->id}", [
            'title' => 'Renamed', 'activity_id' => $this->otherActivity->id, 'status' => 1,
        ])->assertRedirect(route('admin.music.index'))->assertSessionHasNoErrors();
        $music->refresh();
        $this->assertSame('Renamed', $music->title);
        $this->assertSame($this->otherActivity->id, $music->activity_id);
        $this->assertSame($oldPath, $music->file_path);

        // Replace the file: the old one is removed.
        $this->actingAs($this->admin, 'admin')->put(self::BASE . "/{$music->id}", [
            'title' => 'Renamed', 'activity_id' => $this->otherActivity->id, 'status' => 1,
            'music_file' => $this->mp3('new.mp3'),
        ])->assertSessionHasNoErrors();
        $music->refresh();
        $this->assertNotSame($oldPath, $music->file_path);
        $this->assertSame('new.mp3', $music->original_name);
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($music->file_path);

        // An invalid replacement keeps the current file.
        $this->actingAs($this->admin, 'admin')->put(self::BASE . "/{$music->id}", [
            'title' => 'Renamed', 'activity_id' => $this->otherActivity->id, 'status' => 1,
            'music_file' => $this->wav('big.wav', 11 * 1024 * 1024),
        ])->assertSessionHasErrors('music_file');
        Storage::disk('public')->assertExists($music->fresh()->file_path);
    }

    public function test_delete_removes_the_row_and_the_file(): void
    {
        $this->upload();
        $music = ActivityMusic::latest('id')->first();
        Storage::disk('public')->assertExists($music->file_path);

        $this->actingAs($this->admin, 'admin')->delete(self::BASE . "/{$music->id}")
            ->assertRedirect(route('admin.music.index'));

        $this->assertNull(ActivityMusic::find($music->id));
        Storage::disk('public')->assertMissing($music->file_path);
    }
}
