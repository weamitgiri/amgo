<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use Illuminate\Database\Seeder;

class CmsPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'page_name' => 'Homepage Content',
                'slug' => 'homepage',
                'title' => 'Welcome to Our Platform',
                'content' => '<h1>Welcome to Our Admin Panel</h1>
                            <p>This is your homepage content. You can edit this using the CMS management system.</p>
                            <h2>Key Features</h2>
                            <ul>
                                <li>Enterprise-level content management</li>
                                <li>SEO optimization tools</li>
                                <li>Rich text editing capabilities</li>
                                <li>Image management system</li>
                            </ul>',
                'meta_title' => 'Welcome to Our Platform',
                'meta_description' => 'Professional admin panel with comprehensive content management system',
                'meta_keywords' => 'admin, cms, content, management',
                'status' => 1,
                'published_at' => now(),
            ],
            [
                'page_name' => 'Footer Content',
                'slug' => 'footer',
                'title' => 'Footer Information',
                'content' => '<div class="footer-content">
                            <h4>About Us</h4>
                            <p>Professional content management system built for modern businesses.</p>
                            <h4>Contact</h4>
                            <p>Email: support@example.com<br>Phone: +1 (555) 000-0000</p>
                            <h4>Follow Us</h4>
                            <p>Visit our social media channels for updates and news.</p>
                            </div>',
                'meta_title' => 'Footer',
                'meta_description' => 'Footer content and contact information',
                'meta_keywords' => 'footer, contact, information',
                'status' => 1,
                'published_at' => now(),
            ],
            [
                'page_name' => 'Terms & Conditions',
                'slug' => 'terms-conditions',
                'title' => 'Terms & Conditions',
                'content' => '<h1>Terms & Conditions</h1>
                            <p>Last Updated: ' . now()->format('M d, Y') . '</p>
                            <h2>1. Acceptance of Terms</h2>
                            <p>By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
                            <h2>2. Use License</h2>
                            <p>Permission is granted to temporarily download one copy of the materials on our platform for personal, non-commercial transitory viewing only.</p>
                            <h2>3. Disclaimer</h2>
                            <p>The materials on our platform are provided on an \'as is\' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties.</p>
                            <h2>4. Limitations</h2>
                            <p>In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials.</p>
                            <h2>5. Accuracy of Materials</h2>
                            <p>The materials appearing on our platform could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current.</p>',
                'meta_title' => 'Terms & Conditions',
                'meta_description' => 'Read our terms and conditions before using our platform',
                'meta_keywords' => 'terms, conditions, legal, agreement',
                'status' => 1,
                'published_at' => now(),
            ],
            [
                'page_name' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'title' => 'Privacy Policy',
                'content' => '<h1>Privacy Policy</h1>
                            <p>Last Updated: ' . now()->format('M d, Y') . '</p>
                            <h2>1. Introduction</h2>
                            <p>We are committed to protecting your privacy. This policy explains how we collect, use, and disclose information.</p>
                            <h2>2. Information Collection</h2>
                            <p>We collect information you provide directly, such as when you create an account or contact us for support.</p>
                            <h2>3. Use of Information</h2>
                            <p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you about changes to our policies.</p>
                            <h2>4. Information Sharing</h2>
                            <p>We do not sell or share your personal information with third parties except as necessary to provide our services or as required by law.</p>
                            <h2>5. Data Security</h2>
                            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access and alteration.</p>
                            <h2>6. Your Rights</h2>
                            <p>You have the right to access, correct, or delete your personal information. Please contact us to exercise these rights.</p>
                            <h2>7. Contact Us</h2>
                            <p>If you have questions about this privacy policy, please contact us at privacy@example.com</p>',
                'meta_title' => 'Privacy Policy',
                'meta_description' => 'Review our privacy policy to understand how we protect your data',
                'meta_keywords' => 'privacy, policy, data protection, gdpr',
                'status' => 1,
                'published_at' => now(),
            ],
            [
                'page_name' => 'Refund Policy',
                'slug' => 'refund-policy',
                'title' => 'Refund Policy',
                'content' => '<h1>Refund Policy</h1>
                            <p>Last Updated: ' . now()->format('M d, Y') . '</p>
                            <h2>1. Refund Eligibility</h2>
                            <p>You may request a refund within 30 days of your purchase if you are not satisfied with our services.</p>
                            <h2>2. Refund Process</h2>
                            <p>To request a refund, please contact our support team with your order number and reason for the refund request.</p>
                            <h2>3. Refund Timeline</h2>
                            <p>Once we receive and process your refund request, you should expect to receive your refund within 5-7 business days.</p>
                            <h2>4. Non-Refundable Items</h2>
                            <p>Digital services that have been fully used or consumed are not eligible for refunds.</p>
                            <h2>5. Partial Refunds</h2>
                            <p>In some cases, we may offer partial refunds based on the nature of your complaint and our assessment.</p>
                            <h2>6. Customer Support</h2>
                            <p>Before requesting a refund, please contact our support team. We may be able to resolve your issue.</p>
                            <h2>7. Contact Support</h2>
                            <p>Email: support@example.com<br>Phone: +1 (555) 000-0000</p>',
                'meta_title' => 'Refund Policy',
                'meta_description' => 'Learn about our refund policy and how to request a refund',
                'meta_keywords' => 'refund, policy, returns, customer service',
                'status' => 1,
                'published_at' => now(),
            ],
        ];

        foreach ($pages as $page) {
            CmsPage::firstOrCreate(
                ['page_name' => $page['page_name']],
                $page
            );
        }
    }
}
