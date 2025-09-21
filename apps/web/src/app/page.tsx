import { Button } from '@crmblr/ui';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            CRMblr
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Multi-tenant AI-generated CRM platform for nonprofits and organizations.
            Transform your data into actionable insights with our intelligent CRM system.
          </p>
          
          <div className="flex gap-4 justify-center mb-12">
            <Button asChild size="lg">
              <Link href="/login">
                Get Started
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/demo">
                View Demo
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">AI-Powered</h3>
              <p className="text-gray-600">
                Generate SQL reports from natural language queries using advanced AI models.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Multi-Tenant</h3>
              <p className="text-gray-600">
                Secure tenant isolation with row-level security and customizable branding.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Data Import</h3>
              <p className="text-gray-600">
                Import from IRS 990s, CSV files, Excel spreadsheets, and database exports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
