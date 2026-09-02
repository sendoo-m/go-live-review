<?php

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\GeographicScope;
use App\Http\Middleware\SetArabicLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // تسجيل الـ Middleware Aliases
        $middleware->alias([
            'permission' => CheckPermission::class,
            'geo.scope' => GeographicScope::class,
            'arabic.locale' => SetArabicLocale::class,
        ]);

        // تطبيق ضبط اللغة العربية على مسارات الـ API تلقائياً
        $middleware->api(append: [
            SetArabicLocale::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // تخصيص استجابات الاستثناءات بالعربية
    })->create();
