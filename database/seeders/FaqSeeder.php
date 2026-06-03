<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FaqCategory;
use App\Models\Faq;
use App\Models\User;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminId = User::first()?->id;

        // Create FAQ categories
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

        // Create sample FAQs
        $faqs = [
            // General FAQs
            [
                'question' => 'What services do you offer?',
                'answer' => '<p>We offer a comprehensive range of digital services including web development, mobile app development, digital marketing, UI/UX design, and consulting services. Our team specializes in creating custom solutions tailored to your business needs.</p>',
                'category_id' => 1,
                'sort_order' => 1,
                'is_featured' => true,
                'status' => 1,
            ],
            [
                'question' => 'How do I get started with your services?',
                'answer' => '<p>Getting started is easy! Simply contact us through our website, email, or phone. We\'ll schedule a free consultation to discuss your project requirements and provide a customized proposal. Once you approve the proposal, we\'ll begin working on your project immediately.</p>',
                'category_id' => 1,
                'sort_order' => 2,
                'is_featured' => true,
                'status' => 1,
            ],
            [
                'question' => 'Do you provide ongoing support after project completion?',
                'answer' => '<p>Yes, we provide comprehensive post-launch support and maintenance services. This includes bug fixes, updates, performance optimization, and technical support. We offer various support packages to suit different needs and budgets.</p>',
                'category_id' => 1,
                'sort_order' => 3,
                'is_featured' => false,
                'status' => 1,
            ],

            // Account & Billing FAQs
            [
                'question' => 'How can I update my billing information?',
                'answer' => '<p>You can update your billing information by logging into your dashboard and navigating to the Settings -> Billing section. There you can add new payment methods or update existing ones.</p>',
                'category_id' => 2,
                'sort_order' => 4,
                'is_featured' => true,
                'status' => 1,
            ],
            [
                'question' => 'What payment methods do you accept?',
                'answer' => '<p>We accept all major credit/debit cards, UPI, Paytm, and NetBanking. All payments are processed securely through our payment gateway partners.</p>',
                'category_id' => 2,
                'sort_order' => 5,
                'is_featured' => false,
                'status' => 1,
            ],
        ];

        foreach ($faqs as $faqData) {
            Faq::firstOrCreate(
                ['question' => $faqData['question']],
                $faqData + ['created_by' => $adminId, 'updated_by' => $adminId]
            );
        }
    }
}
