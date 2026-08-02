<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\LoginData;
use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly AuthService $authService,
    ) {}

    /**
     * Authenticate a user and issue an API token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $result = $this->authService->login(new LoginData(
            email: $validated['email'],
            password: $validated['password'],
        ));

        if (! $result) {
            return $this->errorResponse('These credentials do not match our records.', 401);
        }

        return $this->successResponse([
            'user' => $result['user'],
            'token' => $result['token'],
        ], 'Login successful');
    }
}
