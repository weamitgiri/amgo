<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default role if none exists
        $role = Role::firstOrCreate(
            ['name' => 'Super Admin'],
            [
                'guard_name' => 'admin',
                'status' => 1,
                'description' => 'Super Administrator with full access'
            ]
        );

        // Create Super Admin User
        User::updateOrCreate(
            ['email' => 'admin@zoventro.com'],
            [
                'name' => 'Super Admin',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'usertype' => 0, // 0 => superadmin
                'status' => 1,
                'role_id' => $role->id,
            ]
        );

        // Create a secondary Admin User
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'username' => 'admin_demo',
                'password' => Hash::make('password'),
                'usertype' => 1, // 1 => admin
                'status' => 1,
                'role_id' => $role->id,
            ]
        );
    }
}
