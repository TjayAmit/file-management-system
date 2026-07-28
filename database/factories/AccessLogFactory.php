<?php

namespace Database\Factories;

use App\Models\AccessLog;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AccessLog>
 */
class AccessLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'document_id' => Document::factory(),
            'action' => fake()->randomElement(['view', 'download', 'print']),
            'created_at' => now(),
        ];
    }
}
