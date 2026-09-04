<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Sidebar entries for the payment module.
 *
 * The admin menu is database-driven (App\Models\Menu), so a new controller is
 * invisible until it has rows here. Written idempotently — re-running the
 * seeder updates the existing rows instead of stacking duplicate menu items,
 * since deployments tend to run seeders more than once.
 */
class PaymentMenuSeeder extends Seeder
{
    public function run(): void
    {
        $parent = [
            'name' => 'Payments',
            'link' => 'admin/payments',
            'parent_id' => 0,
            'icon' => 'fas fa-credit-card',
            'status' => 'Active',
            'order' => 7,
            // 2 = visible to both admins and sub-admins, matching how the
            // Organizers menu is registered.
            'permission_type' => 2,
        ];

        $parentId = DB::table('menu')->where('link', $parent['link'])->value('id');

        if ($parentId) {
            // deleted_at is cleared so re-seeding restores a menu an admin
            // soft-deleted, rather than updating an invisible row.
            DB::table('menu')->where('id', $parentId)->update($parent + ['updated_at' => now(), 'deleted_at' => null]);
        } else {
            $parentId = DB::table('menu')->insertGetId($parent + [
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $children = [
            ['name' => 'Dashboard', 'link' => 'admin/payments', 'icon' => 'fas fa-tachometer-alt'],
            ['name' => 'All Payments', 'link' => 'admin/payments/list', 'icon' => 'fas fa-list'],
            ['name' => 'Razorpay Payments', 'link' => 'admin/payments/list?scope=razorpay', 'icon' => 'fas fa-bolt'],
            ['name' => 'COD Payments', 'link' => 'admin/payments/list?scope=cod', 'icon' => 'fas fa-money-bill-wave'],
            ['name' => 'Failed Payments', 'link' => 'admin/payments/list?scope=failed', 'icon' => 'fas fa-times-circle'],
            ['name' => 'Refunded Payments', 'link' => 'admin/payments/list?scope=refunded', 'icon' => 'fas fa-undo'],
            ['name' => 'Payment Reports', 'link' => 'admin/payments/reports', 'icon' => 'fas fa-chart-line'],
        ];

        foreach ($children as $index => $child) {
            $row = $child + [
                'parent_id' => $parentId,
                'status' => 'Active',
                'order' => $index + 1,
                'permission_type' => 2,
            ];

            $existingId = DB::table('menu')
                ->where('parent_id', $parentId)
                ->where('name', $child['name'])
                ->value('id');

            if ($existingId) {
                DB::table('menu')->where('id', $existingId)->update($row + ['updated_at' => now(), 'deleted_at' => null]);
            } else {
                DB::table('menu')->insert($row + ['created_at' => now(), 'updated_at' => now()]);
            }
        }
    }
}
