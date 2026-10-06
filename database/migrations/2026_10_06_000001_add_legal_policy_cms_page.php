<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Adds a "Legal Policy" CMS page (slug legal-policy) for the footer's LEGAL
 * column, seeded as a copy of the Refund Policy page's content so it starts in
 * the same format; admins edit it from CMS Pages afterwards.
 *
 * Copies from whatever refund-policy row exists on the database it runs on, and
 * does nothing if a legal-policy page (or the "Legal Policy" name) is already
 * there — so it is safe to run on any environment and never overwrites edits.
 */
return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::table('cms_pages')
            ->where('slug', 'legal-policy')
            ->orWhere('page_name', 'Legal Policy')
            ->exists();
        if ($exists) {
            return;
        }

        $refund = DB::table('cms_pages')
            ->where('slug', 'refund-policy')
            ->whereNull('deleted_at')
            ->first();
        if (! $refund) {
            return;
        }

        DB::table('cms_pages')->insert([
            'page_name'        => 'Legal Policy',
            'slug'             => 'legal-policy',
            'title'            => 'Legal Policy',
            'content'          => $refund->content,
            'meta_title'       => 'Legal Policy',
            'meta_description' => $refund->meta_description,
            'meta_keywords'    => $refund->meta_keywords,
            // Not shared: replacing one page's image deletes the old file.
            'featured_image'   => null,
            'status'           => $refund->status,
            'published_at'     => $refund->status ? now() : null,
            'created_by'       => $refund->created_by,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('cms_pages')->where('slug', 'legal-policy')->delete();
    }
};
