import { Job } from 'bullmq';
import { db } from '@crmblr/db';

export interface EmailJobData {
  tenantId: string;
  type: 'thank_you' | 'newsletter' | 'reminder';
  recipientId: string;
  recipientType: 'contact' | 'organization';
  templateId?: string;
  customData?: any;
}

export class EmailProcessor {
  async process(job: Job<EmailJobData>) {
    const { tenantId, type, recipientId, recipientType, templateId, customData } = job.data;
    
    try {
      console.log(`📧 Processing email job: ${type} for ${recipientType} ${recipientId}`);
      
      // Set tenant context for RLS
      await db.setTenantContext(tenantId, 'system');
      
      // Get recipient information
      let recipient: any;
      if (recipientType === 'contact') {
        recipient = await db.client.contact.findUnique({
          where: { id: recipientId },
        });
      } else {
        recipient = await db.client.organization.findUnique({
          where: { id: recipientId },
        });
      }
      
      if (!recipient) {
        throw new Error(`Recipient not found: ${recipientId}`);
      }
      
      // Generate email content based on type
      const emailContent = await this.generateEmailContent(type, recipient, customData);
      
      // Send email (mock implementation)
      await this.sendEmail(recipient.email, emailContent.subject, emailContent.body);
      
      // Update thank you status if applicable
      if (type === 'thank_you' && recipientType === 'contact') {
        // Find associated donations and update thank you status
        await db.client.donation.updateMany({
          where: {
            contactId: recipientId,
            thankYouStatus: 'pending',
          },
          data: {
            thankYouStatus: 'sent',
          },
        });
      }
      
      await db.clearTenantContext();
      
      console.log(`✅ Email sent successfully to ${recipient.email}`);
      
      return {
        success: true,
        recipient: recipient.email,
        type,
      };
      
    } catch (error) {
      console.error(`❌ Email job failed:`, error);
      await db.clearTenantContext();
      throw error;
    }
  }

  private async generateEmailContent(type: string, recipient: any, customData?: any) {
    switch (type) {
      case 'thank_you':
        return {
          subject: `Thank you for your generous donation`,
          body: `Dear ${recipient.firstName || recipient.name},\n\nThank you for your generous donation. Your support means the world to us and helps us continue our important work.\n\nWith gratitude,\nThe Team`,
        };
      
      case 'newsletter':
        return {
          subject: `Monthly Newsletter - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          body: `Dear ${recipient.firstName || recipient.name},\n\nHere's what's happening this month...\n\nBest regards,\nThe Team`,
        };
      
      case 'reminder':
        return {
          subject: `Reminder: Grant Application Deadline Approaching`,
          body: `Dear ${recipient.firstName || recipient.name},\n\nThis is a friendly reminder that your grant application deadline is approaching.\n\nBest regards,\nThe Team`,
        };
      
      default:
        return {
          subject: `Message from CRMblr`,
          body: `Dear ${recipient.firstName || recipient.name},\n\nThank you for your continued support.\n\nBest regards,\nThe Team`,
        };
    }
  }

  private async sendEmail(to: string, subject: string, body: string) {
    // Mock email sending - in production, use SES, SendGrid, etc.
    console.log(`📧 Sending email to ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  }
}
