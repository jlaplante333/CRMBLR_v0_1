'use client';

import Link from 'next/link';
import './landing-styles.css';

export default function HomePage() {

  return (
    <>
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
                VCRM
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
              <div className="hero-badge">🎤 Tokyo Voice AI Hackathon Winner</div>
              <h1 className="hero-title animated-title">
                <span className="title-main">V-CRM: CRM, but with VOICE!</span>
                <span className="title-subtitle">Your Data, Instantly Organized</span>
              </h1>
            <p className="hero-subtitle">
                Our story: Our team created a CRM based around Voice on Oct 25th in Tokyo at the Tokyo Voice AI hackathon at the Ameba towers. Experience the future of CRM with voice-powered interactions. Just say "show me contact Jonathan" and watch the magic happen.
              </p>
              <div className="hero-cta">
                <a href="https://calendly.com/laurie-sartain/30min" target="_blank" className="btn btn-primary btn-large">Schedule Your Demo</a>
                <a href="#how-it-works" className="btn btn-secondary btn-large">See How It Works</a>
                <a href="/voice-test" className="btn btn-accent btn-large">🎤 Test Voice Assistant</a>
              </div>

              <div className="hero-stats">
                <div className="stat">
                <div className="stat-number">Voice</div>
                <div className="stat-label">Powered</div>
              </div>
                <div className="stat">
                <div className="stat-number">Tokyo</div>
                <div className="stat-label">Hackathon</div>
              </div>
                <div className="stat">
                <div className="stat-number">AI</div>
                <div className="stat-label">Enhanced</div>
              </div>
                <div className="stat">
                <div className="stat-number">2025</div>
                <div className="stat-label">Innovation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Problem Section */}
        <section className="problem section">
          <div className="container">
            <div className="text-center">
              <h2>Why Customers and Non-Profits Choose V-CRM (Created at the Tokyo Voice AI Hackathon!)</h2>
              <p className="text-lg text-muted">Voice-powered CRM innovation. Built for the future of customer engagement.</p>
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
              <h2>How VCRM Works</h2>
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
              <h2>Nonprofits Love V-CRM</h2>
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
                  "Running a nonprofit, I spent countless hours trying to wrangle data from spreadsheets, donor databases, and grant tracking systems. I built V-CRM because nonprofits deserve technology that works as hard as we do—with voice-powered innovation from the Tokyo Voice AI Hackathon!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">LS</div>
                <div className="author-info">
                  <div className="author-name">Laurie Sartain</div>
                  <div className="author-title">Founder, V-CRM | Tokyo Voice AI Hackathon Winner</div>
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
                <h4>V-CRM</h4>
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
              <p>&copy; 2025 V-CRM. All rights reserved. | Built with ❤️ at the Tokyo Voice AI Hackathon</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}