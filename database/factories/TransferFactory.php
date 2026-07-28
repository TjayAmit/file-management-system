<?php

namespace Database\Factories;

use App\Models\StorageLocation;
use App\Models\Transfer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transfer>
 */
class TransferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'to_storage_location_id' => StorageLocation::factory(),
            'performed_by' => User::factory(),
            'note' => fake()->optional()->sentence(),
            'transferred_at' => now(),
        ];
    }
}
