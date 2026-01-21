/**
 * Migration Dashboard UI
 *
 * Comprehensive dashboard for managing Base44 to REST API migration
 */

import React, { useState, useEffect } from 'react';
import { featureRegistry } from '../../utils/migration/featureRegistry';
import { Base44Detector } from '../../utils/migration/base44Detector';

const MigrationDashboard = () => {
  const [features, setFeatures] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    migrated: 0,
    inProgress: 0,
    failed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    base44Usage: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadData();
    setupListeners();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const featuresData = featureRegistry.getFeatures();
      const statsData = featureRegistry.getMigrationStats();
      setFeatures(featuresData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load migration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupListeners = () => {
    featureRegistry.onFeatureChange((feature) => {
      loadData();
    });
  };

  const scanCodebase = async () => {
    setScanLoading(true);
    try {
      const detector = new Base44Detector();
      await detector.generateMigrationSuggestions();
      await loadData();
    } catch (error) {
      console.error('Failed to scan codebase:', error);
    } finally {
      setScanLoading(false);
    }
  };

  const registerFeature = async () => {
    if (!newFeature.name || !newFeature.description) return;

    try {
      const base44Usage = newFeature.base44Usage.split(',').map(s => s.trim());
      featureRegistry.registerFeature({
        name: newFeature.name,
        description: newFeature.description,
        base44Usage,
        restEndpoints: [],
        dependencies: [],
        priority: newFeature.priority,
        status: 'detected'
      });

      setNewFeature({ name: '', description: '', base44Usage: '', priority: 'medium' });
      setShowRegisterDialog(false);
    } catch (error) {
      console.error('Failed to register feature:', error);
    }
  };

  const generateMigration = async (featureId) => {
    try {
      const script = featureRegistry.generateMigrationScript(featureId);
      if (script) {
        navigator.clipboard.writeText(script);
        alert('Migration script copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to generate migration:', error);
    }
  };

  const updateFeatureStatus = async (featureId, status) => {
    try {
      featureRegistry.updateFeatureStatus(featureId, status);
    } catch (error) {
      console.error('Failed to update feature status:', error);
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const migrationProgress = stats.total > 0 ? (stats.migrated / stats.total) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Migration Dashboard</h1>
          <p className="text-gray-600">Manage Base44 to REST API migration</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={scanCodebase}
            disabled={scanLoading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {scanLoading ? 'Scanning...' : 'Scan Codebase'}
          </button>
          <button
            onClick={() => setShowRegisterDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Register Feature
          </button>
        </div>
      </div>

      {/* Migration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-gray-200 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Features</span>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Migrated</span>
            <span className="text-2xl font-bold text-green-600">{stats.migrated}</span>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">In Progress</span>
            <span className="text-2xl font-bold text-blue-600">{stats.inProgress}</span>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Pending</span>
            <span className="text-2xl font-bold text-yellow-600">{stats.pending}</span>
          </div>
        </div>
      </div>

      {/* Migration Progress */}
      <div className="p-4 border border-gray-200 rounded">
        <h3 className="font-semibold mb-2">Migration Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${migrationProgress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{Math.round(migrationProgress)}% complete</p>
      </div>

      {/* Features Table */}
      <div className="border border-gray-200 rounded">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Registered Features</h3>
          <p className="text-sm text-gray-600">Features that need or have been migrated</p>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">Loading features...</div>
          ) : features.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No features registered. Use "Register Feature" to add features that need migration.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Priority</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr key={feature.name} className="border-b border-gray-100">
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        feature.status === 'migrated' ? 'bg-green-100 text-green-800' :
                        feature.status === 'migrating' ? 'bg-blue-100 text-blue-800' :
                        feature.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(feature.status)}
                      </span>
                    </td>
                    <td className="p-2 font-medium">{feature.name}</td>
                    <td className="p-2 max-w-xs truncate">{feature.description}</td>
                    <td className="p-2">
                      <span className={`capitalize ${getPriorityColor(feature.priority)}`}>
                        {feature.priority}
                      </span>
                    </td>
                    <td className="p-2">
                      {new Date(feature.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => generateMigration(feature.name)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Generate
                        </button>
                        <select
                          value={feature.status}
                           onChange={(e) => updateFeatureStatus(feature.name, e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                          <option value="detected">Detected</option>
                          <option value="planned">Planned</option>
                          <option value="migrating">Migrating</option>
                          <option value="migrated">Migrated</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Register Feature Dialog */}
      {showRegisterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Register New Feature</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Feature Name</label>
                <input
                  type="text"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., UserProfile"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newFeature.description}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this feature does"
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base44 Usage (comma-separated)</label>
                <input
                  type="text"
                  value={newFeature.base44Usage}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, base44Usage: e.target.value }))}
                  placeholder="e.g., base44Entities.UserProfile.get, base44Auth.login"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newFeature.priority}
                   onChange={(e) => setNewFeature(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={registerFeature}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Register Feature
                </button>
                <button
                  onClick={() => setShowRegisterDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationDashboard;