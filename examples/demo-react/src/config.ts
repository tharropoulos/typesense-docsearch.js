export const typesenseServerConfig = {
  apiKey: 'xyz',
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' as const }],
};

export const defaultCollection = 'docsearch';

export const defaultSearchParameters = {};

export const defaultAskAi = {
  conversationModelId: 'askAIDemo',
};
