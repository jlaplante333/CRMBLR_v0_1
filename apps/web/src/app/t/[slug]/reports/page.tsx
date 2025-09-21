'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';

export default function ReportsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tenant, setTenant] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundTenant = DEMO_TENANTS.find(t => t.slug === slug);
    if (foundTenant) {
      setTenant(foundTenant);
      
      // Mock saved reports
      const mockReports = [
        { id: '1', name: 'Donors who gave ≥$250 in the last 12 months', description: 'High-value donors from the past year' },
        { id: '2', name: 'Lapsed donors (no gift in 18 months)', description: 'Donors who haven\'t given recently' },
        { id: '3', name: 'Grant deadlines in next 60 days', description: 'Upcoming grant application deadlines' },
        { id: '4', name: 'Campaign progress vs target (current year)', description: 'Current campaign performance' },
      ];
      
      setSavedReports(mockReports);
    }
    setIsLoading(false);
  }, [slug]);

  const handleGenerateReport = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Report generated successfully! (This is a demo)');
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>;
  }

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate custom reports using natural language</p>
      </div>

      {/* AI Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle>AI Report Generator</CardTitle>
          <CardDescription>
            Describe what you want to see and our AI will generate the SQL query
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              What would you like to report on?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Show me all donors who gave more than $500 in the last 6 months"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? 'Generating Report...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Your frequently used reports</CardDescription>
            </div>
            <Button variant="outline">Create New Report</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedReports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <h3 className="font-medium mb-2">{report.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                <div className="flex gap-2">
                  <Button size="sm">Run Report</Button>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your latest report activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Donor Analysis Q4 2024</div>
                <div className="text-sm text-gray-600">Generated 2 hours ago</div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Grant Pipeline Status</div>
                <div className="text-sm text-gray-600">Generated yesterday</div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
