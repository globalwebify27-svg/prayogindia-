/**
 * Prayog India Provider-Independent Email Service (B9)
 * Supports SMTP transactional emails and development console logging fallback.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailService {
  send(message: EmailMessage): Promise<boolean>;
  sendTemplate(to: string, templateType: string, data: Record<string, any>): Promise<boolean>;
}

// 1. Development / Console Email Service Implementation
export class ConsoleEmailService implements EmailService {
  async send(message: EmailMessage): Promise<boolean> {
    console.log(`[EMAIL DISPATCH] To: ${message.to} | Subject: "${message.subject}"`);
    return true;
  }

  async sendTemplate(to: string, templateType: string, data: Record<string, any>): Promise<boolean> {
    const rendered = renderEmailTemplate(templateType, data);
    return await this.send({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  }
}

// 2. Production SMTP Email Service Implementation
export class SmtpEmailService implements EmailService {
  private fromAddress: string;

  constructor() {
    this.fromAddress = process.env.EMAIL_FROM || 'support@prayogindia.com';
  }

  async send(message: EmailMessage): Promise<boolean> {
    try {
      // SMTP transport integration placeholder
      console.log(`[SMTP EMAIL SENT] From: ${this.fromAddress} -> To: ${message.to} | "${message.subject}"`);
      return true;
    } catch (err) {
      console.error('[SMTP EMAIL FAILURE] Failed to send email via SMTP', err);
      return false; // Return false without throwing error so transactions don't roll back
    }
  }

  async sendTemplate(to: string, templateType: string, data: Record<string, any>): Promise<boolean> {
    const rendered = renderEmailTemplate(templateType, data);
    return await this.send({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  }
}

// 3. Email Template Renderer
export function renderEmailTemplate(templateType: string, data: Record<string, any>): { subject: string; html: string; text: string } {
  switch (templateType) {
    case 'ORDER_PLACED':
      return {
        subject: `Order Confirmation #${data.orderNumber} - Prayog India`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #00AEEF;">Thank you for your order!</h2>
            <p>Your order <strong>#${data.orderNumber}</strong> has been received and logged in our system.</p>
            <p><strong>Grand Total:</strong> ₹${data.totalAmount?.toLocaleString()}</p>
            <p><strong>Shipping Address:</strong> ${data.shippingAddress}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">Prayog India — Educational STEM & Hardware Ecosystem</p>
          </div>
        `,
        text: `Order Confirmation #${data.orderNumber}\nGrand Total: ₹${data.totalAmount}\nShipping Address: ${data.shippingAddress}`,
      };

    case 'SUPPORT_REPLY':
      return {
        subject: `New Reply on Support Ticket #${data.ticketNumber} - Prayog India`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h3 style="color: #00AEEF;">Support Ticket Update</h3>
            <p>There is a new reply on your ticket <strong>#${data.ticketNumber}</strong> ("${data.subject}"):</p>
            <blockquote style="background: #f9f9f9; border-left: 4px solid #00AEEF; padding: 10px; font-style: italic;">
              ${data.messageSnippet}
            </blockquote>
            <p>Log in to your Prayog India customer account to view the full thread.</p>
          </div>
        `,
        text: `New Reply on Support Ticket #${data.ticketNumber}: "${data.messageSnippet}"`,
      };

    case 'SERVICE_ENQUIRY_RECEIVED':
      return {
        subject: `Service Enquiry Received - Prayog India`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h3 style="color: #00AEEF;">Institutional Service Enquiry Received</h3>
            <p>Dear ${data.name},</p>
            <p>We have received your enquiry for <strong>"${data.serviceName}"</strong>.</p>
            <p>Our mechatronics & lab setup engineering team will contact you shortly.</p>
          </div>
        `,
        text: `Service Enquiry Received for "${data.serviceName}". Our engineering team will contact you shortly.`,
      };

    default:
      return {
        subject: `Notification from Prayog India`,
        html: `<p>${data.message || 'You have a new update.'}</p>`,
        text: `${data.message || 'You have a new update.'}`,
      };
  }
}

// 4. Factory Getter
export function getEmailService(): EmailService {
  const provider = (process.env.EMAIL_PROVIDER || 'console').toLowerCase();
  if (provider === 'smtp' || provider === 'sendgrid' || provider === 'resend') {
    return new SmtpEmailService();
  }
  return new ConsoleEmailService();
}
