<?php

namespace Database\Seeders;

use App\Models\StorageLocation;
use Illuminate\Database\Seeder;

class StorageLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        StorageLocation::firstOrCreate(['name' => 'In Office']);
        StorageLocation::firstOrCreate(['name' => 'Central Storage Building']);
    }
}
