/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-react';
import type { JSX } from 'react';

import type { DemoTheme } from '../App';
import {
  defaultCollection,
  defaultSearchParameters,
  typesenseServerConfig,
} from '../config';

export default function Basic({ theme }: { theme: DemoTheme }): JSX.Element {
  return (
    <DocSearch
      typesenseCollectionName={defaultCollection}
      typesenseServerConfig={typesenseServerConfig}
      typesenseSearchParameters={defaultSearchParameters}
      translations={{ button: { buttonText: 'Keyword search' } }}
      insights={true}
      theme={theme}
      facets={[
        { key: 'language', label: 'Language' },
        { key: 'version', label: 'Version' },
        { key: 'type', label: 'Content type' },
      ]}
    />
  );
}
