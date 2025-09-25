import { useEffect, useMemo, useState } from "react";
import type {
  FormEvent,
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import Modal from "./Modal";

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "password"
  | "date"
  | "time"
  | "datetime-local"
  | "select";

export interface FormFieldOption {
  value: string | number;
  label: string;
}

export type FormValues<T extends Record<string, unknown>> = Partial<Record<keyof T, unknown>>;

export interface FormFieldConfig<T extends Record<string, unknown>> {
  name: keyof T & string;
  label: ReactNode;
  type?: FormFieldType;
  placeholder?: string;
  description?: ReactNode;
  required?: boolean;
  options?: FormFieldOption[];
  disabled?: boolean;
  autoFocus?: boolean;
  render?: (params: {
    value: unknown;
    setValue: (value: unknown) => void;
    error?: string;
    disabled?: boolean;
  }) => ReactNode;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange">;
  textareaProps?: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "value" | "onChange">;
  selectProps?: Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "value" | "onChange">;
}

export type FormErrors<T extends Record<string, unknown>> = Partial<Record<keyof T, string>>;

export interface FormDialogProps<T extends Record<string, unknown>> {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  fields: Array<FormFieldConfig<T>>;
  initialValues?: FormValues<T>;
  onSubmit: (values: FormValues<T>) => void | Promise<void>;
  onClose: () => void;
  validate?: (values: FormValues<T>) => FormErrors<T>;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  closeOnSubmitSuccess?: boolean;
  sizeClassName?: string;
  className?: string;
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const baseInputClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus-visible:outline-none focus-visible:ring focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50";

const errorInputClasses = "border-red-500 focus-visible:ring-red-200";
const labelClasses = "text-sm font-medium text-slate-700";
const helperClasses = "text-xs text-slate-500";
const errorTextClasses = "text-xs text-red-600";

function sanitizeInitialValues<T extends Record<string, unknown>>(values?: FormValues<T>) {
  if (!values) {
    return {} as FormValues<T>;
  }
  return { ...values } as FormValues<T>;
}

export function FormDialog<T extends Record<string, unknown>>({
  open,
  title,
  description,
  fields,
  initialValues,
  onSubmit,
  onClose,
  validate,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isSubmitting,
  closeOnSubmitSuccess = true,
  sizeClassName,
  className,
}: FormDialogProps<T>) {
  const [values, setValues] = useState<FormValues<T>>(() => sanitizeInitialValues(initialValues));
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [internalSubmitting, setInternalSubmitting] = useState(false);

  const resolvedSubmitting = isSubmitting ?? internalSubmitting;

  useEffect(() => {
    if (open) {
      setValues(sanitizeInitialValues(initialValues));
      setErrors({});
    }
  }, [open, initialValues]);

  const handleFieldChange = (name: keyof T & string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const runValidation = (): FormErrors<T> => {
    const nextErrors: FormErrors<T> = {};

    fields.forEach((field) => {
      const value = values[field.name];
      if (field.required) {
        if (value === null || value === undefined || value === "") {
          nextErrors[field.name] = "This field is required.";
        }
      }
    });

    if (validate) {
      const customErrors = validate(values);
      Object.assign(nextErrors, customErrors);
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (resolvedSubmitting) {
      return;
    }

    const validationResult = runValidation();

    if (Object.values(validationResult).some(Boolean)) {
      setErrors(validationResult);

      const firstErrorField = fields.find((field) => validationResult[field.name]);
      if (firstErrorField) {
        window.requestAnimationFrame(() => {
          const element = document.querySelector(`[data-field-name="${firstErrorField.name}"]`);
          if (element instanceof HTMLElement) {
            element.focus();
          }
        });
      }

      return;
    }

    try {
      if (isSubmitting === undefined) {
        setInternalSubmitting(true);
      }

      await onSubmit(values);

      if (closeOnSubmitSuccess) {
        onClose();
      }
    } catch (error) {
      console.error("Form submission failed", error);
    } finally {
      if (isSubmitting === undefined) {
        setInternalSubmitting(false);
      }
    }
  };

  const fieldElements = useMemo(
    () =>
      fields.map((field) => {
        const fieldValue = values[field.name];
        const error = errors[field.name];
        const baseId = `field-${field.name}`;
        const helperId = error ? `${baseId}-error` : field.description ? `${baseId}-help` : undefined;

        if (field.render) {
          return (
            <div key={field.name} className="flex flex-col gap-1">
              <label htmlFor={baseId} className={labelClasses}>
                {field.label}
              </label>
              {field.render({
                value: fieldValue,
                setValue: (value) => handleFieldChange(field.name, value),
                error,
                disabled: field.disabled ?? resolvedSubmitting,
              })}
              {error ? (
                <p id={helperId} className={errorTextClasses}>
                  {error}
                </p>
              ) : field.description ? (
                <p id={helperId} className={helperClasses}>
                  {field.description}
                </p>
              ) : null}
            </div>
          );
        }

        const commonProps = {
          id: baseId,
          name: field.name,
          "data-field-name": field.name,
          disabled: field.disabled ?? resolvedSubmitting,
          "aria-invalid": Boolean(error) || undefined,
          "aria-describedby": helperId,
          autoFocus: field.autoFocus,
        } as const;

        const controlValue =
          fieldValue === null || fieldValue === undefined ? "" : String(fieldValue);

        switch (field.type) {
          case "textarea":
            return (
              <div key={field.name} className="flex flex-col gap-1">
                <label htmlFor={baseId} className={labelClasses}>
                  {field.label}
                </label>
                <textarea
                  {...commonProps}
                  className={cn(baseInputClasses, "min-h-[6rem]", error && errorInputClasses)}
                  placeholder={field.placeholder}
                  value={controlValue}
                  onChange={(event) => handleFieldChange(field.name, event.target.value)}
                  {...field.textareaProps}
                />
                {error ? (
                  <p id={helperId} className={errorTextClasses}>
                    {error}
                  </p>
                ) : field.description ? (
                  <p id={helperId} className={helperClasses}>
                    {field.description}
                  </p>
                ) : null}
              </div>
            );
          case "select":
            return (
              <div key={field.name} className="flex flex-col gap-1">
                <label htmlFor={baseId} className={labelClasses}>
                  {field.label}
                </label>
                <select
                  {...commonProps}
                  className={cn(baseInputClasses, error && errorInputClasses)}
                  value={controlValue}
                  onChange={(event) => handleFieldChange(field.name, event.target.value)}
                  {...field.selectProps}
                >
                  <option value="" disabled>
                    {field.placeholder ?? "Select an option"}
                  </option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {error ? (
                  <p id={helperId} className={errorTextClasses}>
                    {error}
                  </p>
                ) : field.description ? (
                  <p id={helperId} className={helperClasses}>
                    {field.description}
                  </p>
                ) : null}
              </div>
            );
          default:
            return (
              <div key={field.name} className="flex flex-col gap-1">
                <label htmlFor={baseId} className={labelClasses}>
                  {field.label}
                </label>
                <input
                  {...commonProps}
                  className={cn(baseInputClasses, error && errorInputClasses)}
                  placeholder={field.placeholder}
                  type={field.type ?? "text"}
                  value={controlValue}
                  onChange={(event) => handleFieldChange(field.name, event.target.value)}
                  {...field.inputProps}
                />
                {error ? (
                  <p id={helperId} className={errorTextClasses}>
                    {error}
                  </p>
                ) : field.description ? (
                  <p id={helperId} className={helperClasses}>
                    {field.description}
                  </p>
                ) : null}
              </div>
            );
        }
      }),
    [errors, fields, resolvedSubmitting, values],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      sizeClassName={sizeClassName}
      className={className}
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4">{fieldElements}</div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
            disabled={resolvedSubmitting}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={resolvedSubmitting}
          >
            {resolvedSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default FormDialog;
