import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { query } from '@/lib/db';
import { sendEmail, generateVerificationEmail } from '@/lib/email';
import { serverErrorResponse } from '@/lib/http';
import { appBaseUrl } from '@/lib/site';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { company_email, company_name } = body;

    if (!company_email || typeof company_email !== 'string') {
      return NextResponse.json({ error: 'company_email is required' }, { status: 400 });
    }

    if (!company_name || typeof company_name !== 'string') {
      return NextResponse.json({ error: 'company_name is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(company_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (company_name.length < 2 || company_name.length > 255) {
      return NextResponse.json(
        { error: 'Company name must be between 2 and 255 characters' },
        { status: 400 }
      );
    }

    const existingCompany = await query('SELECT id FROM companies WHERE name = $1', [company_name]);
    let companyId = existingCompany.rows[0]?.id;

    if (!companyId) {
      const domain = company_email.split('@')[1];
      const newCompany = await query(
        `INSERT INTO companies (name, website, region, verified, contact_email)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [company_name, `https://${domain}`, 'UAE', false, company_email]
      );
      companyId = newCompany.rows[0].id;
    } else {
      await query(`UPDATE companies SET contact_email = $1, updated_at = NOW() WHERE id = $2`, [
        company_email,
        companyId,
      ]);
    }

    const verificationToken = randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await query(
      `UPDATE companies
       SET verification_token = $1, verification_token_expires = $2
       WHERE id = $3`,
      [verificationToken, tokenExpiresAt, companyId]
    );

    const verificationLink = `${appBaseUrl()}/employer/verify/${verificationToken}`;
    const emailContent = generateVerificationEmail(company_name, verificationLink);

    if (!process.env.SENDGRID_API_KEY) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          success: true,
          message: 'Email is not configured. Use the development verification link.',
          dev_verification_link: verificationLink,
        });
      }
      return NextResponse.json(
        { error: 'Email is not configured. Set SENDGRID_API_KEY before posting jobs.' },
        { status: 503 }
      );
    }

    const emailResult = await sendEmail({
      to: company_email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Check your email for a verification link',
    });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to process login request');
  }
}

export const dynamic = 'force-dynamic';
