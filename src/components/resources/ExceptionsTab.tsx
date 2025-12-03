"use client";

import React from "react";
import { ExceptionList } from "./ExceptionList";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Calendar,
  Info,
  TriangleAlert,
  Lightbulb,
  CheckCircle
} from "lucide-react";

interface ExceptionsTabProps {
  resourceId: number;
  currency?: string;
  className?: string;
}

export function ExceptionsTab({ resourceId, currency = "USD", className }: ExceptionsTabProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Availability Exceptions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create one-time exceptions to override the regular weekly availability patterns.
            These exceptions take priority over weekly schedules and are perfect for holidays, vacations, or special events.
          </p>

          {/* Priority Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Priority Rules:</strong> Exceptions override weekly patterns.
              If multiple exceptions exist for the same date, the active one with the highest priority will be used.
            </AlertDescription>
          </Alert>

          {/* Best Practices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span>Holidays and vacation days</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span>Special working events</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span>Training periods</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
                <span>0 hours = Non-working day</span>
              </div>
              <div className="flex items-center text-sm">
                <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
                <span>Active exceptions override patterns</span>
              </div>
              <div className="flex items-center text-sm">
                <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
                <span>One exception per date allowed</span>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <Alert>
            <TriangleAlert className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Note:</strong> Exception rates are automatically set to non-working type when hours available is 0,
              regardless of the hourly rate specified.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Exception List */}
      <ExceptionList
        resourceId={resourceId}
        currency={currency}
      />
    </div>
  );
}

// Export a memoized version
export const MemoizedExceptionsTab = React.memo(ExceptionsTab);