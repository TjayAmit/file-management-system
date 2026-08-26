<?php

namespace App\Http\Controllers\Admin;

use App\DTOs\CreateUserData;
use App\DTOs\UpdateUserData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetUserPasswordRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
    ) {}

    /**
     * Display a listing of the users.
     */
    public function index(): InertiaResponse
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('admin/users/index', [
            'users' => $this->userService->getAllUsers(),
            'roles' => User::ROLES,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = new CreateUserData(
            name: (string) $request->validated('name'),
            email: (string) $request->validated('email'),
            password: (string) $request->validated('password'),
            role: (string) $request->validated('role'),
        );

        $this->userService->createUser($data, $request->user());

        return back()->with('status', 'User created successfully');
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = new UpdateUserData(
            name: $request->validated('name') !== null ? (string) $request->validated('name') : null,
            email: $request->validated('email') !== null ? (string) $request->validated('email') : null,
            role: $request->validated('role') !== null ? (string) $request->validated('role') : null,
            isActive: $request->validated('is_active') !== null ? (bool) $request->validated('is_active') : null,
        );

        $this->userService->updateUser($user, $data, $request->user());

        return back()->with('status', 'User updated successfully');
    }

    /**
     * Deactivate the specified user.
     */
    public function deactivate(Request $request, User $user): RedirectResponse
    {
        $this->authorize('deactivate', $user);

        $this->userService->deactivateUser($user, $request->user());

        return back()->with('status', 'User deactivated successfully');
    }

    /**
     * Admin offline reset temporary password (PLAN.md 6.5).
     */
    public function resetPassword(ResetUserPasswordRequest $request, User $user): RedirectResponse
    {
        $this->userService->resetTemporaryPassword($user, $request->password(), $request->user());

        return back()->with('status', 'User temporary password set successfully');
    }
}
