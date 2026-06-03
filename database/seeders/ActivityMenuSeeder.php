<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActivityMenuSeeder extends Seeder
{
    public function run(): void
    {
        // Remove old menus
        DB::table('menu')->whereIn('name', ['Games', 'Organizers', 'Reports'])->delete();
        DB::table('menu')->whereIn('link', ['admin/games', 'admin/organizers', 'admin/reports'])->delete();

        // Add Activities menu
        DB::table('menu')->insert([
            [
                'name' => 'Activities',
                'link' => 'admin/activities',
                'parent_id' => 0,
                'icon' => 'fas fa-tasks',
                'status' => 'Active',
                'order' => 5,
                'permission_type' => 2,
            ],
            [
                'name' => 'Organizers',
                'link' => 'admin/organizers',
                'parent_id' => 0,
                'icon' => 'fas fa-user-tie',
                'status' => 'Active',
                'order' => 6,
                'permission_type' => 2,
            ]
        ]);
    }
}
