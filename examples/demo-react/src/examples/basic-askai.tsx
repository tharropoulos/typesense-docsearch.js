/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-react';
import type { JSX } from 'react';

import { defaultCollection, defaultSearchParameters, typesenseServerConfig } from '../config';

export default function BasicAskAI(): JSX.Element {
  return (
    <DocSearch
      typesenseCollectionName={defaultCollection}
      typesenseServerConfig={typesenseServerConfig}
      typesenseSearchParameters={defaultSearchParameters}
      askAi={{
        conversationModelId: 'askAIDemo',
        searchParameters: {
          filter_by: 'language:en',
        },
        suggestedQuestions: ["test"],
      }}
      insights={true}
      translations={{ button: { buttonText: 'Search with Ask AI' } }}
    />
  );
}
