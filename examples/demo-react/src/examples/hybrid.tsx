/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-core';
import { DocSearchButton, DocSearchModal } from 'typesense-docsearch-modal';
import { Sidepanel, SidepanelButton } from 'typesense-docsearch-sidepanel';
import type { JSX } from 'react';

import { defaultSearchParameters, typesenseServerConfig } from '../config';

export default function BasicHybrid(): JSX.Element {
  return (
    <DocSearch>
      <DocSearchButton />
      <DocSearchModal
        typesenseCollectionName="docsearch"
        typesenseServerConfig={typesenseServerConfig}
        typesenseSearchParameters={defaultSearchParameters}
        askAi={{
          conversationModelId: 'e3Kl4lTCBlSA',
          collection: 'docsearch-markdown',
        }}
      />

      <SidepanelButton />
      <Sidepanel
        typesenseCollectionName="docsearch-markdown"
        typesenseServerConfig={typesenseServerConfig}
        askAi={{
          conversationModelId: 'e3Kl4lTCBlSA',
        }}
      />
    </DocSearch>
  );
}
