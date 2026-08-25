import { describe, it, expect } from 'vitest';

import type { AIMessage, AIMessagePart } from '../../types/AskiAi';
import {
  getAskAiBlockingBannerMessage,
  isThreadDepthError,
  isAskAiPromptBlockingError,
  showAskAiBlockingBannerNewConversationLink,
  getMessageContent,
} from '../ai';

describe('isThreadDepthError', () => {
  it('detects AI-217 regardless of casing', () => {
    expect(isThreadDepthError(new Error('AI-217: limit reached'))).toBe(true);
    expect(isThreadDepthError(new Error('prefix ai-217 suffix'))).toBe(true);
  });

  it('detects conversation depth phrasing', () => {
    expect(
      isThreadDepthError(
        new Error(
          "You've hit the max conversation depth (4 messages), start a new conversation."
        )
      )
    ).toBe(true);
    expect(
      isThreadDepthError(new Error('Maximum conversation depth reached.'))
    ).toBe(true);
  });

  it('detects conversation depth in a JSON-shaped error message', () => {
    expect(
      isThreadDepthError(
        new Error(
          JSON.stringify({ message: 'Maximum conversation depth reached.' })
        )
      )
    ).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(isThreadDepthError()).toBe(false);
    expect(isThreadDepthError(new Error('Network failed'))).toBe(false);
    expect(isThreadDepthError(new Error('AI-214: rate limit'))).toBe(false);
  });
});

describe('Ask AI prompt-blocking errors', () => {
  it.each(['AI-203', 'AI-205', 'AI-224', 'AI-225'])(
    'blocks error code %s',
    (code) => {
      expect(isAskAiPromptBlockingError(new Error(`Failed (${code})`))).toBe(
        true
      );
    }
  );

  it.each([
    'Rate limit exceeded',
    'Domain is not whitelisted',
    'Maximum token limit reached',
    'Maximum agent steps exceeded',
  ])('blocks matching message: %s', (errorMessage) => {
    expect(isAskAiPromptBlockingError(new Error(errorMessage))).toBe(true);
  });

  it('does not block unrelated errors', () => {
    expect(isAskAiPromptBlockingError(new Error('Network failed'))).toBe(false);
  });

  it('hides recovery when a new conversation cannot resolve the error', () => {
    expect(
      showAskAiBlockingBannerNewConversationLink(
        new Error('Request blocked for this domain')
      )
    ).toBe(false);
    expect(
      showAskAiBlockingBannerNewConversationLink(
        new Error('Could not complete response due to token output limits')
      )
    ).toBe(false);
    expect(
      showAskAiBlockingBannerNewConversationLink(
        new Error('Rate limit exceeded')
      )
    ).toBe(true);
  });

  it('uses the human message from JSON errors', () => {
    const error = new Error(
      JSON.stringify({
        error: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Retry after 60 seconds.',
      })
    );

    expect(getAskAiBlockingBannerMessage(error)).toBe(
      'Rate limit exceeded. Retry after 60 seconds.'
    );
  });

  it('matches retry-after messages and case-insensitive JSON fields', () => {
    const error = new Error(
      JSON.stringify({ Message: 'Please retry after 60 seconds' })
    );

    expect(isAskAiPromptBlockingError(error)).toBe(true);
    expect(getAskAiBlockingBannerMessage(error)).toBe(
      'Please retry after 60 seconds'
    );
  });

  it('provides a fallback for code-only conversation limits', () => {
    const error = new Error(JSON.stringify({ code: 'AI-217' }));

    expect(getAskAiBlockingBannerMessage(error)).toBeUndefined();
  });

  it('uses a fallback for type-only token output errors', () => {
    const error = new Error(JSON.stringify({ type: 'TokenOutputLimitError' }));

    expect(isAskAiPromptBlockingError(error)).toBe(true);
    expect(getAskAiBlockingBannerMessage(error)).toBe(
      'Could not complete response due to token output limits'
    );
  });
});

function message(id: string, parts: AIMessagePart[]): AIMessage {
  return {
    id,
    role: 'assistant',
    parts,
  };
}

describe('getMessageContent', () => {
  it('joins consecutive text parts so copying returns the full answer', () => {
    expect(
      getMessageContent(
        message('a1', [
          { type: 'text', text: 'Let me look that up.' },
          { type: 'text', text: 'Typesense is a search engine.' },
        ])
      )
    ).toBe('Let me look that up.\n\nTypesense is a search engine.');
  });

  it('returns an empty string without a message or text parts', () => {
    expect(getMessageContent(null)).toBe('');
    expect(getMessageContent(message('a2', []))).toBe('');
  });
});
