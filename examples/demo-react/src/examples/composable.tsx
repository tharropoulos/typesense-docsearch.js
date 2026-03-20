/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-core';
import { DocSearchButton, DocSearchModal } from 'typesense-docsearch-modal';
import { type JSX } from 'react';

import { defaultCollection, defaultSearchParameters, typesenseServerConfig } from '../config';

export default function Composable(): JSX.Element {
  return (
    <DocSearch>
      <DocSearchButton translations={{ buttonText: 'Composable API' }} />
      <DocSearchModal
        typesenseCollectionName={defaultCollection}
        typesenseServerConfig={typesenseServerConfig}
        typesenseSearchParameters={defaultSearchParameters}
        askAi={{
          conversationModelId: 'askAIDemo',
          searchParameters: {
            filter_by: 'language:en',
          },
        }}
      />
    </DocSearch>
  );
}
