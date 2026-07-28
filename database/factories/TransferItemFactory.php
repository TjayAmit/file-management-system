<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\StorageLocation;
use App\Models\Transfer;
use App\Models\TransferItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TransferItem>
 */
class TransferItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'transfer_id' => Transfer::factory(),
            'document_id' => Document::factory(),
            'from_storage_location_id' => StorageLocation::factory(),
        ];
    }
}
