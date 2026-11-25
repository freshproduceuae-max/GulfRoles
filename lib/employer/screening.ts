export type AnswerType = 'yes_no' | 'number' | 'text';

export interface ScreeningQuestion {
  id: string;
  prompt: string;
  answerType: AnswerType;
  required: boolean;
  knockout: boolean;
  expectedYes: boolean | null;
  minNumber: number | null;
}

export interface ScreeningResult {
  questionId: string;
  prompt: string;
  answerText: string;
  knockedOut: boolean;
}

export function evaluateScreening(
  questions: ScreeningQuestion[],
  answers: Record<string, string>
): { results: ScreeningResult[]; knockout: boolean } {
  const results: ScreeningResult[] = [];
  for (const question of questions) {
    const raw = (answers[question.id] || '').trim();
    if (question.required && !raw) {
      throw new Error(`Answer required: ${question.prompt}`);
    }
    let knockedOut = false;
    if (question.knockout && raw) {
      if (question.answerType === 'yes_no') {
        const yes = /^(yes|y|true)$/i.test(raw);
        const expected = question.expectedYes !== false;
        knockedOut = yes !== expected;
      } else if (question.answerType === 'number' && question.minNumber !== null) {
        const value = Number(raw);
        knockedOut = !Number.isFinite(value) || value < question.minNumber;
      }
    }
    if (question.knockout && question.required && !raw) knockedOut = true;
    results.push({
      questionId: question.id,
      prompt: question.prompt,
      answerText: raw,
      knockedOut,
    });
  }
  return { results, knockout: results.some((result) => result.knockedOut) };
}
