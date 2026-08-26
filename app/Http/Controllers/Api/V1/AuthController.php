<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\LoginData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly AuthService $authService,
    ) {}

    /**
     * Authenticate a user and issue an API token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(new LoginData(
            email: (string) $request->validated('email'),
            password: (string) $request->validated('password'),
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
