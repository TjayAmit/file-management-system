<?php

namespace App\Services;

use App\DTOs\LoginData;
use App\Models\User as UserModel;
use App\Repositories\Interface\User as UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    /**
     * Attempt to authenticate a user by credentials and issue an API token.
     *
     * @return array{user: UserModel, token: string}|null
     */
    public function login(LoginData $data): ?array
    {
        $user = $this->userRepository->findByEmail($data->email);

        if (! $user || ! Hash::check($data->password, $user->password)) {
            return null;
        }

        if (! $user->is_active) {
            return null;
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }
}
