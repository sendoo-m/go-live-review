<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogObserver
{
    /**
     * Handle the Model "created" event.
     */
    public function created(Model $model): void
    {
        $this->logAction($model, 'created', null, $model->getAttributes());
    }

    /**
     * Handle the Model "updated" event.
     */
    public function updated(Model $model): void
    {
        $oldValues = array_intersect_key($model->getOriginal(), $model->getChanges());
        $newValues = $model->getChanges();

        // تجنب تسجيل التحديث إذا كان الحقل الوحيد المتغير هو updated_at
        unset($oldValues['updated_at'], $newValues['updated_at']);

        if (!empty($newValues)) {
            $this->logAction($model, 'updated', $oldValues, $newValues);
        }
    }

    /**
     * Handle the Model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        $this->logAction($model, 'deleted', $model->getOriginal(), null);
    }

    /**
     * Handle the Model "restored" event.
     */
    public function restored(Model $model): void
    {
        $this->logAction($model, 'restored', null, ['deleted_at' => null]);
    }

    /**
     * كتابة السجل في جدول audit_logs كعملية إضافة فقط (Append-Only)
     */
    protected function logAction(Model $model, string $action, ?array $oldValues, ?array $newValues): void
    {
        // تجنب تسجيل عمليات نموذج AuditLog نفسه لمنع الحلقات اللانهائية
        if ($model instanceof AuditLog) {
            return;
        }

        // إخفاء الحقول الحساسة مثل كلمات المرور
        $hiddenFields = ['password', 'remember_token', 'two_factor_secret'];
        if ($oldValues) {
            foreach ($hiddenFields as $field) {
                unset($oldValues[$field]);
            }
        }
        if ($newValues) {
            foreach ($hiddenFields as $field) {
                unset($newValues[$field]);
            }
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'model_type' => get_class($model),
            'model_id' => $model->getKey(),
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip() ?? '127.0.0.1',
            'user_agent' => Request::userAgent() ?? 'API Client',
            'created_at' => now(),
        ]);
    }
}
