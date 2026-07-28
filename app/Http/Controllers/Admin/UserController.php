<?php

namespace App\Http\Controllers\Admin;

use App\DTOs\CreateUserData;
use App\DTOs\UpdateUserData;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
        return Inertia::render('admin/users/index', [
            'users' => $this->userService->getAllUsers(),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
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

        $this->userService->createUser($data);

        return back()->with('status', 'User created successfully');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
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

        $this->userService->updateUser($user, $data);

        return back()->with('status', 'User updated successfully');
    }

    /**
     * Deactivate the specified user.
     */
    public function deactivate(User $user): RedirectResponse
    {
        $this->userService->deactivateUser($user);

        return back()->with('status', 'User deactivated successfully');
    }

    /**
     * Admin offline reset temporary password.
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $this->userService->resetTemporaryPassword($user, (string) $validated['password']);

        return back()->with('status', 'User temporary password set successfully');
    }
}
