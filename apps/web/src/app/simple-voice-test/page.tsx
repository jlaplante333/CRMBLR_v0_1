'use client';

import React, { useState } from 'react';

export default function SimpleVoiceTest() {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState('');

  // Function to extract contact name from voice command
  const extractContactName = (command: string): string | null => {
    const patterns = [
      /show me contact (\w+)/i,
      /show contact (\w+)/i,
      /find contact (\w+)/i,
      /search contact (\w+)/i,
      /look for contact (\w+)/i,
      /contact (\w+)/i,
      /show me (\w+)/i,
      /find (\w+)/i,
      /search (\w+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const processCommand = (cmd: string) => {
    const contactName = extractContactName(cmd);
    if (contactName) {
      setResult(`✅ Found contact: "${contactName}" - Would navigate to /t/tokyo-voice-ai/contacts?search=${encodeURIComponent(contactName)}`);
    } else {
      setResult(`❌ No contact name found in command: "${cmd}"`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Voice Agent Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Contact Query Parsing</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter a voice command:
              </label>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g., 'show me contact Jonathan'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => processCommand(command)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Test Command
            </button>
            
            {result && (
              <div className="p-4 bg-gray-100 rounded-md">
                <p className="text-sm">{result}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Quick Test Commands:</h3>
          <div className="space-y-2">
            {[
              "show me contact Jonathan",
              "find contact Amit", 
              "search contact Tatsuya",
              "show me Natsuko",
              "find Yosuke"
            ].map((testCmd, index) => (
              <button
                key={index}
                onClick={() => {
                  setCommand(testCmd);
                  processCommand(testCmd);
                }}
                className="block w-full text-left px-3 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
              >
                "{testCmd}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
