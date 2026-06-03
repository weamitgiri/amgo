<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FaqCategory;
use App\Models\User;

class FaqCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminId = User::first()?->id;

        $categories = [
            [
                'name' => 'General',
                'slug' => 'general',
                'description' => 'General questions about our services',
                'icon' => 'fas fa-question-circle',
                'status' => 1,
                'sort_order' => 1,
            ],
            [
                'name' => 'Account & Billing',
                'slug' => 'account-billing',
                'description' => 'Questions about accounts and billing',
                'icon' => 'fas fa-credit-card',
                'status' => 1,
                'sort_order' => 2,
            ],
            [
                'name' => 'Technical Support',
                'slug' => 'technical-support',
                'description' => 'Technical issues and troubleshooting',
                'icon' => 'fas fa-cog',
                'status' => 1,
                'sort_order' => 3,
            ],
            [
                'name' => 'Privacy & Security',
                'slug' => 'privacy-security',
                'description' => 'Privacy and security related questions',
                'icon' => 'fas fa-shield-alt',
                'status' => 1,
                'sort_order' => 4,
            ],
            [
                'name' => 'Policies',
                'slug' => 'policies',
                'description' => 'Company policies and terms',
                'icon' => 'fas fa-file-contract',
                'status' => 1,
                'sort_order' => 5,
            ],
        ];

        foreach ($categories as $category) {
            FaqCategory::firstOrCreate(
                ['slug' => $category['slug']],
                $category + ['created_by' => $adminId, 'updated_by' => $adminId]
            );
        }
    }
}
