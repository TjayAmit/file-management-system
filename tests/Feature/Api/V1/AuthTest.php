<?php

use App\Models\User;

test('login issues an api token for valid credentials', function () {
    $user = User::factory()->editor()->create([
        'email' => 'editor@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'editor@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'user' => ['id' => $user->id, 'email' => 'editor@example.com'],
            ],
        ])
        ->assertJsonStructure(['data' => ['token']]);
});

test('login rejects invalid credentials', function () {
    User::factory()->editor()->create([
        'email' => 'editor@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'editor@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(401)
        ->assertJson(['success' => false]);
});

test('requests off the office network are rejected', function () {
    config(['network.allowed_cidrs' => ['10.0.0.0/24']]);

    $response = $this->getJson('/api/v1/status');

    $response->assertStatus(403)
        ->assertJson(['success' => false]);
});

test('requests inside the configured office network are allowed', function () {
    config(['network.allowed_cidrs' => ['127.0.0.0/8']]);

    $response = $this->getJson('/api/v1/status');

    $response->assertStatus(200);
});

test('viewer cannot mutate via the api', function () {
    $viewer = User::factory()->viewer()->create();

    $response = $this->actingAs($viewer, 'sanctum')->postJson('/api/v1/businesses', [
        'name' => 'Acme Co',
    ]);

    $response->assertStatus(403)
        ->assertJson(['success' => false]);
});

test('editor can mutate via the api', function () {
    $editor = User::factory()->editor()->create();

    $response = $this->actingAs($editor, 'sanctum')->postJson('/api/v1/businesses', [
        'name' => 'Acme Co',
    ]);

    $response->assertStatus(201);
});
