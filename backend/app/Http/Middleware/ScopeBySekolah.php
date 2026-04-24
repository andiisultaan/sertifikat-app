<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ScopeBySekolah
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isAdmin() && $user->sekolah_id) {
            $request->merge(['_sekolah_id' => (int) $user->sekolah_id]);
        }

        return $next($request);
    }
}
