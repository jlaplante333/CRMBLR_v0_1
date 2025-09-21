'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@crmblr/ui';
import { Plus, Settings, Palette, Users, Database } from 'lucide-react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState('custom-fields');

  const tabs = [
    { id: 'custom-fields', label: 'Custom Fields', icon: Database },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'general', label: 'General', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'custom-fields' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Custom Fields</h2>
                <p className="text-sm text-gray-600">
                  Define custom fields for your CRM modules to capture additional data.
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Donations Fields */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">Donations</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">Source</div>
                      <div className="text-xs text-gray-500">Select field</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">Restricted</div>
                      <div className="text-xs text-gray-500">Boolean field</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">In Honor Of</div>
                      <div className="text-xs text-gray-500">Text field</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>

              {/* Contacts Fields */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">Contacts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">Preferred Pronouns</div>
                      <div className="text-xs text-gray-500">Select field</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">Do Not Contact</div>
                      <div className="text-xs text-gray-500">Boolean field</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">Employer Match</div>
                      <div className="text-xs text-gray-500">Boolean field</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>

              {/* Grants Fields */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">Grants</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">Priority</div>
                      <div className="text-xs text-gray-500">Select field</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">Category</div>
                      <div className="text-xs text-gray-500">Select field</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Branding</h2>
              <p className="text-sm text-gray-600">
                Customize your workspace appearance with colors and logo.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Palette
                  </label>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded border border-gray-300 bg-gray-900"></div>
                    <div className="w-8 h-8 rounded border border-gray-300 bg-blue-500"></div>
                    <div className="w-8 h-8 rounded border border-gray-300 bg-yellow-400"></div>
                    <div className="w-8 h-8 rounded border border-gray-300 bg-gray-100"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Primary, Secondary, Accent, Background colors
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <img src="/brand/makelit.svg" alt="Current logo" className="h-12 mx-auto mb-2" />
                    <Button variant="outline" size="sm">Upload New Logo</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Users & Roles</h2>
                <p className="text-sm text-gray-600">
                  Manage user access and permissions for your workspace.
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          O
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">owner@makelit.org</div>
                          <div className="text-sm text-gray-500">Owner</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Owner
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outline" size="sm">Edit</Button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          A
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">admin@makelit.org</div>
                          <div className="text-sm text-gray-500">Admin</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outline" size="sm">Edit</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
              <p className="text-sm text-gray-600">
                Configure general workspace settings and preferences.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="MAKE Literary Productions, NFP"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain
                </label>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="makelit"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                    .crmblr.com
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>America/Chicago</option>
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>America/Denver</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
