import { queryOne } from '@/lib/db';

export type CompanyRole = 'owner' | 'recruiter' | 'viewer';

export async function companyRole(companyId: string, email: string): Promise<CompanyRole> {
  const member = await queryOne<{ role: CompanyRole; accepted_at: string | null }>(
    `SELECT role, accepted_at FROM company_members WHERE company_id = $1 AND lower(email) = lower($2)`,
    [companyId, email]
  );
  if (member?.accepted_at) return member.role;
  const company = await queryOne<{ contact_email: string | null }>(
    `SELECT contact_email FROM companies WHERE id = $1`,
    [companyId]
  );
  if (company?.contact_email && company.contact_email.toLowerCase() === email.toLowerCase()) return 'owner';
  return 'viewer';
}

export function canRecruit(role: CompanyRole): boolean {
  return role === 'owner' || role === 'recruiter';
}
