<?php

use App\Http\Requests\StrictFormRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\File;

/**
 * Every form request class shipped by the application.
 *
 * @return array<int, class-string>
 */
function applicationRequestClasses(): array
{
    return collect(File::allFiles(app_path('Http/Requests')))
        ->map(function ($file): string {
            $relative = str_replace(['\\', '/'], '\\', $file->getRelativePathname());

            return 'App\\Http\\Requests\\'.substr($relative, 0, -strlen('.php'));
        })
        ->filter(fn (string $class): bool => class_exists($class))
        ->values()
        ->all();
}

test('every form request extends the strict base so unknown fields are rejected', function () {
    $classes = applicationRequestClasses();

    expect($classes)->not->toBeEmpty();

    foreach ($classes as $class) {
        if ($class === StrictFormRequest::class) {
            continue;
        }

        expect(is_subclass_of($class, StrictFormRequest::class))
            ->toBeTrue("{$class} must extend StrictFormRequest.");
    }
});

test('no form request overrides withValidator, which would drop the strict check', function () {
    foreach (applicationRequestClasses() as $class) {
        if ($class === StrictFormRequest::class) {
            continue;
        }

        $method = new ReflectionMethod($class, 'withValidator');

        expect($method->getDeclaringClass()->getName())
            ->toBe(StrictFormRequest::class, "{$class} overrides withValidator; use withStrictValidator instead.");
    }
});

test('no controller validates inline; the rules live in a request class', function () {
    $controllers = collect(File::allFiles(app_path('Http/Controllers')))
        ->map(fn ($file): string => $file->getPathname())
        ->filter(fn (string $path): bool => str_ends_with($path, 'Controller.php'));

    expect($controllers)->not->toBeEmpty();

    foreach ($controllers as $path) {
        $source = (string) file_get_contents($path);

        expect(str_contains($source, '$request->validate('))
            ->toBeFalse(basename($path).' validates inline; move the rules into a form request.');

        expect(str_contains($source, 'Validator::make('))
            ->toBeFalse(basename($path).' builds a validator inline; move the rules into a form request.');
    }
});

test('the base request is a laravel form request', function () {
    expect(is_subclass_of(StrictFormRequest::class, FormRequest::class))->toBeTrue();
});
