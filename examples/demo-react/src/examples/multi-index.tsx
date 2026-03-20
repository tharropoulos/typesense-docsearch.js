/* eslint-disable react/react-in-jsx-scope */
import { DocSearch } from 'typesense-docsearch-react';
import type { JSX } from 'react';

import type { DemoTheme } from '../App';
import {
  defaultCollection,
  defaultSearchParameters,
  typesenseServerConfig,
} from '../config';

export default function MultiIndex({
  theme,
}: {
  theme: DemoTheme;
}): JSX.Element {
  return (
    <DocSearch
      typesenseCollectionName={defaultCollection}
      typesenseServerConfig={typesenseServerConfig}
      typesenseSearchParameters={defaultSearchParameters}
      indices={[
        {
          name: defaultCollection,
        },
        {
          name: 'tailwindcss',
        },
        {
          name: 'kubernetes',
        },
      ]}
      translations={{ button: { buttonText: 'Multi index search' } }}
      insights={true}
      theme={theme}
    />
  );
}
