import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail, generateVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { company_email, company_name } = body;

    // Validate input
    if (!company_email || typeof company_email !== 'string') {
      return NextResponse.json(
        { error: 'company_email is required' },
        { status: 400 }
      );
    }

    if (!company_name || typeof company_name !== 'string') {
      return NextResponse.json(
        { error: 'company_name is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(company_email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate company name length
    if (company_name.length < 2 || company_name.length > 255) {
      return NextResponse.json(
        { error: 'Company name must be between 2 and 255 characters' },
        { status: 400 }
      );
    }

    // Check if company already exists with this email
    const existingCompany = await query(
      'SELECT id FROM companies WHERE name = $1 OR website ILIKE $2',
      [company_name, `%${company_email.split('@')[1]}%`]
    );

    let companyId = existingCompany.rows[0]?.id;

    if (!companyId) {
      // Extract domain from email for website placeholder
      const domain = company_email.split('@')[1];

      // Create new company
      const newCompany = await query(
        `INSERT INTO companies (name, website, region, verified)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [company_name, `https://${domain}`, 'UAE', false]
      );

      companyId = newCompany.rows[0].id;
    }

    // Generate verification token
    const verificationToken = uuidv4();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await query(
      `UPDATE companies
       SET verification_token = $1, verification_token_expires = $2
       WHERE id = $3`,
      [verificationToken, tokenExpiresAt, companyId]
    );

    // Generate verification link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/employer/verify/${verificationToken}`;

    // Send verification email
    const emailContent = generateVerificationEmail(company_name, verificationLink);
    const emailResult = await sendEmail({
      to: company_email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Check your email for a verification link',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Employer login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to process login request',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
