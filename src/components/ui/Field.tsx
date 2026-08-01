import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const fieldClasses =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {children}
    </label>
  );
}

type FieldWrapperProps = { label?: string; name?: string; children: ReactNode };

export function FieldWrapper({ label, name, children }: FieldWrapperProps) {
  return (
    <div>
      {label ? <Label htmlFor={name}>{label}</Label> : null}
      {children}
    </div>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(function Input({ className, label, id, name, ...props }, ref) {
  return (
    <FieldWrapper label={label} name={id ?? name}>
      <input ref={ref} id={id ?? name} name={name} className={cn(fieldClasses, className)} {...props} />
    </FieldWrapper>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
>(function Select({ className, label, id, name, children, ...props }, ref) {
  return (
    <FieldWrapper label={label} name={id ?? name}>
      <select ref={ref} id={id ?? name} name={name} className={cn(fieldClasses, className)} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
>(function Textarea({ className, label, id, name, ...props }, ref) {
  return (
    <FieldWrapper label={label} name={id ?? name}>
      <textarea ref={ref} id={id ?? name} name={name} className={cn(fieldClasses, className)} {...props} />
    </FieldWrapper>
  );
});
