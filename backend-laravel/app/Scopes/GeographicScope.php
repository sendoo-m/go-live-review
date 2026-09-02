<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class GeographicScope implements Scope
{
    /**
     * Apply the geographic scope to a given Eloquent query builder.
     *
     * يتم تطبيق هذا النطاق الجغرافي تلقائياً لتقييد الأنشطة المعروضة بالنطاق الجغرافي
     * المخصص للمستخدم (مثل مراجع أنشطة أسيوط أو مدير فرع محلي)،
     * مع استثناء "المدير العام" أو من يملك صلاحية تجاوز النطاق الجغرافي.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::user();

        if (!$user) {
            return;
        }

        // إذا كان المستخدم مديراً عاماً أو لا يخضع لتقييد جغرافي، لا نقيد الاستعلام
        if ($user->isGeneralManager() || !$user->requiresGeoScope()) {
            return;
        }

        // تقييد الاستعلام بالمدينة / المحافظة التابع لها المستخدم
        if ($user->location_id) {
            $builder->where($model->qualifyColumn('location_id'), $user->location_id);
        }
    }
}
