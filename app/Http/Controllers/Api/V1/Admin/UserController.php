<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\DTOs\CreateUserData;
use App\DTOs\UpdateUserData;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly UserService $userService,
    ) {}

    /**
     * Display a listing of users.
     */
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = $this->userService->getAllUsers();

        return $this->successResponse($users, 'Users retrieved successfully');
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::in(['viewer', 'editor', 'admin'])],
        ]);

        $data = new CreateUserData(
            name: (string) $validated['name'],
            email: (string) $validated['email'],
            password: (string) $validated['password'],
            role: (string) $validated['role'],
        );

        $user = $this->userService->createUser($data);

        return $this->successResponse($user, 'User created successfully', 201);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['sometimes', 'string', Rule::in(['viewer', 'editor', 'admin'])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $data = new UpdateUserData(
            name: isset($validated['name']) ? (string) $validated['name'] : null,
            email: isset($validated['email']) ? (string) $validated['email'] : null,
            role: isset($validated['role']) ? (string) $validated['role'] : null,
            isActive: isset($validated['is_active']) ? (bool) $validated['is_active'] : null,
        );

        $updatedUser = $this->userService->updateUser($user, $data);

        return $this->successResponse($updatedUser, 'User updated successfully');
    }

    /**
     * Deactivate the specified user.
     */
    public function deactivate(User $user): JsonResponse
    {
        $this->authorize('deactivate', $user);

        $deactivatedUser = $this->userService->deactivateUser($user);

        return $this->successResponse($deactivatedUser, 'User deactivated successfully');
    }

    /**
     * Admin offline reset temporary password.
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $this->authorize('resetPassword', $user);

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $resetUser = $this->userService->resetTemporaryPassword($user, (string) $validated['password']);

        return $this->successResponse($resetUser, 'User temporary password set successfully');
    }
}
