<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * A background music track assigned to a game activity (Music Manager).
 * Only active tracks are served to the website; at most one per activity.
 */
class ActivityMusic extends Model
{
    protected $table = 'activity_music';

    /** Accepted upload formats (extensions) and the size limit, shared by the form and the request. */
    public const ALLOWED_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a'];
    public const MAX_KB = 10240;

    protected $fillable = [
        'activity_id',
        'title',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'activity_id' => 'integer',
        'file_size' => 'integer',
        'status' => 'boolean',
    ];

    protected static function booted(): void
    {
        // Deleting a track also removes its file from the public disk.
        static::deleted(function (ActivityMusic $music) {
            if ($music->file_path) {
                Storage::disk('public')->delete($music->file_path);
            }
        });
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    public function getFileUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    public function getFileSizeLabelAttribute(): string
    {
        $bytes = (int) $this->file_size;

        return $bytes >= 1048576
            ? round($bytes / 1048576, 1) . ' MB'
            : max(1, (int) round($bytes / 1024)) . ' KB';
    }
}
