<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['manager', 'keeper'];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        $managerUser = User::firstOrCreate(
            ['email' => 'manager@monday.com'],
            [
                'name' => 'Manager User',
                'password' => Hash::make('password'),
                'phone' => '081234567890',
                'photo' => 'https://ui-avatars.com/api/?name=Manager+User&background=random',
            ]
        );
        $managerUser->assignRole('manager');

        $keeperUser = User::firstOrCreate(
            ['email' => 'keeper@monday.com'],
            [
                'name' => 'Keeper User',
                'password' => Hash::make('password'),
                'phone' => '081234567891',
                'photo' => 'https://ui-avatars.com/api/?name=Keeper+User&background=random',
            ]
        );
        $keeperUser->assignRole('keeper');
    }
}