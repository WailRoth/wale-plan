"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { User, Package, Wrench, Info, X } from "lucide-react";
import type { ResourceType } from "~/lib/types/resource";

interface ResourceTypeSelectorProps {
  value: ResourceType;
  onValueChange: (value: ResourceType) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const resourceTypeInfo = {
  human: {
    label: "Human",
    description: "Team members, employees, contractors",
    icon: User,
    color: "blue",
  },
  material: {
    label: "Material",
    description: "Raw materials, supplies, consumables",
    icon: Package,
    color: "green",
  },
  equipment: {
    label: "Equipment",
    description: "Tools, machinery, hardware, devices",
    icon: Wrench,
    color: "orange",
  },
};

export function ResourceTypeSelector({
  value,
  onValueChange,
  placeholder = "Select resource type",
  disabled = false,
  error,
  className,
}: ResourceTypeSelectorProps) {
  const currentInfo = resourceTypeInfo[value];

  return (
    <div className="space-y-2">
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={error ? "border-red-500" : className}>
          <SelectValue placeholder={placeholder}>
            {value && (
              <div className="flex items-center">
                <currentInfo.icon className="mr-2 h-4 w-4" />
                <span>{currentInfo.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(resourceTypeInfo).map(([type, info]) => (
            <SelectItem key={type} value={type}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <info.icon className="mr-2 h-4 w-4" />
                  <span>{info.label}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    info.color === "blue"
                      ? "border-blue-200 text-blue-700"
                      : info.color === "green"
                      ? "border-green-200 text-green-700"
                      : "border-orange-200 text-orange-700"
                  }`}
                >
                  {type}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-sm text-red-500 flex items-center">
          <X className="mr-1 h-3 w-3" />
          {error}
        </p>
      )}

      {value && (
        <p className="text-xs text-gray-500 flex items-center">
          <Info className="mr-1 h-3 w-3" />
          {currentInfo.description}
        </p>
      )}
    </div>
  );
}

// Export a memoized version
export const MemoizedResourceTypeSelector = React.memo(ResourceTypeSelector);