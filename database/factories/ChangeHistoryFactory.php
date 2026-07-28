<?php

namespace Database\Factories;

use App\Models\ChangeHistory;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChangeHistory>
 */
class ChangeHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'document_id' => Document::factory(),
            'field' => fake()->randomElement(['title', 'approval_date', 'request_type_id']),
            'old_value' => fake()->word(),
            'new_value' => fake()->word(),
            'changed_by' => User::factory(),
            'is_revert' => false,
            'created_at' => now(),
        ];
    }
}
