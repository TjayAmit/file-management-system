<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * The display name and address for each role, keyed by the role itself.
     *
     * `User::ROLES` is the one place that holds the role vocabulary (PLAN.md
     * §6.4); this map must cover it. That is asserted in UserSeederTest
     * rather than patched over with a fallback here — a role added to the
     * model without an account should fail loudly in the suite, not quietly
     * seed an account under a guessed address.
     *
     * @var array<string, array{name: string, email: string}>
     */
    private const PROFILES = [
        'admin' => ['name' => 'Office Administrator', 'email' => 'admin@boss.com'],
        'editor' => ['name' => 'Records Editor', 'email' => 'editor@boss.com'],
        'viewer' => ['name' => 'Office Staff', 'email' => 'viewer@boss.com'],
    ];

    /**
     * The shared starting password.
     *
     * Known and weak on purpose: these are development and first-login
     * accounts. Before go-live the admin changes this one and provisions the
     * rest properly (§6.5).
     */
    private const PASSWORD = 'password';

    /**
     * Run the database seeds.
     *
     * One account per role. There is no self-registration — accounts are
     * created by an admin (§6.5) — so a fresh install has no way in until an
     * admin exists. This seeder is that first door: without it, standing the
     * system up on the office server means editing the database by hand.
     *
     * Idempotent by email, so re-seeding an existing install neither
     * duplicates an account nor resets a password someone has since changed.
     */
    public function run(): void
    {
        foreach (self::PROFILES as $role => $profile) {
            $user = User::firstOrCreate(
                ['email' => $profile['email']],
                [
                    'name' => $profile['name'],
                    'password' => Hash::make(self::PASSWORD),
                    'role' => $role,
                    'is_active' => true,
                ],
            );

            // `email_verified_at` is deliberately not mass-assignable, and
            // every archive route sits behind `verified` — so a seeded
            // account that skipped this would be locked out of the system it
            // was created to open.
            if ($user->wasRecentlyCreated) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }
        }
    }
}
