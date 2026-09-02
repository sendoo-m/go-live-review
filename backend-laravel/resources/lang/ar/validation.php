<?php

return [
    'accepted' => 'يجب قبول :attribute.',
    'active_url' => ':attribute لا يمثل رابطاً صالحاً.',
    'after' => 'يجب أن يكون :attribute تاريخاً لاحقاً لـ :date.',
    'between' => [
        'numeric' => 'يجب أن تكون قيمة :attribute بين :min و :max.',
        'string' => 'يجب أن يكون طول نص :attribute بين :min و :max حروف.',
    ],
    'email' => 'يجب أن يكون :attribute عنوان بريد إلكتروني صالح.',
    'exists' => 'القيمة المحددة في :attribute غير صالحة أو غير موجودة في قاعدة البيانات.',
    'integer' => 'يجب أن يكون :attribute عدداً صحيحاً.',
    'max' => [
        'numeric' => 'يجب ألا تتجاوز قيمة :attribute :max.',
        'string' => 'يجب ألا يتجاوز طول نص :attribute :max حرفاً.',
    ],
    'min' => [
        'numeric' => 'يجب أن تكون قيمة :attribute على الأقل :min.',
        'string' => 'يجب أن يحتوي نص :attribute على الأقل :min حروف.',
    ],
    'required' => 'حقل :attribute مطلوب ولا يمكن تركه فارغاً.',
    'unique' => 'قيمة :attribute مستخدمة بالفعل، يرجى اختيار قيمة أخرى.',
    'attributes' => [
        'name_ar' => 'اسم النشاط بالعربية',
        'category_id' => 'التصنيف الرئيسي',
        'location_id' => 'الموقع الجغرافي (المدينة / المحافظة)',
        'address_ar' => 'العنوان التفصيلي',
        'phone' => 'رقم الهاتف',
        'rating' => 'التقييم',
        'comment' => 'نص المراجعة',
        'email' => 'البريد الإلكتروني',
        'password' => 'كلمة المرور',
    ],
];
