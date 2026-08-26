<?php

use App\Models\Business;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('a successful write flashes a status the page can render', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)
        ->post(route('businesses.store'), ['name' => 'Flash Test Corp'])
        ->assertRedirect();

    $this->actingAs($editor)
        ->get(route('businesses.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('status', 'Business created successfully')
        );
});

test('a page with nothing to report shares no status', function () {
    Business::factory()->create();

    $this->actingAs(User::factory()->viewer()->create())
        ->get(route('businesses.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('status', null));
});
