import React from 'react';

interface PaymentLogoProps {
  source: string;
  className?: string;
}

export function PaymentLogo({ source, className = "w-4 h-4" }: PaymentLogoProps) {
  const getLogo = () => {
    switch (source.toLowerCase()) {
      case 'stripe':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.525 1.204L20.595 4.6c-1.204-.337-2.498-1.33-4.312-1.33-2.912 0-5.306 1.6-5.306 4.415 0 2.513 2.678 3.757 5.263 4.564 2.671.813 3.563 1.515 3.563 2.568 0 .932-.726 1.512-2.044 1.512-2.814 0-5.386-1.285-7.344-1.665L8.484 16.4c1.418.66 3.133 1.11 5.064 1.11 3.032 0 5.406-1.425 5.406-4.415 0-2.636-2.34-3.82-5.978-4.94z"/>
          </svg>
        );
      case 'paypal':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 10.239c.08-.012.16-.012.24-.012.48 0 .88.16 1.2.4.32.24.56.6.72 1.04.16.44.24.96.24 1.52 0 .56-.08 1.08-.24 1.52-.16.44-.4.8-.72 1.04-.32.24-.72.4-1.2.4-.08 0-.16 0-.24-.012C6.636 15.123 6.316 15.123 6 15.123c-.48 0-.88-.16-1.2-.4-.32-.24-.56-.6-.72-1.04-.16-.44-.24-.96-.24-1.52 0-.56.08-1.08.24-1.52.16-.44.4-.8.72-1.04.32-.24.72-.4 1.2-.4.316 0 .636 0 1.076.012z"/>
            <path d="M19.5 6.5h-3.5c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5h3.5c.276 0 .5-.224.5-.5v-11c0-.276-.224-.5-.5-.5z"/>
            <path d="M12 6.5H8.5c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5H12c.276 0 .5-.224.5-.5v-11c0-.276-.224-.5-.5-.5z"/>
            <path d="M4.5 6.5H1c-.276 0-.5.224-.5.5v11c0 .276.224.5.5.5h3.5c.276 0 .5-.224.5-.5v-11c0-.276-.224-.5-.5-.5z"/>
          </svg>
        );
      default:
        return (
          <div className={`${className} bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600`}>
            {source.charAt(0).toUpperCase()}
          </div>
        );
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getLogo()}
      <span>{source}</span>
    </div>
  );
}
