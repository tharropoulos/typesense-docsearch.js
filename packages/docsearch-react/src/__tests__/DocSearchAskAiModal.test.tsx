import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DocSearchAskAiModal } from '../DocSearchAskAiModal';
import type { AIMessage } from '../types/AskiAi';

const mocks = vi.hoisted(() => ({
  startNewConversation: vi.fn(),
  useAskAi: vi.fn(),
}));

vi.mock('../useAskAi', () => ({
  useAskAi: mocks.useAskAi,
}));

describe('DocSearchAskAiModal', () => {
  let messages: AIMessage[] = [];

  beforeEach(() => {
    messages = [];
    mocks.startNewConversation.mockReset();
    mocks.useAskAi.mockImplementation(() => ({
      askAiError: undefined,
      chatId: 'chat-id',
      conversations: { add: vi.fn(), getAll: () => [] },
      exchanges: [],
      isStreaming: false,
      messages,
      restoreConversation: vi.fn(),
      sendMessage: vi.fn(),
      setMessages: vi.fn(),
      startNewConversation: mocks.startNewConversation,
      status: 'ready',
      stopAskAiStreaming: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not reset a conversation when its first message arrives before Ask AI activates', () => {
    const props = {
      typesenseCollectionName: 'docs',
      typesenseServerConfig: {
        apiKey: 'test-key',
        nodes: [{ host: 'localhost', port: 8108, protocol: 'http' as const }],
      },
      askAi: 'conv-model-1',
      initialScrollY: 0,
      onAskAiToggle: vi.fn(),
    };
    const { rerender } = render(
      <DocSearchAskAiModal {...props} isAskAiActive={false} />
    );

    messages = [
      {
        id: 'message-id',
        parts: [{ text: 'Question', type: 'text' }],
        role: 'user',
      },
    ];
    rerender(<DocSearchAskAiModal {...props} isAskAiActive={false} />);

    expect(mocks.startNewConversation).not.toHaveBeenCalled();
  });
});
