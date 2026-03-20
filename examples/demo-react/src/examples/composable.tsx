/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-core';
import { DocSearchButton, DocSearchAskAiModal } from 'typesense-docsearch-modal';
import { type JSX } from 'react';

import type { DemoTheme } from '../App';
import {
  defaultAskAi,
  defaultCollection,
  defaultSearchParameters,
  typesenseServerConfig,
} from '../config';

export default function Composable({
  theme,
}: {
  theme: DemoTheme;
}): JSX.Element {
  return (
    <DocSearch theme={theme}>
      <DocSearchButton translations={{ buttonText: 'Composable API' }} />
      <DocSearchAskAiModal
        typesenseCollectionName={defaultCollection}
        typesenseServerConfig={typesenseServerConfig}
        typesenseSearchParameters={defaultSearchParameters}
        askAi={defaultAskAi}
      />
    </DocSearch>
  );
}
