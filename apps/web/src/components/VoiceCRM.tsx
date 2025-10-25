'use client';

import React, { useState, useEffect } from 'react';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface VoiceCRMProps {
  tenantId: string;
}

export function VoiceCRM({ tenantId }: VoiceCRMProps) {
  const { currentUser } = useCurrentUser();
  const [voiceCommands, setVoiceCommands] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [manualCommand, setManualCommand] = useState('');

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    
    // Add command to history
    setVoiceCommands(prev => [...prev.slice(-9), command]);
    
    // Process command after a short delay to allow for speech response
    setTimeout(() => {
      processVoiceCommand(command.toLowerCase());
    }, 1500); // Wait 1.5 seconds for the voice response to finish
  };

  const processVoiceCommand = (command: string) => {
    // Contact management commands
    if (command.includes('create') && command.includes('contact')) {
      window.location.href = `/t/${tenantId}/contacts?action=create`;
    }
    
    if (command.includes('show') && command.includes('contact')) {
      window.location.href = `/t/${tenantId}/contacts`;
    }
    
    if (command.includes('search') && command.includes('contact')) {
      // Focus on search input
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }

    // Donation commands
    if (command.includes('show') && command.includes('donation')) {
      window.location.href = `/t/${tenantId}/donations`;
    }
    
    if (command.includes('create') && command.includes('donation')) {
      window.location.href = `/t/${tenantId}/donations?action=create`;
    }

    // Calendar commands
    if (command.includes('schedule') && command.includes('meeting')) {
      window.location.href = `/t/${tenantId}/calendar`;
    }
    
    if (command.includes('calendar')) {
      window.location.href = `/t/${tenantId}/calendar`;
    }

    // Report commands
    if (command.includes('generate') && command.includes('report')) {
      window.location.href = `/t/${tenantId}/reports`;
    }
    
    if (command.includes('analytics')) {
      window.location.href = `/t/${tenantId}/reports`;
    }

    // Organization commands
    if (command.includes('show') && command.includes('organization')) {
      window.location.href = `/t/${tenantId}/organizations`;
    }

    // Pipeline commands
    if (command.includes('pipeline')) {
      window.location.href = `/t/${tenantId}/pipeline`;
    }

    // Settings commands
    if (command.includes('settings')) {
      window.location.href = `/t/${tenantId}/settings`;
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="voice-crm-container">
      <VoiceAssistant
        tenantId={tenantId}
        userId={currentUser.id}
        onCommand={handleVoiceCommand}
      />
      
      {/* Voice Command History */}
      {voiceCommands.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Recent Voice Commands</h3>
          <div className="space-y-1">
            {voiceCommands.map((cmd, index) => (
              <div key={index} className="text-xs text-gray-600 bg-white p-2 rounded border">
                "{cmd}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Command Input */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Try a voice command:</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            value={manualCommand}
            onChange={(e) => setManualCommand(e.target.value)}
            placeholder="e.g., 'create new contact'"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && manualCommand.trim()) {
                handleVoiceCommand(manualCommand.trim());
                setManualCommand('');
              }
            }}
          />
          <button
            onClick={() => {
              if (manualCommand.trim()) {
                handleVoiceCommand(manualCommand.trim());
                setManualCommand('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => handleVoiceCommand('create new contact')}
          className="p-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
        >
          📞 New Contact
        </button>
        <button
          onClick={() => handleVoiceCommand('show donations')}
          className="p-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
        >
          💰 Donations
        </button>
        <button
          onClick={() => handleVoiceCommand('schedule meeting')}
          className="p-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm"
        >
          📅 Calendar
        </button>
        <button
          onClick={() => handleVoiceCommand('generate report')}
          className="p-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm"
        >
          📊 Reports
        </button>
      </div>
    </div>
  );
}
