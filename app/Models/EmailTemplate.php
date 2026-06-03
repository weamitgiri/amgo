<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class EmailTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'email_templates';

    protected $fillable = [
        'name',
        'slug',
        'subject',
        'body',
        'variables',
        'description',
        'status',
        'created_by',
        'updated_by',
        'usage_count',
        'last_used_at',
    ];

    protected $casts = [
        'variables' => 'array',
        'last_used_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-generate slug from name if not provided
        static::creating(function ($model) {
            if (!$model->slug) {
                $model->slug = Str::slug($model->name);
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('name') && !$model->isDirty('slug')) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    /**
     * Get the creator of the email template.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    /**
     * Get the updater of the email template.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by', 'id');
    }

    /**
     * Scope to get only active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Scope to get only inactive templates.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 0);
    }

    /**
     * Get status label.
     */
    public function getStatusLabelAttribute()
    {
        return $this->status == 1 ? 'Active' : 'Inactive';
    }

    /**
     * Activate the template.
     */
    public function activate()
    {
        $this->update(['status' => 1]);
    }

    /**
     * Deactivate the template.
     */
    public function deactivate()
    {
        $this->update(['status' => 0]);
    }

    /**
     * Record template usage.
     */
    public function recordUsage()
    {
        $this->increment('usage_count');
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Parse template variables and replace with values.
     */
    public function parseTemplate(array $data = [])
    {
        $subject = $this->subject;
        $body = $this->body;

        foreach ($data as $key => $value) {
            $variable = '{' . $key . '}';
            $subject = str_replace($variable, $value, $subject);
            $body = str_replace($variable, $value, $body);
        }

        return [
            'subject' => $subject,
            'body' => $body,
        ];
    }
}
