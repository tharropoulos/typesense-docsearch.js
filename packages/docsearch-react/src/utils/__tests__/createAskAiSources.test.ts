import { describe, expect, it, vi } from 'vitest';

import { buildAskAiActionSources } from '../createAskAiSources';

describe('buildAskAiActionSources', () => {
  it('returns the Ask AI action for the current query', async () => {
    const sources = await buildAskAiActionSources({
      query: 'How do I install DocSearch?',
      handleSelectAskAiQuestion: vi.fn(),
    });

    expect(sources[0].getItems({} as any)).toMatchObject([
      {
        objectID: 'ask-ai-button',
        query: 'How do I install DocSearch?',
      },
    ]);
  });

  it('selects the Ask AI action as the query', async () => {
    const handleSelectAskAiQuestion = vi.fn();
    const sources = await buildAskAiActionSources({
      query: 'configure',
      handleSelectAskAiQuestion,
    });
    const [action] = (await sources[0].getItems({} as any)) as any[];

    sources[0].onSelect?.({ item: action } as any);

    expect(handleSelectAskAiQuestion).toHaveBeenCalledWith(true, 'configure');
  });
});
