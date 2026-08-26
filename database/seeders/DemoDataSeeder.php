<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * A small, realistic archive for local demos and browser checks.
 *
 * Safe to run repeatedly: everything is matched on a natural key first.
 * Not intended for the production install, which starts from the office's
 * own known-business list (PLAN.md section 6.2).
 */
class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([StorageLocationSeeder::class]);

        $accounts = [
            ['name' => 'Office Head', 'email' => 'admin@office.test', 'role' => 'admin'],
            ['name' => 'Records Clerk', 'email' => 'editor@office.test', 'role' => 'editor'],
            ['name' => 'Front Desk', 'email' => 'viewer@office.test', 'role' => 'viewer'],
        ];

        foreach ($accounts as $account) {
            User::firstOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => Hash::make('Password123!'),
                    'role' => $account['role'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ],
            );
        }

        $requestTypes = collect([
            'Setback inspection request',
            'Occupancy permit application',
            'Building plan endorsement',
            'Fire safety clearance',
        ])->map(fn (string $name): RequestType => RequestType::firstOrCreate(['name' => $name]));

        $structure = [
            'ABC Corporation' => ['14 Rizal Street', '221 Bonifacio Avenue'],
            'Sunrise Trading' => ['9 Mabini Road'],
            'Delta Hardware' => ['5 Del Pilar Street', 'Km 4 National Highway'],
        ];

        $inOffice = StorageLocation::where('name', 'In Office')->firstOrFail();
        $central = StorageLocation::where('name', 'Central Storage Building')->firstOrFail();
        $encoder = User::where('email', 'editor@office.test')->firstOrFail();

        $sequence = 0;

        foreach ($structure as $businessName => $locations) {
            $business = Business::firstOrCreate(['name' => $businessName]);

            foreach ($locations as $location) {
                $branch = Branch::firstOrCreate([
                    'business_id' => $business->id,
                    'location' => $location,
                ]);

                foreach ($requestTypes->take(2) as $requestType) {
                    $sequence++;
                    $title = "{$requestType->name} — {$location}";

                    if (Document::where('title', $title)->exists()) {
                        continue;
                    }

                    $approvedOn = now()->subMonths($sequence * 3)->startOfDay();

                    $document = Document::create([
                        'reference' => (string) Str::uuid(),
                        'branch_id' => $branch->id,
                        'request_type_id' => $requestType->id,
                        'storage_location_id' => $sequence % 2 === 0 ? $central->id : $inOffice->id,
                        'title' => $title,
                        'approval_date' => $approvedOn,
                        'request_date' => $approvedOn->copy()->subWeeks(2),
                        'scan_date' => now(),
                        'uploaded_by' => $encoder->id,
                        'is_hidden' => false,
                    ]);

                    DocumentVersion::create([
                        'document_id' => $document->id,
                        'path' => 'documents/demo-placeholder.pdf',
                        'original_name' => Str::slug($title).'.pdf',
                        'size' => 245_760,
                        'mime_type' => 'application/pdf',
                        'is_current' => true,
                        'uploaded_by' => $encoder->id,
                    ]);
                }
            }
        }
    }
}
