'use client';

import { Button, Input } from '@crmblr/ui';
import Link from 'next/link';
import './crmblr-styles.css';

export default function HomePage() {

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div>
              <a href="/" className="logo">CRMblr</a>
            </div>
            <nav className="nav">
              <button 
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="nav-link"
              >
                How It Works
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('features');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="nav-link"
              >
                Features
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('testimonials');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="nav-link"
              >
                Testimonials
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('pricing');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="nav-link"
              >
                Pricing
              </button>
              <Link href="/signup" className="schedule-demo-btn">Schedule Demo</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="launch-banner">
              🚀 Launch Special: 50% Off Setup
            </div>
            
            <h1 className="hero-title">
              Your Nonprofit's Data,<br />
              Instantly Organized
            </h1>
            
            <p className="hero-subtitle">
              Our nonprofit experts custom-configure your CRM using your existing data. 
              No expensive consultants. No six-month implementations. Just a personalized system ready in 5 days.
            </p>
            
            <div className="hero-buttons">
              <Link href="/signup" className="hero-btn-primary">Schedule Your Demo</Link>
              <button className="hero-btn-secondary">See How It Works</button>
            </div>

            {/* Stats */}
            <div className="stats">
              <div className="stat-item">
                <div className="stat-number">5 Days</div>
                <div className="stat-label">Setup Time</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">$45K</div>
                <div className="stat-label">Avg Savings</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Adoption Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">15%</div>
                <div className="stat-label">More Donations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Nonprofits Choose CRMblr */}
      <section className="section section-gray">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Nonprofits Choose CRMblr</h2>
            <p className="section-subtitle">Real expertise. Personal attention. Fair pricing.</p>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Nonprofit Veterans</h3>
              <p className="feature-description">Built by people who've actually run nonprofits and understand your challenges</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">5-Day Setup</h3>
              <p className="feature-description">Expert developers configure your system rapidly without sacrificing quality</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💚</div>
              <h3 className="feature-title">Personal Support</h3>
              <p className="feature-description">Real humans guide you through adoption - we succeed when you succeed</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚖️</div>
              <h3 className="feature-title">Mission-Aligned Pricing</h3>
              <p className="feature-description">Fair, transparent pricing because we believe in your work</p>
            </div>
          </div>
        </div>
      </section>

      {/* How CRMblr Works */}
      <section id="how-it-works" className="section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How CRMblr Works</h2>
            <p className="section-subtitle">Three simple steps to transform your nonprofit's data management</p>
          </div>

          <div className="how-it-works">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3 className="step-title">We Understand</h3>
              <p className="step-description">
                Our team analyzes your organization's structure, programs, donors, and operations with nonprofit expertise. 
                We know what matters because we've been there.
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3 className="step-title">We Configure</h3>
              <p className="step-description">
                Expert developers custom-configure your CRM with your contacts, donation history, grant pipeline, and workflows. 
                Everything is tailored to match your organization's unique needs.
              </p>
            </div>
            <div className="step-item">
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

      {/* Features Section */}
      <section id="features" className="section section-gray">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Built by Nonprofit People, For Nonprofit People</h2>
            <p className="section-subtitle">Every feature configured with deep understanding of your mission</p>
          </div>

          <div className="features-cards">
            <div className="feature-card">
              <div className="feature-card-icon">👥</div>
              <h3 className="feature-card-title">Expert Configuration</h3>
              <p className="feature-card-description">Our nonprofit specialists carefully migrate your donor data, grant history, and organizational structure with attention to detail.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">🎨</div>
              <h3 className="feature-card-title">Personalized Design</h3>
              <p className="feature-card-description">Thoughtfully customized with your branding, terminology, and workflows. Built by people who understand nonprofit culture.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">📊</div>
              <h3 className="feature-card-title">Unified Dashboard</h3>
              <p className="feature-card-description">See donations, grants, contacts, and operations in one place. Real-time metrics for board reporting.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">📱</div>
              <h3 className="feature-card-title">Field Operations</h3>
              <p className="feature-card-description">Mobile-ready for staff and volunteers. Track service requests, events, and community engagement on the go.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">🔄</div>
              <h3 className="feature-card-title">Smart Pipelines</h3>
              <p className="feature-card-description">Donor cultivation stages configured for your programs. Move contacts from identified to stewarded automatically.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">🤝</div>
              <h3 className="feature-card-title">Ongoing Support</h3>
              <p className="feature-card-description">Personal attention during your critical adoption phase. We're here to ensure your team succeeds, not just deliver software.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Nonprofits Love CRMblr</h2>
            <p className="section-subtitle">Join organizations saving time and raising more</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">
                "As a development professional, I know how critical it is to have donor data that's both accessible and actionable. 
                The challenge is that most CRM systems are either too complex for small teams or too generic to be useful."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">SF</div>
                <div className="author-info">
                  <div className="author-name">Sarah Fundsby</div>
                  <div className="author-title">Associate Director of Development, Major Public University</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "The nonprofit sector desperately needs technology solutions that actually work for our unique challenges. 
                Too often we're forced into systems built for corporate sales teams, not mission-driven organizations."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">JG</div>
                <div className="author-info">
                  <div className="author-name">John Grantsman</div>
                  <div className="author-title">Director of Grants</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Running a nonprofit, I spent countless hours trying to wrangle data from spreadsheets, donor databases, and grant tracking systems. 
                I built CRMblr because nonprofits deserve technology that works as hard as we do—without the six-month implementation nightmare."
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
      <section id="pricing" className="section section-gray">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">Choose the plan that fits your team size</p>
          </div>

          <div className="pricing-grid">
            {/* Small Teams */}
            <div className="pricing-card">
              <h3 className="pricing-title">Small Teams</h3>
              <div className="pricing-price">
                <span className="pricing-amount">$500</span>
                <span className="pricing-period">/month</span>
              </div>
              <div className="pricing-setup">
                <span className="pricing-original">$1,000</span>
                <span className="pricing-discount">$500 setup fee</span>
                <div className="pricing-note">(50% off launch special)</div>
              </div>
              <div className="pricing-users">Up to 5 users</div>
              <ul className="pricing-features">
                <li>• Automated data migration</li>
                <li>• Custom branding & configuration</li>
                <li>• 5 user accounts</li>
                <li>• Mobile app access</li>
                <li>• Real-time dashboards</li>
                <li>• Quarterly data updates</li>
                <li>• Email support</li>
                <li>• Training & onboarding</li>
              </ul>
              <button className="pricing-btn">Get Started</button>
            </div>

            {/* Medium Teams */}
            <div className="pricing-card pricing-card-popular">
              <div className="popular-badge">MOST POPULAR</div>
              <h3 className="pricing-title">Medium Teams</h3>
              <div className="pricing-price">
                <span className="pricing-amount">$1,000</span>
                <span className="pricing-period">/month</span>
              </div>
              <div className="pricing-setup">
                <span className="pricing-original">$2,000</span>
                <span className="pricing-discount">$1,000 setup fee</span>
                <div className="pricing-note">(50% off launch special)</div>
              </div>
              <div className="pricing-users">Up to 10 users</div>
              <ul className="pricing-features">
                <li>• Automated data migration</li>
                <li>• Custom branding & configuration</li>
                <li>• 10 user accounts</li>
                <li>• Mobile app access</li>
                <li>• Real-time dashboards</li>
                <li>• Quarterly data updates</li>
                <li>• Priority email & chat support</li>
                <li>• Training & onboarding</li>
                <li>• Monthly check-ins</li>
              </ul>
              <button className="pricing-btn">Get Started</button>
            </div>

            {/* Unlimited */}
            <div className="pricing-card">
              <h3 className="pricing-title">Unlimited</h3>
              <div className="pricing-price">
                <span className="pricing-amount">$2,000</span>
                <span className="pricing-period">/month</span>
              </div>
              <div className="pricing-setup">
                <span className="pricing-original">$4,000</span>
                <span className="pricing-discount">$2,000 setup fee</span>
                <div className="pricing-note">(50% off launch special)</div>
              </div>
              <div className="pricing-users">Unlimited users</div>
              <ul className="pricing-features">
                <li>• Automated data migration</li>
                <li>• Custom branding & configuration</li>
                <li>• Unlimited user accounts</li>
                <li>• Mobile app access</li>
                <li>• Real-time dashboards</li>
                <li>• Quarterly data updates</li>
                <li>• Dedicated support channel</li>
                <li>• Training & onboarding</li>
                <li>• Weekly check-ins</li>
                <li>• Custom integrations</li>
              </ul>
              <button className="pricing-btn">Get Started</button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Let's Talk About Your Nonprofit's Needs</h2>
            <p className="section-subtitle">Schedule a conversation with someone who understands the nonprofit world</p>
          </div>

          <div className="contact-form">
            <form>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input type="text" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Organization Name *</label>
                  <input type="text" className="form-input" required />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Title (Optional)</label>
                  <input type="text" className="form-input" />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Phone Number (Optional)</label>
                  <input type="tel" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Annual Budget Range (Optional)</label>
                  <select className="form-select">
                    <option>Select budget range</option>
                    <option>Under $500K</option>
                    <option>$500K - $1M</option>
                    <option>$1M - $5M</option>
                    <option>$5M - $10M</option>
                    <option>Over $10M</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Current CRM (Optional)</label>
                <input type="text" className="form-input" />
              </div>
              <div className="form-submit">
                <button type="submit" className="submit-btn">Schedule Demo</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div>
              <div className="footer-brand">
                <h3 className="footer-title">CRMblr</h3>
                <p className="footer-description">The nonprofit CRM that builds itself from your data.</p>
              </div>
            </div>
            <div>
              <h4 className="footer-section-title">Product</h4>
              <ul className="footer-links">
                <li><a href="#features" className="footer-link">Features</a></li>
                <li><a href="#how-it-works" className="footer-link">How It Works</a></li>
                <li><a href="#pricing" className="footer-link">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-section-title">Company</h4>
              <ul className="footer-links">
                <li><a href="#about" className="footer-link">About Us</a></li>
                <li><a href="#contact" className="footer-link">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-section-title">Support</h4>
              <ul className="footer-links">
                <li><a href="#security" className="footer-link">Security</a></li>
                <li><a href="#privacy" className="footer-link">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 CRMblr. All rights reserved. | Built with ❤️ for nonprofits</p>
          </div>
        </div>
      </footer>
    </div>
  );
}