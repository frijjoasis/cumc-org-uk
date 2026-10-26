/**
 * Question IDs link each member's answers to a question, so they must be
 * unique within a meet and never reused.
 *
 * axios is mocked. No network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import EditQuestions from './EditQuestions';

vi.mock('axios');

// Radix measures and captures pointers; jsdom has neither.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.scrollIntoView ??= () => {};

const existing = [
  { id: 1, title: 'Old question', type: 'checkbox' as const },
];

const renderEditor = (onSaved = vi.fn()) => {
  render(
    <EditQuestions
      content={{ questions: existing } as any}
      id="7"
      onSaved={onSaved}
    />
  );
  return onSaved;
};

const savedQuestions = async () => {
  await userEvent.click(screen.getByRole('button', { name: /Save Changes|Saved/i }));
  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  return (vi.mocked(axios.post).mock.calls.at(-1)![1] as any).questions;
};

const applyTemplate = async (name: RegExp) => {
  await userEvent.click(screen.getByRole('button', { name: /Templates/i }));
  await userEvent.click(await screen.findByRole('menuitem', { name }));
};

const addQuestion = async () => {
  await userEvent.click(screen.getByRole('button', { name: /Add Question/i }));
  await userEvent.click(
    await screen.findByRole('menuitem', { name: /Short Answer/i })
  );
};

beforeEach(() => {
  vi.mocked(axios.post).mockReset();
  vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('EditQuestions — question IDs', () => {
  it('gives every question from templates a unique ID', async () => {
    // Questions added in the same instant must still get different IDs.
    vi.spyOn(Date, 'now').mockReturnValue(1_790_000_000_000);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    renderEditor();
    await applyTemplate(/Outdoor Meet/i);
    await applyTemplate(/Indoor Session/i);
    await applyTemplate(/Car \/ Transport/i);

    const ids = (await savedQuestions()).map((q: any) => q.id);
    expect(ids).toHaveLength(1 + 7 + 4 + 3);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps existing IDs so old answers still match', async () => {
    renderEditor();
    await addQuestion();
    const questions = await savedQuestions();
    expect(questions[0]).toEqual(existing[0]);
  });

  it('never reuses the ID of a removed question', async () => {
    renderEditor();
    await addQuestion();
    const before = await savedQuestions();
    const removedID = before[1].id;

    await userEvent.click(screen.getAllByRole('button', { name: /Remove/i })[1]);
    await addQuestion();

    const after = await savedQuestions();
    expect(after).toHaveLength(2);
    expect(after[1].id).not.toBe(removedID);
    expect(after[1].id).not.toBe(existing[0].id);
  });

  it('tells the page what was saved', async () => {
    const onSaved = renderEditor();
    await addQuestion();
    const questions = await savedQuestions();
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(questions));
  });
});
