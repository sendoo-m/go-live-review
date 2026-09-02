<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    protected AuditLogService $auditLogService;

    public function __construct(AuditLogService $auditLogService)
    {
        $this->auditLogService = $auditLogService;
    }

    /**
     * استعراض سجل العمليات الشامل غير القابل للمحو (مع فلاتر البحث والتاريخ)
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'user_id',
            'action',
            'model_type',
            'model_id',
            'from_date',
            'to_date',
        ]);

        $perPage = min((int)$request->input('per_page', 25), 100);
        $paginator = $this->auditLogService->getPaginatedLogs($filters, $perPage);

        return response()->json([
            'count' => $paginator->total(),
            'next' => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
            'results' => AuditLogResource::collection($paginator->items()),
        ]);
    }
}
