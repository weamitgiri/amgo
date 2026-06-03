<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BlogCategory;
use App\Models\User;

class BlogCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminId = User::first()?->id;

        $categories = [
            [
                'name' => 'Technology',
                'slug' => 'technology',
                'description' => 'Latest technology news, tutorials, and insights.',
                'icon' => 'fas fa-microchip',
                'status' => 1,
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'description' => 'Business tips, marketing, and entrepreneurship.',
                'icon' => 'fas fa-briefcase',
                'status' => 1,
            ],
            [
                'name' => 'Lifestyle',
                'slug' => 'lifestyle',
                'description' => 'Articles about lifestyle, productivity, and wellness.',
                'icon' => 'fas fa-heart',
                'status' => 1,
            ],
            [
                'name' => 'Tutorials',
                'slug' => 'tutorials',
                'description' => 'How-to guides and tutorials for developers.',
                'icon' => 'fas fa-graduation-cap',
                'status' => 1,
            ],
            [
                'name' => 'News',
                'slug' => 'news',
                'description' => 'Industry news and announcements.',
                'icon' => 'fas fa-newspaper',
                'status' => 1,
            ],
        ];

        foreach ($categories as $category) {
            BlogCategory::firstOrCreate(
                ['slug' => $category['slug']],
                $category + ['created_by' => $adminId, 'updated_by' => $adminId]
            );
        }
    }
}
