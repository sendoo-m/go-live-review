// ============================================================================
// Daleel Ay Khidma - Admin Reviews & User Reports Moderation
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { ReviewDTO } from "../../../packages/types";
import { Button, RatingStars, Badge, EmptyState, Skeleton } from "../../../packages/ui";
import { MessageSquare, CheckCircle2, XCircle, Trash2, Flag, AlertTriangle, User } from "lucide-react";

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [filter, setFilter] = useState<"all" | "reported" | "pending">("all");
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.getReviews({
        is_reported: filter === "reported" ? true : undefined,
        is_approved: filter === "pending" ? false : undefined,
      });
      if (res.data) setReviews(res.data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const handleModerate = async (id: number, action: "approve" | "reject" | "delete") => {
    try {
      await api.moderateReview(id, action);
      await loadReviews();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء معالجة التقييم");
    }
  };

  return (
    <div className="space-y-6 text-right pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">مراجعة التقييمات وبلاغات المحتوى</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            التحقق من مصداقية تقييمات العملاء وحل بلاغات المحتوى المخالف
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === "all" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            كافة التقييمات ({reviews.length})
          </button>
          <button
            onClick={() => setFilter("reported")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === "reported" ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            البلاغات والشكاوى
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="لا توجد تقييمات أو بلاغات حالياً"
          description="جميع التقييمات مفحوصة ومطابقة لمعايير النشر."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-white rounded-2xl p-5 border ${
                rev.is_reported ? "border-red-200 bg-red-50/20" : "border-slate-200"
              } shadow-xs space-y-3`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {rev.user?.name ? rev.user.name.charAt(0) : "ع"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{rev.user?.name || "مستخدم مسجل"}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rev.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RatingStars rating={rev.rating} showText={false} size="sm" />
                  {rev.is_reported && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      <Flag className="w-3 h-3" />
                      مُبلّغ عنه
                    </span>
                  )}
                  {rev.is_approved ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      معتمد
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      قيد الفحص
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed pr-12">{rev.comment}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                {!rev.is_approved && (
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => handleModerate(rev.id, "approve")}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    اعتماد التقييم
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleModerate(rev.id, "delete")}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  حذف التقييم
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
