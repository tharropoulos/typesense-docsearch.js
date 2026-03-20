/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-core';
import { DocSearchButton, DocSearchAskAiModal } from 'typesense-docsearch-modal';
import { type JSX } from 'react';

import type { DemoTheme } from '../App';
import { AGENT_ID, API_KEY, APP_ID, SEARCH_INDEX_NAME } from '../constants';

export default function Composable({
  theme,
}: {
  theme: DemoTheme;
}): JSX.Element {
  return (
    <DocSearch appId={APP_ID} apiKey={API_KEY} theme={theme}>
      <DocSearchButton translations={{ buttonText: 'Composable API' }} />
      <DocSearchAskAiModal askAi={AGENT_ID} indices={[SEARCH_INDEX_NAME]} />
    </DocSearch>
  );
}
