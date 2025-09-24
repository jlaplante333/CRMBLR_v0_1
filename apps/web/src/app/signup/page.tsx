'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crmblr/ui';

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    website: '',
    contactEmail: '',
    contactName: '',
    phone: '',
    description: ''
  });
  const [files, setFiles] = useState({
    logo: null as File | null,
    form990: null as File | null,
    additionalData: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof typeof files) => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">
                Application Submitted Successfully!
              </CardTitle>
              <CardDescription>
                Thank you for your interest in CRMblr
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  CRM in process of being created
                </h3>
                <p className="text-green-700 mb-4">
                  Please expect to wait 1-2 business days for us to finish the setup on your side.
                </p>
                <p className="text-green-700">
                  Please email{' '}
                  <a href="mailto:jon@crmblr.com" className="font-semibold underline">
                    jon@crmblr.com
                  </a>{' '}
                  or{' '}
                  <a href="mailto:laurie@crmblr.com" className="font-semibold underline">
                    laurie@crmblr.com
                  </a>{' '}
                  for the status of your CRM!
                </p>
              </div>
              
              <Button asChild variant="outline" className="mt-6">
                <a href="/login">Back to Login</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create a CRM for your Non-Profit</CardTitle>
            <CardDescription>
              Tell us about your organization and we'll create a custom CRM for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Organization Information</h3>
                
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    required
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your organization name"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium mb-2">
                    Website URL *
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    required
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourorganization.org"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Organization Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your organization's mission and activities"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    required
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    required
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@organization.org"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload Documents</h3>
                
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium mb-2">
                    Organization Logo
                  </label>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your organization's logo (PNG, JPG, SVG)
                  </p>
                  {files.logo && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {files.logo.name} selected
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="form990" className="block text-sm font-medium mb-2">
                    Form 990 (Tax Documents)
                  </label>
                  <input
                    type="file"
                    id="form990"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'form990')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your most recent Form 990 or tax documents (PDF, DOC, DOCX)
                  </p>
                  {files.form990 && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {files.form990.name} selected
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="additionalData" className="block text-sm font-medium mb-2">
                    Additional Data (Optional)
                  </label>
                  <input
                    type="file"
                    id="additionalData"
                    accept=".csv,.xlsx,.xls,.pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'additionalData')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload any existing donor data, contact lists, or other relevant documents
                  </p>
                  {files.additionalData && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {files.additionalData.name} selected
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                  size="lg"
                >
                  {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  size="lg"
                >
                  <a href="/login">Cancel</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
