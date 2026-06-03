<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed CMS pages and package plans
        $this->call([
            AdminUserSeeder::class,
            ActivityMenuSeeder::class,
            SettingsSeeder::class,
            CmsPageSeeder::class,
            EmailTemplateSeeder::class,
            PackageSeeder::class,
            BlogCategorySeeder::class,
            BlogTagSeeder::class,
            BlogSeeder::class,
            FaqCategorySeeder::class,
            FaqSeeder::class,
            ActivityGameSeeder::class,
        ]);
    }
}
