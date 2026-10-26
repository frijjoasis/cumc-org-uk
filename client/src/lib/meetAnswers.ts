import type { Question } from '@/types/meet';

interface StoredAnswer {
  id?: unknown;
  /** Very old signups used questionID instead of id. */
  questionID?: unknown;
  value?: unknown;
}

export function findAnswer(
  answers: StoredAnswer[] | null | undefined,
  question: Pick<Question, 'id'>
): StoredAnswer | undefined {
  return answers?.find(
    a => a.id === question.id || a.questionID === question.id
  );
}

/**
 * Until October 2026 every checkbox answer was saved as "on", ticked or not.
 * The form could not be submitted with a required box unticked, so "on" there
 * means it was ticked; for an optional box there is no way to tell.
 */
export function wasTicked(
  question: Pick<Question, 'required'>,
  value: unknown
): boolean | undefined {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  if (value === 'on') return question.required ? true : undefined;
  return undefined;
}

/** How an answer reads in the committee table and CSV export. */
export function formatAnswer(
  question: Pick<Question, 'type' | 'required'>,
  value: unknown
): string {
  if (value === undefined || value === null || value === '') return '-';
  if (question.type === 'checkbox' || typeof value === 'boolean') {
    const ticked = wasTicked(question, value);
    if (ticked !== undefined) return ticked ? 'Yes' : 'No';
    if (value === 'on') return 'Unknown';
  }
  if (value === 'true') return 'Yes';
  if (value === 'false') return 'No';
  return String(value);
}
