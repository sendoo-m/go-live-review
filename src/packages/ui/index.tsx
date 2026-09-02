// ============================================================================
// Daleel Ay Khidma - Shared UI Components Library
// ============================================================================

import React, { ReactNode } from "react";
import { Star, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, Loader2, X } from "lucide-react";

// ============================================================================
// 1. Button Component
// ============================================================================
export interface ButtonProps {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "emerald";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e?: any) => void | Promise<void>;
  type?: "button" | "submit" | "reset";
  id?: string;
  title?: string;
  [key: string]: any;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled = false,
  onClick,
  type = "button",
  id,
  title,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs sm:text-sm gap-2",
    lg: "px-6 py-3 text-sm sm:text-base gap-2.5",
  }[size];

  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200",
    outline: "bg-transparent hover:bg-slate-50 text-slate-700 border border-slate-300",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow",
  }[variant];

  return (
    <button
      id={id}
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : leftIcon}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon}
    </button>
  );
}

// ============================================================================
// 2. Badge Component
// ============================================================================
export interface BadgeProps {
  children: ReactNode;
  variant?: "indigo" | "emerald" | "amber" | "red" | "slate" | "blue";
  size?: "sm" | "md";
  className?: string;
  [key: string]: any;
}

export function Badge({ children, variant = "slate", size = "sm", className = "", ...props }: BadgeProps) {
  const variantStyles = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    amber: "bg-amber-50 text-amber-700 border-amber-200/80",
    red: "bg-red-50 text-red-700 border-red-200/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200/80",
  }[variant];

  const sizeStyles = size === "sm" ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// ============================================================================
// 3. Form Input Component
// ============================================================================
export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  className?: string;
  id?: string;
  required?: boolean;
  type?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  name?: string;
  autoFocus?: boolean;
  [key: string]: any;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  className = "",
  id,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  ...props
}: InputProps) {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, "-")}` : undefined);
  return (
    <div className="space-y-1.5 text-right w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{leftIcon}</div>}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-white text-slate-900 text-xs sm:text-sm rounded-xl border ${
            error ? "border-red-400 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
          } ${leftIcon ? "pr-10" : "pr-3.5"} pl-3.5 py-2.5 transition-all outline-none focus:ring-2 shadow-xs ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] font-medium text-red-600 flex items-center gap-1 mt-1">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>}
    </div>
  );
}

// ============================================================================
// 4. Form Select Component
// ============================================================================
export interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  className?: string;
  id?: string;
  required?: boolean;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  name?: string;
  [key: string]: any;
}

export function Select({
  label,
  error,
  options,
  className = "",
  id,
  required = false,
  value,
  onChange,
  disabled = false,
  ...props
}: SelectProps) {
  const selectId = id || (label ? `select-${label.replace(/\s+/g, "-")}` : undefined);
  return (
    <div className="space-y-1.5 text-right w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full bg-white text-slate-900 text-xs sm:text-sm rounded-xl border ${
          error ? "border-red-400 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
        } px-3.5 py-2.5 transition-all outline-none focus:ring-2 font-medium shadow-xs ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] font-medium text-red-600 mt-1">{error}</p>}
    </div>
  );
}

// ============================================================================
// 5. Form Textarea Component
// ============================================================================
export interface TextareaProps {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
  required?: boolean;
  rows?: number;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  [key: string]: any;
}

export function Textarea({
  label,
  error,
  className = "",
  id,
  required = false,
  rows = 3,
  value,
  onChange,
  placeholder,
  disabled = false,
  ...props
}: TextareaProps) {
  const textareaId = id || (label ? `textarea-${label.replace(/\s+/g, "-")}` : undefined);
  return (
    <div className="space-y-1.5 text-right w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        required={required}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-white text-slate-900 text-xs sm:text-sm rounded-xl border ${
          error ? "border-red-400 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
        } p-3.5 transition-all outline-none focus:ring-2 shadow-xs resize-y ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] font-medium text-red-600 mt-1">{error}</p>}
    </div>
  );
}

// ============================================================================
// 6. Rating Stars Component
// ============================================================================
export function RatingStars({
  rating,
  reviewsCount,
  showText = true,
  size = "md",
  interactive = false,
  onRatingChange,
}: {
  rating: number;
  reviewsCount?: number;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (val: number) => void;
}) {
  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${starSizes} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""} ${
              star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <span>{rating > 0 ? rating.toFixed(1) : "جديد"}</span>
          {reviewsCount !== undefined && <span className="text-slate-400 font-normal">({reviewsCount})</span>}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 7. Modal Component
// ============================================================================
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`bg-white rounded-2xl border border-slate-200 shadow-2xl w-full ${maxWidth} overflow-hidden max-h-[90vh] flex flex-col text-right animate-in zoom-in-95 duration-150`}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. Empty State Component
// ============================================================================
export function EmptyState({
  icon: Icon = AlertCircle,
  title,
  description,
  actionText,
  onAction,
}: {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="py-14 px-4 text-center rounded-2xl bg-white border border-slate-200 border-dashed space-y-3">
      <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// 9. Pagination Component
// ============================================================================
export function Pagination({
  currentPage,
  lastPage,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-slate-200 text-xs">
      {totalItems !== undefined && (
        <span className="text-slate-500 font-medium">
          عرض الصفحة <span className="font-bold text-slate-900">{currentPage}</span> من إجمالي <span className="font-bold text-slate-900">{lastPage}</span>
        </span>
      )}
      <div className="flex items-center gap-1.5 mr-auto">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronRight className="w-4 h-4" />}
        >
          السابق
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === pageNum ? "bg-indigo-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronLeft className="w-4 h-4" />}
        >
          التالي
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// 10. Skeleton Loader
// ============================================================================
export function Skeleton({ className = "", ...props }: { className?: string; [key: string]: any }) {
  return <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} {...props} />;
}

export * from "./SocialShareModal";

