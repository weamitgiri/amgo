<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Trial Pack',
                'price' => 499,
                'max_users' => 5,
                'total_groups' => 1,
                'validity_days' => 30,
                'short_description' => 'Best for: Small teams, workshops, family events',
                'features' => [
                    'Up to 5 participants',
                    '1 auto-created group',
                    'Single session',
                    'Lets you test before buying',
                ],
                'status' => Package::STATUS_ACTIVE,
                'sort_order' => 1,
            ],
            [
                'name' => 'Starter Pack',
                'price' => 2999,
                'max_users' => 50,
                'total_groups' => 10,
                'validity_days' => 30,
                'short_description' => 'Best for: Training sessions, mid-size teams',
                'features' => [
                    'Up to 50 participants',
                    '10 auto-created groups',
                    'Even user distribution',
                    'Instant activation',
                ],
                'status' => Package::STATUS_ACTIVE,
                'sort_order' => 2,
            ],
            [
                'name' => 'Growth Pack',
                'price' => 4999,
                'max_users' => 100,
                'total_groups' => 20,
                'validity_days' => 30,
                'short_description' => 'Best for: Corporate events and team engagement',
                'features' => [
                    'Up to 100 participants',
                    '20 auto-created groups',
                    'Even user distribution',
                    'Instant activation',
                ],
                'status' => Package::STATUS_ACTIVE,
                'sort_order' => 3,
            ],
            [
                'name' => 'Business Pack',
                'price' => 8999,
                'max_users' => 300,
                'total_groups' => 60,
                'validity_days' => 30,
                'short_description' => 'Best for: Large corporate events and offsites',
                'features' => [
                    'Up to 300 participants',
                    '60 auto-created groups',
                    'Even user distribution',
                    'Instant activation',
                ],
                'status' => Package::STATUS_ACTIVE,
                'sort_order' => 4,
            ],
            [
                'name' => 'Enterprise Pack',
                'price' => 19999,
                'max_users' => 500,
                'total_groups' => 100,
                'validity_days' => 30,
                'short_description' => 'Best for: Training sessions, mid-size teams',
                'features' => [
                    'Up to 500 participants',
                    '100 auto-created groups',
                    'Even user distribution',
                    'Fully managed setup',
                ],
                'status' => Package::STATUS_ACTIVE,
                'sort_order' => 5,
            ],
        ];

        foreach ($packages as $package) {
            $slug = Str::slug($package['name']);

            Package::updateOrCreate(
                ['slug' => $slug],
                array_merge($package, [
                    'slug' => $slug,
                    'game_access' => ['cricket', 'football', 'tennis', 'casino', 'esports'],
                ])
            );
        }
    }
}
