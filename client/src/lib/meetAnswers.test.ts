import { describe, it, expect } from 'vitest';
import { findAnswer, formatAnswer, wasTicked } from './meetAnswers';

const checkbox = { type: 'checkbox' as const, required: false };
const requiredCheckbox = { type: 'checkbox' as const, required: true };
const text = { type: 'text' as const, required: false };

describe('formatAnswer', () => {
  it.each([
    [checkbox, 'true', 'Yes'],
    [checkbox, 'false', 'No'],
    [checkbox, true, 'Yes'],
    [checkbox, false, 'No'],
    // Saved before checkboxes were fixed: required boxes had to be ticked.
    [requiredCheckbox, 'on', 'Yes'],
    [checkbox, 'on', 'Unknown'],
    [checkbox, undefined, '-'],
    [text, 'Vegan', 'Vegan'],
    [text, 'on', 'on'],
    [text, '', '-'],
    [text, null, '-'],
    [{ required: false }, 'true', 'Yes'],
  ])('%o with %o → %s', (question, value, expected) => {
    expect(formatAnswer(question, value)).toBe(expected);
  });
});

describe('wasTicked', () => {
  it.each([
    [checkbox, 'true', true],
    [checkbox, 'false', false],
    [requiredCheckbox, 'on', true],
    [checkbox, 'on', undefined],
    [checkbox, undefined, undefined],
  ])('%o with %o → %s', (question, value, expected) => {
    expect(wasTicked(question, value)).toBe(expected);
  });
});

describe('findAnswer', () => {
  it('matches by id, including older questionID answers', () => {
    const answers = [
      { id: 'a1b2', value: 'x' },
      { questionID: 7, value: 'y' },
    ];
    expect(findAnswer(answers, { id: 'a1b2' })?.value).toBe('x');
    expect(findAnswer(answers, { id: 7 })?.value).toBe('y');
    expect(findAnswer(answers, { id: 8 })).toBeUndefined();
    expect(findAnswer(null, { id: 8 })).toBeUndefined();
  });
});
