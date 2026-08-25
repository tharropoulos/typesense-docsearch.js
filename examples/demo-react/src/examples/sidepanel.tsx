import type { JSX } from 'react';
/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-core';
import { SidepanelButton, Sidepanel } from 'typesense-docsearch-sidepanel';

import type { DemoTheme } from '../App';
import {
  defaultAskAi,
  defaultCollection,
  typesenseServerConfig,
} from '../config';

export default function SidepanelExample({
  theme,
}: {
  theme: DemoTheme;
}): JSX.Element {
  return (
    <DocSearch theme={theme}>
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
