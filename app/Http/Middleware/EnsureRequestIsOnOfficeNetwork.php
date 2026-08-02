<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\IpUtils;
use Symfony\Component\HttpFoundation\Response;

class EnsureRequestIsOnOfficeNetwork
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var array<int, string> $allowedCidrs */
        $allowedCidrs = config('network.allowed_cidrs', []);

        if ($allowedCidrs === [] || IpUtils::checkIp((string) $request->ip(), $allowedCidrs)) {
            return $next($request);
        }

        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'This system is only accessible from the office network.',
            ], 403);
        }

        abort(403, 'This system is only accessible from the office network.');
    }
}
