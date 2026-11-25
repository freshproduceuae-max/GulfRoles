export const PIPELINE_STAGES = [
  'new',
  'reviewed',
  'shortlisted',
  'interview',
  'offer',
  'hired',
  'rejected',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const STAGE_LABEL: Record<PipelineStage, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

export function isPipelineStage(value: string): value is PipelineStage {
  return (PIPELINE_STAGES as readonly string[]).includes(value);
}

export const JOB_LIFECYCLE = ['published', 'paused', 'closed', 'flagged', 'draft', 'expired', 'rejected'] as const;

export function jobIsOpen(status: string): boolean {
  return status === 'published';
}
