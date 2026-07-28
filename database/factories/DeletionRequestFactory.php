<?php

namespace Database\Factories;

use App\Models\DeletionRequest;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DeletionRequest>
 */
class DeletionRequestFactory extends Factory
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
            'requested_by' => User::factory(),
            'reason' => fake()->sentence(),
            'status' => 'pending',
            'approved_by' => null,
            'decided_at' => null,
        ];
    }
}
