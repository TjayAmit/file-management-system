<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference' => (string) Str::uuid(),
            'branch_id' => Branch::factory(),
            'request_type_id' => RequestType::factory(),
            'storage_location_id' => StorageLocation::factory(),
            'approval_date' => fake()->date(),
            'request_date' => fake()->date(),
            'title' => fake()->sentence(4),
            'scan_date' => now(),
            'uploaded_by' => User::factory(),
            'is_hidden' => false,
        ];
    }
}
