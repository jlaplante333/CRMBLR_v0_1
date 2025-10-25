'use client';

import React from 'react';
import { VoiceCRM } from '@/components/VoiceCRM';

export default function VoiceTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Voice Agent Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Tokyo Voice AI CRM - Voice Assistant</h2>
          <p className="text-gray-600 mb-6">
            Test the voice agent functionality. Try saying "show me contact Jonathan" or use the manual input below.
          </p>
          
          <VoiceCRM tenantId="tokyo-voice-ai" />
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Test Instructions:</h3>
          <ul className="list-disc list-inside text-blue-800 space-y-2">
            <li>Click "Connect Voice" to enable voice input</li>
            <li>Say "show me contact Jonathan" to test contact query</li>
            <li>Use the manual input field to test commands</li>
            <li>Click "Find Jonathan" quick action button</li>
            <li>Check if navigation works to contacts page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
