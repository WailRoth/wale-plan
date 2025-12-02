"use client";

import { Building, Users, Clock, Edit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface Organization {
  id: number;
  name: string;
  timezone: string;
  role: string;
  memberCount?: number;
}

interface OrganizationDisplayProps {
  organization: Organization;
  onEdit?: () => void;
  onOrganizationChange?: (organizationId: number) => void;
  userOrganizations?: Organization[];
  currentOrganizationId?: number;
}

export function OrganizationDisplay({
  organization,
  onEdit,
  onOrganizationChange,
  userOrganizations,
  currentOrganizationId,
}: OrganizationDisplayProps) {
  const formatTimezone = (timezone: string) => {
    try {
      const now = new Date();
      const timeString = now.toLocaleString('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return `${timeString} (${timezone})`;
    } catch {
      return timezone;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {organization.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Badge variant={getRoleBadgeVariant(organization.role)}>
              {organization.role}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Organization Switcher */}
        {userOrganizations && userOrganizations.length > 1 && onOrganizationChange && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Switch Organization
            </label>
            <Select
              value={currentOrganizationId?.toString()}
              onValueChange={(value: string) => onOrganizationChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {userOrganizations.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {org.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {org.role}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Organization Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Timezone</span>
            </div>
            <span className="text-sm font-medium">
              {formatTimezone(organization.timezone)}
            </span>
          </div>

          {organization.memberCount !== undefined && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Members</span>
              </div>
              <span className="text-sm font-medium">
                {organization.memberCount}
              </span>
            </div>
          )}
        </div>

        {/* Current Time Display */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">
              Current Time in {organization.timezone}
            </div>
            <div className="text-lg font-semibold">
              {new Date().toLocaleTimeString('en-US', {
                timeZone: organization.timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                timeZone: organization.timezone,
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}