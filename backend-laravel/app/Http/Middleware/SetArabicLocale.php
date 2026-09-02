<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetArabicLocale
{
    /**
     * Handle an incoming request.
     *
     * يضمن ضبط اللغة الافتراضية للتطبيق إلى العربية وإرجاع ترويسات اللغة واتجاه النص RTL.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language', 'ar');
        $locale = in_array($locale, ['ar', 'en']) ? $locale : 'ar';

        App::setLocale($locale);

        $response = $next($request);

        if (method_exists($response, 'header')) {
            $response->header('Content-Language', $locale);
            $response->header('X-Direction', $locale === 'ar' ? 'rtl' : 'ltr');
        }

        return $response;
    }
}
