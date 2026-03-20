/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-core';
import { DocSearchButton, DocSearchAskAiModal } from 'typesense-docsearch-modal';
import { Sidepanel, SidepanelButton } from 'typesense-docsearch-sidepanel';
import type { JSX } from 'react';

import type { DemoTheme } from '../App';
import {
  defaultAskAi,
  defaultCollection,
  defaultSearchParameters,
  typesenseServerConfig,
} from '../config';

export default function BasicHybrid({
  theme,
}: {
  theme: DemoTheme;
}): JSX.Element {
  return (
    <DocSearch theme={theme}>
      <DocSearchButton />
      <DocSearchAskAiModal
        typesenseCollectionName={defaultCollection}
        typesenseServerConfig={typesenseServerConfig}
        typesenseSearchParameters={defaultSearchParameters}
        askAi={defaultAskAi}
      />

      <SidepanelButton />
      <Sidepanel
        typesenseCollectionName={defaultCollection}
        typesenseServerConfig={typesenseServerConfig}
        askAi={defaultAskAi}
      />
    </DocSearch>
  );
}
