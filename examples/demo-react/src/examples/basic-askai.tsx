/* eslint-disable react/react-in-jsx-scope */
import { DocSearchAI } from 'typesense-docsearch-react';
import type { JSX } from 'react';

import type { DemoTheme } from '../App';
import {
  defaultAskAi,
  defaultCollection,
  defaultSearchParameters,
  typesenseServerConfig,
} from '../config';

export default function BasicAskAI({
  theme,
}: {
  theme: DemoTheme;
}): JSX.Element {
  return (
    <DocSearchAI
      typesenseCollectionName={defaultCollection}
      typesenseServerConfig={typesenseServerConfig}
      typesenseSearchParameters={defaultSearchParameters}
      askAi={{
        ...defaultAskAi,
        searchParameters: {
          filter_by: 'language:en',
        },
        suggestedQuestions: [
          'How do I install Typesense?',
          'How does the DocSearch scraper work?',
        ],
      }}
      facets={[
        { key: 'language', label: 'Language' },
        { key: 'version', label: 'Version' },
        { key: 'type', label: 'Content type' },
      ]}
      insights={true}
      translations={{ button: { buttonText: 'Search with Ask AI' } }}
      theme={theme}
      resultBadgeKey="type"
    />
  );
}
