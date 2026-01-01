/**
 * Entity Migration Controls
 *
 * UI controls for switching individual entities between APIs
 * with real-time status updates and performance metrics.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMigratedEntity } from '@/hooks/useMigratedEntity';
import { entitySwitcher, performanceComparator } from '@/utils/entitySwitcher';

export function EntityMigrationControls({ entityName, showPerformance = true }) {
  const entity = useMigratedEntity(entityName);
  const [performanceData, setPerformanceData] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleApiSwitch = async (useRest) => {
    try {
      if (useRest) {
        await entity.switchToRest();
      } else {
        await entity.switchToBase44();
      }
    } catch (error) {
      console.error(`Failed to switch ${entityName}:`, error);
    }
  };

  const handleOverride = (useRest) => {
    if (useRest) {
      entity.overrideToRest();
    } else {
      entity.overrideToBase44();
    }
  };

  const clearOverride = () => {
    entity.clearOverride();
  };

  const runPerformanceTest = async () => {
    setIsTesting(true);
    try {
      const results = await performanceComparator.comparePerformance(entityName, 'list', {});
      setPerformanceData(results);
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {entityName}
          <div className="flex items-center space-x-2">
            <Badge variant={entity.isUsingRest ? 'default' : 'secondary'}>
              {entity.isUsingRest ? 'REST API' : 'Base44 SDK'}
            </Badge>
            {entity.overrideApi && (
              <Badge variant="outline">
                Override: {entity.overrideApi}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Selection */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">API Selection</div>
            <div className="text-xs text-muted-foreground">
              Choose which API to use for {entityName} operations
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Base44</span>
            <Switch
              checked={entity.isUsingRest}
              onCheckedChange={handleApiSwitch}
            />
            <span className="text-sm">REST</span>
          </div>
        </div>

        {/* Override Controls */}
        {entity.overrideApi && (
          <Alert>
            <AlertDescription>
              Override active: Using {entity.overrideApi} API regardless of migration status.
              <Button
                variant="link"
                size="sm"
                onClick={clearOverride}
                className="ml-2 p-0 h-auto"
              >
                Clear override
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Manual Override */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOverride(true)}
            disabled={entity.overrideApi === 'rest'}
          >
            Force REST
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOverride(false)}
            disabled={entity.overrideApi === 'base44'}
          >
            Force Base44
          </Button>
        </div>

        {/* Performance Testing */}
        {showPerformance && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Performance Test</div>
              <Button
                size="sm"
                variant="outline"
                onClick={runPerformanceTest}
                disabled={isTesting}
              >
                {isTesting ? 'Testing...' : 'Run Test'}
              </Button>
            </div>

            {performanceData && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg text-xs">
                <div>
                  <div className="font-medium text-green-700">REST API</div>
                  <div>Avg: {performanceData.rest.avg.toFixed(0)}ms</div>
                  <div>P95: {performanceData.rest.p95.toFixed(0)}ms</div>
                  <div>Errors: {performanceData.rest.errors}</div>
                </div>
                <div>
                  <div className="font-medium text-blue-700">Base44 SDK</div>
                  <div>Avg: {performanceData.base44.avg.toFixed(0)}ms</div>
                  <div>P95: {performanceData.base44.p95.toFixed(0)}ms</div>
                  <div>Errors: {performanceData.base44.errors}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Migration Status */}
        <div className="text-xs text-muted-foreground">
          Migration Status: {entity.migrationStatus} |
          Override: {entity.overrideApi || 'none'}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Migration Status Indicator
 *
 * Simple component to show migration status for an entity
 */
export function MigrationStatusIndicator({ entityName, showControls = false }) {
  const entity = useMigratedEntity(entityName);

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={entity.isUsingRest ? 'default' : 'secondary'}>
        {entity.isUsingRest ? 'REST' : 'Base44'}
      </Badge>
      {entity.overrideApi && (
        <Badge variant="outline" className="text-xs">
          Override
        </Badge>
      )}
      {showControls && (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => entity.switchToRest()}
            disabled={entity.isUsingRest}
            className="h-6 px-2 text-xs"
          >
            REST
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => entity.switchToBase44()}
            disabled={!entity.isUsingRest}
            className="h-6 px-2 text-xs"
          >
            Base44
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Migration Progress Bar
 *
 * Shows overall migration progress across multiple entities
 */
export function MigrationProgressBar({ entities }) {
  const [progress, setProgress] = useState(0);
  const [migratedCount, setMigratedCount] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const migrated = entities.filter(entityName => {
        // This would need to be implemented to check actual status
        return Math.random() > 0.5; // Placeholder
      }).length;

      setMigratedCount(migrated);
      setProgress((migrated / entities.length) * 100);
    };

    updateProgress();

    // Listen for migration status changes
    window.addEventListener('migrationStatusChanged', updateProgress);
    return () => window.removeEventListener('migrationStatusChanged', updateProgress);
  }, [entities]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Migration Progress</span>
        <span>{migratedCount}/{entities.length} entities migrated</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {progress.toFixed(1)}% complete
      </div>
    </div>
  );
}