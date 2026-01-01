/**
 * Migration Status Dashboard
 *
 * Comprehensive dashboard for monitoring migration progress,
 * controlling entity switches, and viewing analytics.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getMigrationStatus,
  updateMigrationStatus,
  MigrationPresets,
  entitySwitcher,
  abTester,
  performanceComparator,
  batchMigrationManager
} from '@/utils/entitySwitcher';
import { useMigrationAnalytics } from '@/hooks/useMigratedEntity';

export function MigrationStatusDashboard() {
  const [migrationStatus, setMigrationStatus] = useState(getMigrationStatus());
  const [activeExperiments, setActiveExperiments] = useState(new Map());
  const [migrationPlans, setMigrationPlans] = useState([]);
  const analytics = useMigrationAnalytics();

  // Update status when migration status changes
  useEffect(() => {
    const handleStatusChange = () => {
      setMigrationStatus(getMigrationStatus());
    };

    window.addEventListener('migrationStatusChanged', handleStatusChange);
    return () => window.removeEventListener('migrationStatusChanged', handleStatusChange);
  }, []);

  // Load migration plans
  useEffect(() => {
    setMigrationPlans(batchMigrationManager.listPlans());
  }, []);

  const handleEntitySwitch = async (entityName, targetApi) => {
    try {
      if (targetApi === 'rest') {
        await entitySwitcher.switchToRest(entityName);
      } else {
        await entitySwitcher.switchToBase44(entityName);
      }
    } catch (error) {
      console.error(`Failed to switch ${entityName}:`, error);
    }
  };

  const handlePresetMigration = async (presetName) => {
    const entities = MigrationPresets[presetName];
    if (!entities) return;

    const planName = `${presetName.toLowerCase()}_migration_${Date.now()}`;
    batchMigrationManager.createPlan(planName, entities);

    try {
      await batchMigrationManager.executePlan(planName, 'rest');
      setMigrationPlans(batchMigrationManager.listPlans());
    } catch (error) {
      console.error(`Preset migration failed:`, error);
    }
  };

  const handleABTest = async (entityName) => {
    try {
      const experimentId = await abTester.startABTest(entityName);
      setActiveExperiments(prev => new Map(prev.set(experimentId, entityName)));
    } catch (error) {
      console.error(`Failed to start A/B test for ${entityName}:`, error);
    }
  };

  const handlePerformanceTest = async (entityName) => {
    try {
      await performanceComparator.comparePerformance(entityName, 'list', {});
    } catch (error) {
      console.error(`Performance test failed for ${entityName}:`, error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Migration Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and control the Base44 to REST API migration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={analytics.migrationProgress === 100 ? "default" : "secondary"}>
            {analytics.migrationProgress.toFixed(1)}% Complete
          </Badge>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={analytics.migrationProgress} className="w-full" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{analytics.migratedToRest}</div>
                <div className="text-sm text-muted-foreground">On REST API</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{analytics.stillOnBase44}</div>
                <div className="text-sm text-muted-foreground">On Base44 API</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.totalEntities}</div>
                <div className="text-sm text-muted-foreground">Total Entities</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="entities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entities">Entity Control</TabsTrigger>
          <TabsTrigger value="presets">Migration Presets</TabsTrigger>
          <TabsTrigger value="experiments">A/B Testing</TabsTrigger>
          <TabsTrigger value="plans">Batch Operations</TabsTrigger>
        </TabsList>

        {/* Entity Control Tab */}
        <TabsContent value="entities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entity Migration Control</CardTitle>
              <p className="text-sm text-muted-foreground">
                Switch individual entities between Base44 and REST APIs
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(migrationStatus.entities).map(([entityName, status]) => (
                  <div key={entityName} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-medium">{entityName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Currently using {status === 'rest' ? 'REST API' : 'Base44 SDK'}
                        </p>
                      </div>
                      <Badge variant={status === 'rest' ? 'default' : 'secondary'}>
                        {status === 'rest' ? 'REST' : 'Base44'}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={status === 'rest' ? 'default' : 'outline'}
                        onClick={() => handleEntitySwitch(entityName, 'rest')}
                        disabled={status === 'rest'}
                      >
                        Use REST
                      </Button>
                      <Button
                        size="sm"
                        variant={status === 'base44' ? 'default' : 'outline'}
                        onClick={() => handleEntitySwitch(entityName, 'base44')}
                        disabled={status === 'base44'}
                      >
                        Use Base44
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleABTest(entityName)}
                      >
                        A/B Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePerformanceTest(entityName)}
                      >
                        Performance Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Migration Presets Tab */}
        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration Presets</CardTitle>
              <p className="text-sm text-muted-foreground">
                Predefined migration patterns for common scenarios
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(MigrationPresets).map(([presetName, entities]) => (
                  <div key={presetName} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{presetName.replace(/_/g, ' ')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {entities.length} entities: {entities.join(', ')}
                      </p>
                    </div>
                    <Button
                      onClick={() => handlePresetMigration(presetName)}
                    >
                      Migrate to REST
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="experiments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active A/B Tests</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor ongoing A/B tests between REST and Base44 APIs
              </p>
            </CardHeader>
            <CardContent>
              {activeExperiments.size === 0 ? (
                <p className="text-muted-foreground">No active A/B tests</p>
              ) : (
                <div className="space-y-4">
                  {Array.from(activeExperiments.entries()).map(([experimentId, entityName]) => {
                    const results = abTester.getABTestResults(experimentId);
                    return (
                      <div key={experimentId} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{entityName}</h4>
                          <Button
                            size="sm"
                            onClick={() => abTester.endABTest(experimentId)}
                          >
                            End Test
                          </Button>
                        </div>
                        {results && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium">REST API</div>
                              <div>Requests: {results.rest.requests}</div>
                              <div>Avg Response: {results.rest.avgResponseTime.toFixed(0)}ms</div>
                              <div>Error Rate: {(results.rest.errorRate * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="font-medium">Base44 API</div>
                              <div>Requests: {results.base44.requests}</div>
                              <div>Avg Response: {results.base44.avgResponseTime.toFixed(0)}ms</div>
                              <div>Error Rate: {(results.base44.errorRate * 100).toFixed(1)}%</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Operations Tab */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration Plans</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage batch migration operations
              </p>
            </CardHeader>
            <CardContent>
              {migrationPlans.length === 0 ? (
                <p className="text-muted-foreground">No migration plans created</p>
              ) : (
                <div className="space-y-4">
                  {migrationPlans.map((plan) => (
                    <div key={plan.name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{plan.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {plan.entities.length} entities • {plan.status}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {plan.status === 'completed' && (
                            <Badge variant="default">Completed</Badge>
                          )}
                          {plan.status === 'failed' && (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                          {plan.status === 'running' && (
                            <Badge variant="secondary">Running</Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={plan.progress} className="w-full" />
                      <div className="mt-2 text-sm text-muted-foreground">
                        {plan.results.filter(r => r.success).length}/{plan.entities.length} entities migrated
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts */}
      {analytics.migrationProgress < 100 && (
        <Alert>
          <AlertDescription>
            Migration is in progress. {analytics.stillOnBase44} entities remain on Base44 API.
            Use the controls above to migrate entities or run preset migrations.
          </AlertDescription>
        </Alert>
      )}

      {analytics.migrationProgress === 100 && (
        <Alert>
          <AlertDescription className="text-green-700">
            🎉 Migration complete! All entities have been successfully migrated to REST API.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}