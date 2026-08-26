<?php

use Illuminate\Support\Facades\Storage;

test('the private disk documents are stored on is configured', function () {
    $disk = config('filesystems.disks.private');

    expect($disk)->not->toBeNull()
        ->and($disk['driver'])->toBe('local')
        ->and($disk['visibility'] ?? null)->toBe('private');
});

test('the private disk exposes no public url', function () {
    expect(config('filesystems.disks.private.url'))->toBeNull()
        ->and(config('filesystems.disks.private.serve'))->toBeFalse();
});

test('the private disk resolves without faking it', function () {
    $path = Storage::disk('private')->path('probe.pdf');

    expect($path)->toContain('documents');
});
