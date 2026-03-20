/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-core';
import { SidepanelButton, Sidepanel } from 'typesense-docsearch-sidepanel';
import type { JSX } from 'react';

import { defaultAskAi, defaultCollection, typesenseServerConfig } from '../config';

export default function SidepanelExample(): JSX.Element {
  return (
    <DocSearch>
      <SidepanelButton variant="inline" />
      <Sidepanel
        typesenseCollectionName={defaultCollection}
        typesenseServerConfig={typesenseServerConfig}
        askAi={defaultAskAi}
        variant="floating"
      />
    </DocSearch>
  );
}
