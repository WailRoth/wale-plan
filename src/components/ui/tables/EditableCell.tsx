"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast/use-toast";
import { Check, X, Edit, AlertCircle, Info } from "lucide-react";

interface EditableCellProps<T = string | number> {
  value: T;
  onSave: (value: T) => Promise<void> | void;
  type?: "text" | "number" | "email" | "select";
  options?: Array<{ value: T; label: string }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  renderValue?: (value: T) => React.ReactNode;
  icon?: React.ReactNode;
}

const formSchema = z.object({
  value: z.union([z.string(), z.number()]),
});

type FormData = z.infer<typeof formSchema>;

export function EditableCell<T extends string | number>({
  value,
  onSave,
  type = "text",
  options,
  placeholder,
  className,
  disabled = false,
  renderValue,
  icon,
}: EditableCellProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      value: value,
    },
  });

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      if (type === "select" && selectRef.current) {
        selectRef.current.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const startEditing = () => {
    if (!disabled) {
      reset({ value: value });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSave(data.value as T);
      setIsEditing(false);
      reset();
    } catch (error) {
      console.error("Failed to save:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      cancelEditing();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const handleBlur = () => {
    // Small delay to allow click events on other elements
    setTimeout(() => {
      if (isEditing) {
        cancelEditing();
      }
    }, 200);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <Controller
          name="value"
          control={control}
          render={({ field }) => (
            type === "select" && options ? (
              <select
                {...field}
                value={String(field.value)}
                onChange={(e) => field.onChange(
                  typeof value === "number" ? Number(e.target.value) : e.target.value
                )}
                className="w-full h-8 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                ref={selectRef}
              >
                {options.map((option) => (
                  <option key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative flex items-center">
                {icon && (
                  <div className="absolute left-2 z-10 text-gray-400">
                    {icon}
                  </div>
                )}
                <Input
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  value={typeof field.value === 'number' ? field.value : (field.value || '')}
                  onChange={(e) => field.onChange(
                    type === 'number' ? Number(e.target.value) || 0 : e.target.value
                  )}
                  className={`h-8 ${icon ? "pl-8" : ""} ${errors.value ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  ref={inputRef}
                />
              </div>
            )
          )}
        />
        <div className="absolute right-0 top-0 flex space-x-1 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            disabled={isLoading || !isValid}
            className="h-6 px-1"
          >
            <Check className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={cancelEditing}
            disabled={isLoading}
            className="h-6 px-1"
          >
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`relative group cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1 -my-0.5 ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
      onClick={startEditing}
      title={disabled ? "Read-only" : "Click to edit"}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0">
          {icon && <span className="mr-2 text-gray-400">{icon}</span>}
          <span className="truncate">
            {renderValue ? renderValue(value) : String(value)}
          </span>
        </div>
        {!disabled && (
          <Edit className="ml-2 h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
}

// Specialized components for common use cases
export function EditableTextCell(props: Omit<EditableCellProps<string>, "type">) {
  return <EditableCell {...props} type="text" />;
}

export function EditableNumberCell(props: Omit<EditableCellProps<number>, "type">) {
  return <EditableCell {...props} type="number" />;
}

export function EditableEmailCell(props: Omit<EditableCellProps<string>, "type">) {
  return <EditableCell {...props} type="email" />;
}

export function EditableSelectCell<T extends string | number>(
  props: Omit<EditableCellProps<T>, "type"> & { options: Array<{ value: T; label: string }> }
) {
  return <EditableCell {...props} type="select" />;
}