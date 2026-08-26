<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\DTOs\CreateUserData;
use App\DTOs\UpdateUserData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetUserPasswordRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly UserService $userService,
    ) {}

    /**
     * Display a listing of the users.
     */
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        return $this->successResponse($this->userService->getAllUsers(), 'Users retrieved successfully');
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = new CreateUserData(
            name: (string) $request->validated('name'),
            email: (string) $request->validated('email'),
            password: (string) $request->validated('password'),
            role: (string) $request->validated('role'),
        );

        $user = $this->userService->createUser($data, $request->user());

        return $this->successResponse($user, 'User created successfully', 201);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = new UpdateUserData(
            name: $request->validated('name') !== null ? (string) $request->validated('name') : null,
            email: $request->validated('email') !== null ? (string) $request->validated('email') : null,
            role: $request->validated('role') !== null ? (string) $request->validated('role') : null,
            isActive: $request->validated('is_active') !== null ? (bool) $request->validated('is_active') : null,
        );

        $updatedUser = $this->userService->updateUser($user, $data, $request->user());

        return $this->successResponse($updatedUser, 'User updated successfully');
    }

    /**
     * Deactivate the specified user.
     */
    public function deactivate(Request $request, User $user): JsonResponse
    {
        $this->authorize('deactivate', $user);

        $deactivatedUser = $this->userService->deactivateUser($user, $request->user());

        return $this->successResponse($deactivatedUser, 'User deactivated successfully');
    }

    /**
     * Admin offline reset temporary password (PLAN.md 6.5).
     */
    public function resetPassword(ResetUserPasswordRequest $request, User $user): JsonResponse
    {
        $resetUser = $this->userService->resetTemporaryPassword($user, $request->password(), $request->user());

        return $this->successResponse($resetUser, 'User temporary password set successfully');
    }
}
