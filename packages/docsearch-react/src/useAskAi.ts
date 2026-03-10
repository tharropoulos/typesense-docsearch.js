import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConfigurationOptions as TypesenseConfigurationOptions } from 'typesense/lib/Typesense/Configuration';
import type { MultiSearchRequestSchema } from 'typesense/lib/Typesense/Types';

import type { Exchange } from './AskAiScreen';
import type { StoredSearchPlugin } from './stored-searches';
import { createStoredConversations } from './stored-searches';
import type { StoredAskAiState } from './types/StoredDocSearchHit';
import type { AIMessage, AskAiStatus, TypesenseAskAiParams, UseAskAiSendMessageOptions } from './types/AskiAi';

type UseAskAiParams = {
  typesenseServerConfig: TypesenseConfigurationOptions;
  storageKey: string;
} & TypesenseAskAiParams;

type UseAskAiReturn = {
  messages: AIMessage[];
  status: AskAiStatus;
  sendMessage: (query: string, options?: UseAskAiSendMessageOptions) => Promise<void>;
  setMessages: (messages: AIMessage[]) => void;
  stopAskAiStreaming: () => Promise<void>;
  askAiError?: Error;
  isStreaming: boolean;
  exchanges: Exchange[];
  conversations: StoredSearchPlugin<StoredAskAiState>;
  /**
   * Identifier of the active Typesense conversation. Named `chatId` to keep the
   * same surface the modal and sidepanel already consume.
   */
  chatId?: string;
  /** Clears the transcript so the next prompt opens a fresh conversation. */
  startNewConversation: () => void;
  /** Rehydrates a stored conversation into the live transcript. */
  restoreConversation: (messages: AIMessage[], conversationId?: string) => void;
};

type TypesenseNodeConfig = {
  host?: string;
  path?: string;
  port?: number | string;
  protocol?: string;
  url?: string;
};

type StreamChunk = {
  message?: string;
  conversation_id?: string;
  conversation?: {
    answer?: string;
    message?: string;
    conversation_id?: string;
  };
};

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `msg_${Math.random().toString(36).slice(2, 10)}`;
};

const getFirstNode = (config: TypesenseConfigurationOptions): TypesenseNodeConfig => {
  const node = config.nearestNode ?? config.nodes?.[0];

  if (!node) {
    throw new Error('Typesense requires at least one configured node.');
  }

  return node;
};

const getBaseUrl = (config: TypesenseConfigurationOptions): string => {
  const node = getFirstNode(config);

  if (node.url) {
    return node.url;
  }

  if (!node.host) {
    throw new Error('Typesense node configuration must include either `url` or `host`.');
  }

  const protocol = node.protocol ?? 'https';
  const port = node.port ? `:${node.port}` : '';
  const path = node.path ?? '';

  return `${protocol}://${node.host}${port}${path}`;
};

const getConversationId = (messages: AIMessage[]): string | undefined => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const conversationId = messages[i]?.metadata?.conversationId;

    if (conversationId) {
      return conversationId;
    }
  }

  return undefined;
};

const buildAssistantMessage = (conversationId?: string): AIMessage => ({
  id: createId(),
  role: 'assistant',
  parts: [{ type: 'text', text: '', state: 'streaming' }],
  metadata: conversationId ? { conversationId } : {},
});

const buildUserMessage = (query: string): AIMessage => ({
  id: createId(),
  role: 'user',
  parts: [{ type: 'text', text: query, state: 'done' }],
});

const updateAssistantMessage = (
  messages: AIMessage[],
  assistantId: string,
  updater: (message: AIMessage) => AIMessage
): AIMessage[] =>
  messages.map((message) => {
    if (message.id !== assistantId) {
      return message;
    }

    return updater(message);
  });

const parseSseEvent = (event: string): string[] =>
  event
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

const splitSseEvents = (buffer: string): { events: string[]; remainder: string } => {
  const normalizedBuffer = buffer.replace(/\r\n/g, '\n');
  const events = normalizedBuffer.split('\n\n');

  return {
    events: events.slice(0, -1),
    remainder: events.at(-1) ?? '',
  };
};

const buildSearchRequest = ({
  collection,
  queryBy,
  excludeFields,
  searchParameters,
}: Omit<TypesenseAskAiParams, 'conversationModelId'>): MultiSearchRequestSchema<Record<string, unknown>, string> => ({
  collection,
  query_by: queryBy,
  exclude_fields: excludeFields,
  ...(searchParameters ?? {}),
});

export const useAskAi = ({
  typesenseServerConfig,
  storageKey,
  collection,
  queryBy,
  excludeFields = 'embedding',
  conversationModelId,
  searchParameters,
}: UseAskAiParams): UseAskAiReturn => {
  const [messages, setMessagesState] = useState<AIMessage[]>([]);
  const [status, setStatus] = useState<AskAiStatus>('ready');
  const [askAiError, setAskAiError] = useState<Error>();
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<AIMessage[]>([]);
  const conversationIdRef = useRef<string | undefined>(undefined);

  const conversations = useRef(
    createStoredConversations<StoredAskAiState>({
      key: storageKey,
      limit: 10,
    })
  ).current;

  useEffect(() => {
    messagesRef.current = messages;
    conversationIdRef.current = getConversationId(messages);
  }, [messages]);

  const setMessages = useCallback((nextMessages: AIMessage[]): void => {
    messagesRef.current = nextMessages;
    conversationIdRef.current = getConversationId(nextMessages);
    setMessagesState(nextMessages);
  }, []);

  const sendMessage = useCallback(
    async (query: string, _options?: UseAskAiSendMessageOptions): Promise<void> => {
      const userMessage = buildUserMessage(query);
      const assistantMessage = buildAssistantMessage(conversationIdRef.current);
      const nextMessages = [...messagesRef.current, userMessage, assistantMessage];

      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setAskAiError(undefined);
      setStatus('submitted');
      setMessages(nextMessages);

      try {
        const baseUrl = getBaseUrl(typesenseServerConfig);
        const url = new URL('/multi_search', baseUrl);

        url.searchParams.set('q', query);
        url.searchParams.set('conversation', 'true');
        url.searchParams.set('conversation_stream', 'true');
        url.searchParams.set('conversation_model_id', conversationModelId);

        if (conversationIdRef.current) {
          url.searchParams.set('conversation_id', conversationIdRef.current);
        }

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-TYPESENSE-API-KEY': typesenseServerConfig.apiKey,
          },
          body: JSON.stringify({
            searches: [
              buildSearchRequest({
                collection,
                queryBy,
                excludeFields,
                searchParameters,
              }),
            ],
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Typesense conversational search failed.');
        }

        if (!response.body) {
          throw new Error('Typesense conversational search did not return a stream.');
        }

        setStatus('streaming');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streamedText = '';
        let streamedConversationId = conversationIdRef.current;

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const decodedChunk = decoder.decode(value, { stream: true });
          buffer += decodedChunk;

          const { events, remainder } = splitSseEvents(buffer);
          buffer = remainder;

          for (const rawEvent of events) {
            const payloads = parseSseEvent(rawEvent);

            for (const payload of payloads) {
              if (payload === '[DONE]') {
                continue;
              }

              const chunk = JSON.parse(payload) as StreamChunk;
              const finalAnswer = chunk.conversation?.answer;
              const chunkText = chunk.message ?? chunk.conversation?.message ?? '';
              const chunkConversationId = chunk.conversation_id ?? chunk.conversation?.conversation_id;

              if (chunkConversationId) {
                streamedConversationId = chunkConversationId;
                conversationIdRef.current = chunkConversationId;
              }

              if (finalAnswer) {
                if (streamedText.length === 0) {
                  streamedText = finalAnswer;

                  setMessagesState((currentMessages) =>
                    updateAssistantMessage(currentMessages, assistantMessage.id, (message) => ({
                      ...message,
                      metadata: {
                        ...message.metadata,
                        ...(streamedConversationId ? { conversationId: streamedConversationId } : {}),
                      },
                      parts: [
                        {
                          type: 'text',
                          text: streamedText,
                          state: 'streaming',
                        },
                      ],
                    }))
                  );
                }

                continue;
              }

              if (chunkText.length === 0) {
                continue;
              }

              streamedText += chunkText;

              setMessagesState((currentMessages) =>
                updateAssistantMessage(currentMessages, assistantMessage.id, (message) => ({
                  ...message,
                  metadata: {
                    ...message.metadata,
                    ...(streamedConversationId ? { conversationId: streamedConversationId } : {}),
                  },
                  parts: [
                    {
                      type: 'text',
                      text: streamedText,
                      state: 'streaming',
                    },
                  ],
                }))
              );
            }
          }
        }

        setMessagesState((currentMessages) =>
          updateAssistantMessage(currentMessages, assistantMessage.id, (message) => ({
            ...message,
            metadata: {
              ...message.metadata,
              ...(streamedConversationId ? { conversationId: streamedConversationId } : {}),
            },
            parts: [
              {
                type: 'text',
                text: streamedText,
                state: 'done',
              },
            ],
          }))
        );
        setStatus('ready');
      } catch (error) {
        if (abortController.signal.aborted) {
          setStatus('ready');
          return;
        }

        setAskAiError(error as Error);
        setStatus('error');
      }
    },
    [collection, conversationModelId, excludeFields, queryBy, searchParameters, setMessages, typesenseServerConfig]
  );

  const stopAskAiStreaming = useCallback(async (): Promise<void> => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus('ready');
  }, []);

  const startNewConversation = useCallback((): void => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    conversationIdRef.current = undefined;
    setAskAiError(undefined);
    setStatus('ready');
    setMessages([]);
  }, [setMessages]);

  const restoreConversation = useCallback(
    (restoredMessages: AIMessage[], conversationId?: string): void => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setAskAiError(undefined);
      setStatus('ready');
      setMessages(restoredMessages);

      if (conversationId) {
        conversationIdRef.current = conversationId;
      }
    },
    [setMessages]
  );

  const exchanges = useMemo(() => {
    const grouped: Exchange[] = [];

    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'user') {
        const userMessage = messages[i];
        const assistantMessage = messages[i + 1]?.role === 'assistant' ? messages[i + 1] : null;

        grouped.push({ id: userMessage.id, userMessage, assistantMessage });

        if (assistantMessage) {
          i++;
        }
      }
    }

    return grouped;
  }, [messages]);

  const isStreaming = status === 'streaming' || status === 'submitted';

  return {
    messages,
    status,
    sendMessage,
    setMessages,
    stopAskAiStreaming,
    askAiError,
    isStreaming,
    exchanges,
    conversations,
    chatId: getConversationId(messages),
    startNewConversation,
    restoreConversation,
  };
};
