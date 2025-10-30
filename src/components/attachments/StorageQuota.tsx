"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes, type StorageQuota as StorageQuotaType } from "@/features/attachments/schema";
import { AlertTriangle, HardDrive } from "lucide-react";

interface StorageQuotaProps {
  quota: StorageQuotaType;
  showTitle?: boolean;
  compact?: boolean;
}

export function StorageQuota({ quota, showTitle = true, compact = false }: StorageQuotaProps) {
  const isNearLimit = quota.usagePercentage >= 80;
  const isAtLimit = quota.usagePercentage >= 95;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Storage</span>
          <span className="font-medium">
            {formatBytes(quota.usedBytes)} / {formatBytes(quota.quotaBytes)}
          </span>
        </div>
        <Progress
          value={quota.usagePercentage}
          className={`h-2 ${isAtLimit ? "bg-red-100" : isNearLimit ? "bg-yellow-100" : ""}`}
        />
        {isAtLimit && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Storage almost full
          </p>
        )}
      </div>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Usage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Used</span>
            <span className="font-medium">
              {formatBytes(quota.usedBytes)} of {formatBytes(quota.quotaBytes)}
            </span>
          </div>
          <Progress
            value={quota.usagePercentage}
            className={`h-3 ${isAtLimit ? "bg-red-100 dark:bg-red-950" : isNearLimit ? "bg-yellow-100 dark:bg-yellow-950" : ""}`}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{quota.usagePercentage.toFixed(1)}% used</span>
            <span>{formatBytes(quota.availableBytes)} available</span>
          </div>
        </div>

        {/* Warning Messages */}
        {isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Storage almost full</p>
              <p className="text-muted-foreground mt-1">
                Please delete some attachments to free up space or contact support to increase your
                quota.
              </p>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-400">
                Storage running low
              </p>
              <p className="text-yellow-700 dark:text-yellow-500 mt-1">
                You're using {quota.usagePercentage.toFixed(1)}% of your storage quota.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
