<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Allowed Office Network CIDRs
    |--------------------------------------------------------------------------
    |
    | Comma-separated list of IPv4/IPv6 CIDR ranges considered "on the office
    | network" (PLAN.md §6.10). Web and API requests are rejected unless the
    | client IP falls inside one of these ranges. Leave empty to disable the
    | gate (e.g. for local development).
    |
    */

    'allowed_cidrs' => array_filter(array_map(
        'trim',
        explode(',', (string) env('NETWORK_ALLOWED_CIDRS', ''))
    )),

];
