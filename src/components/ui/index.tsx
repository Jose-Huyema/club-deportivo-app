"use client";

import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import clsx from "clsx";
import { ChevronDown, ScanLine } from "lucide-react";

/* ───────────────────────── Card ───────────────────────── */

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        "dark:border-slate-700 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}

/* ───────────────────────── Badge ───────────────────────── */

type Tone = "neutral" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", TONE_CLASSES[tone], className)}
      {...props}
    />
  );
}

/* ───────────────────────── Button ───────────────────────── */

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90 active:bg-primary/80",
  secondary: "bg-slate-100 text-primary hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-primary hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      >
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

/* ───────────────────────── FormField (Label/Input/Select/Textarea/ErrorText) ───────────────────────── */

const fieldBaseClasses =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 " +
  "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={fieldBaseClasses} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={fieldBaseClasses} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={fieldBaseClasses} rows={3} {...props} />;
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="mt-1 text-sm text-red-600 dark:text-red-400">{children}</p>;
}

/* ───────────────────────── EmptyState ───────────────────────── */

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-600">
      <p className="text-base font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ───────────────────────── CollapsibleSection ───────────────────────── */

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [abierta, setAbierta] = useState(defaultOpen);

  return (
    <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
      <button type="button" onClick={() => setAbierta((v) => !v)} className="mb-3 flex w-full items-center justify-between text-left">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</span>
        <ChevronDown className={clsx("h-4 w-4 text-slate-400 transition-transform", abierta && "rotate-180")} />
      </button>
      <div className={clsx(abierta ? "block" : "hidden")}>{children}</div>
    </div>
  );
}

/* ───────────────────────── StickyFormBar / FormBottomSpacer ───────────────────────── */

export function StickyFormBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <div className="mx-auto max-w-4xl">{children}</div>
    </div>
  );
}

export function FormBottomSpacer() {
  return <div className="h-20" aria-hidden="true" />;
}

/* ───────────────────────── ScannerInput ───────────────────────── */

export function ScannerInput({
  onScan,
  placeholder = "Escaneá el carnet…",
  disabled = false,
}: {
  onScan: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = value.trim();
      setValue("");
      if (code) onScan(code);
    }
  }

  function handleBlur() {
    if (!disabled) setTimeout(() => inputRef.current?.focus(), 150);
  }

  return (
    <div className="relative">
      <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-center text-base tracking-wide focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
      />
    </div>
  );
}
