<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
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
            'subject_type' => Document::class,
            'subject_id' => Document::factory(),
            'action' => fake()->randomElement(['document.uploaded', 'branch.merged', 'document.transferred']),
            'details' => ['note' => fake()->sentence()],
            'created_at' => now(),
        ];
    }
}
