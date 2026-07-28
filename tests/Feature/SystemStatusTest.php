<?php

test('web system status endpoint returns valid response', function () {
    $response = $this->get('/system-status');

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'ok',
            'version' => 'v1',
        ]);
});
