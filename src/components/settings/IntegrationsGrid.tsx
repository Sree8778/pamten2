
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const integrations = [
  {
    id: 'ats',
    name: 'Applicant Tracking System',
    provider: 'JobDiva API',
    status: 'connected',
    lastSync: '10 minutes ago',
    enabled: true,
  },
  {
    id: 'hris',
    name: 'HR Information System',
    provider: 'Workday',
    status: 'connected',
    lastSync: '1 hour ago',
    enabled: true,
  },
  {
    id: 'vms',
    name: 'Vendor Management',
    provider: 'Fieldglass',
    status: 'disconnected',
    lastSync: 'Never',
    enabled: false,
  },
  {
    id: 'email',
    name: 'Email Integration',
    provider: 'Gmail / Outlook',
    status: 'connected',
    lastSync: '5 minutes ago',
    enabled: true,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    provider: 'Google Calendar',
    status: 'connected',
    lastSync: '5 minutes ago',
    enabled: true,
  },
  {
    id: 'background',
    name: 'Background Checks',
    provider: 'HireRight API',
    status: 'connected',
    lastSync: '30 minutes ago',
    enabled: true,
  },
  {
    id: 'talent',
    name: 'Talent Search',
    provider: 'Dice TalentSearch API',
    status: 'connected',
    lastSync: '15 minutes ago',
    enabled: true,
  },
  {
    id: 'cyberseek',
    name: 'Skills Framework',
    provider: 'CyberSeek API',
    status: 'connected',
    lastSync: '1 day ago',
    enabled: true,
  },
];

const IntegrationsGrid = () => {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-md font-bold text-gray-800">Platform Integrations</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((integration) => (
            <div 
              key={integration.id}
              className="border border-gray-200 rounded p-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-800">{integration.name}</h3>
                <Switch checked={integration.enabled} />
              </div>
              <div className="text-xs text-gray-500 mb-1">Provider: {integration.provider}</div>
              <div className="flex justify-between items-center mt-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  integration.status === 'connected' 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
                {integration.status === 'connected' ? (
                  <span className="text-xs text-gray-400">Updated {integration.lastSync}</span>
                ) : (
                  <button className="text-xs bg-gray-800 text-white px-2 py-1 rounded">
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationsGrid;
