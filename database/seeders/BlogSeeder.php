<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::first();

        if (! $admin) {
            $admin = User::create([
                'name' => 'Administrator',
                'username' => 'admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'usertype' => 0,
                'status' => 1,
                'role_id' => 0,
            ]);
        }

        $adminId = $admin->id;

        // Ensure categories exist
        $categories = ['Technology', 'Business', 'Lifestyle', 'Events', 'Productivity'];
        $categoryIds = [];
        foreach ($categories as $cat) {
            $category = BlogCategory::firstOrCreate(
                ['slug' => Str::slug($cat)],
                ['name' => $cat, 'status' => 1]
            );
            $categoryIds[Str::slug($cat)] = $category->id;
        }

        $blogs = [
            [
                'title' => 'The Future of Corporate Team Building',
                'short_description' => 'Exploring how technology is reshaping how teams connect and collaborate.',
                'content' => '<p>Corporate team building has evolved beyond simple trust falls. Today, immersive digital experiences and gamified challenges are leading the way in creating meaningful connections among remote and hybrid teams.</p>',
                'category_slug' => 'business',
            ],
            [
                'title' => 'Top 5 Productivity Hacks for 2026',
                'short_description' => 'Stay ahead of the curve with these essential productivity tips for the modern professional.',
                'content' => '<p>Productivity in 2026 is all about focused work and leveraging AI tools effectively. We dive into five strategies that will help you reclaim your time and achieve more with less effort.</p>',
                'category_slug' => 'productivity',
            ],
            [
                'title' => 'Designing Immersive Game Experiences',
                'short_description' => 'What makes a game truly engaging? Our lead designer shares insights into the creative process.',
                'content' => '<p>Creating an immersive game requires a perfect blend of narrative, mechanics, and visual storytelling. Learn about the design principles we use to build our signature Mystery Quest series.</p>',
                'category_slug' => 'technology',
            ],
            [
                'title' => 'Planning Your Next Virtual Event',
                'short_description' => 'A comprehensive guide to hosting successful online gatherings that people actually enjoy.',
                'content' => '<p>Virtual events don\'t have to be boring. With the right platform and engaging activities, you can host an event that leaves a lasting impression on your attendees.</p>',
                'category_slug' => 'events',
            ],
            [
                'title' => 'Healthy Habits for Hybrid Workers',
                'short_description' => 'Maintaining physical and mental well-being while navigating the split between home and office.',
                'content' => '<p>The hybrid work model offers flexibility but also challenges. Discover how to build a routine that supports your health, no matter where your desk is located today.</p>',
                'category_slug' => 'lifestyle',
            ],
        ];

        foreach ($blogs as $data) {
            Blog::updateOrCreate(
                ['slug' => Str::slug($data['title'])],
                [
                    'title' => $data['title'],
                    'short_description' => $data['short_description'],
                    'content' => $data['content'],
                    'category_id' => $categoryIds[$data['category_slug']] ?? $categoryIds['technology'],
                    'author_id' => $adminId,
                    'status' => 'published',
                    'published_at' => now(),
                    'is_featured' => true,
                    'show_on_homepage' => true,
                    'created_by' => $adminId,
                ]
            );
        }
    }
}
