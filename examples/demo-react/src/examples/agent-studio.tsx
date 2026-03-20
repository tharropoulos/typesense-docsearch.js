/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-core';
import { DocSearchButton } from 'typesense-docsearch-modal/button';
import { DocSearchModal } from 'typesense-docsearch-modal/modal';
import { SidepanelButton } from 'typesense-docsearch-sidepanel/button';
import { Sidepanel } from 'typesense-docsearch-sidepanel/sidepanel';
import type { JSX } from 'react';

import { defaultAskAi, defaultCollection, defaultSearchParameters, typesenseServerConfig } from '../config';

export function AgentStudioExample(): JSX.Element {
  return (
    <>
      <DocSearch>
        <DocSearchButton
          translations={{
            buttonText: 'Ask AI with Agent Studio',
          }}
        />
        <DocSearchModal
          typesenseCollectionName={defaultCollection}
          typesenseServerConfig={typesenseServerConfig}
          typesenseSearchParameters={defaultSearchParameters}
          askAi={defaultAskAi}
        />
      </DocSearch>

      <DocSearch>
        <SidepanelButton
          variant="inline"
          translations={{
            buttonText: 'Agent Studio',
          }}
        />
        <Sidepanel
          typesenseCollectionName={defaultCollection}
          typesenseServerConfig={typesenseServerConfig}
          askAi={defaultAskAi}
        />
      </DocSearch>
    </>
  );
}
