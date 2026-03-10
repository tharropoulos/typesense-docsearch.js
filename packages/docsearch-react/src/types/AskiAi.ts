import type { MultiSearchRequestSchema } from 'typesense/lib/Typesense/Types';

export type AskAiState = 'conversation-history' | 'conversation' | 'initial' | 'new-conversation';

export type AskAiStatus = 'error' | 'ready' | 'streaming' | 'submitted';

export interface AITextPart {
  type: 'text';
  text: string;
  state?: 'done' | 'streaming';
}

export type AIMessagePart = AITextPart;

export type AIMessage = {
  id: string;
  role: 'assistant' | 'user';
  parts: AIMessagePart[];
  metadata?: {
    stopped?: boolean;
    conversationId?: string;
  };
};

export type UseAskAiSendMessageOptions = {
  suggestedQuestionId?: string;
};

export type TypesenseAskAiSearchParameters = Omit<
  Partial<MultiSearchRequestSchema<Record<string, unknown>, string>>,
  'collection' | 'exclude_fields' | 'q' | 'query_by'
>;

export type TypesenseAskAiParams = {
  collection: string;
  conversationModelId: string;
  excludeFields?: string;
  queryBy: string;
  searchParameters?: TypesenseAskAiSearchParameters;
};
