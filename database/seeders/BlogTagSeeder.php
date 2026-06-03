<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BlogTag;
use App\Models\User;

class BlogTagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminId = User::first()?->id;

        $tags = [
            ['name' => 'Laravel', 'slug' => 'laravel', 'status' => 1],
            ['name' => 'PHP', 'slug' => 'php', 'status' => 1],
            ['name' => 'Web Development', 'slug' => 'web-development', 'status' => 1],
            ['name' => 'SEO', 'slug' => 'seo', 'status' => 1],
            ['name' => 'Business', 'slug' => 'business', 'status' => 1],
            ['name' => 'Productivity', 'slug' => 'productivity', 'status' => 1],
        ];

        foreach ($tags as $tag) {
            BlogTag::firstOrCreate(
                ['slug' => $tag['slug']],
                $tag + ['created_by' => $adminId, 'updated_by' => $adminId]
            );
        }
    }
}
