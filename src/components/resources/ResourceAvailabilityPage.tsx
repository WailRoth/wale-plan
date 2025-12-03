"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DailyAvailabilityTable } from "./DailyAvailabilityTable";
import { api } from "~/trpc/react";
import { toast } from "~/components/ui/toast/use-toast";
import { Loader2, Settings, ArrowLeft } from "lucide-react";
import { type DailyAvailabilityPattern } from "~/lib/validations/resourcePattern";

interface ResourceAvailabilityPageProps {
  className?: string;
}

export function ResourceAvailabilityPage({ className }: ResourceAvailabilityPageProps) {
  const params = useParams();
  const router = useRouter();
  const resourceId = parseInt(params.resourceId as string);

  const [hasChanges, setHasChanges] = useState(false);
  const [currentPatterns, setCurrentPatterns] = useState<DailyAvailabilityPattern[]>([]);

  // tRPC queries and mutations
  const {
    data: patternsData,
    isLoading,
    error,
    refetch,
  } = api.resourcePatterns.getByResourceId.useQuery(
    { resourceId },
    {
      enabled: !!resourceId,
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: resourceData,
    isLoading: isResourceLoading,
  } = api.resources.getById.useQuery(
    { id: resourceId },
    {
      enabled: !!resourceId,
      refetchOnWindowFocus: false,
    }
  );

  const updatePatternMutation = api.resourcePatterns.updateDailyPattern.useMutation();
  const resetToDefaultsMutation = api.resourcePatterns.resetToDefaults.useMutation();

  const patterns = patternsData?.success ? patternsData.data.patterns : [];
  const currency = patternsData?.success ? patternsData.data.currency : "USD";
  const resource = resourceData?.success ? resourceData.data : null;

  // Initialize current patterns when data loads
  React.useEffect(() => {
    if (patterns.length > 0 && currentPatterns.length === 0) {
      const normalized = patterns.map(p => ({
        dayOfWeek: p.dayOfWeekName as DailyAvailabilityPattern["dayOfWeek"],
        isActive: p.isActive,
        startTime: p.workStartTime || "09:00",
        endTime: p.workEndTime || "17:00",
        hourlyRate: p.hourlyRate ?? undefined,
      }));
      setCurrentPatterns(normalized);
    }
  }, [patterns, currentPatterns.length]);

  const handlePatternChange = (newPatterns: DailyAvailabilityPattern[]) => {
    setCurrentPatterns(newPatterns);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!resourceId || currentPatterns.length === 0) {
      toast({
        title: "Error",
        description: "No resource selected or no patterns to save",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await updatePatternMutation.mutateAsync({
        resourceId,
        patterns: currentPatterns,
        currency,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Availability patterns updated successfully",
        });
        setHasChanges(false);
        refetch();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to update patterns",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save availability patterns",
        variant: "destructive",
      });
    }
  };

  const handleResetToDefaults = async () => {
    if (!resourceId) return;

    if (!window.confirm("Are you sure you want to reset to default patterns? This will overwrite all current settings.")) {
      return;
    }

    try {
      const result = await resetToDefaultsMutation.mutateAsync({ resourceId });

      if (result.success) {
        toast({
          title: "Success",
          description: "Patterns reset to defaults successfully",
        });
        refetch();
        setHasChanges(false);
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to reset patterns",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Reset error:", error);
      toast({
        title: "Error",
        description: "Failed to reset patterns",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    // Reset to original patterns
    if (patterns.length > 0) {
      const normalized = patterns.map(p => ({
        dayOfWeek: p.dayOfWeekName as DailyAvailabilityPattern["dayOfWeek"],
        isActive: p.isActive,
        startTime: p.workStartTime || "09:00",
        endTime: p.workEndTime || "17:00",
        hourlyRate: p.hourlyRate ?? undefined,
      }));
      setCurrentPatterns(normalized);
      setHasChanges(false);
    }
  };

  const handleBack = () => {
    if (hasChanges && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }
    router.push("/dashboard/resources");
  };

  if (isLoading || isResourceLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Availability</h3>
            <p className="text-muted-foreground mb-4">
              {error.message || "Failed to load availability patterns"}
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resource) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Resource Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested resource could not be found.
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              {resource.name} — Disponibilités
            </h1>
            <p className="text-muted-foreground">
              Configurez les horaires de travail et tarifs par jour
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {resource.type}
          </Badge>
          <Badge variant={resource.isActive ? "default" : "secondary"}>
            {resource.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Availability Table */}
        <DailyAvailabilityTable
          patterns={currentPatterns.length > 0 ? currentPatterns : patterns}
          currency={currency}
          disabled={updatePatternMutation.isPending}
          onChange={handlePatternChange}
        />

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleResetToDefaults}
                  disabled={resetToDefaultsMutation.isPending || updatePatternMutation.isPending}
                >
                  {resetToDefaultsMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Réinitialiser
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={!hasChanges || updatePatternMutation.isPending}
                >
                  Annuler
                </Button>
              </div>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updatePatternMutation.isPending}
              >
                {updatePatternMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Enregistrer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}