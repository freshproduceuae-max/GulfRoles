/**
 * Email utility for sending job digest emails via SendGrid
 */

import { FormattedJob } from './search';

interface SendGridResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a job digest email using SendGrid
 * @param email - Recipient email address
 * @param jobs - Array of job listings to include
 * @param subject - Email subject line
 * @param unsubscribeToken - Token for unsubscribe link
 * @returns Response object with success status
 */
export async function sendJobDigest(
  email: string,
  jobs: FormattedJob[],
  subject: string,
  unsubscribeToken: string
): Promise<SendGridResponse> {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  if (!sendgridApiKey) {
    console.error('SENDGRID_API_KEY is not configured');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    // Limit to 10 jobs per digest
    const jobsToSend = jobs.slice(0, 10);

    const htmlContent = buildDigestHTML(jobsToSend, unsubscribeToken);

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            subject,
          },
        ],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@jobbrowser.app',
          name: 'JobBrowser Alerts',
        },
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', response.status, errorText);
      return {
        success: false,
        error: `SendGrid error: ${response.status}`,
      };
    }

    // Extract message ID from response headers if available
    const messageId = response.headers.get('x-message-id');

    return {
      success: true,
      messageId: messageId || undefined,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build HTML email content for job digest
 */
function buildDigestHTML(jobs: FormattedJob[], unsubscribeToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${baseUrl}/api/alerts/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  const jobCardsHTML = jobs.map((job) => buildJobCard(job, baseUrl)).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      color: #333;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .intro {
      font-size: 16px;
      color: #555;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    .jobs-list {
      margin-bottom: 30px;
    }
    .job-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      transition: box-shadow 0.2s ease;
    }
    .job-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .job-title {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px 0;
    }
    .job-company {
      font-size: 14px;
      color: #667eea;
      font-weight: 600;
      margin: 0 0 12px 0;
    }
    .job-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin: 12px 0;
      font-size: 13px;
      color: #6b7280;
    }
    .job-meta-item {
      display: flex;
      align-items: center;
    }
    .job-salary {
      background-color: #f0f4ff;
      color: #667eea;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 4px;
      display: inline-block;
      font-size: 13px;
    }
    .job-location {
      background-color: #f3f4f6;
      padding: 6px 12px;
      border-radius: 4px;
      display: inline-block;
      font-size: 13px;
    }
    .job-description {
      font-size: 14px;
      color: #555;
      line-height: 1.6;
      margin: 15px 0;
      max-height: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .job-apply-button {
      display: inline-block;
      background-color: #667eea;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      margin-top: 12px;
      transition: background-color 0.2s ease;
    }
    .job-apply-button:hover {
      background-color: #5568d3;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      line-height: 1.8;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>JobBrowser Weekly Digest</h1>
      <p>New opportunities matching your interests</p>
    </div>

    <div class="content">
      <p class="intro">
        Hi there! We found <strong>${jobs.length} new job${jobs.length !== 1 ? 's' : ''}</strong> that match your preferences this week. Check them out and apply to the ones that interest you!
      </p>

      <div class="jobs-list">
        ${jobCardsHTML}
      </div>

      <div style="text-align: center; margin-top: 40px;">
        <a href="${baseUrl}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">Browse All Jobs</a>
      </div>
    </div>

    <div class="footer">
      <p>JobBrowser helps you find the right job in the Gulf region.</p>
      <p>
        <a href="${baseUrl}">Visit JobBrowser</a> |
        <a href="${unsubscribeUrl}">Unsubscribe from alerts</a>
      </p>
      <p style="margin-top: 20px; font-size: 11px; color: #9ca3af;">
        © ${new Date().getFullYear()} JobBrowser. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Build a single job card HTML
 */
function buildJobCard(job: FormattedJob, baseUrl: string): string {
  const jobUrl = `${baseUrl}/jobs/${job.id}`;
  const salaryRange = formatSalaryRange(
    job.salary_min,
    job.salary_max,
    job.salary_currency
  );

  return `
    <div class="job-card">
      <h3 class="job-title">${escapeHtml(job.title)}</h3>
      <p class="job-company">${escapeHtml(job.company_name)}</p>

      <div class="job-meta">
        <div class="job-meta-item">
          <span class="job-location">${escapeHtml(job.location)}</span>
        </div>
        ${salaryRange ? `<div class="job-meta-item"><span class="job-salary">${salaryRange}</span></div>` : ''}
        <div class="job-meta-item">${escapeHtml(job.job_type)}</div>
      </div>

      <p class="job-description">${escapeHtml(truncateDescription(job.description, 150))}</p>

      <a href="${jobUrl}" class="job-apply-button">View Job Details</a>
    </div>
  `;
}

/**
 * Format salary range for display
 */
function formatSalaryRange(
  min: number | null,
  max: number | null,
  currency: string | null
): string {
  if (!min && !max) return '';

  const curr = currency || 'USD';

  if (min && max) {
    return `${curr} ${formatNumber(min)} - ${formatNumber(max)}`;
  }

  if (min) {
    return `From ${curr} ${formatNumber(min)}`;
  }

  if (max) {
    return `Up to ${curr} ${formatNumber(max)}`;
  }

  return '';
}

/**
 * Format number with commas
 */
function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Truncate description text
 */
function truncateDescription(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
}

/**
 * Legacy email sending for backward compatibility
 */
export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; type: string; content: string }[];
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@jobbrowser.app',
          name: 'JobBrowser',
        },
        content: [
          {
            type: 'text/html',
            value: html,
          },
          ...(text ? [{ type: 'text/plain', value: text }] : []),
        ],
        ...(attachments?.length
          ? {
              attachments: attachments.map((file) => ({
                filename: file.filename,
                type: file.type,
                content: file.content,
                disposition: 'attachment',
              })),
            }
          : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', response.status, errorText);
      return {
        success: false,
        error: `SendGrid error: ${response.status}`,
      };
    }

    const messageId = response.headers.get('x-message-id');
    return {
      success: true,
      messageId: messageId || undefined,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a magic link verification email
 */
export function generateVerificationEmail(
  companyName: string,
  verificationLink: string
): { subject: string; html: string; text: string } {
  const subject = `Verify your email to post jobs on JobBrowser - ${companyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
            <p>Welcome to JobBrowser Job Posting</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for signing up to post jobs on JobBrowser. To verify your email and access the job posting wizard, please click the button below:</p>
            <a href="${verificationLink}" class="button">Verify Email & Post Job</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this email, you can safely ignore it.</p>
            <hr />
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; font-size: 12px; color: #666;">${verificationLink}</p>
            <div class="footer">
              <p>&copy; 2026 JobBrowser. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Verify Your Email

    Welcome to JobBrowser Job Posting.

    Please visit this link to verify your email and access the job posting wizard:
    ${verificationLink}

    This link will expire in 24 hours.

    If you didn't request this email, you can safely ignore it.
  `;

  return { subject, html, text };
}

/**
 * Generate a job posted confirmation email
 */
export function generateJobPostedEmail(
  companyName: string,
  jobTitle: string,
  jobId: string
): { subject: string; html: string; text: string } {
  const subject = `Your job "${jobTitle}" has been posted on JobBrowser`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Job Posted Successfully!</h1>
          </div>
          <div class="content">
            <p>Hello ${companyName},</p>
            <p>Your job posting has been successfully published on JobBrowser.</p>
            <h2>${jobTitle}</h2>
            <a href="${process.env.NEXTAUTH_URL}/jobs/${jobId}" class="button">View Job Posting</a>
            <p>Job ID: ${jobId}</p>
            <p>Your job will be visible to job seekers across our platform.</p>
            <div class="footer">
              <p>&copy; 2026 JobBrowser. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Job Posted Successfully!

    Hello ${companyName},

    Your job posting has been successfully published on JobBrowser.

    Job: ${jobTitle}
    Job ID: ${jobId}

    View your job posting:
    ${process.env.NEXTAUTH_URL}/jobs/${jobId}

    Your job will be visible to job seekers across our platform.
  `;

  return { subject, html, text };
}

export function generateApplicationEmail(input: {
  jobTitle: string;
  companyName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string | null;
  coverLetter?: string | null;
  inboxUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `New application for ${input.jobTitle}`;
  const text = [
    `${input.applicantName} (${input.applicantEmail}) applied for ${input.jobTitle} at ${input.companyName}.`,
    input.applicantPhone ? `Phone: ${input.applicantPhone}` : '',
    input.coverLetter ? `Note: ${input.coverLetter}` : '',
    `Open the applicant and download the CV: ${input.inboxUrl}`,
    'Sign in with your employer email link if that page asks you to. JobBrowser does not sell applicant CVs.',
  ]
    .filter(Boolean)
    .join('\n\n');
  const html = `<p>${escapeHtml(text).replace(/\n/g, '<br />')}</p><p><a href="${escapeHtml(input.inboxUrl)}">Open applicants</a></p>`;
  return { subject, html, text };
}

export function generateCandidateConfirmationEmail(input: {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  statusUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Application received for ${input.jobTitle}`;
  const text = [
    `Hello ${input.applicantName},`,
    `Your application for ${input.jobTitle} at ${input.companyName} is with that employer.`,
    `You can check the status here: ${input.statusUrl}`,
    'The CV is available only to that employer and to the JobBrowser operator. It is deleted after 12 months, or sooner if you ask.',
  ].join('\n\n');
  const html = `<p>${escapeHtml(text).replace(/\n/g, '<br />')}</p><p><a href="${escapeHtml(input.statusUrl)}">Check application status</a></p>`;
  return { subject, html, text };
}

export function generateCandidateStatusEmail(input: {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: 'shortlisted' | 'rejected';
  statusUrl: string;
}): { subject: string; html: string; text: string } {
  const label = input.status === 'shortlisted' ? 'shortlisted' : 'not moving forward';
  const subject = `Update on your application for ${input.jobTitle}`;
  const text = [
    `Hello ${input.applicantName},`,
    `${input.companyName} marked your application for ${input.jobTitle} as ${label}.`,
    `See the status here: ${input.statusUrl}`,
  ].join('\n\n');
  const html = `<p>${escapeHtml(text).replace(/\n/g, '<br />')}</p>`;
  return { subject, html, text };
}
