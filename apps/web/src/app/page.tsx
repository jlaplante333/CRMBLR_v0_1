'use client';

import Link from 'next/link';

export default function HomePage() {

  return (
    <>
      <style jsx global>{`
        /* CSS Variables - Perfect match to live site */
        :root {
          --color-primary: #4A9B8E;
          --color-primary-light: #5FB3A6;
          --color-primary-dark: #3A8B7E;
          --color-secondary: #043353;
          --color-accent: #18A4E0;
          --color-white: #FFFFFF;
          --color-gray-50: #F8F9FA;
          --color-gray-100: #E9ECEF;
          --color-gray-200: #DEE2E6;
          --color-gray-300: #CED4DA;
          --color-gray-400: #ADB5BD;
          --color-gray-500: #6C757D;
          --color-gray-600: #495057;
          --color-gray-700: #343A40;
          --color-gray-800: #212529;
          --color-gray-900: #1A1A1A;
          --color-success: #16A34A;
          --color-warning: #EAB308;
          --color-error: #DC2626;
          --color-info: var(--color-accent);
          --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --font-body: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --font-mono: 'Courier New', monospace;
          --text-xs: 0.75rem;
          --text-sm: 0.875rem;
          --text-base: 1rem;
          --text-lg: 1.125rem;
          --text-xl: 1.25rem;
          --text-2xl: 1.5rem;
          --text-3xl: 1.875rem;
          --text-4xl: 2.25rem;
          --text-5xl: 3rem;
          --text-6xl: 3.75rem;
          --space-xs: 0.25rem;
          --space-sm: 0.5rem;
          --space-md: 1rem;
          --space-lg: 1.5rem;
          --space-xl: 2rem;
          --space-2xl: 3rem;
          --space-3xl: 4rem;
          --radius-sm: 0.25rem;
          --radius-md: 0.375rem;
          --radius-lg: 0.5rem;
          --radius-xl: 0.75rem;
          --radius-2xl: 1rem;
          --radius-full: 9999px;
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
          --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
          --container-max-width: 1200px;
          --container-padding: var(--space-md);
          --transition-fast: 150ms ease;
          --transition-base: 250ms ease;
          --transition-slow: 350ms ease;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
          scroll-padding-top: 80px;
        }

        body {
          font-family: var(--font-body);
          font-size: var(--text-base);
          line-height: 1.6;
          color: var(--color-gray-900);
          background-color: var(--color-white);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: var(--space-md);
        }

        h1 { font-size: var(--text-5xl); }
        h2 { font-size: var(--text-4xl); }
        h3 { font-size: var(--text-3xl); }
        h4 { font-size: var(--text-2xl); }
        h5 { font-size: var(--text-xl); }
        h6 { font-size: var(--text-lg); }

        p {
          margin-bottom: var(--space-md);
        }

        a {
          color: var(--color-primary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        a:hover {
          color: var(--color-primary-dark);
          text-decoration: underline;
        }

        img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        .container {
          max-width: var(--container-max-width);
          margin: 0 auto;
          padding: 0 var(--container-padding);
        }

        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }

        .text-primary { color: var(--color-primary); }
        .text-secondary { color: var(--color-secondary); }
        .text-accent { color: var(--color-accent); }
        .text-muted { color: var(--color-gray-500); }

        .bg-primary { background-color: var(--color-primary); }
        .bg-secondary { background-color: var(--color-secondary); }
        .bg-light { background-color: var(--color-gray-50); }
        .bg-white { background-color: var(--color-white); }

        .btn {
          display: inline-block;
          padding: var(--space-md) var(--space-xl);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: var(--text-base);
          line-height: 1;
          text-align: center;
          text-decoration: none;
          border: 2px solid transparent;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
        }

        .btn-primary {
          background-color: var(--color-primary);
          color: var(--color-white);
          border-color: var(--color-primary);
        }

        .btn-primary:hover {
          background-color: var(--color-primary-dark);
          border-color: var(--color-primary-dark);
          color: var(--color-white);
          text-decoration: none;
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
          background-color: transparent;
          color: var(--color-primary);
          border-color: var(--color-primary);
        }

        .btn-secondary:hover {
          background-color: var(--color-primary);
          color: var(--color-white);
          text-decoration: none;
        }

        .btn-large {
          padding: var(--space-lg) var(--space-2xl);
          font-size: var(--text-lg);
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--color-white);
          box-shadow: var(--shadow-sm);
          z-index: 1000;
          transition: all var(--transition-base);
        }

        .navbar.scrolled {
          box-shadow: var(--shadow-md);
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md) 0;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--color-secondary);
          text-decoration: none;
        }

        .navbar-logo:hover {
          text-decoration: none;
          color: var(--color-primary);
        }

        .navbar-logo svg {
          width: 40px;
          height: 40px;
        }

        .navbar-menu {
          display: flex;
          gap: var(--space-xl);
          list-style: none;
          align-items: center;
          margin: 0;
          padding: 0;
        }

        .navbar-link {
          color: var(--color-gray-700);
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .navbar-link:hover {
          color: var(--color-primary);
          text-decoration: none;
        }

        .navbar-cta {
          margin-left: var(--space-xl);
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-sm);
        }

        .menu-toggle span {
          display: block;
          width: 25px;
          height: 3px;
          background: var(--color-secondary);
          margin: 5px 0;
          transition: all var(--transition-base);
        }

        .hero {
          padding-top: calc(80px + var(--space-3xl));
          padding-bottom: var(--space-3xl);
          background: linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-white) 100%);
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, var(--color-primary) 0%, transparent 70%);
          opacity: 0.03;
          animation: rotate 30s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-badge {
          display: inline-block;
          margin-bottom: var(--space-lg);
          padding: var(--space-sm) var(--space-lg);
          background: var(--color-primary);
          color: var(--color-white);
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          font-weight: 600;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .hero-title {
          font-size: clamp(var(--text-3xl), 5vw, var(--text-6xl));
          color: var(--color-secondary);
          margin-bottom: var(--space-lg);
        }

        .hero-subtitle {
          font-size: var(--text-xl);
          color: var(--color-gray-600);
          margin-bottom: var(--space-2xl);
          line-height: 1.6;
        }

        .hero-cta {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-xl);
          margin-top: var(--space-3xl);
          padding-top: var(--space-3xl);
          border-top: 1px solid var(--color-gray-200);
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          font-size: var(--text-4xl);
          font-weight: 700;
          color: var(--color-primary);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--color-gray-500);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .problem {
          padding: var(--space-3xl) 0;
          background: var(--color-white);
        }

        .problem-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
          margin-top: var(--space-2xl);
        }

        .problem-card {
          text-align: center;
          padding: var(--space-xl);
          border-radius: var(--radius-xl);
          background: var(--color-gray-50);
          transition: all var(--transition-base);
        }

        .problem-card:hover {
          background: var(--color-white);
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }

        .problem-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto var(--space-md);
          background: var(--color-error);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-2xl);
          color: var(--color-white);
        }

        .problem-title {
          font-size: var(--text-xl);
          color: var(--color-secondary);
          margin-bottom: var(--space-sm);
        }

        .problem-description {
          color: var(--color-gray-600);
          font-size: var(--text-sm);
        }

        .how-it-works {
          padding: var(--space-3xl) 0;
          background: var(--color-gray-50);
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-2xl);
          margin-top: var(--space-2xl);
        }

        .step {
          position: relative;
          padding: var(--space-xl);
          background: var(--color-white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-base);
        }

        .step:hover {
          box-shadow: var(--shadow-xl);
          transform: translateY(-4px);
        }

        .step-number {
          position: absolute;
          top: calc(-1 * var(--space-lg));
          left: var(--space-xl);
          width: 40px;
          height: 40px;
          background: var(--color-primary);
          color: var(--color-white);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: var(--text-xl);
        }

        .step-title {
          font-size: var(--text-2xl);
          color: var(--color-secondary);
          margin-bottom: var(--space-md);
          margin-top: var(--space-md);
        }

        .step-description {
          color: var(--color-gray-600);
          line-height: 1.6;
        }

        .features {
          padding: var(--space-3xl) 0;
          background: var(--color-white);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--space-2xl);
          margin-top: var(--space-2xl);
        }

        .feature {
          display: flex;
          gap: var(--space-lg);
          padding: var(--space-xl);
          border-radius: var(--radius-xl);
          background: var(--color-gray-50);
          transition: all var(--transition-base);
        }

        .feature:hover {
          background: var(--color-white);
          box-shadow: var(--shadow-lg);
          transform: translateX(4px);
        }

        .feature-icon {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          background: var(--color-primary);
          color: var(--color-white);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
        }

        .feature-content h3 {
          font-size: var(--text-xl);
          color: var(--color-secondary);
          margin-bottom: var(--space-sm);
        }

        .feature-content p {
          color: var(--color-gray-600);
          font-size: var(--text-sm);
          margin-bottom: 0;
        }

        .testimonials {
          padding: var(--space-3xl) 0;
          background: var(--color-gray-50);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--space-xl);
          margin-top: var(--space-2xl);
        }

        .testimonial {
          background: var(--color-white);
          padding: var(--space-xl);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        .testimonial::before {
          content: '"';
          position: absolute;
          top: var(--space-md);
          left: var(--space-md);
          font-size: var(--text-6xl);
          color: var(--color-primary);
          opacity: 0.2;
          font-family: Georgia, serif;
        }

        .testimonial-content {
          position: relative;
          z-index: 1;
          font-style: italic;
          color: var(--color-gray-700);
          margin-bottom: var(--space-lg);
          line-height: 1.8;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .author-avatar {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-full);
          background: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-white);
          font-weight: 700;
          font-size: var(--text-xl);
        }

        .author-info {
          flex: 1;
        }

        .author-name {
          font-weight: 600;
          color: var(--color-secondary);
        }

        .author-title {
          font-size: var(--text-sm);
          color: var(--color-gray-500);
        }

        .pricing {
          padding: var(--space-3xl) 0;
          background: var(--color-white);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--space-xl);
          max-width: 1200px;
          margin: var(--space-2xl) auto;
        }

        .pricing-card {
          padding: var(--space-2xl);
          background: var(--color-white);
          border: 2px solid var(--color-gray-200);
          border-radius: var(--radius-xl);
          text-align: center;
          position: relative;
          transition: transform var(--transition-base), box-shadow var(--transition-base);
        }

        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .pricing-card.pricing-featured {
          border-color: var(--color-primary);
          transform: scale(1.05);
        }

        .pricing-card.pricing-featured:hover {
          transform: scale(1.05) translateY(-4px);
        }

        .pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-primary);
          color: var(--color-white);
          padding: var(--space-xs) var(--space-lg);
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          font-weight: 600;
        }

        .pricing-title {
          font-size: var(--text-2xl);
          color: var(--color-secondary);
          margin-bottom: var(--space-md);
        }

        .pricing-price {
          font-size: var(--text-5xl);
          color: var(--color-primary);
          font-weight: 700;
          margin-bottom: var(--space-md);
        }

        .pricing-price span {
          font-size: var(--text-xl);
          color: var(--color-gray-500);
        }

        .pricing-features {
          list-style: none;
          padding: 0;
          margin: var(--space-xl) 0;
          text-align: left;
        }

        .pricing-features li {
          padding: var(--space-sm) 0;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--color-gray-700);
        }

        .pricing-features li::before {
          content: '✓';
          color: var(--color-success);
          font-weight: 700;
          font-size: var(--text-lg);
        }

        .pricing-users {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--color-primary);
          margin: var(--space-md) 0;
          padding: var(--space-sm) 0;
          border-bottom: 1px solid var(--color-gray-200);
        }

        .cta-section {
          padding: var(--space-3xl) 0;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          color: var(--color-white);
          text-align: center;
        }

        .cta-section h2 {
          color: var(--color-white);
          margin-bottom: var(--space-lg);
        }

        .cta-section p {
          font-size: var(--text-xl);
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto var(--space-2xl);
        }

        .cta-section .btn {
          background: var(--color-white);
          color: var(--color-primary);
        }

        .cta-section .btn:hover {
          background: var(--color-gray-50);
          color: var(--color-primary);
          transform: translateY(-2px);
        }

        .form-container {
          max-width: 600px;
          margin: var(--space-2xl) auto;
          padding: var(--space-2xl);
          background: var(--color-white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
        }

        .form-group {
          margin-bottom: var(--space-lg);
        }

        .form-label {
          display: block;
          margin-bottom: var(--space-sm);
          font-weight: 600;
          color: var(--color-secondary);
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: var(--space-md);
          border: 2px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          font-family: var(--font-body);
          transition: border-color var(--transition-fast);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-submit {
          width: 100%;
        }

        .footer {
          padding: var(--space-3xl) 0 var(--space-xl);
          background: var(--color-secondary);
          color: var(--color-white);
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-2xl);
          margin-bottom: var(--space-2xl);
        }

        .footer-section h4 {
          color: var(--color-white);
          font-size: var(--text-lg);
          margin-bottom: var(--space-md);
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
        }

        .footer-section li {
          margin-bottom: var(--space-sm);
        }

        .footer-section a {
          color: var(--color-gray-300);
          transition: color var(--transition-fast);
        }

        .footer-section a:hover {
          color: var(--color-white);
          text-decoration: none;
        }

        .footer-bottom {
          padding-top: var(--space-xl);
          border-top: 1px solid rgba(255,255,255,0.1);
          text-align: center;
          color: var(--color-gray-400);
          font-size: var(--text-sm);
        }

        @media (max-width: 768px) {
          :root {
            --text-5xl: 2.5rem;
            --text-4xl: 2rem;
            --text-3xl: 1.5rem;
          }
          
          .navbar-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--color-white);
            box-shadow: var(--shadow-lg);
            flex-direction: column;
            padding: var(--space-xl);
          }
          
          .navbar-menu.active {
            display: flex;
          }
          
          .menu-toggle {
            display: block;
          }
          
          .hero-cta {
            flex-direction: column;
            align-items: center;
          }
          
          .hero-cta .btn {
            width: 100%;
            max-width: 300px;
          }
          
          .grid-2,
          .grid-3,
          .grid-4 {
            grid-template-columns: 1fr;
          }
          
          .features-grid,
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
          
          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .container {
            --container-padding: var(--space-md);
          }
          
          .hero {
            padding-top: calc(80px + var(--space-2xl));
            padding-bottom: var(--space-2xl);
          }
          
          .section {
            padding: var(--space-2xl) 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          display: inline-block;
          vertical-align: middle;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        :focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        .email-obfuscated {
          cursor: pointer;
        }

        .email-obfuscated:hover {
          text-decoration: underline;
        }

        @media print {
          .navbar,
          .footer,
          .cta-section,
          .btn {
            display: none;
          }

          body {
            font-size: 12pt;
          }

          .container {
            max-width: 100%;
          }
        }
      `}</style>
      
      <div>
        {/* Navigation */}
        <nav className="navbar" id="navbar">
          <div className="container">
            <div className="navbar-container">
              <a href="#" className="navbar-logo">
                <svg className="logo-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="15" width="80" height="90" fill="none" stroke="currentColor" strokeWidth="3" rx="4"/>
                  <line x1="20" y1="35" x2="100" y2="35" stroke="currentColor" strokeWidth="2"/>
                  <line x1="20" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="2"/>
                  <line x1="20" y1="85" x2="100" y2="85" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="35" cy="35" r="6" fill="var(--color-secondary)"/>
                  <circle cx="50" cy="35" r="6" fill="var(--color-secondary)"/>
                  <circle cx="75" cy="35" r="6" fill="currentColor"/>
                  <circle cx="90" cy="35" r="6" fill="currentColor"/>
                  <circle cx="35" cy="60" r="6" fill="var(--color-secondary)"/>
                  <circle cx="50" cy="60" r="6" fill="var(--color-secondary)"/>
                  <circle cx="65" cy="60" r="6" fill="var(--color-secondary)"/>
                  <circle cx="85" cy="60" r="6" fill="currentColor"/>
                  <circle cx="35" cy="85" r="6" fill="var(--color-secondary)"/>
                  <circle cx="55" cy="85" r="6" fill="currentColor"/>
                  <circle cx="70" cy="85" r="6" fill="currentColor"/>
                  <circle cx="85" cy="85" r="6" fill="currentColor"/>
                </svg>
                CRMblr
              </a>
              
              <ul className="navbar-menu" id="navbarMenu">
                <li><a href="#how-it-works" className="navbar-link">How It Works</a></li>
                <li><a href="#features" className="navbar-link">Features</a></li>
                <li><a href="#testimonials" className="navbar-link">Testimonials</a></li>
                <li><a href="#pricing" className="navbar-link">Pricing</a></li>
                <li><Link href="/login" className="navbar-link">Login</Link></li>
                <li className="navbar-cta"><a href="https://calendly.com/laurie-sartain/30min" target="_blank" className="btn btn-primary">Schedule Demo</a></li>
              </ul>
              
              <button className="menu-toggle" id="menuToggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
              </button>
          </div>
        </div>
        </nav>

      {/* Hero Section */}
      <section className="hero">
          <div className="container">
            <div className="hero-content animate-fadeInUp">
              <div className="hero-badge">🚀 Launch Special: 50% Off Setup</div>
              <h1 className="hero-title">Your Nonprofit's Data,<br/>Instantly Organized</h1>
            <p className="hero-subtitle">
                Our nonprofit experts custom-configure your CRM using your existing data. No expensive consultants. No six-month implementations. Just a personalized system ready in 5 days.
              </p>
              <div className="hero-cta">
                <a href="https://calendly.com/laurie-sartain/30min" target="_blank" className="btn btn-primary btn-large">Schedule Your Demo</a>
                <a href="#how-it-works" className="btn btn-secondary btn-large">See How It Works</a>
            </div>

              <div className="hero-stats">
                <div className="stat">
                <div className="stat-number">5 Days</div>
                <div className="stat-label">Setup Time</div>
              </div>
                <div className="stat">
                <div className="stat-number">$45K</div>
                <div className="stat-label">Avg Savings</div>
              </div>
                <div className="stat">
                <div className="stat-number">95%</div>
                <div className="stat-label">Adoption Rate</div>
              </div>
                <div className="stat">
                <div className="stat-number">15%</div>
                <div className="stat-label">More Donations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Problem Section */}
        <section className="problem section">
          <div className="container">
            <div className="text-center">
              <h2>Why Nonprofits Choose CRMblr</h2>
              <p className="text-lg text-muted">Real expertise. Personal attention. Fair pricing.</p>
          </div>

            <div className="problem-grid">
              <div className="problem-card">
                <div className="problem-icon">👥</div>
                <h3 className="problem-title">Nonprofit Veterans</h3>
                <p className="problem-description">Built by people who've actually run nonprofits and understand your challenges</p>
            </div>
              <div className="problem-card">
                <div className="problem-icon">🚀</div>
                <h3 className="problem-title">5-Day Setup</h3>
                <p className="problem-description">Expert developers configure your system rapidly without sacrificing quality</p>
            </div>
              <div className="problem-card">
                <div className="problem-icon">💚</div>
                <h3 className="problem-title">Personal Support</h3>
                <p className="problem-description">Real humans guide you through adoption - we succeed when you succeed</p>
            </div>
              <div className="problem-card">
                <div className="problem-icon">⚖️</div>
                <h3 className="problem-title">Mission-Aligned Pricing</h3>
                <p className="problem-description">Fair, transparent pricing because we believe in your work</p>
            </div>
          </div>
        </div>
      </section>

        {/* How It Works */}
        <section className="how-it-works section" id="how-it-works">
          <div className="container">
            <div className="text-center">
              <h2>How CRMblr Works</h2>
              <p className="text-lg text-muted">Three simple steps to transform your nonprofit's data management</p>
          </div>

            <div className="steps">
              <div className="step">
              <div className="step-number">1</div>
              <h3 className="step-title">We Understand</h3>
              <p className="step-description">
                  Our team analyzes your organization's structure, programs, donors, and operations
                  with nonprofit expertise. We know what matters because we've been there.
              </p>
            </div>
              <div className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">We Configure</h3>
              <p className="step-description">
                  Expert developers custom-configure your CRM with your contacts, donation history, grant pipeline,
                  and workflows. Everything is tailored to match your organization's unique needs.
              </p>
            </div>
              <div className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">You Succeed</h3>
              <p className="step-description">
                Your team gets personal support during the critical adoption phase. 
                We're here to ensure success because we understand the nonprofit journey.
              </p>
            </div>
          </div>
        </div>
      </section>

        {/* Features */}
        <section className="features section" id="features">
          <div className="container">
            <div className="text-center">
              <h2>Built by Nonprofit People, For Nonprofit People</h2>
              <p className="text-lg text-muted">Every feature configured with deep understanding of your mission</p>
          </div>

            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon">👥</div>
                <div className="feature-content">
                  <h3>Expert Configuration</h3>
                  <p>Our nonprofit specialists carefully migrate your donor data, grant history, and organizational structure with attention to detail.</p>
            </div>
            </div>
              <div className="feature">
                <div className="feature-icon">🎨</div>
                <div className="feature-content">
                  <h3>Personalized Design</h3>
                  <p>Thoughtfully customized with your branding, terminology, and workflows. Built by people who understand nonprofit culture.</p>
            </div>
            </div>
              <div className="feature">
                <div className="feature-icon">📊</div>
                <div className="feature-content">
                  <h3>Unified Dashboard</h3>
                  <p>See donations, grants, contacts, and operations in one place. Real-time metrics for board reporting.</p>
            </div>
              </div>
              <div className="feature">
                <div className="feature-icon">📱</div>
                <div className="feature-content">
                  <h3>Field Operations</h3>
                  <p>Mobile-ready for staff and volunteers. Track service requests, events, and community engagement on the go.</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🔄</div>
                <div className="feature-content">
                  <h3>Smart Pipelines</h3>
                  <p>Donor cultivation stages configured for your programs. Move contacts from identified to stewarded automatically.</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🤝</div>
                <div className="feature-content">
                  <h3>Ongoing Support</h3>
                  <p>Personal attention during your critical adoption phase. We're here to ensure your team succeeds, not just deliver software.</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
        <section className="testimonials section" id="testimonials">
          <div className="container">
            <div className="text-center">
              <h2>Nonprofits Love CRMblr</h2>
              <p className="text-lg text-muted">Join organizations saving time and raising more</p>
          </div>

          <div className="testimonials-grid">
              <div className="testimonial">
                <p className="testimonial-content">
                  "As a development professional, I know how critical it is to have donor data that's both accessible and actionable. The challenge is that most CRM systems are either too complex for small teams or too generic to be useful."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">SF</div>
                <div className="author-info">
                  <div className="author-name">Sarah Fundsby</div>
                  <div className="author-title">Associate Director of Development, Major Public University</div>
                </div>
              </div>
            </div>
              <div className="testimonial">
                <p className="testimonial-content">
                  "The nonprofit sector desperately needs technology solutions that actually work for our unique challenges. Too often we're forced into systems built for corporate sales teams, not mission-driven organizations."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">JG</div>
                <div className="author-info">
                  <div className="author-name">John Grantsman</div>
                  <div className="author-title">Director of Grants</div>
                </div>
              </div>
            </div>
              <div className="testimonial">
                <p className="testimonial-content">
                  "Running a nonprofit, I spent countless hours trying to wrangle data from spreadsheets, donor databases, and grant tracking systems. I built CRMblr because nonprofits deserve technology that works as hard as we do—without the six-month implementation nightmare."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">LS</div>
                <div className="author-info">
                  <div className="author-name">Laurie Sartain</div>
                  <div className="author-title">Founder, CRMblr | Former Executive Director, MAKE Lit, NFP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
        <section className="pricing section" id="pricing">
          <div className="container">
            <div className="text-center">
              <h2>Simple, Transparent Pricing</h2>
              <p className="text-lg text-muted">Choose the plan that fits your team size</p>
          </div>

          <div className="pricing-grid">
              {/* Small Teams Plan */}
            <div className="pricing-card">
              <h3 className="pricing-title">Small Teams</h3>
              <div className="pricing-price">
                  $500<span>/month</span>
              </div>
                <p className="text-muted"><s style={{color: 'var(--color-gray-400)'}}>$1,000</s> $500 setup fee<br/>(50% off launch special)</p>
              <div className="pricing-users">Up to 5 users</div>
                
              <ul className="pricing-features">
                  <li>Automated data migration</li>
                  <li>Custom branding & configuration</li>
                  <li>5 user accounts</li>
                  <li>Mobile app access</li>
                  <li>Real-time dashboards</li>
                  <li>Quarterly data updates</li>
                  <li>Email support</li>
                  <li>Training & onboarding</li>
              </ul>
                
                <a href="https://calendly.com/laurie-sartain/30min" target="_blank" className="btn btn-secondary btn-large">Get Started</a>
            </div>

              {/* Medium Teams Plan */}
              <div className="pricing-card pricing-featured">
                <div className="pricing-badge">MOST POPULAR</div>
              <h3 className="pricing-title">Medium Teams</h3>
              <div className="pricing-price">
                  $1,000<span>/month</span>
              </div>
                <p className="text-muted"><s style={{color: 'var(--color-gray-400)'}}>$2,000</s> $1,000 setup fee<br/>(50% off launch special)</p>
              <div className="pricing-users">Up to 10 users</div>
                
              <ul className="pricing-features">
                  <li>Automated data migration</li>
                  <li>Custom branding & configuration</li>
                  <li>10 user accounts</li>
                  <li>Mobile app access</li>
                  <li>Real-time dashboards</li>
                  <li>Quarterly data updates</li>
                  <li>Priority email & chat support</li>
                  <li>Training & onboarding</li>
                  <li>Monthly check-ins</li>
              </ul>
                
                <a href="https://calendly.com/laurie-sartain/30min" target="_blank" className="btn btn-primary btn-large">Get Started</a>
            </div>

              {/* Unlimited Plan */}
            <div className="pricing-card">
              <h3 className="pricing-title">Unlimited</h3>
              <div className="pricing-price">
                  $2,000<span>/month</span>
              </div>
                <p className="text-muted"><s style={{color: 'var(--color-gray-400)'}}>$4,000</s> $2,000 setup fee<br/>(50% off launch special)</p>
              <div className="pricing-users">Unlimited users</div>
                
              <ul className="pricing-features">
                  <li>Automated data migration</li>
                  <li>Custom branding & configuration</li>
                  <li>Unlimited user accounts</li>
                  <li>Mobile app access</li>
                  <li>Real-time dashboards</li>
                  <li>Quarterly data updates</li>
                  <li>Dedicated support channel</li>
                  <li>Training & onboarding</li>
                  <li>Weekly check-ins</li>
                  <li>Custom integrations</li>
              </ul>
                
                <a href="https://calendly.com/laurie-sartain/30min" target="_blank" className="btn btn-secondary btn-large">Get Started</a>
            </div>
          </div>
        </div>
      </section>

        {/* CTA Section */}
        <section className="cta-section" id="demo">
          <div className="container">
            <h2>Let's Talk About Your Nonprofit's Needs</h2>
            <p>Schedule a conversation with someone who understands the nonprofit world</p>
            
            <div className="form-container">
              <form id="demoForm">
                <div className="form-group">
                  <label htmlFor="yourName" className="form-label">Your Name *</label>
                  <input type="text" id="yourName" name="yourName" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="orgName" className="form-label">Organization Name *</label>
                  <input type="text" id="orgName" name="orgName" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input type="email" id="email" name="email" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="title" className="form-label">Your Title (Optional)</label>
                  <input type="text" id="title" name="title" className="form-input" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number (Optional)</label>
                  <input type="tel" id="phone" name="phone" className="form-input" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="budget" className="form-label">Annual Budget Range (Optional)</label>
                  <select id="budget" name="budget" className="form-select">
                    <option value="">Select budget range</option>
                    <option value="Under $500K">Under $500K</option>
                    <option value="$500K - $1M">$500K - $1M</option>
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="$5M - $10M">$5M - $10M</option>
                    <option value="Over $10M">Over $10M</option>
                  </select>
                </div>
                
              <div className="form-group">
                  <label htmlFor="currentCRM" className="form-label">Current CRM (Optional)</label>
                  <input type="text" id="currentCRM" name="currentCRM" className="form-input" placeholder="e.g., Salesforce, spreadsheets, none" />
              </div>
                
                <button type="submit" className="btn btn-primary btn-large form-submit">Schedule Demo</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
          <div className="container">
          <div className="footer-content">
              <div className="footer-section">
                <h4>CRMblr</h4>
                <p>The nonprofit CRM that builds itself from your data.</p>
              </div>
              <div className="footer-section">
                <h4>Product</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#how-it-works">How It Works</a></li>
                  <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
              <div className="footer-section">
                <h4>Company</h4>
                <ul>
                  <li><a href="about.html">About Us</a></li>
                  <li><a href="mailto:laurie@crmblr.com">Contact</a></li>
              </ul>
            </div>
              <div className="footer-section">
                <h4>Support</h4>
                <ul>
                  <li><a href="security.html">Security</a></li>
                  <li><a href="privacy.html">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
              <p>&copy; 2025 CRMblr. All rights reserved. | Built with ❤️ for nonprofits</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}