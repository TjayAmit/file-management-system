<?php

use App\DTOs\SystemStatusData;
use App\Repositories\Interface\SystemStatus;

test('api v1 status endpoint returns valid response', function () {
    $response = $this->getJson('/api/v1/status');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'System status retrieved successfully',
            'data' => [
                'status' => 'ok',
                'version' => 'v1',
            ],
        ]);
});

test('api v1 status endpoint respects repository interface mocking', function () {
    $mockRepo = Mockery::mock(SystemStatus::class);
    $mockRepo->shouldReceive('getStatus')
        ->once()
        ->andReturn(new SystemStatusData(
            status: 'maintenance',
            version: 'v1-mocked',
            environment: 'testing',
            meta: ['mocked' => true]
        ));

    $this->app->instance(SystemStatus::class, $mockRepo);

    $response = $this->getJson('/api/v1/status');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'status' => 'maintenance',
                'version' => 'v1-mocked',
            ],
        ]);
});
